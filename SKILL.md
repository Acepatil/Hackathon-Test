---
name: hackathon-skill-package-validator
description: "Use this skill when you want to package the buyer/seller marketplace into a hackathon-ready skill submission, validate its canonical layout, and generate a concrete submission report."
---

# Skill: Hackathon Skill Package Validator

Use this skill when you want to verify that a hackathon skill artifact follows the canonical submission checklist and produces a measurable report.

## What this skill does

This skill package validates the repository against the hackathon rubric for skill artefacts. It checks for:

- `SKILL.md` with YAML frontmatter and an activation selector
- canonical folders: `scripts/`, `references/`, `assets/`
- at least one runnable automation script
- bundled assets and reference documentation
- measurable output in the form of a generated report

It also documents how the package maps to axis 5 (skills.md quality), axis 4 (robustness), and axis 3 (completeness).

## How to use

1. Run the validation script:

```bash
python3 scripts/validate_skill_pack.py
```

2. Inspect the generated report:

```bash
less assets/skill_submission_report.md
```

3. Use the references for rubric alignment:

- `references/domain-rules.md`
- `references/output-schema.md`
- `references/second-workflow-walkthrough.md`

## Repository context

This repository contains two separate full-stack marketplace applications:

- `buyer/` — the buyer-facing marketplace application with a React/TypeScript/Vite frontend and a Go backend BFF that fetches, translates, caches, and serves localized product catalogs.
- `seller/` — the seller-facing application with a Go backend and a merchant-facing frontend for voice-driven product listing, smart spec suggestion, and product management.

The validation workflow in this skill package targets the repository packaging, while the buyer/seller apps remain the core product logic under `buyer/` and `seller/`.

## Files in this package

- `SKILL.md` — canonical skill entrypoint with metadata and usage guidance
- `scripts/validate_skill_pack.py` — runnable checker that generates a report
- `assets/report-template.md` — report scaffold used by the script
- `references/output-schema.md` — documented output format for the generated report
- `references/second-workflow-walkthrough.md` — reuse story for a second workflow
- `references/domain-rules.md` — rubric-aligned submission guidance

## Application folders

- `buyer/` — buyer marketplace full-stack application
- `seller/` — seller marketplace full-stack application

## Outputs

- `assets/skill_submission_report.md` — a measurable, shareable markdown report that captures package validation state.

## Environment Variables

- None required for this validation skill.
- If the skill is extended to include external integrations, add each secret and API key here.

## Why this maps to the rubric

- Axis 5 (`Skilled Solution?`) — professional-grade package structure, explicit activation statement, and clear documentation.
- Axis 4 (`Solution Robustness`) — contains a real script with deterministic validation logic and concrete output.
- Axis 3 (`Solution Completeness`) — includes a complete submission workflow, references, and cross-workflow reuse guidance.

## Suggested demo narrative

1. Show the problem: packaging hackathon submission quality.
2. Explain the skill: load `SKILL.md`, run `scripts/validate_skill_pack.py`, inspect output.
3. Run the script live, including a negative input if a folder is missing.
4. Show reuse: the same validator also works for evaluating another skill submission.
5. Highlight the measurable output: `assets/skill_submission_report.md`.
