# Fix CI shared-Postgres test race Verification

**Verdict**: PASS
**Profile**: light (no `## tlc-implement` block in `AGENTS.md`; confirmed via `grep -n "## tlc-implement" AGENTS.md` — no match)
**Diff range**: `776c645..HEAD` (HEAD = `6566ac4`)
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

## Profile notes

- Step 1 (binding-source check) skipped — `ui`-only, `light` profile.
- Step 4 (fault injection) skipped — `standard`/`ui`-only, `light` profile.
- `Coverage` join and `Test policy` rows skipped — `standard`/`ui`-only; the checklist carries no `## Test policy` section anyway.
- Step 2 (run every proof) and step 3 (check the assertion) run as `light` describes.
- `Swept` rows re-read: all seven `n/a` rows state a concrete, still-true reason (no validation surface added, no retry logic touched, etc.) — none claim a constraint "existing in the code" that needs independent re-checking. The one non-`n/a` row (`concurrency and ordering: C1, C2, C3`) is the checklist's own claim resting on the three checks, verified below.

## Diff confirmed

`git diff 776c645..HEAD -- vitest.config.ts` shows the only change in the range:
```
+    fileParallelism: false,
```
No other file changed in the range (`git log --oneline 776c645..HEAD` = single commit `6566ac4`).

## Checks

| Check | Claim | Proof run | Evidence | Result |
|---|---|---|---|---|
| C1 | `vitest.config.ts` sets `test.fileParallelism` to `false` | `grep -n "fileParallelism: false" vitest.config.ts` | `vitest.config.ts:7` — `    fileParallelism: false,` | PASS |
| C2 | `pnpm run test:run` passes in full against the shared Postgres DB, `app.test.ts` and `UserRepository.integration.test.ts` both green in the same run, including `expect(first.status).toBe(201)` at `app.test.ts:148` | `pnpm run test:run` run **4 times** (exit 0 each time, explicit exit code checked on run 4) | Every run: `Test Files 10 passed (10)`, `Tests 66 passed (66)`. Assertion located at `src/drivers/app.test.ts:148` inside `describe("POST /users — 500 internal error", ...)` (opens line 145): `expect(first.status).toBe(201);` | PASS |
| C3 | `pnpm run test:coverage` passes in full against the same shared DB | `pnpm run test:coverage`, exit 0 | `Test Files 10 passed (10)`, `Tests 66 passed (66)`, coverage summary printed (100% stmts/funcs/lines, 96.77% branches) | PASS |

Both `test:run` (`vitest run`) and `test:coverage` (`vitest run --coverage`) resolve through the single `vitest.config.ts` — no per-script config override — so the `fileParallelism: false` setting applies identically to both proofs (`package.json:11-14`).

## Repeat-run evidence for C2 (race-elimination claim)

Ran `pnpm run test:run` four consecutive times against the live Postgres container (`solid-masterclass-db-1`, port 5433, matching `.env`'s `DATABASE_URL`), after applying pending migrations with `pnpm exec drizzle-kit migrate --config=drizzle.config.ts`:

| Run | Test Files | Tests | Exit |
|---|---|---|---|
| 1 | 10 passed (10) | 66 passed (66) | 0 (implicit, no failure output) |
| 2 | 10 passed (10) | 66 passed (66) | 0 |
| 3 | 10 passed (10) | 66 passed (66) | 0 |
| 4 | 10 passed (10) | 66 passed (66) | 0 (explicitly captured: `EXITCODE=0`) |

All four runs are clean — no flake observed across repeated sequential execution, consistent with the fix's claim that disabling file-level parallelism removes the cross-file race against the shared database. (The pino error-level log lines seen in stdout are expected: they come from the app's own error logger firing during the "duplicate phone number" / 500-path tests, which intentionally trigger a DB constraint violation — not a test failure signal.)

## Gate

`pnpm run test:run` (repeated x4) — 66 passed, 0 failed, each run
`pnpm run test:coverage` — 66 passed, 0 failed; coverage report generated
