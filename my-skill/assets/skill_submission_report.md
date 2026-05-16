# Skill Submission Report

Skill name: hackathon-skill-package-validator
Skill description: Use this skill when you want to package the buyer/seller marketplace into a hackathon-ready skill submission, validate its canonical layout, and generate a concrete submission report.

Generated: 2026-05-16

## What this report checks

This skill package is designed to map the hackathon submission into the rubric axes and produce a concrete evaluation report.

## Validation status

- **PASS** Root SKILL.md exists: Required canonical skill file
- **PASS** scripts/ directory exists: Required support scripts folder
- **PASS** references/ directory exists: Required references folder
- **PASS** assets/ directory exists: Required assets folder
- **PASS** At least one runnable script: Must have a real script
- **PASS** Report template asset: Template for visible output
- **PASS** SKILL.md YAML frontmatter: Canonical metadata block
- **PASS** SKILL.md name field: Skill identity
- **PASS** SKILL.md description field: Activation statement

## Outputs

- `assets/skill_submission_report.md`: a readable submission checklist report
- `scripts/validate_skill_pack.py`: runnable validation script
- `references/output-schema.md`: documented output format
- `references/second-workflow-walkthrough.md`: reuse and portability example
- `references/domain-rules.md`: rubric and evaluation guidance
