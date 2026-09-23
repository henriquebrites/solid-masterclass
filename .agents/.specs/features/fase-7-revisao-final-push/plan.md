# Fase 7 — Revisão final e push

## Problem

O working tree de `chore/phase-7-spec-lean-comparison` está limpo e idêntico ao histórico de
`main` acrescido apenas dos merges de CI (Fase 6). Não há, hoje, um commit de "Fase 7" no
repositório, e a fase carrega duas inconsistências já comprovadas por investigação anterior
(`.agents/reports/fase-7-revisao-final-push.md`, branch `chore/phase-7-end-review-push`,
aprovada pelo usuário em 2026-09-22) e reconfirmadas nesta sessão:

- `pnpm run lint` termina com exit code 1 sempre que `dist/` já existe em disco (situação normal
  depois de rodar `pnpm run build` localmente), porque `eslint.config.js:9-25` define
  `ignores: ["dist", "node_modules"]` dentro do mesmo objeto de configuração que também tem
  `languageOptions`, `files`, `plugins`, `rules` e `extends` — em ESLint flat config, `ignores`
  só vira ignore global quando está sozinho no seu próprio objeto. Reproduzido nesta sessão:
  6 erros `simple-import-sort/imports`, todos em `dist/*.js`. Quem roda o gate local antes de
  um push paga com um lint vermelho que não indica nenhum problema real de código.
- `.agents/.tasks/fix-vitest-dist-test-isolation.md` continua fora de `.agents/.tasks/done/`
  embora seus 3 critérios já estejam implementados no código atual: `tsconfig.json:26` já exclui
  `**/*.test.ts` do build e `vitest.config.ts` já exclui `dist`. O tracker de tarefas do projeto
  desalinha do estado real do código.

O que muda quando esta fase termina: o gate local (`typecheck`, `lint`, `format:check`, `build`,
`test:run`) fecha limpo mesmo com `dist/` já presente em disco, o tracker de tarefas reflete o
código real, o diff que entra no commit é auditado contra segredos e artefatos gerados, o commit
segue o padrão do projeto e chega a `origin` passando pelo gate do `.husky/pre-push`.

## Flow

Reaproveita o gate de qualidade já existente (`pnpm run typecheck/lint/format:check/build/test:run`,
os mesmos comandos que `.github/workflows/ci.yml` roda) e o hook `.husky/pre-push` já existente —
nenhum comando novo é criado.

`single module - eslint.config.js` (única mudança de código desta fase) mais duas ações de
processo fora do código: reposicionar um arquivo de tracker e o ciclo git add → commit → push.

1. `pnpm run lint` (exists) -> lê `eslint.config.js` (exists) - hoje linta `dist/` porque
   `ignores` está dentro de um objeto de config com outras chaves; a correção move
   `ignores: ["dist", "node_modules"]` para um objeto isolado (mesmo arquivo, sem novo arquivo)
2. `git add` (exists) -> stage seletivo de `eslint.config.js`, da relocação de
   `.agents/.tasks/fix-vitest-dist-test-isolation.md`, de `AGENTS.md` e dos artefatos
   `.agents/.specs/features/fase-7-revisao-final-push/{plan.md,checks.md}` ->
   `/commit-message` (skill existente) gera a mensagem -> `git commit` (exists)
3. `git push` (exists) -> `.husky/pre-push` (exists) roda `pnpm run test:run` -> `origin` (exists)

## Impact

| Front | What changes |
| --- | --- |
| tooling | `eslint.config.js`: `ignores: ["dist", "node_modules"]` passa a viver sozinho em seu próprio objeto de configuração, sem `languageOptions`/`files`/`plugins`/`rules`/`extends` junto - nenhuma regra de lint muda, só o escopo do ignore |
| tracker | `.agents/.tasks/fix-vitest-dist-test-isolation.md` muda de local para `.agents/.tasks/done/fix-vitest-dist-test-isolation.md`, conteúdo inalterado - reflete que seus 3 critérios já estão implementados |
| docs | `AGENTS.md`: adiciona `.agents/.specs/` à tabela de diretórios de saída de skill, seguindo a própria regra do arquivo de que diretório com nome iniciado por ponto vive dentro de `.agents/` - descoberto ao escrever este `plan.md`, que por padrão da skill `tlc-spec-lean` teria ido para `.specs/` na raiz |
| stored data | nada a migrar - nenhuma mudança de schema ou dado |

## Relations

`None - no stored-data shape change`

## Surface

