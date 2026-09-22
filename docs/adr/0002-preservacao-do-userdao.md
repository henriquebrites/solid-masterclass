# 0002 — Preservação do `UserDAO.ts`

## Status

Aceito. Formaliza uma decisão já vigente e documentada em prosa em `AGENTS.md` desde antes da Fase 4.

## Contexto

`src/resources/daos/UserDAO.ts` e `UserDAODrizzle` implementam o mesmo propósito de `UserRepository`/`UserRepositoryDrizzle` (persistência de usuários), mas não são usados pela aplicação em runtime — o fluxo real usa `UserRepository`. `UserDAO.ts` existe como material de estudo do princípio de Inversão de Dependência (DIP) do SOLID: mostra a mesma abstração implementada de duas formas, uma delas propositalmente não conectada ao restante do sistema.

Sem um registro formal, esse código morto aparente é um alvo natural de limpeza automática ou refatoração por quem não conhece a decisão.

## Decisão

Manter `src/resources/daos/UserDAO.ts` e `UserDAODrizzle` como estão, incluindo seu desuso em runtime, como material didático. Não remover, substituir ou "corrigir" esse código como se fosse código morto.

## Consequências

- `UserDAO.ts`, `UserDAODrizzle` e seu teste permanecem no repositório indefinidamente, sem serem referenciados por `src/drivers/app.ts` ou qualquer outro ponto de entrada.
- Qualquer ferramenta de lint de código morto (dead code) precisa ignorar explicitamente esses arquivos, caso venha a ser adotada.
- README e `AGENTS.md` documentam o papel didático de `UserDAO.ts`, para que a intenção fique visível a quem lê apenas um dos dois.
