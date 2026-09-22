# SOLID Masterclass

[![CI](https://github.com/henriquebrites/solid-masterclass/actions/workflows/ci.yml/badge.svg)](https://github.com/henriquebrites/solid-masterclass/actions/workflows/ci.yml)

Projeto de estudo que aplica os princípios SOLID e Arquitetura Hexagonal (Ports & Adapters) na construção de uma API backend em Node.js e TypeScript. A aplicação expõe um endpoint de criação de usuários, demonstrando separação entre regras de negócio, adaptadores de entrada/saída e recursos externos (banco de dados e notificações).

## Tecnologias

- [Node.js](https://nodejs.org/) com [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://fastify.dev/) — servidor HTTP
- [Zod](https://zod.dev/) via `fastify-type-provider-zod` — validação de schema e tipagem das rotas
- [@fastify/swagger](https://github.com/fastify/fastify-swagger) e [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) — documentação interativa da API
- [Drizzle ORM](https://orm.drizzle.team/) — acesso a dados PostgreSQL
- [PostgreSQL](https://www.postgresql.org/) (via Docker)
- [bcrypt](https://www.npmjs.com/package/bcrypt) — hash de senhas
- [Vitest](https://vitest.dev/) e [Supertest](https://github.com/ladjs/supertest) — testes
- [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/) — lint e formatação
- [pnpm](https://pnpm.io/) — gerenciador de pacotes

## Arquitetura do Projeto

![Arquitetura Hexagonal](./.github/images/architecture.jpg)

O projeto segue o fluxo **Drivers → Ports & Adapters → Application (Core) → Ports & Adapters → Resources**:

- **Drivers** (`src/drivers`): ponto de entrada da aplicação. Contém a configuração do servidor Fastify (`app.ts`), o registro de rotas, schemas de validação (Zod) e o mapeamento de erros de negócio para respostas HTTP.
- **Application / Core** (`src/application`): o núcleo da aplicação, independente de framework ou infraestrutura.
  - `entities`: modelos de domínio (ex.: `User`).
  - `usecases`: regras de negócio, como `CreateUser`, que orquestra validação de senha, verificação de e-mail duplicado, canal de marketing preferido e persistência do usuário.
  - `factories`: criação de estratégias concretas a partir de um identificador, como `SendNotificationFactory`.
  - `errors`: erros de domínio específicos (`PasswordDoNotMatchError`, `EmailAlreadyExistsError`, `InvalidMarketingPreferredChannelError`, `UserCreationError`).
- **Resources** (`src/resources`): adaptadores que conectam o núcleo a recursos externos.
  - `db`: cliente Drizzle (`client.ts`) e schema da tabela `users` (`schema.ts`).
  - `repositories`: implementação de `UserRepository` (`UserRepositoryDrizzle`) usada pelo caso de uso para persistir e consultar usuários.
  - `notifications`: implementações do padrão Strategy (`SendEmailNotification`, `SendSMSNotification`, `SendPushNotification`, `SendWhatsAppNotification`) para envio de notificações conforme o canal escolhido.

Essa organização mantém as regras de negócio (`application`) isoladas tanto da camada que recebe requisições (`drivers`) quanto da camada que acessa recursos externos (`resources`), permitindo trocar implementações (ex.: outro ORM ou canal de notificação) sem alterar o core.

## Requisitos

- Node.js
- [pnpm](https://pnpm.io/) `12.4.2` (definido em `packageManager` no `package.json`)
- [Docker](https://www.docker.com/) e Docker Compose (para subir o PostgreSQL local)

## Instalação

```bash
pnpm install
```

## Configuração

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.example .env
```

Variável de ambiente utilizada:

| Variável       | Descrição                              | Exemplo (`.env.example`)                                          |
| -------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | URL de conexão do PostgreSQL (Drizzle) | `postgresql://postgres:postgres@localhost:5433/solid_masterclass` |

O `docker-compose.yml` sobe o PostgreSQL mapeando a porta do container (`5432`) para a porta `5433` do host — ajuste a porta em `DATABASE_URL` conforme o ambiente usado.

## Executando o projeto

Suba o banco de dados PostgreSQL:

```bash
docker compose up -d
```

Inicie a aplicação em modo desenvolvimento (com recarregamento automático):

```bash
pnpm dev
```

A documentação interativa (Swagger UI) fica disponível em `http://localhost:4949/docs`.

### Build e produção

```bash
pnpm build
pnpm start
```

## Documentação da API (Swagger)

O servidor registra `@fastify/swagger` (geração do documento OpenAPI a partir dos schemas Zod das rotas, via `jsonSchemaTransform`) e `@fastify/swagger-ui` (interface interativa), montada no prefixo `/docs`.

Com a aplicação em execução (`pnpm dev` ou `pnpm start`), a documentação fica disponível em:

```text
http://localhost:4949/docs
```

O documento OpenAPI é gerado com as seguintes informações (definidas em `src/drivers/app.ts`):

- **Título:** `SampleApi`
- **Descrição:** `Sample backend service`
- **Versão:** `1.0.0`

## Endpoints

### `POST /users`

Cria um novo usuário. Valida senha e confirmação, unicidade de e-mail e canal de notificação preferido, então persiste o usuário (com senha hasheada via `bcrypt`) e dispara a notificação correspondente ao canal escolhido.

**Corpo da requisição (JSON):**

| Campo                       | Tipo     | Regras                                           |
| --------------------------- | -------- | ------------------------------------------------ |
| `name`                      | `string` | mínimo 1 caractere (após `trim`)                 |
| `age`                       | `number` | inteiro, entre 18 e 100                          |
| `phoneNumber`               | `string` | deve iniciar com `+55`, mínimo 1 caractere       |
| `email`                     | `string` | formato de e-mail válido                         |
| `password`                  | `string` | mínimo 8 caracteres                              |
| `passwordConfirmation`      | `string` | mínimo 8 caracteres, deve ser igual a `password` |
| `preferredMarketingChannel` | `string` | um de: `email`, `sms`, `push`, `whatsapp`        |

**Exemplo de requisição:**

```bash
curl -X POST http://localhost:4949/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 20,
    "phoneNumber": "+5511999999999",
    "email": "john@example.com",
    "password": "password123",
    "passwordConfirmation": "password123",
    "preferredMarketingChannel": "email"
  }'
```

**Respostas:**

| Status | Quando ocorre                                                          | Corpo                                                                                           |
| ------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `201`  | Usuário criado com sucesso                                             | `{ id, name, age, phoneNumber, email, preferredMarketingChannel }` (sem a senha)                |
| `400`  | Corpo inválido, senha e confirmação diferentes, ou canal inválido      | `{ "error": "Passwords do not match" }` ou `{ "error": "Invalid marketing preferred channel" }` |
| `409`  | E-mail já cadastrado                                                   | `{ "error": "E-mail já cadastrado" }`                                                           |
| `500`  | Erro inesperado ao criar o usuário (ex.: violação de constraint no BD) | `{ "error": "Erro ao criar usuário" }`                                                          |

## Testes

```bash
pnpm test
```

Os testes (`src/drivers/app.test.ts`) cobrem o endpoint `POST /users`, incluindo criação bem-sucedida, senha divergente (400), e-mail já cadastrado (409), erros de validação de schema (400) e erro de banco (500).

## Lint e formatação

```bash
pnpm lint
pnpm lint-fix
pnpm format
```

## Licença

ISC, conforme declarado no `package.json`.
