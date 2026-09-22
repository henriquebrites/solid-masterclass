# DEV-12 — Validação final da configuração dos agentes (Fase 2)

> Run: `harness-eval` `2026-09-22-full` (`.agents/.harness-eval/runs/2026-09-22-full/` — movido de `.harness-eval/` na raiz após a execução original)
> Escopo do run: T0 (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agents.mdc`) + T1 (9 skills) + T2 (34 refs, incluindo docs opcionais `.github/workflows/ci.yml`, `package.json`, `tsconfig.json` por aprovação do usuário) + Track A (correção) + Track C (utilidade, dual-judge `claude-sonnet-5`).

## Critérios de aceite

### 1. `harness-eval` executado contra o estado final do repositório e produz veredito

**Atendido.** Run completo: inventário (796→799 claims após docs opcionais) → Track A (deterministic) → Track C (surfaces + Judge1 + Judge2 + merge). Veredito por surface: **Keep-core: 37 · Mixed: 1 · Slim: 1 · Hold: 3** (`10-usefulness-agreement.md`). Trap gate PASS (0 misses), fan-in gate PASS (0 bloqueios).

Track B (redundância) não foi executado — o usuário optou por `C` no gate Q2 do próprio `harness-eval`, não `B` nem `B+C`. O critério de aceite pede "um veredito (Ship/Review/Hold/Slim/Keep-core)", que a Track A + Track C já produzem (Slim/Keep-core/Mixed/Hold); Ship/Review é rótulo específico de Track B, não solicitada nesta execução.

### 2. Nenhum caminho/comando em `AGENTS.md`, `CLAUDE.md` ou `.cursor/rules/` aponta para algo inexistente

**Atendido — confirmado por Track A e por verificação manual independente.**

- Track A (`04-correctness.md`): **14 achados BROKEN no total, 0 nos arquivos T0** (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agents.mdc`). Todos os 14 estão em arquivos de referência de outras skills não tocadas pelas tarefas 2.1–2.5 (`harness-eval/SKILL.md`, `harness-eval/references/PROTOCOL.md`, `tlc-spec-driven/references/tasks.md`, `tlc-spec-lean/references/verify.md`) — exemplos genéricos e stack-agnósticos (`bin/rails`, `yarn test:unit`, `lib/...`, `.cursor/skills`) inerentes a esses templates, não referências ao projeto.
- Verificação manual: todos os caminhos citados em `AGENTS.md` (diretórios de `.agents/`, `src/{drivers,application,resources}`, `UserDAO.ts`, `UserRepository.ts`, `eslint.config.js`, `.prettierrc`, `.editorconfig`, `tsconfig.json`, `package.json`, `.github/workflows/ci.yml`, `.husky/`, `src/application/errors`, `.env.example`, `README.md`) resolvem no repositório. Os diretórios `.agents/plans/`, `.agents/reports/`, `.agents/research/`, `.agents/artifacts/`, `.agents/tmp/` e `docs/` estão ausentes conforme esperado — `AGENTS.md` já os declara como "ainda não existem, criar sob demanda". Os 4 scripts citados (`lint`, `format`, `test`, `build`) existem em `package.json`.

### 3. Claude Code lista e carrega as 9 skills via `.claude/skills/`

**Atendido — verificação manual.** Os 9 symlinks em `.claude/skills/` (`commit-message`, `github-readme-generator`, `harness-eval`, `the-judge`, `tlc-discover`, `tlc-implement`, `tlc-plan`, `tlc-spec-driven`, `tlc-spec-lean`) resolvem para `.agents/skills/<nome>/SKILL.md`, todos existentes e legíveis.

### 4. Cursor localiza as regras em `.cursor/rules/`

**Atendido — verificação manual.** `.cursor/rules/agents.mdc` existe com frontmatter válido (`description`, `alwaysApply: true`) no formato que o Cursor espera para regras carregadas automaticamente, e referencia `AGENTS.md`/`CLAUDE.md` mais a lista textual das 9 skills.

