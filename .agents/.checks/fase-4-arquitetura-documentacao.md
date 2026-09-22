# Fase 4 — Arquitetura e Documentação

Sources:

- `.agents/plans/fase-4-arquitetura-documentacao.md` - discovery + plano de execução, ordem das tarefas, decisões pendentes
- [DEV-21](https://linear.app/henrique-brites/issue/DEV-21/41-mover-portas-de-saida-userrepository-sendnotificationstrategy-para) - critérios de aceite de 4.1 (mover portas)
- [DEV-22](https://linear.app/henrique-brites/issue/DEV-22/42-atualizar-diagrama-de-arquitetura-e-texto-do-readmeagentsmd) - critérios de aceite de 4.2 (diagrama/texto)
- [DEV-23](https://linear.app/henrique-brites/issue/DEV-23/43-documentar-userdaots-no-readme) - critérios de aceite de 4.3 (UserDAO no README)
- [DEV-24](https://linear.app/henrique-brites/issue/DEV-24/44-documentar-no-readme-os-scripts-de-validacao-ja-existentes) - critérios de aceite de 4.4 (scripts no README)
- [DEV-25](https://linear.app/henrique-brites/issue/DEV-25/45-corrigir-nota-desatualizada-em-agentsmd-sobre-agentsreports) - critérios de aceite de 4.5 (nota AGENTS.md)
- [DEV-26](https://linear.app/henrique-brites/issue/DEV-26/46-registrar-decisoes-arquiteturais-relevantes-em-adr-condicional) - critérios de aceite de 4.6 (ADRs), aprovada pelo usuário: sim, formato leve, replicar no Notion sob "solid-masterclass"
- [DEV-27](https://linear.app/henrique-brites/issue/DEV-27/47-adicionar-regra-de-lint-de-fronteira-entre-camadas-opcional) - critérios de aceite de 4.7 (lint de fronteira), aprovada pelo usuário: sim, adicionar dependência
- Resposta do usuário (2026-09-22) - decisões pendentes 2, 3, 4 do plano: diagrama em Mermaid embutido no README; ADRs sim (formato leve + espelho no Notion); lint de fronteira sim (`eslint-plugin-boundaries`)

## Out of scope

- Smoke test de boot da aplicação - não pedido por nenhuma issue desta fase
- Qualquer alteração em `src/resources/daos/UserDAO.ts`, `UserDAODrizzle` ou seu teste - preservação explícita em todas as issues que tocam documentação
- Mudança de comportamento runtime do endpoint `POST /users` - fase é estritamente estrutural (relocação de tipos) e documental

## Landing

Toca `src/application/ports/` (novo), `src/resources/repositories/UserRepository.ts`, `src/resources/notifications/index.ts`, `src/application/usecases/CreateUser.ts`, `src/application/factories/index.ts`, `README.md`, `AGENTS.md`, `eslint.config.js`, `package.json`, `docs/adr/` (novo). Reusa a convenção de arquivo-por-classe já em `AGENTS.md:65-73` para os novos arquivos de porta e ADR.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Interfaces de porta (`UserRepository`, `SendNotificationStrategy`) passam a viver em `src/application/ports/`, um arquivo por interface | `src/application/ports/UserRepository.ts` exporta só a interface; `src/application/ports/SendNotificationStrategy.ts` idem; implementações em `resources/` importam o tipo de lá | manter as interfaces coexistindo com as implementações em `resources/` - já provado como o problema estrutural que a Fase 4 existe para corrigir (`AGENTS.md:63`) |
| Diagrama de arquitetura passa a ser Mermaid embutido no `README.md`, substituindo `.github/images/architecture.jpg` | bloco ` ```mermaid ` dentro da seção "Arquitetura do Projeto"; a imagem `.jpg` e sua referência são removidas do README | manter o `.jpg` e redesenhá-lo - sem fonte editável no repo, não versionável/diff-ável; usuário escolheu Mermaid |
| ADRs formalizados em `docs/adr/`, referenciados por `AGENTS.md` como local de decisões futuras | `docs/adr/0001-localizacao-das-portas-de-saida.md`, `docs/adr/0002-preservacao-do-userdao.md`, formato leve (Contexto/Decisão/Consequências) | não adotar ADRs e manter decisões só em prosa - usuário aprovou a adoção formal |
| `eslint-plugin-boundaries` adicionado como devDependency, com regra que impede `src/application/**` de importar `src/resources/**` ou `src/drivers/**` | nova entrada em `devDependencies` do `package.json`; `elements` e `rules` em `eslint.config.js` | não adicionar a dependência e manter a regra só documentada - usuário aprovou explicitamente a nova dependência (exigido por `AGENTS.md`) |

- Nada além disso nesta mudança é difícil de reverter - o espelho da ADR no Notion é um passo adicional pedido pelo usuário, fora do repositório, e não afeta nenhuma decisão técnica tomada aqui

## Checks

### S1 - Portas de saída movidas para application/ports · 6 files · ~6.9 KB · ~2k

**C1** - `src/application/ports/UserRepository.ts` exporta a interface `UserRepository`
Proof: `grep -q "export interface UserRepository" src/application/ports/UserRepository.ts`

**C2** - `src/resources/repositories/UserRepository.ts` não define mais a interface, só `UserRepositoryDrizzle`, importando o tipo da nova porta
Proof: `! grep -q "export interface UserRepository" src/resources/repositories/UserRepository.ts && grep -q 'from "../../application/ports/UserRepository.js"' src/resources/repositories/UserRepository.ts`

**C3** - `src/application/ports/SendNotificationStrategy.ts` exporta a interface `SendNotificationStrategy`
Proof: `grep -q "export interface SendNotificationStrategy" src/application/ports/SendNotificationStrategy.ts`

**C4** - `src/resources/notifications/index.ts` não define mais a interface, só as 4 implementações, importando o tipo da nova porta
Proof: `! grep -q "export interface SendNotificationStrategy" src/resources/notifications/index.ts && grep -q 'from "../../application/ports/SendNotificationStrategy.js"' src/resources/notifications/index.ts`

**C5** - Nenhum arquivo em `src/application/` importa de `src/resources/`
Proof: `! grep -rn 'resources/' src/application --include="*.ts" | grep -v '.test.ts'`

**C6** - `pnpm run typecheck` passa sem alteração de comportamento
Proof: `pnpm run typecheck`

**C7** - A suíte de testes existente continua verde após a relocação
Proof: `pnpm run test:run`

**C8** - `UserDAO.ts` e `UserDAODrizzle` não foram tocados
Proof: `git diff --name-only <commit-base-da-fase-4> -- src/resources/daos/` retorna vazio

### S2 - Diagrama e texto de arquitetura atualizados · README.md, AGENTS.md · ~17.3 KB · ~5k

**C9** - README contém um bloco Mermaid na seção "Arquitetura do Projeto", substituindo a imagem `.jpg`
Proof: `grep -q '```mermaid' README.md && ! grep -q './.github/images/architecture.jpg' README.md`

**C10** - O texto do README lista `application/ports` como módulo existente, junto de `entities`, `usecases`, `factories`, `errors`
Proof: `grep -q 'application/ports\|ports`' README.md` (leitura manual confirma a menção na seção de arquitetura)

**C11** - Nenhum componente fantasma (`DTO`, `Services`, `CLIs`, `APIs Externas`) aparece nas seções de arquitetura do README e do AGENTS.md
Proof: `! grep -niE '\bDTO\b|\bServices\b|\bCLIs\b|APIs Externas' README.md AGENTS.md`

**C12** - AGENTS.md (seção "Arquitetura Hexagonal") lista exatamente os módulos existentes em `src/application` (incluindo `ports`), `src/drivers`, `src/resources`
Proof: leitura manual da seção `## Arquitetura Hexagonal` do `AGENTS.md` comparada a `find src -maxdepth 2 -type d | sort`

### S3 - UserDAO documentado no README · README.md · ~8.2 KB · ~2k

**C13** - README menciona `src/resources/daos/UserDAO.ts`, explica que é material de estudo de DIP, não usado em runtime, e que o fluxo real usa `UserRepository`
Proof: `grep -q 'UserDAO' README.md` (leitura manual confirma as três afirmações exigidas pela issue)

### S4 - Scripts de validação documentados no README · README.md · ~8.2 KB · ~2k

**C14** - README lista `pnpm run typecheck`, `pnpm run test:run`, `pnpm run test:coverage`, `pnpm run test:types` e `pnpm run format:check`, cada um correspondendo a um script real de `package.json`
Proof: `for s in typecheck test:run test:coverage test:types format:check; do grep -q "pnpm run $s" README.md || exit 1; done`
Proof: `for s in typecheck test:run test:coverage test:types format:check; do node -e "if(!require('./package.json').scripts['$s'])process.exit(1)"; done`

### S5 - Nota desatualizada de AGENTS.md corrigida · AGENTS.md · ~9.1 KB · ~2k

**C15** - `AGENTS.md` não afirma mais que `.agents/reports/` ou `.agents/plans/` "ainda não existem"
Proof: `! grep -q 'ainda não existem' AGENTS.md` ou, se a frase for reescrita mantendo a palavra para outros diretórios, leitura manual confirma que `reports/` e `plans/` não estão mais na lista dos que "ainda não existem"

### S6 - ADRs formalizados · docs/adr/, AGENTS.md, Notion · ~1 KB (novo) + trecho de AGENTS.md · ~1k

**C16** - `docs/adr/0001-localizacao-das-portas-de-saida.md` existe e documenta contexto, decisão e consequências da relocação das portas (4.1)
Proof: `test -f docs/adr/0001-localizacao-das-portas-de-saida.md`
Proof: `grep -qi 'contexto' docs/adr/0001-localizacao-das-portas-de-saida.md && grep -qi 'decisão' docs/adr/0001-localizacao-das-portas-de-saida.md && grep -qi 'consequências' docs/adr/0001-localizacao-das-portas-de-saida.md`

**C17** - `docs/adr/0002-preservacao-do-userdao.md` existe e formaliza a decisão já vigente de preservar `UserDAO.ts`, sem alterar o conteúdo normativo já existente em `AGENTS.md:75-79`
Proof: `test -f docs/adr/0002-preservacao-do-userdao.md`
Proof: leitura manual confirma que a seção "Preservação de `UserDAO.ts`" do `AGENTS.md` mantém seu conteúdo normativo original (só ganha, no máximo, uma referência à ADR)

**C18** - `AGENTS.md` referencia `docs/adr/` como local de registro de decisões arquiteturais relevantes daqui em diante
Proof: `grep -q 'docs/adr' AGENTS.md`

**C19** - As mesmas duas ADRs existem como páginas no Notion, dentro de uma página/pasta chamada "solid-masterclass"
Proof: leitura manual - confirmação de que as duas páginas foram criadas via `notion-create-pages` sob uma página "solid-masterclass" e que seus links foram reportados ao usuário

### S7 - Lint de fronteira entre camadas · eslint.config.js, package.json · ~2.3 KB · ~1k

**C20** - `package.json` lista `eslint-plugin-boundaries` em `devDependencies`
Proof: `node -e "if(!require('./package.json').devDependencies['eslint-plugin-boundaries'])process.exit(1)"`

**C21** - `eslint.config.js` define uma regra que falha caso `src/application/**` importe de `src/resources/**` ou `src/drivers/**`
Proof: manual - inserir temporariamente um import de `resources` em um arquivo de `src/application`, rodar `pnpm lint` e confirmar exit code ≠ 0, depois reverter o import temporário

**C22** - `pnpm lint` passa no estado real do código (pós-4.1, sem o import de teste)
Proof: `pnpm lint`

## Swept

- validation: n/a (per source) - fase não altera validação de entrada do endpoint
- failure modes: n/a (per source) - fase não altera fluxo de erro do `CreateUser`
- idempotency and retry: n/a (per source) - fase não altera semântica de escrita
- authorization: n/a (per source) - endpoint não tem autorização hoje, fora de escopo desta fase
- concurrency and ordering: n/a (per source) - nenhuma mudança de concorrência
- data lifecycle: n/a (per source) - nenhum dado persistido é afetado
- external-dependency failure: C21, C22 - a nova dependência de lint (`eslint-plugin-boundaries`) é validada tanto pelo caso positivo (C22, lint passa hoje) quanto pelo caso de falha proposital (C21, um import inválido quebra o lint)
- state transitions: n/a (per source) - nenhuma máquina de estados envolvida
- observability: n/a (per source) - fora de escopo desta fase

## Coverage

- Nenhum conjunto enumerado adicional além do que os Checks e o `Swept` acima já cobrem - as sete issues (DEV-21..27) já enumeram integralmente os critérios de aceite desta fase, e cada critério está coberto por um check ou marcado `n/a`/`existing` conforme a fonte.
- `docs/adr/*` (2 ADRs) -> C16 (0001), C17 (0002) - ambas com proof
- Notion mirror (2 páginas) -> C19 - única checagem manual da fase por não haver ferramenta de asserção automatizável para conteúdo do Notion
- Claims que citam um caminho de arquivo, script ou comando concreto: C1, C2, C3, C4, C5, C6, C7, C8, C9, C11, C13, C14, C15, C16, C17, C18, C20, C21, C22 - cada um tem prova que executa o comando real ou lê o arquivo diretamente.

## Handoff

Uma única fatia de trabalho no total, ~23.5 KB de leitura estimada (~6k tokens) - muito abaixo de qualquer limite de handoff (150k). Build completo em uma única sessão, sem handoff entre agentes.
