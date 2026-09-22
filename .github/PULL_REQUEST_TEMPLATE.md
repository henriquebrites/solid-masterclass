## Descrição

<!-- Descreva o que este PR muda e por quê. -->

## Fase / Issue relacionada

<!-- Referencie a fase do curso (ex.: Fase 6) ou a issue relacionada (ex.: DEV-35), se aplicável. -->

## Checklist de verificação local

Antes de abrir o PR, confirme que os checks que o CI roda passam localmente:

- [ ] `pnpm run typecheck` — type-check
- [ ] `pnpm exec eslint .` — lint
- [ ] `pnpm run format:check` — format check
- [ ] `pnpm run build` — build
- [ ] `pnpm run migrate && pnpm run test:run` — testes (com migrations aplicadas)
