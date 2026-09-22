# Corrigir o Vitest para não rodar testes compilados em dist/

> Build this with **tlc-implement** (`.agents/skills/tlc-implement`).
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

Hoje, depois de rodar `pnpm build` uma vez, `dist/` fica com cópias compiladas dos arquivos de teste (`dist/drivers/app.test.js`, `dist/resources/daos/UserDAO.test.js`, `dist/application/usecases/CreateUser.test.js`, etc.), porque `tsconfig.json:25` compila tudo em `src/**/*` sem excluir `*.test.ts`. Não existe `vitest.config.ts` no repositório, então o Vitest 5 usa o include default (`**/*.{test,spec}.?(c|m)[jt]s?(x)`) e só exclui `node_modules` e `.git` — logo ele roda a mesma suíte duas vezes, uma a partir de `src` e outra a partir do `dist` obsoleto. As duas cópias batem no mesmo Postgres real com os mesmos dados de fixture (`email: "john@example.com"`, `phoneNumber: "+5511999999999"`), e como `usersTable.email`/`.phoneNumber` são `.unique()` (`src/resources/db/schema.ts:6,8`) e `CreateUser.execute()` só verifica e-mail antes do insert, sem transação (`src/application/usecases/CreateUser.ts:35-38`), as duas suítes concorrentes colidem na constraint única e o teste que deveria retornar 201 recebe 500 de forma intermitente. Quem roda `pnpm test` localmente depois de um build — ou via `.husky/pre-push`, que roda `pnpm exec vitest run` — paga com testes vermelhos que não indicam nenhum bug real no código de produção. O CI não é afetado hoje porque `.github/workflows/ci.yml` roda `tsc --noEmit` (não gera `dist/`) e nunca chama `pnpm build` antes de `vitest run`, então o problema só aparece localmente.

Depois desta mudança, `tsc` para de emitir arquivos de teste para `dist/`, e o Vitest passa a ignorar `dist/` explicitamente na sua própria configuração — cada suíte roda uma única vez, a partir de `src`, e o resultado de `pnpm test` deixa de depender de o `dist/` local estar limpo ou obsoleto.

3 criteria in 1 slice · 0 one-way doors · 1 open, of which 0 block

## Criteria

1. Quando `pnpm build` roda, então `dist/` não contém nenhum arquivo `*.test.js`.
2. Quando `pnpm test` (vitest) roda, então apenas arquivos que casam com `src/**/*.test.ts` são executados — nenhum arquivo em `dist/**/*.test.js` aparece na run, mesmo que `dist/` já contenha artefatos compilados de um build anterior.
3. Dado um `pnpm build` seguido de `pnpm test` (ou `pnpm exec vitest run`, o mesmo comando do `.husky/pre-push`), quando o teste `POST /users — success` roda, então ele retorna 201 de forma determinística — não mais 500 intermitente — porque nenhuma suíte duplicada roda concorrentemente contra os mesmos dados de fixture.

## Out of scope

- Corrigir a condição de corrida em `CreateUser.execute()` (só `email` é verificado antes do insert; `phoneNumber` não é verificado, e não há transação/lock) - esta task remove o gatilho acidental (suítes duplicadas por causa do `dist/`), mas não corrige o problema de fundo, que ainda pode se manifestar em produção com dois cadastros concorrentes usando o mesmo telefone. Ver Unresolved #1.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| command `pnpm build` (tsc) | quais arquivos são emitidos | 1 |
| command `pnpm build` (tsc) | formato de saída e verbosidade | existing - inalterado, saída padrão do tsc |
| command `pnpm build` (tsc) | flags e seus defaults | n/a - nenhuma flag nova é adicionada |
| command `pnpm build` (tsc) | código de saída (exit code) | existing - inalterado |
| command `pnpm test` (vitest) | quais arquivos são executados | 2, 3 |
| command `pnpm test` (vitest) | formato de saída e verbosidade | existing - reporter padrão do Vitest, inalterado |
| command `pnpm test` (vitest) | flags e seus defaults | n/a - nenhuma flag nova é adicionada |
| command `pnpm test` (vitest) | código de saída (exit code) | existing - inalterado |

## Swept

- validation: n/a - nenhuma entrada de usuário é validada por esta mudança
- failure modes: n/a - nenhum modo de falha novo; falhas de compilação/teste seguem o comportamento existente do tsc/vitest
- idempotency and retry: n/a - rodar `pnpm build`/`pnpm test` repetidamente já é determinístico depois desta mudança (critério 1, 2); não há retry a coordenar
- authorization: n/a - ferramenta de build/teste, sem superfície de autorização
- concurrency and ordering: 2, 3 - remove o gatilho que fazia duas suítes idênticas rodarem concorrentemente contra o mesmo banco
- data lifecycle: n/a - nenhuma mudança no ciclo de vida de dados persistidos; o reset de linhas de teste (`beforeEach`) já existe e não muda
- external-dependency failure: n/a - nenhuma dependência externa nova
- state transitions: n/a - nenhuma máquina de estados é alterada
- observability: n/a - nenhum log/métrica novo; o reporter do Vitest já expõe pass/fail

## Impact

| Front | What changes |
|---|---|
| tooling | `tsconfig.json` `exclude` ganha `"**/*.test.ts"` - `tsc` para de emitir arquivos de teste para `dist/`, nenhum código de runtime é afetado |
| tooling | novo arquivo `vitest.config.ts` - a descoberta de arquivos do Vitest passa a ser explícita em vez de depender do default do framework |

## Decided

| Decision | Shape | Alternative rejected |
|---|---|---|
| None - mudança é só de configuração de build/teste, totalmente reversível (editar/remover a entrada do `exclude` ou o arquivo `vitest.config.ts`); nenhum schema, contrato ou dependência nova é introduzido | | |

## Sources

- Investigação nesta sessão (2026-09-21), feita lendo o repositório diretamente: `tsconfig.json:14,25-26` (outDir `dist`, `include: ["src/**/*"]`, sem excluir testes), `package.json:6,8` (`"build": "tsc"`, `"test": "vitest"`), ausência de qualquer `vitest.config.*` no repositório, defaults compilados do Vitest 5.0.1 (`defaultInclude = ["**/*.{test,spec}.?(c|m)[jt]s?(x)"]`, `defaultExclude = ["**/node_modules/**", "**/.git/**"]`), `src/resources/db/schema.ts:6,8` (`usersTable.email`/`.phoneNumber` únicos), `src/application/usecases/CreateUser.ts:35-38` (só `findByEmail` antes do insert, sem transação), `.env` (mesma `DATABASE_URL` real usada pelos testes), `.github/workflows/ci.yml:47,56-57` (CI roda `tsc --noEmit` e nunca `pnpm build`, por isso não reproduz o bug) e `.husky/pre-push:3` (roda `pnpm exec vitest run`, onde o bug aparece localmente se houver um `dist/` obsoleto). Esta task é o registro da decisão; se a investigação relatada aqui divergir do código, pergunte antes de construir.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | open | Vale abrir uma task separada para corrigir a condição de corrida real em `CreateUser.execute()` (só `email` é checado antes do insert; `phoneNumber` não é checado; sem transação/lock), que esta task não toca e que pode ainda gerar um 500 por telefone duplicado em produção sob cadastros concorrentes? | Deixado como está nesta task; a corrida em produção permanece latente até uma task de acompanhamento tratá-la. |
