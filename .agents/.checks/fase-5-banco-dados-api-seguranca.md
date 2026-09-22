# Fase 5 — Banco de Dados, API e Segurança

Sources:

- `.agents/.tasks/fase-5-banco-dados-api-seguranca.md` - as 7 tarefas (5.1-5.7), critérios de aceite, ordem de execução, decisões resolvidas
- `.agents/.design/fase-5-banco-dados-api-seguranca.md` - discovery confirmado, boundary (in/out/unchanged)
- [DEV-28](https://linear.app/henrique-brites/issue/DEV-28) - critérios de aceite de 5.1 (logger + log de erro descartado)
- [DEV-29](https://linear.app/henrique-brites/issue/DEV-29) - critérios de aceite de 5.2 (unhandledRejection/uncaughtException)
- [DEV-30](https://linear.app/henrique-brites/issue/DEV-30) - critérios de aceite de 5.3 (validar DATABASE_URL no boot)
- [DEV-31](https://linear.app/henrique-brites/issue/DEV-31) - critérios de aceite de 5.4 (graceful shutdown)
- [DEV-32](https://linear.app/henrique-brites/issue/DEV-32) - critérios de aceite de 5.5 (helmet/cors/rate-limit), instalação das 3 dependências já aprovada pelo usuário em 2026-09-22
- [DEV-33](https://linear.app/henrique-brites/issue/DEV-33) - critérios de aceite de 5.6 (teste de integração real de `UserRepositoryDrizzle`), nome de arquivo já decidido: `UserRepository.integration.test.ts`
- [DEV-34](https://linear.app/henrique-brites/issue/DEV-34) - critérios de aceite de 5.7 (setErrorHandler centralizado)

## Out of scope

- `UserDAO.ts` e sua não-utilização em runtime - ADR 0002, nenhuma tarefa desta fase o toca
- Scripts `db:*` / `drizzle-kit migrate` fora do CI - decisão formalizada em `AGENTS.md`
- Autenticação/autorização - não há rota que precise hoje
- Atualização de `drizzle-orm`/`drizzle-kit` de RC para versão estável - risco registrado, não bloqueante
- Qualquer alteração de schema, migration ou do contrato público de `POST /users` (status codes, shape de request/response)

## Landing

Toca `src/drivers/app.ts`, `src/index.ts`, `src/resources/db/client.ts`, `package.json` (3 novas deps), e adiciona `src/resources/repositories/UserRepository.integration.test.ts`. Reusa o logger nativo do Fastify (Pino, já embutido em `fastify`) em vez de introduzir um logger separado, e reusa o padrão de banco real já usado em `app.test.ts` (mesmo `docker-compose`, mesmo `db.delete(usersTable)` no `beforeEach`) para o novo teste de integração.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Logger do Fastify habilitado nativamente (`fastify({ logger: true })`), sem biblioteca externa | `logger: true` (ou objeto de config mínima) em `buildApp` | instalar um logger de terceiros (winston, etc.) - rejeitado porque Pino já é dependência transitiva do Fastify; nenhuma dependência nova é necessária |
| CORS: `origin: false` (nenhuma origem refletida) | `app.register(fastifyCors, { origin: false })` | allowlist de origem ou `origin: true`/`*` - rejeitado pelo usuário em 2026-09-22: nenhum frontend conhecido consome a API hoje, e o endpoint aceita senha no corpo |
| Rate limit: 5 req/min por IP, escopado à rota `POST /users` via `config.rateLimit` | `app.register(fastifyRateLimit)` global (sem limite default agressivo) + `config: { rateLimit: { max: 5, timeWindow: "1 minute" } }` na rota | limite global genérico (dezenas/centenas por minuto) - rejeitado pelo usuário: não mitiga abuso de escrita/enumeração de e-mail no endpoint de cadastro |
| Tratamento de erro da API centralizado via `app.setErrorHandler`, substituindo o `try/catch` inline do handler de `POST /users` | `setErrorHandler` mapeia as 3 classes de erro de domínio para 400/400/409 com os mesmos corpos atuais, e qualquer erro não mapeado para 500 com log | manter o `try/catch` inline - rejeitado pela própria tarefa 5.7: não escala para rotas futuras, cada uma repetiria o mapeamento |
| Novo arquivo de teste `UserRepository.integration.test.ts` (não reaproveita `UserRepository.test.ts`) | arquivo novo em `src/resources/repositories/`, sem `vi.mock("../db/client")`, usando o `db` real | estender `UserRepository.test.ts` - rejeitado: esse arquivo mocka `db` inteiramente no topo, incompatível com um teste que precisa do client real; decisão já registrada na tarefa 5.6 |
| Validação de `DATABASE_URL` no boot via zod, falhando com mensagem explícita | schema zod validando `DATABASE_URL` como string não vazia, aplicado antes de `drizzle(...)` em `client.ts` | checagem manual (`if (!process.env.DATABASE_URL) throw ...`) - rejeitada porque zod já é dependência do projeto e a tarefa 5.3 pede explicitamente esse mecanismo |

- Nada além disso nesta mudança é difícil de reverter - handlers de processo (5.2), shutdown gracioso (5.4) e log de exceção (5.1) são todos aditivos e reversíveis por remoção de código, sem afetar dado persistido ou contrato observável.

## Test policy

Código desta fase é majoritariamente **instrumentação/infraestrutura de processo** (logger habilitado, handlers de sinal/exceção, shutdown, validação de boot) - forwarding e side-effects sem tabela de decisão própria, provados no nível de fumaça (boot real, sinal real, request real via `supertest`) porque não há branch a enumerar. As únicas duas exceções com decisão real:

- **`setErrorHandler` (5.7)**: dispatcha sobre 4 casos (3 erros de domínio + fallback) - decisão, mas já reduzida a mapeamento 1:1 testado pelo próprio boundary HTTP existente (`app.test.ts`), que já cobre exatamente essas 4 branches por status code e corpo. Nenhuma proof adicional no nível "unitário" é necessária: o `setErrorHandler` só existe para servir esse mesmo boundary, e o boundary já enumera o conjunto completo (3 erros de domínio + 1 fallback).
- **Rate limit por rota (5.5)**: decisão binária (excedeu 5/min ou não) provada no boundary HTTP, único lugar onde ela é observável.

Nenhuma linha adicional de `Test policy` é proposta para `AGENTS.md`: a fase não introduz um padrão de camada nova, apenas estende o boundary HTTP já testado em `app.test.ts` (analogue mais próximo por forma: dispatch sobre erro -> status code).

## Checks

### S1 - Observabilidade mínima: logger do Fastify + log do erro descartado (5.1) · `src/drivers/app.ts` · ~3.5 KB · ~1k

**C1** - `buildApp` instancia o Fastify com logger habilitado
Proof: `grep -q "logger:" src/drivers/app.ts`

**C2** - Uma requisição real emite um log estruturado do Fastify (smoke, via captura de stdout ou `app.log` spy)
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "logs a structured line for a request"`

**C3** - Uma exceção não mapeada capturada no handler é registrada via logger antes da resposta 500
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "logs the original error before responding 500"`

**C4** - O corpo da resposta 500 ao cliente continua exatamente `{ error: "Erro ao criar usuário" }`, sem vazar stack trace
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "returns 500 when a DB constraint throws"`

### S2 - Tratamento de exceções não capturadas no processo (5.2) · `src/index.ts` · ~1 KB · ~0.5k

**C5** - Um `unhandledRejection` é capturado e registrado via logger antes do encerramento do processo
Proof: `pnpm exec vitest run src/index.test.ts -t "logs and exits on unhandledRejection"`

**C6** - Uma exceção síncrona não capturada (`uncaughtException`) é capturada e registrada via logger antes do encerramento do processo
Proof: `pnpm exec vitest run src/index.test.ts -t "logs and exits on uncaughtException"`

### S3 - Validar DATABASE_URL no boot (5.3) · `src/resources/db/client.ts` · ~1 KB · ~0.5k

**C7** - Quando `DATABASE_URL` não está definida, o boot falha com mensagem explícita nomeando a variável ausente (não um erro genérico do driver `pg`)
Proof: `pnpm exec vitest run src/resources/db/client.test.ts -t "throws an explicit error naming DATABASE_URL when it is missing"`

**C8** - Quando `DATABASE_URL` está definida como string não vazia, o boot prossegue sem alteração de comportamento observável
Proof: `pnpm exec vitest run src/resources/db/client.test.ts -t "does not throw when DATABASE_URL is set"`

### S4 - Graceful shutdown da conexão com o banco (5.4) · `src/index.ts`, `src/resources/db/client.ts` · ~1.5 KB · ~0.5k

**C9** - Ao receber `SIGTERM`, a conexão com o banco é fechada antes do processo encerrar
Proof: `pnpm exec vitest run src/index.test.ts -t "closes the database connection on SIGTERM"`

**C10** - Ao receber `SIGINT`, a conexão com o banco é fechada antes do processo encerrar
Proof: `pnpm exec vitest run src/index.test.ts -t "closes the database connection on SIGINT"`

**C11** - Quando o fechamento da conexão falha, o erro é registrado via logger e o processo ainda assim encerra
Proof: `pnpm exec vitest run src/index.test.ts -t "logs and still exits when closing the connection fails"`

### S5 - Hardening HTTP: helmet, CORS, rate limit (5.5) · `src/drivers/app.ts`, `package.json` · ~2 KB · ~1k

**C12** - `package.json` lista `@fastify/helmet`, `@fastify/cors` e `@fastify/rate-limit` em `dependencies`
Proof: `node -e "const p=require('./package.json'); ['@fastify/helmet','@fastify/cors','@fastify/rate-limit'].forEach(d=>{if(!p.dependencies[d])process.exit(1)})"`

**C13** - Qualquer resposta da API inclui o header `x-content-type-options: nosniff` (padrão do `@fastify/helmet`)
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "includes helmet security headers"`

**C14** - Uma requisição cross-origin não reflete nenhuma origem em `Access-Control-Allow-Origin`
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "does not reflect any origin in Access-Control-Allow-Origin"`

**C15** - A 6ª requisição de um mesmo IP a `POST /users` dentro de 1 minuto recebe `429`
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "returns 429 after 5 requests per minute from the same IP"`

### S6 - Teste de integração real para UserRepositoryDrizzle (5.6) · `src/resources/repositories/UserRepository.integration.test.ts` (novo) · ~2 KB · ~1k

**C16** - `UserRepositoryDrizzle.create` persiste o registro contra o banco real e retorna o valor salvo
Proof: `pnpm exec vitest run src/resources/repositories/UserRepository.integration.test.ts -t "persists the user and returns the saved record"`

**C17** - `UserRepositoryDrizzle.findByEmail` com e-mail existente retorna o registro correspondente, contra o banco real
Proof: `pnpm exec vitest run src/resources/repositories/UserRepository.integration.test.ts -t "returns the matching record for an existing email"`

**C18** - `UserRepositoryDrizzle.findByEmail` com e-mail inexistente retorna `undefined` (mesmo valor "não encontrado" que o código atual produz), contra o banco real
Proof: `pnpm exec vitest run src/resources/repositories/UserRepository.integration.test.ts -t "returns undefined for a non-existent email"`

### S7 - setErrorHandler centralizado (5.7) · `src/drivers/app.ts` · ~2 KB · ~1k

**C19** - `PasswordDoNotMatchError` lançada por qualquer rota produz a mesma resposta 400 atual, originada do `setErrorHandler`
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "returns 400 when password !== passwordConfirmation"`

**C20** - `EmailAlreadyExistsError` lançada por qualquer rota produz a mesma resposta 409 atual, originada do `setErrorHandler`
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "returns 409 when the e-mail already exists"`

**C21** - `InvalidMarketingPreferredChannelError` lançada por uma rota produz o mesmo corpo/status 400 que as outras respostas 400 do endpoint, originada do `setErrorHandler` (inalcançável hoje via `POST /users` real porque o schema zod já filtra `preferredMarketingChannel` antes de `CreateUser.execute` rodar - ver nota de Coverage; provado registrando uma rota de teste dedicada que lança a exceção diretamente, para exercitar o mapeamento do `setErrorHandler` sem depender de um caminho HTTP inatingível)
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "maps InvalidMarketingPreferredChannelError to 400"`

**C22** - Um erro não mapeado produz 500 com `{ error: "Erro ao criar usuário" }` e é logado, agora a partir do `setErrorHandler`
Proof: `pnpm exec vitest run src/drivers/app.test.ts -t "returns 500 when a DB constraint throws"`

**C23** - Toda a suíte de `src/drivers/app.test.ts` continua passando sem alteração de asserções
Proof: `pnpm exec vitest run src/drivers/app.test.ts`

**C24** - Suíte completa e verde ao final da fase
Proof: `pnpm run test:run`
Proof: `pnpm run typecheck`

## Swept

- validation: n/a (per source) - nenhuma tarefa altera validação de entrada do endpoint (schema zod inalterado)
- failure modes: C3, C7, C11, C22 - erro descartado agora logado, boot falha explicitamente sem `DATABASE_URL`, shutdown falho ainda encerra, erro não mapeado ainda vira 500 logado
- idempotency and retry: n/a (per source) - nenhuma tarefa altera semântica de escrita
- authorization: n/a (per source) - endpoint não tem autorização hoje, fora de escopo (ver "Fora de escopo" da fase)
- concurrency and ordering: n/a (per source) - nenhuma tarefa introduz concorrência nova
- data lifecycle: n/a (per source) - nenhum dado persistido é afetado; shutdown (C9-C11) fecha conexão, não apaga dado
- external-dependency failure: C7, C9-C11 - falha de configuração (`DATABASE_URL` ausente) e falha ao fechar a conexão do Postgres são ambas tratadas explicitamente
- state transitions: n/a (per source) - nenhuma máquina de estados envolvida
- observability: C1-C6, C22 - é o próprio tema central da fase (logger, exceções não capturadas, log do erro descartado)

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| Erros de domínio mapeados pelo `setErrorHandler` (4: 3 domínio + 1 fallback) | `PasswordDoNotMatchError` C19 · `EmailAlreadyExistsError` C20 · `InvalidMarketingPreferredChannelError` C21 · não mapeado C22 | - |
| Sinais de encerramento do processo (2) | `SIGTERM` C9 · `SIGINT` C10 | - |
| Exceções fatais do processo (2) | `unhandledRejection` C5 · `uncaughtException` C6 | - |
| Dependências de hardening instaladas (3) | `@fastify/helmet` C12 · `@fastify/cors` C12 · `@fastify/rate-limit` C12 | - |
| Critérios de `DATABASE_URL` no boot (2) | ausente C7 · presente C8 | - |

- Claims que citam um status code, header ou corpo de resposta concreto: C4, C13, C14, C15, C19, C20, C21, C22 - cada um tem prova que cruza o boundary HTTP real (`supertest` contra `app.server` ou `app.inject`).
- Nota sobre C21: confirmado por leitura de `CreateUser.ts:46` e do schema zod em `app.ts` - `InvalidMarketingPreferredChannelError` só é lançada quando `preferredMarketingChannel` não está em `["email","sms","push","whatsapp"]`, e o schema zod (`z.enum([...])`) já rejeita qualquer valor fora desse conjunto com 400 antes de `CreateUser.execute` rodar. A branch é código morto no caminho HTTP real hoje (só alcançável chamando `CreateUser.execute` diretamente, como já faz `CreateUser.test.ts:80`) - C21 prova apenas que o `setErrorHandler` mapeia essa classe corretamente **se** ela for lançada, via uma rota de teste dedicada, não que o boundary real a alcança.

## Handoff

Sete fatias, leitura estimada total ~13 KB (~6k tokens) - muito abaixo do limite de handoff (150k, ou 90k se o projeto declarar budget menor). Build completo em uma única sessão, sem handoff entre agentes. S1/S2/S4/S7 competem pelo mesmo trecho de `src/drivers/app.ts`/`src/index.ts` (conforme já observado na ordem de execução da tarefa) e devem ser construídas em sequência dentro da mesma sessão para evitar conflito de merge local.
