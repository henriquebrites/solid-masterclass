# Fase 5 — Banco de Dados, API e Segurança

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`).
> Fonte: `.design/fase-5-banco-dados-api-seguranca.md` (discovery confirmado). Nada em `Decisões pendentes`
> deve ser assumido durante a implementação — trate como pergunta em aberto, não como default silencioso.

## Correção em relação ao relatório de `/tlc-discover`

O relatório de discovery original afirmava que não existia teste para `UserRepository.ts`. Isso estava incorreto: `src/resources/repositories/UserRepository.test.ts` já existe e cobre `findByEmail`/`create`, mas mocka `db` inteiramente (mesmo padrão de `src/resources/daos/UserDAO.test.ts`). A lacuna real, refletida na tarefa 5.6, é mais estreita: nenhum teste exercita `UserRepositoryDrizzle` diretamente contra um Postgres real — a única cobertura com banco real hoje é indireta, via HTTP em `src/drivers/app.test.ts`. `.design/fase-5-banco-dados-api-seguranca.md` já foi atualizado com essa correção.

7 tarefas · 0 tarefas com contrato de API/schema alterado · 0 decisões em aberto (as 4 anteriores foram resolvidas em 2026-09-22 — ver "Decisões resolvidas").

Cadastradas no Linear (time/projeto Development MVP): [DEV-28](https://linear.app/henrique-brites/issue/DEV-28) (5.1), [DEV-29](https://linear.app/henrique-brites/issue/DEV-29) (5.2), [DEV-30](https://linear.app/henrique-brites/issue/DEV-30) (5.3), [DEV-31](https://linear.app/henrique-brites/issue/DEV-31) (5.4), [DEV-32](https://linear.app/henrique-brites/issue/DEV-32) (5.5), [DEV-33](https://linear.app/henrique-brites/issue/DEV-33) (5.6), [DEV-34](https://linear.app/henrique-brites/issue/DEV-34) (5.7).

---

## 5.1 — Observabilidade mínima: habilitar logger do Fastify e registrar erros descartados

**Linear**: [DEV-28](https://linear.app/henrique-brites/issue/DEV-28)

**Descrição**: Hoje `fastify()` é instanciado sem `logger` (`src/drivers/app.ts:18`), e o `catch` genérico do handler de `POST /users` (`src/drivers/app.ts:91`) descarta a exceção original ao responder 500 — não existe nenhum registro da causa raiz em lugar nenhum. Isso torna impossível diagnosticar falhas reais (ex.: banco fora do ar, violação de constraint não mapeada). Esta tarefa habilita o logger nativo do Fastify (Pino, já embutido na dependência `fastify` — não requer instalar pacote novo) e registra o erro real antes de responder 500.

**Critérios de aceite**:
1. Ao receber uma requisição, um log estruturado é emitido pelo logger do Fastify (habilitado).
2. Quando uma exceção não mapeada (fora das três classes de erro de domínio já tratadas) é capturada no handler de `POST /users`, o erro original é registrado via logger antes da resposta 500 ser enviada.
3. O corpo da resposta 500 ao cliente continua exatamente `{ error: "Erro ao criar usuário" }`, sem vazar stack trace/detalhes internos — `src/drivers/app.test.ts:142-155` deve continuar passando sem alteração de asserção.

**Prioridade**: Alta
**Dependências**: nenhuma
**Arquivos envolvidos**: `src/drivers/app.ts`
**Resultado esperado**: falhas internas passam a deixar rastro em log, sem alterar o contrato de resposta já testado.

---

## 5.2 — Tratamento de exceções não capturadas no processo

**Linear**: [DEV-29](https://linear.app/henrique-brites/issue/DEV-29)

**Descrição**: `src/index.ts` sobe o servidor sem nenhum handler para `unhandledRejection`/`uncaughtException` (confirmado por grep, sem ocorrências em `src/`). Hoje uma falha assíncrona não tratada em qualquer ponto do processo o derruba sem deixar rastro. Esta tarefa adiciona handlers que registram a exceção antes de encerrar o processo.

**Critérios de aceite**:
1. Quando uma `Promise` rejeitada não é tratada em nenhum ponto do processo, o evento é capturado e registrado via logger antes do encerramento do processo.
2. Quando uma exceção síncrona não capturada ocorre, o evento é capturado e registrado via logger antes do encerramento do processo.

**Prioridade**: Alta
**Dependências**: 5.1 (recomendado, para reaproveitar o mesmo logger; não estritamente bloqueante, mas usar `console.error` isoladamente duplicaria o mecanismo de log)
**Arquivos envolvidos**: `src/index.ts`
**Resultado esperado**: falhas fatais do processo passam a ser registradas antes do encerramento.

---

## 5.3 — Validar `DATABASE_URL` no boot

**Linear**: [DEV-30](https://linear.app/henrique-brites/issue/DEV-30)

**Descrição**: `DATABASE_URL` é lida via non-null assertion (`process.env.DATABASE_URL!`) em `src/resources/db/client.ts:5` e `drizzle.config.ts:11`, sem qualquer validação. Se a variável faltar, a aplicação falha de forma pouco informativa. Esta tarefa adiciona validação explícita no boot, usando zod (já é dependência do projeto — não requer instalar pacote novo).

**Critérios de aceite**:
1. Quando `DATABASE_URL` não está definida ao iniciar a aplicação, o processo falha no boot com uma mensagem de erro explícita nomeando a variável ausente — não um erro genérico do driver `pg`.
2. Quando `DATABASE_URL` está definida como string não vazia, o boot prossegue normalmente, sem alteração de comportamento observável.

**Prioridade**: Alta
**Dependências**: nenhuma
**Arquivos envolvidos**: `src/resources/db/client.ts`
**Resultado esperado**: falha de configuração fica clara imediatamente no boot, em vez de se manifestar como erro obscuro de conexão.
**Nota de escopo**: `DATABASE_URL` é a única variável de ambiente usada no código-fonte hoje (confirmado por grep) — não há outras a validar.

---

## 5.4 — Graceful shutdown da conexão com o banco

**Linear**: [DEV-31](https://linear.app/henrique-brites/issue/DEV-31)

**Descrição**: Não existe hoje nenhum fechamento explícito da conexão/pool com o Postgres ao encerrar o processo (grep sem ocorrências de shutdown em `src/`). Esta tarefa adiciona o fechamento gracioso da conexão ao receber `SIGTERM`/`SIGINT`.

**Critérios de aceite**:
1. Quando o processo recebe `SIGTERM` ou `SIGINT`, a conexão com o banco de dados é fechada antes do processo encerrar.
2. Quando o fechamento da conexão falha, o erro é registrado via logger e o processo ainda assim encerra (não trava esperando).

**Prioridade**: Média
**Dependências**: nenhuma estrita; recomenda-se executar após 5.1 para reaproveitar o logger no critério 2
**Arquivos envolvidos**: `src/index.ts`, `src/resources/db/client.ts`
**Resultado esperado**: encerramento do processo não deixa conexões de banco penduradas.

---

## 5.5 — Hardening HTTP básico (CORS, rate limiting, headers de segurança)

**Linear**: [DEV-32](https://linear.app/henrique-brites/issue/DEV-32)

**Descrição**: Não há CORS, rate limiting nem headers de segurança (helmet) configurados — nenhum desses plugins está instalado. O único endpoint público, `POST /users`, permite enumeração de e-mail via resposta 409 diferenciada, sem qualquer limitação de taxa. Esta tarefa adiciona `@fastify/helmet`, `@fastify/cors` e `@fastify/rate-limit`.

**Dependência aprovada em 2026-09-22**: instalar `@fastify/helmet`, `@fastify/cors` e `@fastify/rate-limit` — usuário confirmou explicitamente (regra de `AGENTS.md`, seção "Análise prévia e limites de autonomia"). A instalação em si ainda não foi executada; fica para o momento da implementação desta tarefa.

**Critérios de aceite**:
1. Em qualquer resposta da API, os headers de segurança padrão do `@fastify/helmet` estão presentes (ex.: `X-Content-Type-Options: nosniff`).
2. Em uma requisição cross-origin, a resposta reflete `origin: false` — nenhuma origem é refletida em `Access-Control-Allow-Origin`, ou seja, nenhum navegador tem acesso cross-origin por padrão.
3. Quando o número de requisições de um mesmo IP a `POST /users` excede 5 por minuto, a resposta é `429`.

**Prioridade**: Média (não bloqueante hoje, dado que existe uma única rota pública de cadastro, mas ausência comprovada em código)
**Dependências**: nenhuma entre tarefas
**Arquivos envolvidos**: `src/drivers/app.ts`, `package.json`
**Resultado esperado**: a API passa a ter uma camada mínima de proteção HTTP.

**Decisão de política (registrada em 2026-09-22, a pedido do usuário — "como engenheiro de software especialista em segurança")**:
- **CORS**: `origin: false`. Hoje não existe nenhum frontend conhecido consumindo `POST /users` — o projeto é só backend, testado via `supertest`/`curl`/Swagger UI local. Sem um consumidor de browser identificado, a opção mais segura é não refletir nenhuma origem por padrão, em vez de adivinhar uma allowlist. Revisitar quando um frontend real for definido (abre uma origem específica, nunca `origin: true`/`*` com endpoint que aceita senha no corpo).
- **Rate limit**: 5 requisições por minuto por IP, aplicado especificamente à rota `POST /users` (via `config.rateLimit` na própria rota, não um limite global). Justificativa: é um endpoint de criação de conta — o risco não é volume de leitura, é abuso de escrita (contas falsas em massa) e enumeração de e-mail (a resposta `409` já diferencia e-mail existente do inexistente, então um atacante pode varrer e-mails cadastrados sem rate limit). Um limite de leitura genérico (dezenas/centenas por minuto) não mitigaria isso; o padrão de mercado para endpoints de cadastro/login é de poucas tentativas por minuto por IP. Ajustar para cima é uma mudança reversível de configuração, não uma nova decisão arquitetural.

---

## 5.6 — Teste de integração real (sem mock) para `UserRepositoryDrizzle`

**Linear**: [DEV-33](https://linear.app/henrique-brites/issue/DEV-33)

**Descrição**: Ver "Correção em relação ao relatório de `/tlc-discover`" no topo deste documento. A lacuna real: nenhum teste exercita `UserRepositoryDrizzle` diretamente contra um Postgres real — a única cobertura com banco real hoje é indireta, via HTTP em `src/drivers/app.test.ts`. Esta tarefa adiciona esse teste direto, seguindo o padrão de banco real já usado em `app.test.ts` (mesmo `docker-compose`, mesmo `db.delete(usersTable)` no `beforeEach`).

**Critérios de aceite**:
1. Quando `UserRepositoryDrizzle.create` é chamado contra o banco real, o registro é persistido e o valor retornado corresponde ao registro salvo.
2. Quando `UserRepositoryDrizzle.findByEmail` é chamado com um e-mail existente contra o banco real, o registro correspondente é retornado.
3. Quando `UserRepositoryDrizzle.findByEmail` é chamado com um e-mail inexistente contra o banco real, o repositório retorna o mesmo valor "não encontrado" que o código atual já produz (`UserRepository.ts:9-12`).

**Prioridade**: Média
**Dependências**: nenhuma
**Arquivos envolvidos**: `src/resources/repositories/UserRepository.integration.test.ts` (novo)
**Resultado esperado**: o caminho de persistência realmente usado em runtime passa a ter cobertura direta contra banco real, não apenas indireta via HTTP.

**Decisão de nome do arquivo (registrada em 2026-09-22, a pedido do usuário — "segue o padrão do projeto")**: `UserRepository.integration.test.ts`. `UserRepository.test.ts` já existe e não pode ser reaproveitado (usa `vi.mock("../db/client")` no topo do arquivo, incompatível com um teste que precisa do client real). O projeto não declara uma convenção própria para distinguir teste mockado de teste com banco real, então a escolha segue o que o projeto já garante tecnicamente: `vitest.config.ts:5` inclui qualquer arquivo casando com `src/**/*.test.ts` — `UserRepository.integration.test.ts` casa com esse glob sem exigir nenhuma alteração de configuração, e o sufixo `.integration` é a convenção padrão do ecossistema JS/TS para essa distinção.

---

## 5.7 — Centralizar tratamento de erros da API com `setErrorHandler` do Fastify

**Linear**: [DEV-34](https://linear.app/henrique-brites/issue/DEV-34)

**Descrição**: O tratamento de erro hoje é um `try/catch` manual e inline dentro do único handler de `POST /users` (`src/drivers/app.ts:81-92`). Não há `setErrorHandler` centralizado do Fastify. Esse padrão não escala: cada rota futura precisaria repetir o mesmo mapeamento de erros de domínio para código HTTP. Esta tarefa move esse mapeamento para um `setErrorHandler` central.

**Critérios de aceite**:
1. Quando qualquer rota lança `PasswordDoNotMatchError`, `EmailAlreadyExistsError` ou `InvalidMarketingPreferredChannelError`, a resposta HTTP (código e corpo) é idêntica à que o comportamento atual já produz (400/400/409, mesmos corpos), agora originada do handler centralizado.
2. Quando qualquer rota lança um erro não mapeado, a resposta é 500 com `{ error: "Erro ao criar usuário" }` (comportamento atual preservado) e o erro é logado (reaproveitando 5.1).
3. Todos os testes existentes em `src/drivers/app.test.ts` continuam passando sem alteração de asserções.

**Prioridade**: Baixa (melhoria estrutural; não bloqueante com uma única rota hoje, mas evita repetição quando novas rotas forem adicionadas)
**Dependências**: 5.1 (para nascer já logando, sem retrabalho do mesmo trecho de código)
**Arquivos envolvidos**: `src/drivers/app.ts`
**Resultado esperado**: tratamento de erro centralizado e reutilizável para rotas futuras, sem alterar nenhum contrato observável hoje.

---

## Ordem de execução

```
5.1 (observabilidade mínima)
 ├─→ 5.2 (exceções não capturadas)      — recomendado após 5.1
 ├─→ 5.4 (graceful shutdown)             — recomendado após 5.1
 └─→ 5.7 (setErrorHandler centralizado)  — depende de 5.1

