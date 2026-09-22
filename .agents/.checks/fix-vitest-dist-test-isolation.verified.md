# Fix Vitest running compiled tests from dist/ Verification

**Verdict**: PASS  
**Profile**: light  
**Diff range**: `origin/main..HEAD`  
**Round**: 1 - full  
**Verifier**: independent sub-agent (author ≠ verifier)

## Checks

| Check | Claim | Proof | Evidence | Result |
|---|---|---|---|---|
| C1 | `dist/` contains no `*.test.js` after build | `pnpm build && find dist -name '*.test.js' \| wc -l` → 0 | `tsconfig.json:26` — `"exclude": ["node_modules", "dist", "**/*.test.ts"]` excludes tests from compilation | PASS |
| C2 | Vitest runs only `src/**/*.test.ts`, ignores stale `dist/` | `pnpm exec vitest run` reports 6 test files, all from `src/` paths | All six files listed in output: `src/resources/notifications/`, `src/application/factories/`, `src/resources/daos/`, `src/resources/repositories/`, `src/application/usecases/`, `src/drivers/` — zero from `dist/`. `vitest.config.ts` sets `include: ["src/**/*.test.ts"]` and `exclude: ["node_modules", ".git", "dist"]` | PASS |
| C3 | Build+test sequence is deterministic; `POST /users — success` returns 201 three times | Run `pnpm build && pnpm exec vitest run` three times consecutively | Run 1: all "POST /users — success" tests ✓ (201). Run 2: all ✓ (201). Run 3: all ✓ (201). No intermittent 500 errors, no race condition on unique email/phoneNumber constraints | PASS |

## Configuration verified

| File | Change | Status |
|---|---|---|
| `tsconfig.json` | Added `**/*.test.ts` to `exclude` array (line 26) | verified at HEAD |
| `vitest.config.ts` | New file: explicit `include: ["src/**/*.test.ts"]`, `exclude: ["node_modules", ".git", "dist"]` | verified at HEAD |

## Gate

All proofs executed independently at HEAD. Three checks, three passes, zero failures. No blocking gaps.
