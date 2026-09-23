# Fase 7 — Revisão final e push checks

Profile: light
Plan: `.specs/features/fase-7-revisao-final-push/plan.md`

16 checks in 6 slices · 1 one-way door · 0 open, of which 0 block

## Checks

### S1 - Gate local fecha limpo · 1 file (eslint.config.js) · 1.7 KB · ~1k

**C1** - `pnpm run typecheck` termina com exit code 0 (AC 1)
Proof: `pnpm run typecheck` (exit code 0)

**C2** - `pnpm run lint` termina com exit code 0 e sem erro sob `dist/`, mesmo com `dist/` já compilado em disco (AC 2)
Proof: `pnpm run build && pnpm run lint` (exit code 0; nenhuma linha de saída contém `/dist/`)

**C3** - `pnpm run format:check` termina com exit code 0 (AC 3)
Proof: `pnpm run format:check` (exit code 0)

**C4** - `pnpm run test:run` reporta `66 passed` em `10` arquivos com exit code 0 (AC 4)
Proof: `pnpm run test:run` (exit code 0; saída contém `Test Files  10 passed (10)` e `Tests  66 passed (66)`)

**C5** - `pnpm run build` termina com exit code 0 e não emite `*.test.js` sob `dist/` (AC 5)
Proof: `pnpm run build && test -z "$(find dist -name '*.test.js')"` (exit code 0)

### S2 - `eslint.config.js` ignora `dist/`/`node_modules/` globalmente · 1 file · 1.7 KB · ~1k

**C6** - `eslint.config.js` define um objeto de configuração cuja única chave é `ignores: ["dist", "node_modules"]` (AC 6)
Proof: `python3 -c "import re,sys; c=open('eslint.config.js').read(); sys.exit(0 if re.search(r'\{\s*ignores: \[\"dist\", \"node_modules\"\],\s*\}', c) else 1)"` (exit code 0)

**C7** - Com `dist/` compilado presente, `pnpm run lint` não reporta nenhum erro sob `dist/` (AC 7, mesma observação de C2 agora coberta pela causa raiz)
Proof: `pnpm run build && pnpm run lint` (exit code 0; nenhuma linha de saída contém `/dist/`) - reusa o comando de C2

### S3 - Tracker reflete o código real · 1 file (relocação) · 7.2 KB · ~2k

**C8** - `.agents/.tasks/fix-vitest-dist-test-isolation.md` é movido para `.agents/.tasks/done/` sem alteração de conteúdo (AC 8)
Proof: `git diff --cached --find-renames=100% --diff-filter=R --name-status | grep -q "fix-vitest-dist-test-isolation.md"` (exit code 0 - o diff staged mostra rename puro, 100% de similaridade)

### S4 - Diff auditado antes do commit · 0 files novos (leitura de estado do git) · ~1k

**C9** - Nenhum arquivo staged está sob um caminho ignorado por `.gitignore` (`node_modules/`, `dist/`, `coverage/`, `.data-postgres/`, `.env`) (AC 9)
Proof: `! (git diff --cached --name-only | git check-ignore --stdin)` (exit code 0 - `check-ignore` não casa nenhum arquivo staged, então o `!` inverte seu exit 1 para 0)

**C10** - `git diff --cached --stat` lista exatamente os 5 arquivos pretendidos (`eslint.config.js`, a relocação da task, `AGENTS.md`, `plan.md` e `checks.md` desta feature) e nenhum arquivo ignorado (AC 10)
Proof: `test "$(git diff --cached --name-only | sort)" = "$(printf '%s\n' '.agents/.specs/features/fase-7-revisao-final-push/checks.md' '.agents/.specs/features/fase-7-revisao-final-push/plan.md' '.agents/.tasks/done/fix-vitest-dist-test-isolation.md' 'AGENTS.md' 'eslint.config.js' | sort)"` (exit code 0)

### S5 - Commit e push confirmados · 0 files novos (comandos git) · ~2k

