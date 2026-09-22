# Harness Eval: Usefulness Agreement (Track C)

> Run dir: `/Users/britesh/dev/formacao-em-SOLID/solid-masterclass/.harness-eval/runs/2026-09-22-full`
> Trap gate: PASS (misses=0)
> Fan-in gate: PASS (slim-fanin-blocked=0)
> Judges: J1 model=`claude-sonnet-5` · J2 model=`claude-sonnet-5`
> Bands: Slim = dual SLIM/ROUTING + trap PASS + fan-in PASS; Keep-core = dual KEEP-CORE; Mixed = dual MIXED; Hold = disagree / unclear / missing / slim-fanin-blocked
> **Model-sensitive:** re-judge on a second model before large Slim deletes.
> **Fan-in:** another harness surface hard-loads this path as SoT → Hold, not Slim.
> **Mixed apply:** use `11-mixed-apply.md` only — do not re-judge from this table alone.

## What these words mean

| Word | Meaning | You should |
|------|---------|------------|
| **Keep-core** | Most of the file changes agent behavior | Do **not** slim |
| **Mixed** | Real rules + large theory/examples/overlap | Keep rules; cut bulk — follow `11-mixed-apply.md` |
| **Slim** | Mostly theory / repo-demo / overlap, **and** no other harness surface hard-loads it | Compress or delete body |
| **Hold** | Judges disagreed, unclear, or Slim blocked by fan-in | Do nothing yet (or update consumers first) |
| **Trap PASS** | Planted traps scored correctly | Necessary but not sufficient for Slim |
| **Fan-in blocked** | Another harness file mandates loading this path / treats it as SoT | Do **not** stub/delete until consumers are updated |

This track answers: *does deleting this change agent behavior?* Not the same as redundancy (`07-agreement.md`).

## Executive summary

- Real surfaces scored: 42
- Slim: **1**
- Keep-core: **37**
- Mixed: **1** → apply plan: `11-mixed-apply.md`
- Hold: **3** (fan-in blocked: 0)
- Trap misses: none

## Discrimination (plants)

| ID | Expected family | J2 family |
|----|-----------------|-----------|
| S901 | SLIM | SLIM |
| S902 | SLIM | SLIM |
| S903 | KEEP-CORE | KEEP-CORE |

Slim by tier: {'T2': 1}
Keep-core by tier: {'T0': 1, 'T1': 9, 'T2': 27}
Mixed by tier: {'T0': 1}
Hold by tier: {'T0': 1, 'T2': 2}

## Slim (compress / delete body candidates)

| ID | Tier | Name | Path | J1 | J2 |
|----|------|------|------|----|----|
| S026 | T2 | code-analysis.md | `.agents/skills/tlc-spec-driven/references/code-analysis.md` | SLIM | SLIM |

## Slim fan-in blocked (do not stub/delete)

Dual SLIM/ROUTING-ONLY, but another harness surface hard-loads the path (load/SoT/extract mandate). Update or drop those consumers before Slim apply.

| ID | Path | Citers |
|----|------|--------|
| — | — | none |

## Keep-core

