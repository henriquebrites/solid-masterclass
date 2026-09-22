# Fase 6 — Automação e integração contínua

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`).
> Fonte: `.agents/.design/fase-6-automacao-integracao-continua.md` (discovery confirmado). Nada em "Decisões resolvidas"
> deve ser reaberto sem necessidade.

## Resumo

O discovery já confirmou que o CI existente (`.github/workflows/ci.yml`) é sólido e não precisa ser recriado. O escopo da Fase 6 é fechar 3 lacunas pontuais: falta de relatório de cobertura no CI, falta de documentação do passo de migration para testes locais passarem em checkout limpo, e ausência de templates de PR/Issue (relevante agora que o projeto aceita colaboração externa). Proteção de branch e gate de cobertura ficaram fora de escopo por decisão do usuário.

**Correção em relação ao discovery**: o relatório original dizia que "não há documentação de setup local". Isso estava impreciso — o README já documenta `.env` e `docker compose up` (seções "Configuração" e "Executando o projeto"). A lacuna real, mais estreita, é que falta apenas o passo de `drizzle-kit migrate` (que o CI já roda, mas não está no README nem em `package.json`). A tarefa 6.2 reflete essa correção.

4 tarefas · 0 tarefas com contrato de API/schema alterado · 0 decisões em aberto (as 2 perguntas foram resolvidas pelo usuário em 2026-09-22).

Cadastradas no Linear (time/projeto Development MVP): [DEV-35](https://linear.app/henrique-brites/issue/DEV-35) (6.1), [DEV-36](https://linear.app/henrique-brites/issue/DEV-36) (6.2), [DEV-37](https://linear.app/henrique-brites/issue/DEV-37) (6.3), [DEV-38](https://linear.app/henrique-brites/issue/DEV-38) (6.4).

---

## 6.1 — Adicionar relatório de cobertura de testes ao CI (sem gate)

**Descrição**: `package.json` já declara `test:coverage` (`vitest run --coverage`, usando `@vitest/coverage-v8`, já instalado como devDependency) mas nenhum step de `.github/workflows/ci.yml` o executa. Esta tarefa adiciona um step que roda esse script, gerando relatório informativo no log do job — sem threshold que bloqueie o merge (decisão explícita do usuário: sem gate).

**Critérios de aceite**:
1. `.github/workflows/ci.yml` contém um novo step (ex.: "Coverage report") que executa `pnpm run test:coverage`, após o step "Run tests".
2. O job continua com exit code `0` independente do percentual de cobertura — nenhum campo `coverage.thresholds` é adicionado a `vitest.config.ts`.
3. Ao rodar o workflow (push/PR para `main`), o log do novo step exibe o relatório texto gerado pelo provider `v8` (reporter `text`, já configurado em `vitest.config.ts:8`).

**Prioridade**: Alta
**Dependências**: nenhuma
**Arquivos envolvidos**: `.github/workflows/ci.yml`
**Resultado esperado**: visibilidade de cobertura em todo PR/push para `main`, sem bloquear merges por nota baixa.

---

## 6.2 — Documentar (e automatizar) o passo de migration para testes locais

**Descrição**: `src/drivers/app.test.ts` e `src/resources/repositories/UserRepository.integration.test.ts` usam o client real do banco (`src/resources/db/client.ts`) e falham se o schema não estiver migrado. O CI já roda `pnpm exec drizzle-kit migrate --config=drizzle.config.ts` antes dos testes (`.github/workflows/ci.yml:59-60`), mas esse passo não existe como script em `package.json` nem está documentado no `README.md` — um contribuidor seguindo as instruções atuais ("Configuração"/"Executando o projeto") sobe o banco e configura `.env`, mas os 2 testes de integração ainda falham porque o schema não foi migrado.

**Critérios de aceite**:
1. `package.json` ganha um script `migrate` (`"migrate": "drizzle-kit migrate --config=drizzle.config.ts"`), reaproveitando a dependência `drizzle-kit` já instalada — nenhuma dependência nova.
2. `README.md`, na seção "Testes" (linha ~184), passa a listar o passo de migration (`pnpm run migrate`) como pré-requisito antes de `pnpm test`, na mesma sequência que o CI já segue.
3. Seguindo os passos do README do zero em um checkout limpo (`pnpm install` → `docker compose up -d` → `cp .env.example .env` → `pnpm run migrate` → `pnpm test`), os 10 arquivos de teste passam, incluindo os 2 de integração.

**Prioridade**: Alta
**Dependências**: nenhuma
**Arquivos envolvidos**: `README.md`, `package.json`
**Resultado esperado**: um novo contribuidor consegue rodar a suíte de testes completa localmente seguindo só o README, sem precisar adivinhar o passo de migration.

---

## 6.3 — Criar template de Pull Request

**Descrição**: Não existe `.github/PULL_REQUEST_TEMPLATE.md` hoje (confirmado por busca completa no repositório). Com o projeto passando a aceitar colaboração externa, um template padroniza a descrição de PRs. Idioma: português, consistente com README/ADRs/docs (decisão do usuário, 2026-09-22).

**Critérios de aceite**:
1. `.github/PULL_REQUEST_TEMPLATE.md` existe e, ao abrir um novo PR no GitHub visando `main`, seu conteúdo pré-preenche a descrição.
2. O template inclui, no mínimo: descrição da mudança, referência à fase do curso ou issue relacionada (quando aplicável), e um checklist de verificação local antes de abrir o PR.
3. O checklist referencia exatamente os checks que `.github/workflows/ci.yml` roda hoje (typecheck, lint, format check, build, testes) — nenhuma verificação prometida que o CI não cobre.

**Prioridade**: Média
**Dependências**: nenhuma
**Arquivos envolvidos**: `.github/PULL_REQUEST_TEMPLATE.md` (novo)
**Resultado esperado**: PRs de qualquer colaborador seguem uma estrutura consistente, alinhada ao que o CI de fato verifica.

---

## 6.4 — Criar templates de Issue (bug e sugestão)

**Descrição**: Não existe `.github/ISSUE_TEMPLATE/` hoje. Com colaboração externa, padronizar como bugs e sugestões são reportados reduz idas e vindas. Idioma: português (mesma decisão de 6.3).

**Critérios de aceite**:
1. `.github/ISSUE_TEMPLATE/bug_report.md` existe, com campos para descrição do problema, passos para reproduzir, comportamento esperado e ambiente (versão do Node, SO).
2. `.github/ISSUE_TEMPLATE/feature_request.md` existe, com campos para descrição da sugestão e motivação/contexto.
3. Ao abrir uma nova Issue no GitHub, o seletor de tipo de template exibe as duas opções.

**Prioridade**: Baixa (melhoria de processo, não bloqueante — nenhuma issue externa foi aberta até hoje)
**Dependências**: nenhuma
**Arquivos envolvidos**: `.github/ISSUE_TEMPLATE/bug_report.md` (novo), `.github/ISSUE_TEMPLATE/feature_request.md` (novo)
**Resultado esperado**: issues externas chegam com contexto mínimo padronizado.

---

## Ordem de execução

```
6.1 (coverage no CI)         — independente
6.2 (migration no README)    — independente
6.3 (template de PR)         — independente
6.4 (templates de Issue)     — independente
```

Nenhuma dependência entre as 4 tarefas — podem ser feitas em qualquer ordem ou em paralelo. Nenhuma altera schema, contrato de API ou comportamento de runtime da aplicação.

## Fora de escopo

- **Proteção de branch em `main`** — decisão do usuário (2026-09-22): fica de fora, configuração manual no GitHub.
- **Gate/threshold de cobertura mínima** — decisão do usuário (2026-09-22): sem gate, `test:coverage` é só informativo.
- **`test:types` no CI** — mencionado no discovery como oportunidade opcional, não confirmado como necessidade comprovada; fácil de adicionar depois seguindo o mesmo padrão de 6.1.
- **`CONTRIBUTING.md` dedicado** — decisão do usuário (2026-09-22): emendar o README existente em vez de criar arquivo novo, evitando duplicação de conteúdo já documentado (`.env`, `docker compose`).

## Sources

- `.agents/.design/fase-6-automacao-integracao-continua.md` — discovery confirmado; origem do escopo
- `.github/workflows/ci.yml` — workflow existente, ponto de extensão da tarefa 6.1
- `package.json` — scripts existentes (`test:coverage`, `drizzle-kit` já instalado)
- `README.md` — seções "Configuração"/"Executando o projeto"/"Testes", ponto de extensão da tarefa 6.2

## Unresolved

None — as 2 perguntas foram resolvidas pelo usuário em 2026-09-22 (ver "Decisões resolvidas").

## Decisões resolvidas

| # | Questão original | Decisão | Onde |
|---|---|---|---|
| 1 | Onde documentar o passo de migration faltante: emendar README ou criar CONTRIBUTING.md novo? | Emendar o README existente, para evitar duplicação | Critérios de aceite de 6.2 |
| 2 | Idioma dos templates de PR/Issue: português ou inglês? | Português, consistente com o resto da documentação do projeto | Critérios de aceite de 6.3 e 6.4 |
