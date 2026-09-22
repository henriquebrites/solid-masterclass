# Fase 4 — Arquitetura e Documentação

> Gerado por `/tlc-discover` + `/tlc-plan`. As tarefas abaixo estão cadastradas no Linear (time/projeto `Development MVP`, mesmo usado nas Fases 2 e 3). Os IDs do Linear estão referenciados em cada tarefa.

## Investigação (`/tlc-discover`)

### 1. Resumo do estado atual

O projeto é uma API educacional (Fastify + TypeScript + Drizzle/PostgreSQL) que demonstra SOLID e Arquitetura Hexagonal em um único fluxo real: `POST /users`. A implementação em `src/` é enxuta e consistente na maior parte — três pastas top-level (`application`, `drivers`, `resources`), um único caso de uso (`CreateUser`), um único driver HTTP. O README e o `AGENTS.md` descrevem um fluxo de cinco estágios (**Drivers → Ports & Adapters → Application (Core) → Ports & Adapters → Resources**) com um diagrama (`.github/images/architecture.jpg`) que nomeia uma camada "Ports & Adapters" explícita, "DTO", "Services" e "APIs Externas" — nenhum desses tem correspondência estrutural no código atual. Não existem ADRs nem diretório `docs/`; decisões arquiteturais relevantes (como a preservação intencional de `UserDAO.ts`) estão registradas apenas em `AGENTS.md`.

### 2. Estrutura arquitetural

```
src/
├── application/        (núcleo: entities, usecases, factories, errors)
├── drivers/             (entrada HTTP: app.ts, app.test.ts)
├── resources/            (adapters: db, repositories, daos, notifications)
└── index.ts              (entrypoint do processo)
```

- **`application/entities`** — `User.ts`: interface anêmica, sem value objects.
- **`application/usecases`** — `CreateUser.ts`: único caso de uso; orquestra validação de senha, checagem de e-mail duplicado, hashing (`bcrypt` direto), persistência (via `UserRepository` injetado) e notificação (via `SendNotificationFactory`).
- **`application/factories`** — `SendNotificationFactory`: resolve, por `switch`, qual adapter concreto de notificação instanciar.
- **`application/errors`** — 4 erros de domínio nomeados.
- **`drivers`** — `app.ts`: servidor Fastify, rota `POST /users`, schemas Zod, wiring (`new CreateUser(new UserRepositoryDrizzle())`), tradução de erros em status HTTP.
- **`resources`** — `db` (cliente Drizzle + schema), `repositories` (`UserRepository` + `UserRepositoryDrizzle`, usada em produção), `daos` (`UserDAO` + `UserDAODrizzle`, **não usada em runtime**, material didático de DIP), `notifications` (`SendNotificationStrategy` + 4 stubs).

Não existe pasta `ports/` nem `domain/` separada. As interfaces (portas) coexistem no mesmo arquivo que suas implementações.

### 3. Separação e dependências

- Wiring correto na borda (`drivers/app.ts` instancia o adapter concreto e injeta no caso de uso).
- **Inversão de dependência real, mas fisicamente invertida**: `CreateUser.ts` depende de `UserRepository` só como *tipo*, mas o arquivo que define essa porta está em `resources/`, não em `application/`. Contraria `AGENTS.md:63` ("drivers e resources dependem de application, nunca o contrário"). **Problema comprovado.**
- O mesmo padrão se repete em `application/factories` → `resources/notifications`.
- `CreateUser.ts` chama `bcrypt.hash(...)` diretamente, sem porta dedicada.
- Duplicação de tipo `User` entre `application/entities/User.ts` e `resources/daos/UserDAO.ts` — esperado, `UserDAO.ts` é módulo de estudo isolado.
- `UserRepositoryDrizzle` (em uso) não mapeia explicitamente registro→domínio; `UserDAODrizzle` (não usado) sim — observação de baixo impacto, **fora de escopo** desta fase.
- Nenhuma garantia técnica (lint de fronteiras) impede violação futura da direção de dependência.
- Testes por camada consistentes com o desenho pretendido.

### 4. README e imagem da arquitetura

O diagrama e o texto descrevem: **Drivers → Ports & Adapters → Application (Core: Use Cases, Services, Entities, Factories) → Ports & Adapters → Resources (Banco de Dados, APIs Externas)**.

| Elemento no diagrama/texto | Existe no código? |
|---|---|
| Camada "Ports & Adapters" dedicada | **Não** |
| Bloco "DTO" separado | **Não** |
| "Services" dentro de Application | **Não** |
| "CLIs" como Driver | **Não** |
| "APIs Externas" em Resources | **Não** |
| `daos/UserDAO.ts` | Existe, mas **não citado no README** |

Documentação **incorreta**, não apenas incompleta. Exemplo `curl`, nomes de classes, OpenAPI, tabela de respostas e comandos `pnpm` básicos **conferem**. Lacuna: scripts `typecheck`, `test:run`, `test:coverage`, `test:types`, `format:check` ausentes do README.

### 5. ADRs

Não existe `docs/`, `adr/`, `.design/` ou `decisions/`. Candidatas a registro formal: preservação de `UserDAO.ts`, organização de portas, regra de direção de dependência.