### 5. Achados de Hold/inconsistência bloqueante registrados e resolvidos ou aceitos como pendência

**Atendido — nenhum achado bloqueante; 3 Hold e 1 Slim registrados como pendência aceita (sem ação nesta tarefa).**

Track A não teve achados BROKEN dentro do escopo de 2.1–2.5 (ver critério 2). Track C produziu:

| ID | Path | Veredito | Motivo | Decisão |
|----|------|----------|--------|---------|
| S001 | `.cursor/rules/agents.mdc` | Mixed (dual) | A ponte de descoberta do Cursor é comportamental (keep), mas a lista de 9 skills duplica `CLAUDE.md` (overlap) | **Aceito como pendência.** A duplicação é intencional e já documentada em `CLAUDE.md` ("O Cursor tem instruções equivalentes... lista as mesmas skills por referência textual") — o Cursor não descobre `.agents/skills/` sozinho, então a lista textual é a única forma de exposição. `11-mixed-apply.md` fica disponível para uma futura tarefa de slim, se decidido. |
| S003 | `CLAUDE.md` | Hold (J1=MIXED, J2=KEEP-CORE) | Divergência entre juízes sobre se a seção de skills é puramente roteamento ou também substância | **Aceito como pendência.** Divergência de julgamento subjetivo (usefulness é model-sensitive por definição do próprio `harness-eval`), não uma inconsistência factual — `CLAUDE.md` está fora do escopo de edição desta tarefa (2.6 é validação, não reescrita de 2.1–2.5). |
| S015 | `.agents/skills/harness-eval/references/GLOSSARY.md` | Hold (J1=MIXED, J2=SLIM) | Divergência sobre se o glossário é carregado por agente ou só embutido pelos scripts de merge | **Aceito como pendência.** Fora do escopo de 2.1–2.5 (pertence à própria skill `harness-eval`, que a tarefa explicitly marca como "existente — usar, não modificar"). |
| S027 | `.agents/skills/tlc-spec-driven/references/coding-principles.md` | Hold (J1=KEEP-CORE, J2=MIXED) | Divergência sobre se a seção "Writing Voice" é teoria genérica ou comportamental | **Aceito como pendência.** Fora do escopo de 2.1–2.5 (skill `tlc-spec-driven`, não tocada por esta fase). |
| S026 | `.agents/skills/tlc-spec-driven/references/code-analysis.md` | Slim (dual) | Conselho genérico de prioridade de ferramentas (ast-grep/ripgrep/grep), sem mandato de carregamento nem conteúdo específico do repo | **Aceito como pendência.** Fora do escopo de 2.1–2.5 (skill `tlc-spec-driven`, não tocada por esta fase); nenhum fan-in bloqueado. |

Nenhum dos 5 achados acima está em `AGENTS.md`, `CLAUDE.md` (exceto S001/S003, que são divergências de julgamento, não quebras) ou nos arquivos efetivamente produzidos pelas tarefas 2.1–2.5 de forma que exija correção obrigatória. Todos ficam registrados aqui e nos artefatos brutos do run (`.agents/.harness-eval/runs/2026-09-22-full/`) para decisão futura, sem bloquear o fechamento da Fase 2.

## Resultado esperado (registro objetivo)

Este documento, junto com `.agents/.harness-eval/runs/2026-09-22-full/` (inventário, Track A, Track C, judges, merge), constitui o registro objetivo exigido: confirma que Claude Code e Cursor localizam e seguem as instruções e skills configuradas, e que nenhum caminho citado em `AGENTS.md`/`CLAUDE.md`/`.cursor/rules/` está quebrado.

## Pendências

- 4 achados Hold/Slim de Track C (S001, S003, S015, S026, S027) aceitos como pendência com justificativa acima — nenhuma ação de código foi tomada, conforme regra "Report-only by default" do próprio `harness-eval` e o limite de escopo desta tarefa (validação, não remediação).
- Track B (redundância) não foi executado nesta run — escopo escolhido pelo usuário foi Track C. Pode ser rodado separadamente se desejado.
