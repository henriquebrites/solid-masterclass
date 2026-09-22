# Regras de análise prévia e limites de autonomia dos agentes

Sources:

- Linear DEV-11 (https://linear.app/henrique-brites/issue/DEV-11/25-regras-de-analise-previa-e-limites-de-autonomia-dos-agentes) - descrição, critérios de aceite, arquivos envolvidos e dependências

## Out of scope

- Alterar `package.json`, `.github/workflows/ci.yml` ou hooks do Husky - a tarefa só exige referenciá-los a partir de `AGENTS.md`
- Espelhar as novas regras em `.cursor/rules/agents.mdc` - não listado nos arquivos envolvidos pela tarefa; `agents.mdc` já referencia `AGENTS.md` por completo

## Landing

Toca apenas `AGENTS.md`, acrescentando uma seção nova. Reaproveita os comandos já documentados em "Comandos de validação" e a lista de scripts existente em `package.json` - não inventa comandos novos.

- Nada aqui é porta de mão única: é documentação de política, reversível por edição.

## Checks

### S1 - Regras de análise prévia e limites de autonomia · 1 arquivo · ~5 KB · ~1k

**C1** - `AGENTS.md` exige exame do código relacionado (padrões existentes, camada afetada, dependências e testes atuais) antes de propor ou implementar qualquer alteração, e instrui a evitar refatorações não relacionadas ao objetivo da tarefa em curso.
Proof: `grep -A6 "## Análise prévia" AGENTS.md | grep -i "padrões existentes"` e `grep -i "refatorações não relacionadas" AGENTS.md`

**C2** - `AGENTS.md` exige que dúvidas relevantes e conflitos com decisões existentes sejam apresentados ao usuário antes de implementar mudanças que dependam dessas decisões.
Proof: `grep -i "dúvidas relevantes" AGENTS.md` e `grep -i "conflitos com decisões existentes" AGENTS.md`

**C3** - `AGENTS.md` lista como executáveis sem confirmação adicional exatamente: `pnpm run lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run build`.
Proof: `sed -n '/Executáveis sem confirmação adicional/,/Exigem confirmação explícita/p' AGENTS.md | grep -c '`pnpm run lint`\|`pnpm exec tsc --noEmit`\|`pnpm test`\|`pnpm run build`'` retorna 4 - a seção isolada tem exatamente essas 4 ocorrências (a busca sem escopo no arquivo inteiro retorna 5, porque `pnpm test` também aparece em "Comandos de validação", fora da lista "sem confirmação")

**C4** - `AGENTS.md` lista como exigindo confirmação explícita, no mínimo: instalação/alteração de dependências, `drizzle-kit migrate` fora do CI, alteração de arquivos de configuração (tsconfig.json, eslint.config.js, .prettierrc, workflows de CI, hooks do Husky), commits, push e qualquer operação destrutiva.
Proof: `grep -i "pnpm add" AGENTS.md`, `grep -i "drizzle-kit migrate" AGENTS.md`, `grep -i "tsconfig.json" AGENTS.md`, `grep -i "husky" AGENTS.md`, `grep -i "operação destrutiva" AGENTS.md`

**C5** - `AGENTS.md` declara que a existência de um script em `package.json` não implica autorização automática para executá-lo.
Proof: `grep -i "não implica autorização" AGENTS.md`

**C6** - `AGENTS.md` instrui que, diante de uma operação fora dos limites definidos, o agente deve interromper o trabalho e solicitar autorização.
Proof: `grep -i "interrompa o trabalho" AGENTS.md`

## Swept

- validation: n/a - tarefa é documentação, não código
- failure modes: C6 - operação fora dos limites definidos leva a interrupção e pedido de autorização
- idempotency: n/a - edição de documento único, sem efeito colateral repetível
- authorization: C3, C4 - é o próprio objeto da tarefa
- concurrency: n/a - não há execução concorrente de agentes neste repositório
- data lifecycle: n/a - nenhum dado é criado, retido ou descartado
- external-dependency failure: n/a - nenhuma dependência externa nova
- state transitions: n/a - não há máquina de estados envolvida
- observability: n/a - não é comportamento em runtime, é regra para agentes

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| comandos livres (4) | `pnpm run lint` C3 · `pnpm exec tsc --noEmit` C3 · `pnpm test` C3 · `pnpm run build` C3 | - |
| operações que exigem confirmação (6 categorias) | dependências C4 · `drizzle-kit migrate` fora do CI C4 · config (tsconfig/eslint/prettier/CI/husky) C4 · commits C4 · push C4 · operação destrutiva C4 | - |

- Nenhum check afirma código de status, rota ou resposta HTTP - critério não se aplica a este check (tarefa é documentação de regras para agentes, não comportamento de API)

## Handoff

Não aplicável - uma única slice, ~1k tokens de leitura, sem necessidade de handoff.