### 6. Consistência documental

Corretas: exemplo de endpoint, erros de domínio, scripts básicos, OpenAPI, `.env`/Docker. Incompletas: scripts de validação de CI, `UserDAO.ts` não citado, nota desatualizada em `AGENTS.md:31`. Incorretas: diagrama/texto descrevendo elementos inexistentes.

### 7. Problemas e riscos

1. **[Comprovado]** Direção de dependência declarada violada estruturalmente pela localização da porta `UserRepository`.
2. **[Comprovado]** README/diagrama descrevem elementos estruturais inexistentes no código.
3. **[Comprovado]** `UserDAO.ts` invisível no README.
4. **[Lacuna]** Sem garantia técnica (lint) da direção de dependência.
5. **[Lacuna]** Sem registro formal de decisões.
6. **[Observação de baixo impacto]** Inconsistência de mapeamento banco→domínio entre os dois adapters paralelos — fora de escopo.

### 8. Decisões existentes a preservar

- `UserDAO.ts` mantido como está, incluindo seu desuso em runtime.
- Estrutura de três camadas e convenções de `AGENTS.md:65-73`.
- Estratégia de testes por camada já estabelecida.
- Escopo estritamente educacional — evitar abstrações adicionais que não sirvam ao ensino de SOLID/hexagonal.

## Plano de execução (`/tlc-plan`)

### Ordem sugerida

```
4.1 (base) ──▶ 4.2 (diagrama/texto) ──▶ 4.6 (ADRs, se aprovado)
   │                                        ▲
   └────────────────────────────────────────┘
4.3, 4.4, 4.5 — independentes, podem rodar em paralelo a qualquer momento
4.7 — opcional, depois de 4.1, só com aprovação explícita (nova dependência)
```

### Tarefas

| ID | Título | Linear | Prioridade | Depende de |
|---|---|---|---|---|
| 4.1 | Mover portas de saída (`UserRepository`, `SendNotificationStrategy`) para `src/application/ports/` | [DEV-21](https://linear.app/henrique-brites/issue/DEV-21/41-mover-portas-de-saida-userrepository-sendnotificationstrategy-para) | Alta | — |
| 4.2 | Atualizar diagrama de arquitetura e texto do README/AGENTS.md | [DEV-22](https://linear.app/henrique-brites/issue/DEV-22/42-atualizar-diagrama-de-arquitetura-e-texto-do-readmeagentsmd) | Alta | 4.1 (DEV-21) |
| 4.3 | Documentar `UserDAO.ts` no README | [DEV-23](https://linear.app/henrique-brites/issue/DEV-23/43-documentar-userdaots-no-readme) | Média | — |
| 4.4 | Documentar no README os scripts de validação existentes | [DEV-24](https://linear.app/henrique-brites/issue/DEV-24/44-documentar-no-readme-os-scripts-de-validacao-ja-existentes) | Baixa | — |
| 4.5 | Corrigir nota desatualizada em `AGENTS.md` sobre `.agents/reports/` | [DEV-25](https://linear.app/henrique-brites/issue/DEV-25/45-corrigir-nota-desatualizada-em-agentsmd-sobre-agentsreports) | Baixa | — |
| 4.6 | Registrar decisões arquiteturais relevantes em ADR (condicional) | [DEV-26](https://linear.app/henrique-brites/issue/DEV-26/46-registrar-decisoes-arquiteturais-relevantes-em-adr-condicional) | Média | 4.1 (DEV-21) |
| 4.7 | Lint de fronteira entre camadas (opcional, condicional) | [DEV-27](https://linear.app/henrique-brites/issue/DEV-27/47-adicionar-regra-de-lint-de-fronteira-entre-camadas) | Baixa | 4.1 (DEV-21) |

Descrições completas, critérios de aceite, arquivos envolvidos e resultado esperado de cada tarefa estão no corpo da issue correspondente no Linear (link na tabela acima). Cada issue referencia de volta este plano (`.agents/plans/fase-4-arquitetura-documentacao.md`).

### Decisões pendentes que exigem aprovação

1. **Local exato das portas movidas (4.1).** Recomendação: `src/application/ports/`.
2. **Formato do diagrama de arquitetura (4.2).** Sem fonte editável hoje; recomendação: Mermaid embutido no README.
3. **Adoção formal de ADRs (4.6).** Recomendação: sim, formato leve.
4. **Lint de fronteira entre camadas (4.7).** Exige nova dependência — recomendação: sim, como item opcional separado.

### Critérios de validação da fase

- `pnpm run typecheck`, `pnpm test` e `pnpm lint` passam sem falhas após todas as tarefas aprovadas.
- Nenhum import de `src/application/` para `src/resources/` ou `src/drivers/` permanece.
- README/`AGENTS.md`/diagrama batem com a árvore real de `src/`; `UserDAO.ts` documentado publicamente.
- `src/resources/daos/UserDAO.ts`, `UserDAODrizzle` e seu teste permanecem inalterados.
- Cada decisão pendente foi respondida antes de iniciar a implementação correspondente.
