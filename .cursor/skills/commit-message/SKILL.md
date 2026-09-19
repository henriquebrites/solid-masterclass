
---
name: commit-message
description: Generate concise English Git commit messages following Conventional Commits, based on the actual changes in the repository. Use when creating, reviewing, or improving a commit message.
disable-model-invocation: true
---

# Conventional Commit Message Generator

## Objective

Generate a single Git commit message in English that accurately describes the changes being committed.

## Workflow

1. Inspect the staged changes first using `git diff --cached`.
2. If there are no staged changes, inspect `git diff` and the relevant repository context.
3. Review relevant filenames and code changes to understand the actual purpose of the implementation.
4. Determine the appropriate Conventional Commits type and, when useful, a concise scope.
5. Generate exactly one commit message following the required format.
6. Do not invent changes, features, fixes, or intentions that are not supported by the available evidence.

## Required format

`type(scope): description`

The scope is optional:

`type: description`

For breaking changes:

`type(scope)!: description`

## Rules

- Write the entire commit message in English.
- Follow the Conventional Commits specification.
- Keep the complete message under or equal to 150 characters, including the type, scope, punctuation, and spaces.
- Use a concise, specific description written in the imperative mood.
- Use lowercase for the type and description unless proper nouns or technical identifiers require otherwise.
- Do not end the description with a period.
- Use a scope only when it adds useful context, such as `auth`, `api`, `database`, or `user`.
- Prefer the smallest accurate type and scope that communicate the change.
- Do not include a body, footer, Markdown formatting, quotation marks, or explanations.
- Do not include issue numbers unless they are explicitly present in the provided context and relevant to the commit.
- Never claim a breaking change unless the changes clearly introduce one.

## Conventional Commit types

- `feat`: Introduce a new feature.
- `fix`: Fix a bug.
- `docs`: Documentation-only changes.
- `style`: Changes that do not affect code behavior, such as formatting or whitespace.
- `refactor`: Restructure code without changing its external behavior or fixing a bug.
- `perf`: Improve performance.
- `test`: Add or update tests.
- `build`: Change build systems or external dependencies.
- `ci`: Change CI configuration or scripts.
- `chore`: Maintenance tasks that do not fit another type.
- `revert`: Revert a previous commit.

Choose the type based on the actual changes, not merely the files modified.

## Output validation

Before responding, verify that:

1. The message follows the required Conventional Commits format.
2. The type accurately represents the changes.
3. The description is in English and clearly communicates the purpose.
4. The message contains no more than 150 characters.
5. The output contains exactly one commit message and nothing else.

If the available changes are insufficient to determine the intent, ask one concise clarification question instead of guessing.