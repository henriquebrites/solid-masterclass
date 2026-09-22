# AGENTS.md

Instruções equivalentes para o Cursor estão em `.cursor/rules/agents.mdc`, que referencia este arquivo e `CLAUDE.md`.

## Regras gerais

- A raiz do projeto é o diretório onde este arquivo está localizado.
- Nunca crie, salve ou modifique arquivos fora da raiz do projeto.
- Não altere arquivos globais do sistema ou configurações de outros projetos.
- Antes de criar arquivos, verifique se já existe um local apropriado.
- Se o diretório necessário não existir, crie-o dentro do projeto.
- Evite duplicações, alterações desnecessárias e arquivos temporários desnecessários.
- Respeite as convenções e configurações existentes no projeto.

## Organização dos arquivos

Mantenha os arquivos auxiliares dos agentes em `.agents/`:

| Conteúdo                                    | Diretório            |
| ------------------------------------------- | -------------------- |
| Skills                                      | `.agents/skills/`    |
| Tarefas e checklists                        | `.agents/.tasks/`    |
| Checklists de verificação (`tlc-implement`) | `.agents/.checks/`   |
| Planos de implementação                     | `.agents/plans/`     |
| Relatórios e análises                       | `.agents/reports/`   |
| Pesquisas e referências                     | `.agents/research/`  |
| Artefatos auxiliares                        | `.agents/artifacts/` |
| Arquivos temporários                        | `.agents/tmp/`       |
| Saídas do `harness-eval`                    | `.agents/.harness-eval/` |

`.agents/.tasks/` e `.agents/.checks/` usam ponto porque são os nomes que as skills `tlc-plan` e `tlc-implement` já usam na prática (`.tasks/<name>.md` e `.checks/<feature>.md`) e que já existem no repositório. `.agents/.harness-eval/` usa ponto pelo mesmo motivo: é o nome que a skill `harness-eval` já usa por padrão (`.harness-eval/runs/<run-id>/`), apenas movido para dentro de `.agents/`. Os demais diretórios (`plans/`, `reports/`, `research/`, `artifacts/`, `tmp/`) ainda não existem e devem ser criados sob demanda, sem ponto, quando a primeira tarefa que os usa surgir.

Crie os diretórios necessários quando ainda não existirem.

A skill `harness-eval` (`.agents/skills/harness-eval/`) escreve suas saídas em `<--root>/.harness-eval/runs/<run-id>/` por padrão — para que fiquem em `.agents/.harness-eval/`, passe `--out-base .agents/.harness-eval/runs/<run-id>` para `inventory_extract.py` e `track_a_correctness.py`, e `--run-dir .agents/.harness-eval/runs/<run-id>` para os demais scripts (`surfaces_extract.py`, `merge_agreement.py`, `merge_usefulness.py`), mantendo `--root .` (raiz do repositório) para a varredura. Não altere os scripts da skill para isso.

## Arquivos da aplicação

- Código-fonte: `src/`
- Testes: siga a estrutura de testes existente no projeto.
- Documentação permanente: `docs/` (o diretório ainda não existe; crie-o sob demanda quando houver conteúdo para colocar nele, sem criação preventiva)
- Arquivos compilados: `dist/`
- Cobertura de testes: `coverage/`
- Resultados de testes: `test-results/`
- Relatórios Playwright: `playwright-report/`
- Configurações: mantenha nos locais convencionais das respectivas ferramentas.
- Arquivos de exemplo de ambiente: raiz do projeto, como `.env.example`.

Respeite a estrutura existente. Não mova arquivos apenas para adequá-los a esta lista.

## Arquitetura Hexagonal

O projeto segue Arquitetura Hexagonal (Ports & Adapters), conforme documentado em `README.md`: **Drivers → Ports & Adapters → Application (Core) → Ports & Adapters → Resources**.

- **Drivers** (`src/drivers`): ponto de entrada da aplicação — servidor Fastify, registro de rotas, schemas de validação (Zod) e mapeamento de erros de negócio para respostas HTTP.
- **Application / Core** (`src/application`): núcleo da aplicação, independente de framework ou infraestrutura.
  - `entities`: modelos de domínio.
  - `usecases`: regras de negócio, orquestrando validação, verificação de regras e persistência via as abstrações definidas em `resources`.
  - `factories`: criação de estratégias concretas a partir de um identificador.
  - `errors`: erros de domínio específicos.
- **Resources** (`src/resources`): adaptadores que conectam o núcleo a recursos externos (banco de dados, repositórios, notificações).

