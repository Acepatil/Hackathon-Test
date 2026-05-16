#!/usr/bin/env python3
import os
import re
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
SKILL_MD = ROOT / "SKILL.md"
REPORT_TEMPLATE = ROOT / "assets" / "report-template.md"
OUTPUT_REPORT = ROOT / "assets" / "skill_submission_report.md"


def parse_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not match:
        return {}
    frontmatter = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            frontmatter[key.strip()] = value.strip().strip('"').strip("'")
    return frontmatter


def check_structure(root: Path) -> list[tuple[str, bool, str]]:
    checks = []
    checks.append(("Root SKILL.md exists", SKILL_MD.exists(), "Required canonical skill file"))
    checks.append(("scripts/ directory exists", (root / "scripts").is_dir(), "Required support scripts folder"))
    checks.append(("references/ directory exists", (root / "references").is_dir(), "Required references folder"))
    checks.append(("assets/ directory exists", (root / "assets").is_dir(), "Required assets folder"))
    checks.append(("At least one runnable script", any(p.suffix == ".py" for p in (root / "scripts").glob("*.py")), "Must have a real script"))
    checks.append(("Report template asset", REPORT_TEMPLATE.exists(), "Template for visible output"))
    checks.append(("SKILL.md YAML frontmatter", bool(parse_frontmatter(SKILL_MD)), "Canonical metadata block"))
    fm = parse_frontmatter(SKILL_MD)
    checks.append(("SKILL.md name field", bool(fm.get("name")), "Skill identity"))
    checks.append(("SKILL.md description field", bool(fm.get("description")), "Activation statement"))
    return checks


def render_report(root: Path, checks: list[tuple[str, bool, str]], frontmatter: dict) -> None:
    template = REPORT_TEMPLATE.read_text(encoding="utf-8")
    status_lines = []
    for title, passed, note in checks:
        status = "PASS" if passed else "FAIL"
        status_lines.append(f"- **{status}** {title}: {note}")

    rendered = template.replace("{{name}}", frontmatter.get("name", "<missing>"))
    rendered = rendered.replace("{{description}}", frontmatter.get("description", "<missing>"))
    rendered = rendered.replace("{{date}}", date.today().isoformat())
    rendered = rendered.replace("{{validation_checks}}", "\n".join(status_lines))
    rendered = rendered.replace("{{summary}}", "This skill package is designed to map the hackathon submission into the rubric axes and produce a concrete evaluation report.")

    OUTPUT_REPORT.write_text(rendered, encoding="utf-8")


def main() -> int:
    checks = check_structure(ROOT)
    frontmatter = parse_frontmatter(SKILL_MD)
    passed = all(result for _, result, _ in checks)
    print("Skill package validation report")
    print("===============================\n")
    for title, result, note in checks:
        print(f"{title:40} {'PASS' if result else 'FAIL'}  - {note}")
    print()
    render_report(ROOT, checks, frontmatter)
    print(f"Generated {OUTPUT_REPORT.relative_to(ROOT)}")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
