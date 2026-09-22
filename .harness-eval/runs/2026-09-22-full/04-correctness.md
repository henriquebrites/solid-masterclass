# Harness Eval: Correctness (Track A)

> Generated: 2026-09-22T01:21:07.177409+00:00
> Method: deterministic path/command checks (no README)

## What these words mean

| Word | Meaning | You should |
|------|---------|------------|
| **BROKEN** | A cited path or command does not exist (high-precision check) | Fix the cite or restore the file |
| **OK path-cites** | Concrete path cites that resolved | No action |
| **T0 / T1 / T2** | Always-on rules / skills / cited harness refs | Fix T0 cites first (always loaded) |

This track answers: *is the harness factually wrong about paths/commands?* Not redundancy (`07`) or usefulness (`10`).

## Executive summary

- T0: 3 · T1: 9 · T2: 34
- Manifests: package.json
- Findings: **14 broken** · 81 path-cites ok

## Inventory

### T0

Always-on rules (always loaded).

- `.cursor/rules/agents.mdc`
- `AGENTS.md`
- `CLAUDE.md`

### T1

Skills.

- `.agents/skills/commit-message/SKILL.md`
- `.agents/skills/github-readme-generator/SKILL.md`
- `.agents/skills/harness-eval/SKILL.md`
- `.agents/skills/the-judge/SKILL.md`
- `.agents/skills/tlc-discover/SKILL.md`
- `.agents/skills/tlc-implement/SKILL.md`
- `.agents/skills/tlc-plan/SKILL.md`
- `.agents/skills/tlc-spec-driven/SKILL.md`
- `.agents/skills/tlc-spec-lean/SKILL.md`

### T2

Cited harness refs.

- `.agents/skills/github-readme-generator/references/evidence-policy.md`
- `.agents/skills/github-readme-generator/references/validation-checklist.md`
- `.agents/skills/harness-eval/references/GLOSSARY.md`
- `.agents/skills/harness-eval/references/PROTOCOL.md`
- `.agents/skills/harness-eval/references/claims.schema.json`
- `.agents/skills/harness-eval/references/judge-prompts.md`
- `.agents/skills/the-judge/references/comment-voice.md`
- `.agents/skills/the-judge/references/review-standards.md`
- `.agents/skills/tlc-discover/references/document-format.md`
- `.agents/skills/tlc-implement/references/checklist-format.md`
- `.agents/skills/tlc-implement/references/screens.md`
- `.agents/skills/tlc-implement/references/test-policy.md`
- `.agents/skills/tlc-implement/references/verify.md`
- `.agents/skills/tlc-plan/references/document-format.md`
- `.agents/skills/tlc-spec-driven/references/code-analysis.md`
- `.agents/skills/tlc-spec-driven/references/coding-principles.md`
- `.agents/skills/tlc-spec-driven/references/context-limits.md`
- `.agents/skills/tlc-spec-driven/references/design.md`
- `.agents/skills/tlc-spec-driven/references/discuss.md`
- `.agents/skills/tlc-spec-driven/references/implement.md`
- `.agents/skills/tlc-spec-driven/references/lessons.md`
- `.agents/skills/tlc-spec-driven/references/memory.md`
- `.agents/skills/tlc-spec-driven/references/specify.md`
- `.agents/skills/tlc-spec-driven/references/sub-agents.md`
- `.agents/skills/tlc-spec-driven/references/tasks.md`
- `.agents/skills/tlc-spec-driven/references/validate.md`
- `.agents/skills/tlc-spec-lean/references/build.md`
- `.agents/skills/tlc-spec-lean/references/checks.md`
- `.agents/skills/tlc-spec-lean/references/memory.md`
- `.agents/skills/tlc-spec-lean/references/plan.md`
- `.agents/skills/tlc-spec-lean/references/verify.md`
- `.github/workflows/ci.yml`
- `package.json`
- `tsconfig.json`

## Findings

### [A001] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/SKILL.md`
- **The instruction cites:** `.agents/skills`
- **Looked for:** `.agents/skills` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A002] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/SKILL.md`
- **The instruction cites:** `.cursor/skills`
- **Looked for:** `.cursor/skills` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A003] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/SKILL.md`
- **The instruction cites:** `lib/...`
- **Looked for:** `lib/...` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A004] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/SKILL.md`
- **The instruction cites:** `test/...`
- **Looked for:** `test/...` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A005] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/SKILL.md`
- **The instruction cites:** `.agents/...`
- **Looked for:** `.agents/...` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A007] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/SKILL.md`
- **The instruction cites:** `.agents/…`
- **Looked for:** `.agents/…` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A008] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/references/PROTOCOL.md`
- **The instruction cites:** `.agents/skills`
- **Looked for:** `.agents/skills` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A009] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/references/PROTOCOL.md`
- **The instruction cites:** `.cursor/skills`
- **Looked for:** `.cursor/skills` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A010] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/references/PROTOCOL.md`
- **The instruction cites:** `bin/console`
- **Looked for:** `bin/console` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A011] BROKEN — missing file

- **In:** `.agents/skills/harness-eval/references/PROTOCOL.md`
- **The instruction cites:** `references/view.md`
- **Looked for:** `references/view.md` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A014] BROKEN — missing file

- **In:** `.agents/skills/tlc-implement/references/verify.md`
- **The instruction cites:** `bin/rails`
- **Looked for:** `bin/rails` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

### [A015] BROKEN — missing command

- **In:** `.agents/skills/tlc-spec-driven/references/tasks.md`
- **The instruction cites:** `yarn test:unit`
- **Looked in:** `package.json` scripts (repo root only)
- **Fix:** Add a `test:unit` script to `package.json` at the repo root, or change the cite to a command that exists there.

### [A016] BROKEN — missing command

- **In:** `.agents/skills/tlc-spec-driven/references/tasks.md`
- **The instruction cites:** `yarn test:e2e`
- **Looked in:** `package.json` scripts (repo root only)
- **Fix:** Add a `test:e2e` script to `package.json` at the repo root, or change the cite to a command that exists there.

### [A017] BROKEN — missing file

- **In:** `.agents/skills/tlc-spec-lean/references/verify.md`
- **The instruction cites:** `bin/rails`
- **Looked for:** `bin/rails` at the repo root (case-sensitive)
- **Fix:** Point the cite at a path that exists, or restore the missing file.

## Notes

- Path normalization preserves `.agents` (never `str.lstrip('./')`).
- Placeholders and bare example filenames are skipped.
- Fenced code blocks are not scanned for path cites.
- `references/` may resolve under a skill named in the same surface (e.g. load `dev`).
- Missing `app/`/`lib/`/`test/` cites are BROKEN only when mandate language is nearby.