| ID | Tier | Name | Path | J1 | J2 |
|----|------|------|------|----|----|
| S002 | T0 | AGENTS.md | `AGENTS.md` | KEEP-CORE | KEEP-CORE |
| S004 | T1 | commit-message | `.agents/skills/commit-message/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S005 | T1 | github-readme-generator | `.agents/skills/github-readme-generator/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S006 | T1 | harness-eval | `.agents/skills/harness-eval/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S007 | T1 | the-judge | `.agents/skills/the-judge/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S008 | T1 | tlc-discover | `.agents/skills/tlc-discover/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S009 | T1 | tlc-implement | `.agents/skills/tlc-implement/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S010 | T1 | tlc-plan | `.agents/skills/tlc-plan/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S011 | T1 | tlc-spec-driven | `.agents/skills/tlc-spec-driven/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S012 | T1 | tlc-spec-lean | `.agents/skills/tlc-spec-lean/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S013 | T2 | evidence-policy.md | `.agents/skills/github-readme-generator/references/evidence-policy.md` | KEEP-CORE | KEEP-CORE |
| S014 | T2 | validation-checklist.md | `.agents/skills/github-readme-generator/references/validation-checklist.md` | KEEP-CORE | KEEP-CORE |
| S016 | T2 | PROTOCOL.md | `.agents/skills/harness-eval/references/PROTOCOL.md` | KEEP-CORE | KEEP-CORE |
| S017 | T2 | judge-prompts.md | `.agents/skills/harness-eval/references/judge-prompts.md` | KEEP-CORE | KEEP-CORE |
| S018 | T2 | comment-voice.md | `.agents/skills/the-judge/references/comment-voice.md` | KEEP-CORE | KEEP-CORE |
| S019 | T2 | review-standards.md | `.agents/skills/the-judge/references/review-standards.md` | KEEP-CORE | KEEP-CORE |
| S020 | T2 | document-format.md | `.agents/skills/tlc-discover/references/document-format.md` | KEEP-CORE | KEEP-CORE |
| S021 | T2 | checklist-format.md | `.agents/skills/tlc-implement/references/checklist-format.md` | KEEP-CORE | KEEP-CORE |
| S022 | T2 | screens.md | `.agents/skills/tlc-implement/references/screens.md` | KEEP-CORE | KEEP-CORE |
| S023 | T2 | test-policy.md | `.agents/skills/tlc-implement/references/test-policy.md` | KEEP-CORE | KEEP-CORE |
| S024 | T2 | verify.md | `.agents/skills/tlc-implement/references/verify.md` | KEEP-CORE | KEEP-CORE |
| S025 | T2 | document-format.md | `.agents/skills/tlc-plan/references/document-format.md` | KEEP-CORE | KEEP-CORE |
| S028 | T2 | context-limits.md | `.agents/skills/tlc-spec-driven/references/context-limits.md` | KEEP-CORE | KEEP-CORE |
| S029 | T2 | design.md | `.agents/skills/tlc-spec-driven/references/design.md` | KEEP-CORE | KEEP-CORE |
| S030 | T2 | discuss.md | `.agents/skills/tlc-spec-driven/references/discuss.md` | KEEP-CORE | KEEP-CORE |
| S031 | T2 | implement.md | `.agents/skills/tlc-spec-driven/references/implement.md` | KEEP-CORE | KEEP-CORE |
| S032 | T2 | lessons.md | `.agents/skills/tlc-spec-driven/references/lessons.md` | KEEP-CORE | KEEP-CORE |
| S033 | T2 | memory.md | `.agents/skills/tlc-spec-driven/references/memory.md` | KEEP-CORE | KEEP-CORE |
| S034 | T2 | specify.md | `.agents/skills/tlc-spec-driven/references/specify.md` | KEEP-CORE | KEEP-CORE |
| S035 | T2 | sub-agents.md | `.agents/skills/tlc-spec-driven/references/sub-agents.md` | KEEP-CORE | KEEP-CORE |
| S036 | T2 | tasks.md | `.agents/skills/tlc-spec-driven/references/tasks.md` | KEEP-CORE | KEEP-CORE |
| S037 | T2 | validate.md | `.agents/skills/tlc-spec-driven/references/validate.md` | KEEP-CORE | KEEP-CORE |
| S038 | T2 | build.md | `.agents/skills/tlc-spec-lean/references/build.md` | KEEP-CORE | KEEP-CORE |
| S039 | T2 | checks.md | `.agents/skills/tlc-spec-lean/references/checks.md` | KEEP-CORE | KEEP-CORE |
| S040 | T2 | memory.md | `.agents/skills/tlc-spec-lean/references/memory.md` | KEEP-CORE | KEEP-CORE |
| S041 | T2 | plan.md | `.agents/skills/tlc-spec-lean/references/plan.md` | KEEP-CORE | KEEP-CORE |
| S042 | T2 | verify.md | `.agents/skills/tlc-spec-lean/references/verify.md` | KEEP-CORE | KEEP-CORE |

## Mixed (keep core, slim examples/theory)

Path list only. **Apply instructions:** `11-mixed-apply.md` (KEEP/CUT per ID).

| ID | Tier | Name | Path | J1 | J2 |
|----|------|------|------|----|----|
| S001 | T0 | agents.mdc | `.cursor/rules/agents.mdc` | MIXED | MIXED |

## Hold

| ID | Tier | Reason | J1 | J2 | Path |
|----|------|--------|----|----|------|
| S003 | T0 | disagree | MIXED | KEEP-CORE | `CLAUDE.md` |
| S015 | T2 | disagree | MIXED | SLIM | `.agents/skills/harness-eval/references/GLOSSARY.md` |
| S027 | T2 | disagree | KEEP-CORE | MIXED | `.agents/skills/tlc-spec-driven/references/coding-principles.md` |

## Action guidance

- **Slim:** compress only after trap PASS **and** fan-in PASS; still human-approve; prefer re-judge on a second model if deleting >30% of a skill.
- **Slim fan-in blocked:** do **not** stub/delete; either keep the checklist body or update every citing harness surface in the same change, then re-merge.
- **Mixed:** open `11-mixed-apply.md` and execute KEEP/CUT per ID only. Do **not** re-judge. Do **not** replace KEEP snippets with `See app/...` or defer KEEP contracts to AGENTS.md. Empty Keep-core/Slim cells → skip that path.
- **Keep-core:** do not slim for usefulness reasons.
- **Hold:** no usefulness trim.
- See `08-usefulness-j1.md` / `09-usefulness-j2.md` for raw score rows.
- Fan-in detail JSON: `slim-fanin.json`.