`None - nothing consumed outside` (mudança de tooling/processo interno; nenhuma rota HTTP é
adicionada ou muda de assinatura)

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| `git push origin chore/phase-7-spec-lean-comparison` publica o(s) commit(s) desta fase no remoto compartilhado | `git push` (sem `--force`) só depois que `git status`, `git diff --cached` e o gate local confirmarem que só os arquivos pretendidos estão no commit | reescrever o commit depois de publicado (`git commit --amend` + `push --force`) - rejeitado porque reescreve histórico que colaboradores/CI já podem ter buscado; a Regra Crítica 8 desta skill já trata push como uma ação que exige autorização explícita separada da aprovação do plano |

- Nada mais nesta mudança é difícil de reverter: a correção em `eslint.config.js` volta a ser o
  estado atual com uma edição; a relocação do arquivo de tracker é um `git mv` reversível.

## Criteria

### S1: Gate local fecha limpo, reproduzindo o CI (P1)

O gate de qualidade que hoje falha em `lint` quando `dist/` já existe em disco passa a fechar
limpo do início ao fim, na mesma ordem que `.github/workflows/ci.yml` usa.

**Acceptance Criteria**

1. WHEN `pnpm run typecheck` roda THEN o sistema SHALL terminar com exit code `0`.
2. WHEN `pnpm run lint` roda com `dist/` já presente em disco (produzido por um `pnpm run build` anterior) THEN o sistema SHALL terminar com exit code `0` e SHALL NOT reportar nenhum erro cujo caminho de arquivo esteja sob `dist/`.
3. WHEN `pnpm run format:check` roda THEN o sistema SHALL terminar com exit code `0`.
4. WHEN `pnpm run test:run` roda contra o Postgres local (`docker-compose`, porta `5433`) THEN o sistema SHALL reportar `66 passed` em `10` arquivos de teste com exit code `0`.
5. WHEN `pnpm run build` roda THEN o sistema SHALL terminar com exit code `0` e SHALL NOT emitir nenhum arquivo `*.test.js` sob `dist/`.

**Independent test:** rodar os 5 comandos em sequência a partir da raiz do projeto, com o
container `solid-masterclass-db-1` ativo, e conferir exit code e as strings acima na saída.

### S2: `eslint.config.js` ignora `dist/` e `node_modules/` globalmente (P1)

A causa raiz do erro 2 acima fica corrigida na configuração, não contornada rodando lint antes do
build.

**Acceptance Criteria**

6. O `eslint.config.js` SHALL definir um objeto de configuração cuja única chave é `ignores: ["dist", "node_modules"]` - sem `languageOptions`, `files`, `plugins`, `rules` ou `extends` no mesmo objeto.
7. IF `pnpm run lint` roda com um `dist/` já compilado presente THEN o sistema SHALL NOT reportar nenhum erro sob `dist/` (mesma observação do critério 2, agora coberta pela causa raiz).

**Independent test:** `pnpm run build && pnpm run lint` a partir de um checkout onde `dist/` ainda
não existia; exit code `0`.

### S3: Tracker reflete o código real (P2)

A task já resolvida no código sai da lista de pendências.

**Acceptance Criteria**

8. WHEN a revisão confirma que `tsconfig.json` exclui `**/*.test.ts` do build e que `vitest.config.ts` exclui `dist` da descoberta de testes THEN o sistema SHALL mover `.agents/.tasks/fix-vitest-dist-test-isolation.md` para `.agents/.tasks/done/fix-vitest-dist-test-isolation.md` sem alterar o conteúdo do arquivo.

**Independent test:** `git mv` mostrado no diff como rename puro (100% de similaridade), sem
alterações de linha.

### S4: Diff auditado antes do commit (P1)

Nenhum segredo ou artefato gerado entra no commit.

**Acceptance Criteria**

9. IF `git status --ignored` lista um arquivo sob `node_modules/`, `dist/`, `coverage/`, `.data-postgres/`, ou chamado `.env` THEN o sistema SHALL NOT incluir esse arquivo em `git add` nem no commit.
10. WHEN o commit é montado THEN `git diff --cached --stat` SHALL listar exatamente os arquivos pretendidos desta fase (`eslint.config.js`, a relocação da task, `AGENTS.md`, e os artefatos `.agents/.specs/features/fase-7-revisao-final-push/plan.md` e `checks.md`) e SHALL NOT listar nenhum arquivo ignorado por `.gitignore`.

**Independent test:** `git status --ignored` antes do `add`, e `git diff --cached --stat` depois,
comparados manualmente contra a lista de arquivos pretendidos.

### S5: Commit e push confirmados (P1)

O ciclo de fechamento da fase: mensagem gerada pela skill, commit único, histórico conferido,
push confirmado pelo próprio gate do `pre-push`.

**Acceptance Criteria**

