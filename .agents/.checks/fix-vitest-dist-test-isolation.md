# Fix Vitest running compiled tests from dist/

Sources:

- [.tasks/fix-vitest-dist-test-isolation.md](.tasks/fix-vitest-dist-test-isolation.md) - pre-decided task with 3 criteria, 1 slice, 0 one-way doors

## Out of scope

- Fixing the underlying race condition in `CreateUser.execute()` (only `email` is checked before insert; `phoneNumber` is not; no transaction/lock) — this task removes the accidental trigger (duplicate test suites from `dist/`), but does not fix the root issue that can still manifest in production under concurrent signups using the same phone number. Tracked as Unresolved #1 in the source task.

## Landing

This change touches two config files only, both fully reversible: `tsconfig.json` gains a test exclusion in `exclude`, and a new `vitest.config.ts` makes file discovery explicit. Zero runtime code is modified, zero data migrations exist, zero contracts change. No one-way doors.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| None - both changes are config-only and reversible | | |

## Checks

### S1 - Isolate source tests from compiled artifacts · 2 files · ~200 B total · ~50k

**C1** - When `pnpm build` runs, `dist/` contains no `*.test.js` files
Proof: `pnpm build && find dist -name '*.test.js' -type f | wc -l` returns 0

**C2** - When `pnpm exec vitest run` runs, only files matching `src/**/*.test.ts` are executed, even if `dist/` contains stale compiled test files
Proof: `pnpm exec vitest run --reporter=verbose 2>&1 | grep -E 'test file|PASS|FAIL'` shows only `src/` paths, no `dist/` paths

**C3** - Consecutive runs of `pnpm build && pnpm exec vitest run` return deterministic results; specifically, `POST /users — success` test returns 201 consistently (not intermittent 500)
Proof: Run `pnpm build && pnpm exec vitest run --reporter=verbose 2>&1 | grep "POST /users.*success"` three times consecutively; all three runs pass the test, no intermittent 500

## Swept

- validation: n/a — no user input validation changes
- failure modes: n/a — no new failure modes; existing tsc/vitest errors propagate as before
- idempotency and retry: C1, C2, C3 — running `pnpm build`/`pnpm test` repeatedly is now deterministic (was intermittent before)
- authorization: n/a — build/test tooling, no authorization boundary
- concurrency and ordering: C2, C3 — removes the trigger that caused two identical test suites to race against the same Postgres with identical fixture data
- data lifecycle: n/a — no change to test data reset logic (already exists in `beforeEach`, unchanged)
- external-dependency failure: n/a — no new external dependencies
- state transitions: n/a — no state machine altered
- observability: n/a — no new logging/metrics; Vitest reporter already exposes pass/fail

## Coverage

| Set (size) | Member → proof | Unproven |
| --- | --- | --- |
| tsc output (2 categories) | compiled source code C1 (implicitly, since C1 checks absence of test files) · test files excluded C1 | - |
| Vitest include/exclude discovery (2 surfaces) | `src/**/*.test.ts` picked up C2 · `dist/**/*.test.js` ignored even when present C2 | - |
| determinism under build + test sequence (1 outcome) | `pnpm build && pnpm exec vitest run` produces 201 on named test C3 | - |

- C1, C2, C3 all cross the command-line boundary and report observable file-system and test-output changes

## Handoff

**Profile:** `light` (default, no override in `AGENTS.md`)
**Batch:** S1 only (1 slice, 3 checks, ~50k tokens < 150k budget); handoff after S1 to Verifier
**Commits by batch close:**
- After C1, C2, C3 all green: single commit with `tsconfig.json` + new `vitest.config.ts`

**What the build establishes:** two config-only changes, zero runtime code, zero reversals of other decisions, zero clarifications needed from user (all scope and refusals settled by source task doc).

**Verifier input:** checklist + `<base commit>..HEAD` diff, all 3 checks with their proofs green locally.
