# Fase 5 — Banco de Dados, API e Segurança — Verified

Verified fresh (independent agent, not the author) against `.agents/.checks/fase-5-banco-dados-api-seguranca.md`, diff `4ec9a4c..HEAD` (7 commits, matches the 7 slices S1-S7).

## Verdict: ALL 24 CHECKS PASS

### S1 - Observability (5.1)

- C1 PASS - `grep "logger:"` in app.ts finds `fastify({ logger: true, ...options })`.
- C2 PASS - `"logs a structured line for a request"` captures pino stream, asserts `logs.some(l => l.includes("incoming request"))`. Real assertion, not just green.
- C3 PASS - `"logs the original error before responding 500"` asserts `logs.some(l => l.includes('"level":50'))` (pino error level) after a DB-constraint 500.
- C4 PASS - `"returns 500 when a DB constraint throws"` asserts `res.body` is exactly `{ error: "Erro ao criar usuário" }`, no stack leak.

### S2 - Process exceptions (5.2)

- C5 PASS - `"logs and exits on unhandledRejection"` asserts `app.log.error` called with the reason and `process.exit(1)`.
- C6 PASS - same pattern for `uncaughtException`, exit(1).

### S3 - DATABASE_URL validation (5.3)

- C7 PASS - `"throws an explicit error naming DATABASE_URL when it is missing"` deletes env var, asserts import rejects matching `/DATABASE_URL/`. `client.ts` uses a zod schema with an explicit message naming the var.
- C8 PASS - `"does not throw when DATABASE_URL is set"` sets a valid URL, asserts import resolves.

### S4 - Graceful shutdown (5.4)

- C9 PASS - `"closes the database connection on SIGTERM"` asserts `db.$client.end` called.
- C10 PASS - same for SIGINT.
- C11 PASS - `"logs and still exits when closing the connection fails"` — `end` rejects, asserts `app.log.error` called with the close error AND `exitSpy` called with 0 (still exits despite failure).

### S5 - HTTP hardening (5.5)

- C12 PASS - confirms `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit` in `dependencies` (not devDependencies).
- C13 PASS - `"includes helmet security headers"` asserts `x-content-type-options: nosniff`.
- C14 PASS - `"does not reflect any origin..."` sends `Origin: https://evil.example.com`, asserts `access-control-allow-origin` header is `undefined`.
- C15 PASS - `"returns 429 after 5 requests..."` uses a fresh probe app with the production default rate limit, fires 5 non-429 requests then asserts 429 on the 6th; correctly isolated from the shared `app` instance (`usersRateLimit: {max:100_000}` in beforeAll).

### S6 - Real-DB integration test (5.6)

- C16 PASS - creates via repository, re-reads via a fresh `db.select()` query, asserts row count 1 and content.
- C17 PASS - real DB roundtrip for an existing email.
- C18 PASS - asserts `undefined` for a non-existent email.
- File has no `vi.mock("../db/client")`, matching the Landing row.

### S7 - setErrorHandler centralization (5.7)

- C19 PASS - 400 password-mismatch, body/status unchanged.
- C20 PASS - 409 email-exists, body/status unchanged.
- C21 PASS (caveat confirmed true) - dedicated throwaway route proves the mapping directly; confirmed via `CreateUser.ts`/`app.ts` that the branch is unreachable through the real zod-validated HTTP path today.
- C22 PASS - DB-constraint 500, unchanged body, now originates from `setErrorHandler` (no more inline try/catch).
- C23 PASS - full `app.test.ts` passes standalone, no existing assertions changed.
- C24 PASS - see suite results below.

## Landing — all rows reflected in the diff, no discrepancies

Native Fastify logger, CORS `origin: false`, rate limit scoped to `POST /users` via route `config`, `setErrorHandler` centralization, new `UserRepository.integration.test.ts` without mocks, zod validation of `DATABASE_URL`, new `src/drivers/processLifecycle.ts` module wired from `index.ts`, and `buildApp`'s `usersRateLimit` test seam — all confirmed present exactly as described.

## Out of scope — untouched

`UserDAO.ts`, `drizzle-kit`/migrate scripts, auth, and the `drizzle-orm`/`drizzle-kit` versions are all unchanged. Schema, migrations and the `POST /users` contract are unchanged. One incidental, harmless change: `AGENTS.md` gained two lines documenting where LLM/skill output directories live — unrelated to Fase 5 scope, flagged for visibility only.

## Full validation suite at HEAD

- `pnpm run typecheck` → PASS
- `pnpm run lint` → PASS
- `pnpm run test:run` → PASS: 10 files, 66 tests, all passed (against the real Postgres container on port 5433)

## Notes (non-blocking)

`setErrorHandler`'s generic `error.statusCode < 500` passthrough branch (beyond the 3 named domain errors) is documented in the checklist's `Test policy` section as the mechanism that also covers the rate-limit plugin's 429 — not an undisclosed change.