11. WHEN o diff estiver staged (S4) THEN o sistema SHALL gerar a mensagem de commit com a skill `/commit-message` e SHALL criar exatamente um commit terminando com essa mensagem.
12. WHEN o commit é criado THEN `git log --oneline -3` SHALL mostrá-lo como o commit mais recente da branch, acima de `2d2290b`.
13. WHEN `git push` roda THEN o hook `.husky/pre-push` SHALL executar `pnpm run test:run` antes de publicar, e o push SHALL NOT alcançar `origin` se essa execução terminar com exit code diferente de `0`.
14. WHEN o push termina com sucesso THEN `git status` SHALL reportar a branch local em paridade com `origin/chore/phase-7-spec-lean-comparison` (nenhum commit local à frente do remoto).

**Independent test:** `git log --oneline -3` antes e depois do commit, e `git status`/
`git rev-list --left-right --count origin/<branch>...<branch>` depois do push.

### S6: Rastreamento no Linear (P2)

A fase fica visível no tracker do projeto, seguindo o mesmo padrão usado nas Fases 5 e 6.

**Acceptance Criteria**

15. WHEN este plano é aprovado THEN o sistema SHALL criar uma issue no Linear (time/projeto "Development MVP", o mesmo usado nas Fases 5-6) rastreando "Fase 7 — Revisão final e push".
16. WHEN o push do critério 14 é confirmado THEN o sistema SHALL mover essa issue do Linear para o estado Done.

**Independent test:** issue visível no Linear com status inicial diferente de Done após a
criação, e status Done após a confirmação do push.

## Out of scope

| Excluded | Why |
| --- | --- |
| Corrigir a condição de corrida em `CreateUser.execute()` (só `email` é verificado antes do insert, `phoneNumber` não, sem transação) | Já registrado como "Unresolved #1" na task de vitest e no relatório de descoberta anterior; é um problema de produto pré-existente, não algo introduzido ou revisado nesta fase de revisão final e push |
| Gate de cobertura de testes ou proteção de branch no CI | Decisão explícita do usuário já registrada na Fase 6 (`.agents/.tasks/done/fase-6-automacao-integracao-continua.md`) |
| Abrir Pull Request para esta branch | O usuário pediu revisão final, commit e push; abrir PR é a skill `open-pr`, não solicitada nesta tarefa |
| Qualquer mudança de código além da correção em `eslint.config.js` | Fora do objetivo "revisão final e push"; uma revisão final não é o momento de refatorar |

## Assumptions

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Branch de destino do commit/push é a branch atual, `chore/phase-7-spec-lean-comparison` | Commitar e dar push nesta branch, não em `chore/phase-7-end-review-push` (que já existe com apenas o relatório de descoberta) | É a branch em que a skill foi invocada nesta sessão; nenhuma instrução do usuário pediu trocar de branch | n |
| Time/projeto do Linear para a nova issue | "Development MVP", o mesmo das Fases 5 e 6 | Precedente direto nos dois arquivos `.agents/.tasks/done/fase-{5,6}-*.md`, que citam esse time/projeto e linkam issues `DEV-*` | n |
| Escopo da correção em `eslint.config.js` | Só reposicionar `ignores: ["dist", "node_modules"]` para um objeto próprio - nenhuma outra regra de lint muda | Menor mudança que corrige a causa raiz comprovada; qualquer regra adicional seria refatoração fora do objetivo desta fase | n |

**Open questions:** none - todas resolvidas ou registradas acima.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| command `pnpm run lint` | código de saída | AC 2, 7 |
| command `pnpm run lint` | formato de saída e verbosidade | existing - reporter stylish padrão do ESLint, inalterado |
| command `pnpm run lint` | flags e seus defaults | n/a - nenhuma flag nova é adicionada |
| command `pnpm run test:run` | código de saída | AC 4 |
| command `pnpm run test:run` | o que imprime numa falha parcial | existing - reporter padrão do Vitest, inalterado; os logs de `DrizzleQueryError`/"duplicate key" durante os testes de conflito são esperados e pré-existentes |
| command `pnpm run build` | código de saída e quais arquivos são emitidos | AC 1, 5 |
| command `git push` | o que acontece quando falha (pre-push barra o push) | AC 13 |
| todos os comandos acima | versionamento, rate limit | n/a - scripts de desenvolvimento internos, sem consumidor externo |

## Sources

- `.agents/reports/fase-7-revisao-final-push.md` (branch `chore/phase-7-end-review-push`,
  aprovado pelo usuário em 2026-09-22) - relatório de descoberta que primeiro identificou a causa
  raiz do lint e a task de tracker desalinhada; reconfirmado nesta sessão com os mesmos comandos.
- `.agents/.tasks/done/fase-6-automacao-integracao-continua.md` - precedente de time/projeto do
  Linear ("Development MVP") e do padrão de mover a task de fase para `done/` ao final.
