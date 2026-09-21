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

| Conteúdo                 | Diretório             |
| ------------------------ | --------------------- |
| Skills                   | `.agents/skills/`     |
| Tarefas e checklists     | `.agents/.tasks/`     |
| Checklists de verificação (`tlc-implement`) | `.agents/.checks/` |
| Planos de implementação  | `.agents/plans/`      |
| Relatórios e análises    | `.agents/reports/`    |
| Pesquisas e referências  | `.agents/research/`   |
| Artefatos auxiliares     | `.agents/artifacts/`  |
| Arquivos temporários     | `.agents/tmp/`        |

`.agents/.tasks/` e `.agents/.checks/` usam ponto porque são os nomes que as skills `tlc-plan` e `tlc-implement` já usam na prática (`.tasks/<name>.md` e `.checks/<feature>.md`) e que já existem no repositório. Os demais diretórios (`plans/`, `reports/`, `research/`, `artifacts/`, `tmp/`) ainda não existem e devem ser criados sob demanda, sem ponto, quando a primeira tarefa que os usa surgir.

Crie os diretórios necessários quando ainda não existirem.

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
