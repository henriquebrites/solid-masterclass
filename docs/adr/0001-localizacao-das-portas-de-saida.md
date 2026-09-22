# 0001 — Localização das portas de saída

## Status

Aceito.

## Contexto

`AGENTS.md` documenta a regra de que `drivers` e `resources` dependem de `application`, nunca o contrário. Até a Fase 4, as interfaces `UserRepository` e `SendNotificationStrategy` estavam definidas nos mesmos arquivos que suas implementações concretas, em `src/resources/`. Como consequência, `src/application/usecases/CreateUser.ts` e `src/application/factories/index.ts` importavam tipos de `src/resources/`, contrariando estruturalmente a regra já documentada.

Durante a implementação, o mesmo problema foi encontrado em `SendNotificationFactory`: definido em `src/application/factories/`, ele instanciava diretamente as quatro classes concretas de `src/resources/notifications/`, violando a mesma regra de direção de dependência.

## Decisão

1. `UserRepository` e `SendNotificationStrategy` passam a ser definidas em `src/application/ports/`, um arquivo por interface. As implementações concretas (`UserRepositoryDrizzle`, as quatro estratégias de notificação) permanecem em `src/resources/`, agora importando o tipo de `src/application/ports/`.
2. `SendNotificationFactory` sai de `src/application/factories/` e passa a viver em `src/resources/notifications/SendNotificationFactory.ts`, implementando um novo port `NotificationFactory` (`src/application/ports/NotificationFactory.ts`). `CreateUser` passa a receber o `NotificationFactory` via construtor, no mesmo padrão já usado para `UserRepository`, em vez de importar a factory estaticamente.
3. O diretório `src/application/factories/` é removido.

## Consequências

- A regra de `AGENTS.md` ("drivers e resources dependem de application, nunca o contrário") passa a ser verdadeira estruturalmente, não apenas por convenção documentada.
- `CreateUser` agora recebe duas dependências via construtor (`UserRepository`, `NotificationFactory`) em vez de uma, e o wiring em `src/drivers/app.ts` passa a instanciar e injetar ambas.
- Nenhuma mudança de comportamento observável do endpoint `POST /users` — mesmo contrato HTTP, mesma lógica de seleção de canal de notificação.
- `src/resources/daos/UserDAO.ts` e `UserDAODrizzle` não foram tocados por esta decisão (ver [0002](./0002-preservacao-do-userdao.md)).
