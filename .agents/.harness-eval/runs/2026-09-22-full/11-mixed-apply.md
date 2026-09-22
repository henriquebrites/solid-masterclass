# Mixed apply plan (Track C)

> Run dir: `/Users/britesh/dev/formacao-em-SOLID/solid-masterclass/.harness-eval/runs/2026-09-22-full`
> Judges: J1 model=`claude-sonnet-5` · J2 model=`claude-sonnet-5`
> **This file is the only Mixed apply input.** Do not re-judge usefulness.

## What these words mean

| Word | Meaning | Apply must |
|------|---------|------------|
| **KEEP** | Text from judge Keep-core columns | Remain in the harness surface as rule/snippet |
| **CUT** | Text from judge Slim columns | Delete or compress only this bulk |
| **Apply** | Mechanical edit | Not a new design pass |

## Hard rules for apply agents

1. For each Mixed ID below, edit **only** that path.
2. **KEEP** items must survive (same contract — concern/module/section/checklist).
   Do not replace a KEEP teaching snippet with a weaker pattern.
3. **CUT** only what both judges' Slim columns describe (or the union when both
   clearly name the same bulk). If KEEP and CUT conflict, **skip that path** (Hold).
4. Never replace a fenced teaching snippet with `See app/...` / `lib/...` / `test/...`.
5. Never defer KEEP content to AGENTS.md or another surface unless CUT explicitly
   names OVERLAP with that path **and** KEEP still retains the behavior contract.
6. Do not open the repo to invent a different convention than KEEP states.
7. After edits: every KEEP bullet must still be satisfied by the file text.

## Paths (1)

### S001 — `.cursor/rules/agents.mdc`

- Tier: `T0` · Name: `agents.mdc`
- Overall: J1 `MIXED` · J2 `MIXED`

#### KEEP (do not remove or degrade)

- **J1:** BEHAVIOR-CHANGING: the `alwaysApply: true` pointer directing Cursor to read `AGENTS.md`/`CLAUDE.md` — Cursor has no native symlink-based skill discovery, so this rule is the only mechanism that tells a Cursor session where rules/skills live.
- **J2:** BEHAVIOR-CHANGING: the Cursor-specific bridge text ("Cursor não descobre diretórios de skills via symlink... leia o SKILL.md da skill relevante em .agents/skills/<nome>/SKILL.md") — without it a Cursor agent has no path from `.cursor/rules/agents.mdc` to `.agents/skills/`, since Cursor cannot discover `.claude/skills` symlinks

#### CUT (only this bulk)

- **J1:** OVERLAP: the bullet list of 9 skill names duplicates `CLAUDE.md`'s skill list verbatim.
- **J2:** OVERLAP: the itemized 9-skill list duplicates the same list already in `CLAUDE.md` verbatim

#### Overlap cites (context only; cut OVERLAP here only if listed under CUT)

- **J1:** CLAUDE.md (S003)
- **J2:** `CLAUDE.md` (S003)

---