5.3 (validar DATABASE_URL) — independente, pode ser feita a qualquer momento
5.6 (teste de integração UserRepositoryDrizzle) — independente, pode ser feita a qualquer momento
5.5 (hardening HTTP) — independente; dependência de instalação já aprovada (ver tarefa 5.5)
```

Nenhuma tarefa altera schema, migration ou o contrato público de `POST /users` (status codes e shape de request/response). Apenas 5.1/5.2/5.4/5.7 competem pelo mesmo trecho de `src/drivers/app.ts`/`src/index.ts` e se beneficiam de revisão em sequência.

## Fora de escopo

- `UserDAO.ts` e sua não-utilização em runtime — decisão formalizada em `docs/adr/0002-preservacao-do-userdao.md`. Nenhuma tarefa acima o toca.
- Scripts `db:*` no `package.json` / execução de `drizzle-kit migrate` fora do CI — decisão formalizada em `AGENTS.md`. Nenhuma tarefa acima o toca.
- Autenticação/autorização — não há rota que precise hoje.
- Atualização de `drizzle-orm`/`drizzle-kit` de RC para versão estável — risco registrado no discovery, não uma tarefa (nenhum problema comprovado no código atual).

## Sources

- `.design/fase-5-banco-dados-api-seguranca.md` — discovery confirmado; origem do escopo e da evidência de código citada em cada tarefa
- `AGENTS.md` — convenções de teste, camadas hexagonais e regra de aprovação para instalar dependências
- `docs/adr/0002-preservacao-do-userdao.md` — decide manter `UserDAO.ts` fora do runtime

## Unresolved

None — todas as 4 questões foram resolvidas pelo usuário em 2026-09-22 (ver "Decisões resolvidas").

## Decisões resolvidas

| # | Questão original | Decisão | Onde |
|---|---|---|---|
| 1 | Aprova instalar `@fastify/helmet`, `@fastify/cors` e `@fastify/rate-limit` para a tarefa 5.5? | Aprovado pelo usuário. Instalação ainda não executada — ocorre no momento da implementação de 5.5. | Critérios de aceite de 5.5 |
| 2 | Qual política de CORS na tarefa 5.5? | `origin: false` (nenhuma origem refletida por padrão), decidido pelo usuário delegando a um "engenheiro de software especialista em segurança" — ver justificativa em 5.5 | Critérios de aceite de 5.5 |
| 3 | Qual limite de rate limiting na tarefa 5.5? | 5 req/min por IP, escopado à rota `POST /users` — ver justificativa em 5.5 | Critérios de aceite de 5.5 |
| 4 | Nome do novo arquivo de teste da tarefa 5.6? | `UserRepository.integration.test.ts`, a pedido do usuário ("segue o padrão do projeto") — ver justificativa em 5.6 | Arquivos envolvidos de 5.6 |
