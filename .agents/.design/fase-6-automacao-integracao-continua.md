# Fase 6 — Automação e integração contínua

> Plan from this document. Each slice below carries its own shape - copy it, do not re-derive it.
> Status: confirmed by Henrique Brites, 2026-09-22 — escopo decidido durante esta descoberta (`tlc-discover`); planejamento (`tlc-plan`) ainda não executado.

## Situation

- Project: in active construction (curso SOLID em fases sequenciais; Fase 5 — banco de dados, API e segurança — já concluída e mergeada em `main`, commit `f10d8af`)
- Decision: open — nenhum escopo de Fase 6 existia antes desta descoberta; a branch `ci/phase-6-automation-continuous-integration` já foi criada a partir de `main` (0 commits à frente), mas estava vazia
- In flight: o próprio documento da Fase 5 (`.agents/.design/fase-5-banco-dados-api-seguranca.md:43`) já apontava `.github/workflows/ci.yml` como "único ponto onde migrations rodam automaticamente" — sinal direto para o escopo aqui. ADR `docs/adr/0002-preservacao-do-userdao.md` decide manter `UserDAO.ts` desconectado do runtime como material didático — este trabalho preserva essa decisão e não a reabre; nenhum arquivo relacionado foi tocado nesta investigação.
- At stake: reversível na maior parte (configuração de CI, documentação, templates) — nenhuma mudança de schema, dado de produção ou API pública está em jogo

## Problem

Absence: o projeto já tem um workflow de CI funcional (`.github/workflows/ci.yml`: checkout → setup pnpm/Node 24 → install → typecheck → lint → format check → build → `drizzle-kit migrate` → testes), mas com três lacunas concretas:

1. **Cobertura de teste não é medida no CI.** O script `test:coverage` existe em `package.json` mas nunca é chamado pelo workflow — não há visibilidade sobre quanto do código é exercitado pelos testes.
2. **Testes falham em checkout limpo sem setup manual.** Dos 10 arquivos de teste, 2 (`src/drivers/app.test.ts`, `src/resources/repositories/UserRepository.integration.test.ts`) importam o client real do banco (`src/resources/db/client.ts`) e lançam exceção imediata se `DATABASE_URL` não estiver setado. O CI já resolve isso (sobe Postgres via service container e roda migrations antes dos testes), mas não há `.env` commitado nem documentação de setup local — um novo contribuidor rodando `pnpm install && pnpm test` em checkout limpo vê 2 arquivos falharem, sem saber por quê.
3. **Não há templates de PR/Issue.** Busca completa no repositório por `PULL_REQUEST_TEMPLATE`/`ISSUE_TEMPLATE` não retornou nenhum arquivo; `.github/` só contém `workflows/ci.yml`.

Quem sente isso: um colaborador externo (aluno/revisor) abrindo PR pela primeira vez — sem instruções de setup, sem estrutura de PR/Issue a seguir. O projeto passou a aceitar colaboração externa (confirmado pelo usuário nesta descoberta), o que torna essas três ausências relevantes agora, diferente de quando o trabalho era só solo.

Número que moveu a decisão: nenhuma métrica de uso externo existe ainda, porque a colaboração externa é uma decisão tomada agora, não um padrão observado — a evidência é estrutural (ausência comprovada em `.github/` e nos scripts do CI), não volumétrica.

Descartado nesta descoberta: proteção de branch em `main` foi identificada como lacuna real (confirmado via `gh api repos/.../branches/main/protection` → 404 "Branch not protected"), mas o usuário decidiu deixá-la fora do escopo — fará essa configuração manualmente no GitHub.

## Boundary

In: adicionar `test:coverage` ao workflow existente como relatório informativo (sem threshold/gate que bloqueie merge); documentar o setup local necessário para os testes passarem em checkout limpo (subir `docker-compose`, copiar `.env.example` para `.env`, rodar `drizzle-kit migrate`, então `pnpm test`) — em README.md ou um CONTRIBUTING.md novo; criar `.github/PULL_REQUEST_TEMPLATE.md` e `.github/ISSUE_TEMPLATE/`.

Out: proteção de branch em `main` (decisão do usuário — configuração manual fora do código, fora desta fase). Qualquer alteração em `UserDAO.ts` (ADR 0002, preservado). Novo workflow do zero — o `ci.yml` existente já cobre lint/test/build corretamente e será estendido, não substituído. Gate/threshold de cobertura mínima — decidido explicitamente como "sem gate" pelo usuário.

Unchanged: o pipeline de steps já existente em `.github/workflows/ci.yml` (typecheck, lint, format, build, migrate, test) permanece como está, só recebe um step adicional de coverage. Hooks do Husky (`pre-commit`/`pre-push`) e `.lintstagedrc.json` não mudam.

## Open — decisões que precisam ser esclarecidas antes do Shape

1. `test:coverage` deve rodar como step separado no job existente do `ci.yml`, ou vale considerar um job paralelo? (Dado que o projeto é pequeno e o job atual já é monolítico, um step adicional no mesmo job é o padrão mais simples — a avaliar no planejamento.)
2. Onde documentar o setup local: seção nova no `README.md` ou `CONTRIBUTING.md` dedicado? Projetos com colaboração externa costumam preferir `CONTRIBUTING.md` separado.
3. Conteúdo específico dos templates de PR/Issue: que campos/seções fazem sentido para este projeto educacional (ex.: referência à fase do curso, checklist de lint/test local, tipo de issue — bug/dúvida/sugestão)?
4. Idioma dos templates: o projeto já mistura português (docs, PRs) e inglês (mensagens de commit, per skill `commit-message`) — qual convenção seguir nos templates?

## Sources

- `.github/workflows/ci.yml` — workflow de CI existente, ponto de extensão para o coverage report
- `package.json` — scripts `test:coverage`/`test:types` já existentes mas não usados no CI
- `.agents/.design/fase-5-banco-dados-api-seguranca.md` — precedente que já apontava `ci.yml` como único lugar onde migrations rodam automaticamente
- `docs/adr/0002-preservacao-do-userdao.md` — decide manter `UserDAO.ts` como material didático desconectado do runtime, preservado nesta fase
- Verificação via `gh api repos/henriquebrites/solid-masterclass/branches/main/protection` (2026-09-22) — confirma ausência de proteção de branch em `main`, decisão registrada como fora de escopo
