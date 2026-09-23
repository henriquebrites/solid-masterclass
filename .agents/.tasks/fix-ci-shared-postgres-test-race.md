# Fix flaky CI: eliminate cross-file Postgres race in Vitest integration tests

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`).
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

CI job 107148997286 (`henriquebrites/solid-masterclass`) fails intermittently at
`src/drivers/app.test.ts:148` with `expected 500 to be 201`. The underlying error is:

```
duplicate key value violates unique constraint "users_phone_number_key"
Key (phone_number)=(+5511999999999) already exists.
```

Two test files hit the same real Postgres database (single `DATABASE_URL`, one shared service
container in CI) with the identical fixed fixture `phoneNumber: "+5511999999999"` /
`email: "john@example.com"`: `src/drivers/app.test.ts` and
`src/resources/repositories/UserRepository.integration.test.ts`. Each does
`beforeEach(() => db.delete(usersTable))` before inserting that row. Vitest's default file-level
parallelism (`test.fileParallelism: true`, the vitest@5 default, unset in `vitest.config.ts`) runs
these two files concurrently in separate workers, so one file's cleanup or insert can interleave
with the other's "first" insert, producing the unique-constraint violation. `src/drivers/app.ts`
correctly converts that unexpected DB error into a 500, so the test's `expect(first.status).toBe(201)`
at line 148 fails - a symptom of the race, not of the error handler. This makes the CI job flaky,
costs re-runs, and erodes trust in the suite's signal.

Change: `vitest.config.ts` sets `test.fileParallelism: false`, so Vitest runs all test files
sequentially in a job instead of in parallel workers, removing the concurrent access to the shared
database. Both `pnpm run test:run` and `pnpm run test:coverage` (both run in CI, per
`.github/workflows/`) pick this up automatically since neither script overrides `fileParallelism`
on the CLI.

3 criteria in 1 slice · 0 one-way doors · 0 open

## Criteria

### CI test job runs the full suite sequentially against the shared database

1. Given `vitest.config.ts`, then `test.fileParallelism` is set to `false` (vitest@5 default is
   `true`).
2. When `pnpm run test:run` executes against a Postgres database shared by all test files (as in
   CI), then it exits with code `0`, with `src/drivers/app.test.ts` and
   `src/resources/repositories/UserRepository.integration.test.ts` both passing in the same run,
   including the assertion `expect(first.status).toBe(201)` at `src/drivers/app.test.ts:148`.
3. When `pnpm run test:coverage` executes the same way, then it exits with code `0`, for the same
   reason (it runs the full suite through the same `vitest.config.ts`).

## Out of scope

- Replacing the fixed fixture (`+5511999999999` / `john@example.com`) with per-test unique values
  - the source's own recommendation ("for the current suite and CI setup, disabling file
    parallelism is the smallest and most direct fix") already picks sequential execution for this
    task; unique fixtures remain a follow-up if the suite outgrows sequential execution (more
    integration files, longer CI time).

## Observable

`None - no user-facing surface` (CI/test-infrastructure fix only).

## Swept

- validation: n/a - no new input validation
- failure modes: n/a - the existing 500-on-unexpected-DB-error conversion in `src/drivers/app.ts`
  is unchanged
- idempotency and retry: n/a - no retry logic touched
- authorization: n/a - no authorization surface
- concurrency and ordering: criteria 1-3 - this is the dimension the task exists to fix; disabling
  file-level parallelism removes the cross-file race against the shared database
- data lifecycle: n/a - the `beforeEach` delete-all cleanup pattern is preexisting and unchanged
- external-dependency failure: n/a - no change to how a real DB failure is surfaced
- state transitions: n/a - no lifecycle in this task
- observability: n/a - existing per-file Vitest pass/fail output already shows the result; no new
  logging or metric is needed to verify

## Impact

| Front | What changes |
|---|---|
| CI runtime | the test job runs all files sequentially instead of across parallel workers; total CI test duration increases (5 test files today: `app.test.ts`, `UserRepository.integration.test.ts`, `UserRepository.test.ts`, `UserDAO.test.ts`, `CreateUser.test.ts`) |
| test config | `vitest.config.ts` gains `test.fileParallelism: false` (default `true` today) |

## Decided

None - `fileParallelism` is a single boolean in `vitest.config.ts`, reversible by flipping it
back; it persists no schema, is consumed by no external contract, and introduces no dependency.

## Sources

- CI job 107148997286 (`henriquebrites/solid-masterclass`) - failure log quoted above; settles
  the root cause (cross-file race against the shared Postgres database) and the recommended fix
  (disable Vitest file parallelism) for the current suite and CI setup.

This task is the record of decision. If a linked document diverges, ask before building.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | | None | |
