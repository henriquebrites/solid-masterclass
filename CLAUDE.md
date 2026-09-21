# Skills

As skills compartilhadas do projeto estão centralizadas em `.agents/skills/` — essa é a **fonte única**. O diretório `.claude/skills/` existe apenas para que o Claude Code descubra essas skills, e contém **exclusivamente symlinks** apontando para `.agents/skills/`, nunca cópias ou conteúdo próprio. É esse symlink que faz a ponte: sem ele, o Claude Code não enxerga as skills, mesmo que elas existam em `.agents/skills/`.

Skills atualmente presentes (fonte em `.agents/skills/`, symlink correspondente em `.claude/skills/`):

- `commit-message`
- `github-readme-generator`
- `harness-eval`
- `the-judge`
- `tlc-discover`
- `tlc-implement`
- `tlc-plan`
- `tlc-spec-driven`
- `tlc-spec-lean`

Ao executar uma tarefa:

- Consulte as skills disponíveis em `.agents/skills/`.
- Leia o arquivo `SKILL.md` da skill relevante antes de executar o trabalho.
- Siga as instruções e os critérios definidos nessa skill.
- Não duplique skills em outros diretórios.

## Adicionando uma nova skill

1. Crie a skill em `.agents/skills/<nome>/SKILL.md` — nunca diretamente em `.claude/skills/`.
2. Exponha-a criando um symlink em `.claude/skills/<nome>` apontando para `.agents/skills/<nome>`.
3. Nunca copie o conteúdo da skill para `.claude/skills/<nome>` — apenas o symlink deve existir ali.

Observação: essa orientação indica onde estão os arquivos, mas não substitui a configuração de descoberta de skills do Claude Code.

## Cursor

O Cursor tem instruções equivalentes em `.cursor/rules/agents.mdc`, que referencia `AGENTS.md` e este arquivo e lista as mesmas skills por referência textual a `.agents/skills/` (o Cursor não descobre diretórios de skills via symlink, apenas arquivos `.mdc` em `.cursor/rules/` ou `AGENTS.md`).
