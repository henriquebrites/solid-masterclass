# Fix flaky CI: eliminate cross-file Postgres race in Vitest integration tests

Sources:

- `.agents/.tasks/fix-ci-shared-postgres-test-race.md` - settles intent, criteria, and the chosen
  mechanism (disable Vitest file parallelism)
- CI job 107148997286 (`henriquebrites/solid-masterclass`) - original failure log, root cause

## Out of scope

- Replacing the fixed fixture (`+5511999999999` / `john@example.com`) with per-test unique values
  - the task already picked sequential execution as the fix for the current suite and CI setup;
    unique fixtures stay a follow-up if the suite outgrows sequential execution.

## Landing

Touches only `vitest.config.ts`. No new module, no schema, no dependency.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| - | - | - |

- Nothing here is hard to reverse - a single boolean in `vitest.config.ts`, flippable back with no
  persisted schema, no consumed contract, and no new dependency.

## Checks

### S1 - Sequential CI test execution eliminates the shared-Postgres race · 1 file · 356 B · ~1k

**C1** - `vitest.config.ts` sets `test.fileParallelism` to `false` (vitest@5 default is `true`)
Proof: `grep -n "fileParallelism: false" vitest.config.ts`

**C2** - `pnpm run test:run` passes in full against the CI's shared Postgres database, with
`src/drivers/app.test.ts` and `src/resources/repositories/UserRepository.integration.test.ts`
both green in the same run, including `expect(first.status).toBe(201)` at `app.test.ts:148`
Proof: `pnpm run test:run` (exit code 0)

**C3** - `pnpm run test:coverage` passes in full against the same shared database, for the same
reason (same `vitest.config.ts`)
Proof: `pnpm run test:coverage` (exit code 0)

## Swept

- validation: n/a - no new input validation
- failure modes: n/a - `src/drivers/app.ts`'s existing 500-on-unexpected-DB-error conversion is
  unchanged
- idempotency and retry: n/a - no retry logic touched
- authorization: n/a - no authorization surface
- concurrency and ordering: C1, C2, C3 - disabling file-level parallelism is the fix for the
  cross-file race against the shared database
- data lifecycle: n/a - the `beforeEach` delete-all cleanup pattern is preexisting and unchanged
- external-dependency failure: n/a - no change to how a real DB failure is surfaced
- state transitions: n/a - no lifecycle in this change
- observability: n/a - existing per-file Vitest pass/fail output already shows the result
