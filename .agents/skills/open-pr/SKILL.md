---
name: open-pr
description: Open a pull request on GitHub for the current branch using the gh CLI. Derives a Conventional Commits-style title from the branch's own commits, runs this repo's local quality gates (typecheck, lint, format, build, migrate + tests), and fills in the project's own PR template with a description grounded in the actual diff. Use when the user says "open a PR", "create a PR", "abrir PR", "abre o PR", "submit my changes", or asks to open a pull request for the current branch. Do NOT use this skill to review PR content quality after it's open (use the-judge) or to write a plain commit message (use commit-message).
---

# Open PR

Turns the current branch into a pull request against `main` with a title that matches this
repo's Conventional Commits history and a body that follows `.github/PULL_REQUEST_TEMPLATE.md`
— filled in from the real diff, not placeholder text.

This repo is a solo learning project with a single long-lived branch (`main`); there is no
staging/homolog/develop split and no stacked-PR pattern to enforce. Every PR targets `main`.
Keep this skill that simple — don't reintroduce branch-flow machinery this project doesn't have.

## Prerequisites

Run `gh auth status`. If not authenticated, tell the user to run `gh auth login` and stop.

## Step 1 — Gather context

Run in parallel:

```bash
git fetch origin
git rev-parse --abbrev-ref HEAD                 # current branch
git log --format="%h %s" origin/main...HEAD     # commits ahead of main
git diff --stat origin/main...HEAD              # files changed
```

Check whether a PR already exists for this branch:

```bash
gh pr view --json url,title 2>/dev/null
```

If one exists, show its URL and stop — don't open a duplicate.

If `git log origin/main...HEAD` returns nothing, there is nothing to open a PR for. Say so and stop.

## Step 2 — Run the local quality gates

`.github/PULL_REQUEST_TEMPLATE.md` asks the author to confirm these pass locally before opening
a PR, and CI enforces the same checks on the PR itself. Running them first catches failures
before a reviewer (or CI) does:

```bash
pnpm run typecheck
pnpm exec eslint .
pnpm run format:check
pnpm run build
pnpm run migrate && pnpm run test:run
```

Record which ones pass. If something fails because of the change itself (a real type error, a
lint violation, a broken test), show the failure and ask whether to fix it before continuing —
don't open a PR you already know is red.

If a command fails for local-environment reasons unrelated to the change (e.g. `migrate` can't
reach a database because `DATABASE_URL` isn't configured in this shell), say so plainly and ask
the user whether to proceed anyway, noting that CI will still run the same check on the PR.

## Step 3 — Derive the PR title

This repo's PR titles follow the same Conventional Commits format as its commit messages (see
the `commit-message` skill): `type(scope): description`, lowercase, imperative mood, no trailing
period, ≤ 72 characters, scope optional.

Look at the commits gathered in Step 1:
- If the branch has one commit, or several commits that all serve the same change, the title can
  mirror that commit's message directly.
- If the branch mixes several unrelated changes, pick the type that reflects the branch's
  dominant, most significant change and write a description that summarizes the whole diff —
  not just the last commit.

Show the suggested title to the user and ask for confirmation or an adjustment before moving on.

## Step 4 — Fill in the PR description from the project's own template

Read `.github/PULL_REQUEST_TEMPLATE.md` fresh (don't rely on a copy — if the template changes,
this skill should follow it automatically) and fill in its sections from the actual diff and
commit history:

- **Descrição**: 2–4 sentences on what changed and why, in the same spirit as the `commit-message`
  skill's guidance — describe the effect of the change, not a restatement of the file list the
  diff already shows.
- **Fase / Issue relacionada**: this project tracks work in phases under `.agents/.checks/` and
  `.agents/plans/` (e.g. a branch named `ci/phase-6-...` corresponds to
  `.agents/.checks/fase-6-automacao-integracao-continua.md`). Look for a check or plan file whose
  name matches the current branch's phase number or slug and reference it. If nothing matches
  clearly, leave the section for the user to fill in rather than guessing.
- **Checklist de verificação local**: check off each box based on what actually passed in Step 2.
  Leave a box unchecked if that command failed or couldn't be run, don't check it just because
  the PR is about to be opened.

This project's own docs (`AGENTS.md`, the `.agents/.checks/` and `.agents/plans/` files, and the
PR template itself) are written in Portuguese, while commit messages are written in English by
convention. Follow that same split: write the PR title in English, and write the description
content in Portuguese by default — unless the user has been writing to you in English, in which
case match them.

## Step 5 — Confirm and create

Show the final title and filled-in description, and ask for confirmation. Once confirmed:

```bash
gh pr create \
  --title "{title}" \
  --base "main" \
  --body "$(cat <<'EOF'
{description}
EOF
)"
```

## Step 6 — Output

Print the PR URL returned by `gh pr create`.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| PR already open for this branch | Detected in Step 1 via `gh pr view` — show the existing URL, don't create a duplicate |
| `gh` not installed | Instruct the user: `brew install gh` or https://github.com/cli/cli |
| No commits ahead of `main` | Stop — nothing to open a PR for |
| Quality gate fails on the change itself | Ask whether to fix it before opening the PR |
| Quality gate fails for local-environment reasons (e.g. no `DATABASE_URL`) | Note it, note CI still covers it, ask whether to proceed |
| Merge conflicts against `main` | Warn: resolve with `git merge origin/main` before opening the PR |

## Related skills

- **`commit-message`** — the PR title follows the same Conventional Commits rules this skill uses for individual commits; keep them consistent.
- **`the-judge`** — run after the PR is open to get a full code review posted as GitHub review comments. This skill does not review code quality itself.
