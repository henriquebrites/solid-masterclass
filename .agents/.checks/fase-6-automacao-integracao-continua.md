# Fase 6 — Automação e integração contínua

Sources:

- `.agents/.tasks/fase-6-automacao-integracao-continua.md` - descrição, critérios de aceite, decisões resolvidas e ordem de execução das 4 tarefas
- `.agents/.design/fase-6-automacao-integracao-continua.md` - discovery confirmado, origem do escopo (referenciado pela task, não reaberto)

## Out of scope

- Proteção de branch em `main` - decisão do usuário (2026-09-22), configuração manual no GitHub
- Gate/threshold de cobertura mínima - decisão do usuário (2026-09-22), `test:coverage` permanece informativo
- `test:types` no CI - não confirmado como necessidade comprovada
- `CONTRIBUTING.md` dedicado - decisão do usuário (2026-09-22), emendar o README em vez de criar arquivo novo

## Landing

Toca `.github/workflows/ci.yml`, `package.json`, `README.md` e cria `.github/PULL_REQUEST_TEMPLATE.md` e `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md`. Nenhuma mudança de schema, contrato de API ou comportamento de runtime da aplicação.

- Nenhum door nesta mudança - são 4 tarefas independentes de documentação/CI, nenhuma introduz um padrão novo que o próximo código precise copiar, nem persiste dado ou contrato externo

## Checks

### S1 - Relatório de cobertura no CI, sem gate · 1 arquivo · ~1 KB · ~1k

**C1** - `.github/workflows/ci.yml` contém um step "Coverage report" que executa `pnpm run test:coverage`, posicionado depois do step "Run tests"
Proof: `awk '/name: Run tests/{r=NR} /name: Coverage report/{c=NR} END{exit !(c>r && r>0)}' .github/workflows/ci.yml && grep -A1 'name: Coverage report' .github/workflows/ci.yml | grep -q 'pnpm run test:coverage'`

**C2** - Nenhum campo `coverage.thresholds` foi adicionado a `vitest.config.ts`
Proof: `! grep -q 'thresholds' vitest.config.ts`

**C3** - `pnpm run test:coverage` roda até o fim e sai com exit code `0`, imprimindo o relatório texto do provider `v8`
Proof: `pnpm run test:coverage; echo "exit:$?"` (exit:0, saída contém tabela `% Coverage report from v8`)

### S2 - Script e documentação do passo de migration · 2 arquivos · ~2 KB · ~2k

**C4** - `package.json` ganha o script `"migrate": "drizzle-kit migrate --config=drizzle.config.ts"`
Proof: `node -e "process.exit(require('./package.json').scripts.migrate === 'drizzle-kit migrate --config=drizzle.config.ts' ? 0 : 1)"`

**C5** - `README.md`, na seção "Testes", lista `pnpm run migrate` como pré-requisito antes de `pnpm test`, na mesma sequência do CI
Proof: `awk '/^## Testes/{f=1} f && /pnpm run migrate/{m=NR} f && /pnpm test/{t=NR; exit} END{exit !(m>0 && t>0 && m<t)}' README.md`

**C6** - Seguindo os passos do README do zero (`pnpm install` → `docker compose up -d` → `cp .env.example .env` → `pnpm run migrate` → `pnpm test`), os 10 arquivos de teste passam, incluindo os 2 de integração
Proof: `pnpm run migrate && pnpm run test:run` (exit 0, relatório final lista 10 arquivos de teste)

### S3 - Template de Pull Request · 1 arquivo novo · ~1 KB · ~1k

**C7** - `.github/PULL_REQUEST_TEMPLATE.md` existe e inclui descrição da mudança, referência à fase/issue relacionada e um checklist de verificação local
Proof: `test -f .github/PULL_REQUEST_TEMPLATE.md && grep -qi 'descrição' .github/PULL_REQUEST_TEMPLATE.md && grep -qiE 'fase|issue' .github/PULL_REQUEST_TEMPLATE.md && grep -qi 'checklist' .github/PULL_REQUEST_TEMPLATE.md`

**C8** - O checklist do template referencia exatamente os checks que `.github/workflows/ci.yml` roda hoje (typecheck, lint, format check, build, testes) - nenhum a mais, nenhum a menos
Proof: `for c in typecheck lint "format" build test; do grep -qi "$c" .github/PULL_REQUEST_TEMPLATE.md || echo "MISSING: $c"; done` (sem saída = todos presentes) e inspeção manual confirmando que nenhum item extra (ex.: `test:types`, cobertura mínima) aparece como obrigatório

### S4 - Templates de Issue (bug e sugestão) · 2 arquivos novos · ~1 KB · ~1k

**C9** - `.github/ISSUE_TEMPLATE/bug_report.md` existe com campos para descrição do problema, passos para reproduzir, comportamento esperado e ambiente (Node, SO)
Proof: `test -f .github/ISSUE_TEMPLATE/bug_report.md && grep -qi 'descrição' .github/ISSUE_TEMPLATE/bug_report.md && grep -qi 'reproduzir' .github/ISSUE_TEMPLATE/bug_report.md && grep -qi 'esperado' .github/ISSUE_TEMPLATE/bug_report.md && grep -qiE 'node|so\b|ambiente' .github/ISSUE_TEMPLATE/bug_report.md`

**C10** - `.github/ISSUE_TEMPLATE/feature_request.md` existe com campos para descrição da sugestão e motivação/contexto
Proof: `test -f .github/ISSUE_TEMPLATE/feature_request.md && grep -qi 'descrição' .github/ISSUE_TEMPLATE/feature_request.md && grep -qiE 'motivação|contexto' .github/ISSUE_TEMPLATE/feature_request.md`

**C11** - Ambos os templates têm front matter YAML válido (`name`/`about` ou `title`/`labels`) para que o GitHub os ofereça como opções distintas no seletor de tipo de issue
Proof: `head -5 .github/ISSUE_TEMPLATE/bug_report.md | grep -q '^---$' && head -5 .github/ISSUE_TEMPLATE/feature_request.md | grep -q '^---$'`

## Swept

- validation: não se aplica - nenhuma entrada de usuário em runtime é processada por esta fase
- failure modes: não se aplica - mudanças de CI/documentação, sem lógica de aplicação
- idempotency/retry: C4 (script `migrate` é idempotente por natureza do `drizzle-kit migrate`, comportamento herdado, não alterado por esta fase)
- authorization: não se aplica
- concurrency/ordering: C1 (ordem do novo step em relação a "Run tests"), C5 (ordem do passo de migration em relação a `pnpm test` no README)
- data lifecycle: não se aplica - nenhum dado persistido é criado ou alterado
- external-dependency failure: não se aplica - nenhuma nova dependência externa
- state transitions: não se aplica
- observability: C1/C3 (visibilidade de cobertura no log do CI é o próprio objetivo da tarefa 6.1)

## Coverage

`profile: light` (nenhuma declaração de profile em `AGENTS.md`) - sem join de `Coverage`. Cada check acima usa uma asserção localizada; C1, C5 e C11 verificam ordem/estrutura diretamente no arquivo-fonte em vez de por amostragem.

## Handoff

Batch único - as 4 tarefas somam ~5k tokens estimados de leitura (arquivos pequenos: workflow, package.json, README, 3 templates novos), muito abaixo do orçamento de 150k. Nenhum handoff necessário.