**C11** - O commit criado a partir do diff staged usa uma mensagem no padrão Conventional Commits gerada pela skill `/commit-message` (AC 11)
Proof: `git log -1 --pretty=%s | grep -Eq '^(feat|fix|chore|docs|refactor|test|ci|build|perf|style)(\(.+\))?: .+'` (exit code 0)

**C12** - O commit criado é o mais recente da branch, com `2d2290b` como pai direto (AC 12)
Proof: `test "$(git log --oneline -2 | tail -1 | cut -d' ' -f1)" = "2d2290b"` (exit code 0)

**C13** - `.husky/pre-push` executa `pnpm run test:run` antes de publicar, barrando o push se esse comando falhar (AC 13)
Proof: `grep -q 'pnpm run test:run' .husky/pre-push` (exit code 0 - hook já existente, não modificado nesta fase; seu comportamento de barrar o push em falha é o default do husky para um script que termina com exit code diferente de 0)

**C14** - Depois do push, a branch local está em paridade com `origin/chore/phase-7-spec-lean-comparison` (AC 14)
Proof: `git status | grep -q "Your branch is up to date with 'origin/chore/phase-7-spec-lean-comparison'"` (exit code 0)

### S6 - Rastreamento no Linear · sem arquivos de código · ~1k

**C15** - Uma issue é criada no Linear, time/projeto "Development MVP", rastreando "Fase 7 — Revisão final e push" (AC 15)
Proof: chamada `mcp__claude_ai_Linear__get_issue` pelo id da issue criada retorna `team` = "Development MVP" e `title` contendo "Fase 7"

**C16** - Depois do push confirmado (C14), a mesma issue é movida para o estado Done (AC 16)
Proof: chamada `mcp__claude_ai_Linear__get_issue` pelo mesmo id retorna `state.name` = "Done"

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| comandos do gate local (5) | typecheck C1 · lint C2 · format:check C3 · test:run C4 · build C5 | - |
| categorias de caminho ignorado a vigiar no diff (5) | C9, table-driven over all 5 categories via `.gitignore` (`node_modules`, `.env`, `dist`, `.data-*`, `coverage`) | - |
| one-way doors (1) | `git push origin` C13, C14 | - |

- Nenhum claim desta fase nomeia status code, rota ou schema - `Relations` e `Surface` do plano
  são `None`, então não há linhas adicionais de contrato a cobrir.

## Swept

- validation and bounds: n/a - nenhuma entrada de usuário é validada por esta mudança
- failure and partial failure: C13 - o `pre-push` já existente barra o push se `pnpm run test:run` falhar no meio do gate
- idempotency, retry, duplicates: n/a - `git push` sem alterações locais adicionais não recria o commit; nenhum retry a coordenar
- authorization and rate limits: n/a - ferramenta de tooling/processo interno, sem superfície de autorização
- concurrency and ordering: n/a - execução sequencial por um único agente, sem escrita concorrente no mesmo branch
- data lifecycle: n/a - nenhuma mudança no ciclo de vida de dados persistidos pela aplicação
- external-dependency failure: n/a - falha de rede em `git push` já é reportada pelo próprio `git` com exit code diferente de 0; nenhum fallback novo é introduzido
- state transitions: C15, C16 - a issue do Linear transita de um estado inicial (não Done) para Done somente depois do push confirmado
- observability: n/a - nenhum log/métrica novo é introduzido pela aplicação

## Out of scope

Ver `plan.md` seção `## Out of scope` - corrigir a condição de corrida em `CreateUser.execute()`,
gate de cobertura/proteção de branch, abrir Pull Request, e qualquer mudança de código além da
correção em `eslint.config.js`.

## Handoff

Tamanho total: `eslint.config.js` (1.7 KB) + relocação de `fix-vitest-dist-test-isolation.md`
(7.2 KB, conteúdo inalterado) + leituras de estado do git/Linear (sem arquivo) ≈ 9 KB / 4 ≈
2.3k tokens - muito abaixo do budget default de 150k.

- Todos os 16 checks cabem em um único builder, sem handoff. Nenhuma pergunta de mecanismo é
  necessária.