As regras de negócio (`application`) ficam isoladas tanto da camada de entrada (`drivers`) quanto da camada de acesso a recursos externos (`resources`), permitindo trocar implementações sem alterar o core. Ao adicionar código, mantenha essa direção de dependência: `drivers` e `resources` dependem de `application`, nunca o contrário.

## Convenções de código

Estas convenções já são observadas no código existente e, onde aplicável, impostas por `eslint.config.js`, `.prettierrc`, `.editorconfig` e `tsconfig.json` (TypeScript `strict`, ESLint flat config com `simple-import-sort`, Prettier). Não as contrarie.

- Classes e interfaces: `PascalCase` (ex.: `CreateUser`, `UserRepository`, `UserDAO`).
- Nome do arquivo alinhado ao nome da classe/interface principal exportada (ex.: `UserRepository.ts` exporta `UserRepository`), exceto barris de re-exportação (`index.ts`) e arquivos que exportam valores/configuração em vez de uma classe (ex.: `app.ts`, `client.ts`, `schema.ts`), que usam nome em minúsculo.
- Diretórios: minúsculo e plural (ex.: `entities`, `usecases`, `repositories`, `daos`).
- Classes de erro de domínio: sufixo `Error` (ex.: `EmailAlreadyExistsError`, `UserCreationError`), definidas em `src/application/errors`.
- Testes: arquivo `<Nome>.test.ts` colocado ao lado do código-fonte testado (ex.: `CreateUser.ts` e `CreateUser.test.ts` no mesmo diretório), usando Vitest.

## Preservação de `UserDAO.ts`

`src/resources/daos/UserDAO.ts` é mantido intencionalmente como material de estudo do princípio de Inversão de Dependência (DIP) do SOLID. Ele não é usado pela aplicação em runtime — o fluxo real de persistência usa `UserRepository` (`src/resources/repositories/UserRepository.ts`).

**Não remova, substitua ou "corrija" `UserDAO.ts` como código morto.** Sua existência é uma decisão de produto para fins didáticos, não um resíduo a ser limpo.

## Comandos de validação

Use os scripts já existentes em `package.json` para verificar conformidade — não invente novos scripts:

- `pnpm lint` — ESLint.
- `pnpm format` — Prettier.
- `pnpm test` — Vitest.
- `pnpm build` — checagem de tipos e compilação TypeScript.

## Análise prévia e limites de autonomia

Antes de propor ou implementar qualquer alteração:

- Examine o código relacionado: padrões existentes, camada afetada (`drivers`, `application` ou `resources`), dependências e testes atuais.
- Evite refatorações não relacionadas ao objetivo da tarefa em curso.
- Apresente dúvidas relevantes e conflitos com decisões existentes ao usuário antes de implementar mudanças que dependam dessas decisões.

Executáveis sem confirmação adicional:

- `pnpm run lint`
- `pnpm exec tsc --noEmit`
- `pnpm test` (execução local, sem afetar banco real)
- `pnpm run build`

Exigem confirmação explícita do usuário, no mínimo:

- Instalação ou alteração de dependências (`pnpm add`/`remove`, edição de `package.json`).
- Qualquer `drizzle-kit migrate` fora do CI (`.github/workflows/ci.yml`) — localmente afeta o banco de desenvolvimento real.
- Alteração de arquivos de configuração (`tsconfig.json`, `eslint.config.js`, `.prettierrc`, workflows de CI, hooks do Husky em `.husky/`).
- Commits e push.
- Qualquer operação destrutiva.

A existência de um script em `package.json` não implica autorização automática para executá-lo. Diante de uma operação fora dos limites definidos acima, interrompa o trabalho e solicite autorização ao usuário.

## Planejamento e execução

- Consulte os planos e tarefas relevantes antes de iniciar uma implementação.
- Salve novos planos em `.agents/plans/` e tarefas/checklists em `.agents/.tasks/`.
- Atualize os documentos relacionados quando necessário.
- Siga as skills aplicáveis à tarefa.
- Execute os testes e verificações pertinentes à implementação.
- Ao finalizar, informe os arquivos criados ou modificados e os testes executados.

## Segurança e conclusão

- Não grave credenciais, tokens ou segredos em arquivos auxiliares.
- Não sobrescreva ou exclua arquivos existentes sem necessidade e justificativa.
- Se uma operação exigir escrita fora do projeto, interrompa-a e informe o usuário.
- Antes de concluir, confira se os arquivos gerados estão nos locais corretos e dentro do projeto.
