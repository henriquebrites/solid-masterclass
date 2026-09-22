# Fase 5 — Banco de Dados, API e Segurança

> Plan from this document. Each slice below carries its own shape - copy it, do not re-derive it.
> Status: confirmed by Henrique Brites, 2026-09-22 — escopo decidido durante o planejamento (`tlc-plan`); ver `.agents/.tasks/fase-5-banco-dados-api-seguranca.md` para as tarefas resultantes.

## Situation

- Project: in active construction (curso SOLID em fases sequenciais; Fase 4 — arquitetura — já concluída e mergeada em `main`)
- Decision: open — nenhum escopo de Fase 5 foi confirmado ainda; este documento é a descoberta que antecede essa decisão
- In flight: `docs/adr/0002-preservacao-do-userdao.md` já decide manter `UserDAO.ts` desconectado do runtime como material didático de DIP — este trabalho preserva essa decisão e não a reabre. `AGENTS.md` já decide não rodar `drizzle-kit migrate` fora do CI — este trabalho preserva essa decisão e não a reabre.
- At stake: reversível na maior parte (logging, validação de env, headers HTTP) — nenhuma mudança de schema ou dado de produção está em jogo, já que o projeto roda apenas localmente e em CI

## Problem

Absence: o projeto tem uma camada de API (Fastify + Drizzle/PostgreSQL) funcional, mas sem nenhuma capacidade de diagnosticar falhas em produção nem de se proteger de abuso básico. Hoje, quem opera a API não consegue saber por que uma requisição falhou com 500 — a exceção é capturada e descartada sem log em `src/drivers/app.ts:91`, e o Fastify sobe sem logger (`fastify()` sem opções, `src/drivers/app.ts:18`). Não há substituto: não existe log nenhum, estruturado ou não, além de uma linha de `console.log` de startup em `src/index.ts`.

O mesmo vale para segurança de borda: não há CORS, rate limiting ou headers de segurança configurados (nenhum plugin correspondente está instalado), e o único endpoint público (`POST /users`) permite enumeração de e-mail via resposta 409 diferenciada, sem qualquer limitação de taxa.

Número que moveu a decisão: nenhuma métrica de produção existe porque o projeto nunca rodou fora de local/CI — isto é um projeto educacional em construção, não um produto em uso. A evidência é estrutural (ausência comprovada em código), não volumétrica.

## Boundary

In: observabilidade mínima (log de erros, handlers de exceção não capturada), validação de variáveis de ambiente no boot, hardening HTTP básico (helmet/cors/rate-limit), graceful shutdown da conexão com o banco, error handler centralizado do Fastify, teste de integração para `UserRepository.ts` (o repositório realmente usado em runtime).

Out: qualquer alteração em `UserDAO.ts` ou na regra de não rodar `drizzle-kit migrate` fora do CI — ambos já são decisões formalizadas (ADR 0002, `AGENTS.md`) e fora de questão nesta fase. Autenticação/autorização — não há rota que precise hoje, fica para quando houver rotas autenticadas. Atualização de `drizzle-orm`/`drizzle-kit` de RC para versão estável — risco registrado, não bloqueante.

Unchanged: `src/resources/db/schema.ts`, a migration já aplicada em `drizzle/20260919182818_late_deadpool/`, e o contrato atual de `POST /users` (schema zod, códigos 201/400/409/500) permanecem como estão — nada aqui exige alteração de schema ou de contrato.

## Open — decisões que precisam ser esclarecidas antes do Shape

1. Profundidade da observabilidade: habilitar apenas o `logger` padrão do Fastify + log do erro hoje descartado, ou adotar logging estruturado (ex. pino, já embutido no Fastify)?
2. Prioridade do hardening HTTP (`helmet`/`cors`/`rate-limit`): entra nesta fase ou fica para quando houver mais de uma rota/rota autenticada?
3. Validação de env vars: schema com zod (já é dependência do projeto) ou checagem manual com erro explícito no boot?
4. Teste de integração de `UserRepositoryDrizzle` contra banco real: entra no escopo desta fase? (Correção: `src/resources/repositories/UserRepository.test.ts` já existe e cobre `findByEmail`/`create`, mas mocka `db` inteiramente, no mesmo padrão de `UserDAO.test.ts` — a lacuna real não é "nenhum teste", é a ausência de um teste que exercite o repositório diretamente contra um Postgres real; hoje a única cobertura com banco real é indireta, via HTTP em `src/drivers/app.test.ts`.)
5. Confirmação de que a fase fica restrita ao código de aplicação, sem tocar infraestrutura de deploy/produção (hoje só existe ambiente local + CI).

Respostas tomadas durante o planejamento (`tlc-plan`), com os padrões recomendados neste documento como default: todas as seis áreas de "In" entraram no escopo; ver `.agents/.tasks/fase-5-banco-dados-api-seguranca.md` para as 7 tarefas resultantes (5.1–5.7) e as decisões que permanecem em aberto (política de CORS, limite de rate limiting, aprovação para instalar as 3 dependências de hardening HTTP, nome do novo arquivo de teste).

## Sources

- `docs/adr/0002-preservacao-do-userdao.md` — decide manter `UserDAO.ts` como material didático desconectado do runtime
- `AGENTS.md` — decide não rodar `drizzle-kit migrate` fora do CI
- `.github/workflows/ci.yml` — único ponto onde migrations rodam automaticamente
