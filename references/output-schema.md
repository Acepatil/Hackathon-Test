# Output Schema

This skill produces a markdown validation report at `assets/skill_submission_report.md`.

Fields:
- `Skill name` — the canonical `SKILL.md` name field.
- `Skill description` — the frontmatter description field.
- `Generated` — report generation date.
- `Validation status` — pass/fail results for every package requirement.
- `Outputs` — the files produced or validated by the skill.

This schema is intentionally lightweight so the report can be consumed in Claude Code, VS Code, or any markdown viewer.
