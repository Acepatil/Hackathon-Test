# Second Workflow Walkthrough

## Reuse case: Catalog QA readiness checker

The same skill package can be applied to a second internal workflow:

1. A product catalog manager needs to ensure a new marketplace data ingestion pipeline is ready for evaluation.
2. They run `python3 scripts/validate_skill_pack.py` to verify the package contains the required metadata, scripts, and assets.
3. The generated `assets/skill_submission_report.md` is shared with judges or reviewers as a concrete artifact.

## Why this is portable

- The script does not depend on seller or buyer code paths.
- It validates packaging quality rather than domain-specific business logic.
- The same structure works for any hackathon skill artifact that needs a clean submission checklist.
