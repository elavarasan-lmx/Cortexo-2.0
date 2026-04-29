# SKILL: Migration Planner (CI3 → CI4)
## Metadata
- **ID:** migration-ci3-to-ci4
- **Category:** migration
- **Risk Level:** High
- **Tags:** codeigniter, migration, php, deprecation
- **Version:** 1.0.0
- **Author:** Cortexo Team

## Description
Analyzes CodeIgniter 3 codebase and generates a comprehensive migration plan to CodeIgniter 4. Identifies breaking changes, deprecated APIs, and provides step-by-step migration guide.

## Trigger
- Manual: User selects "Migration Plan"

## Input
- CI3 project path or code sample
- Optional: target CI4 version

## Steps
1. **Scan** — Identify CI3-specific patterns ($this->input, $this->load, etc.)
2. **Map** — Map each CI3 API to CI4 equivalent
3. **Breaking Changes** — List all incompatible patterns
4. **Migration Steps** — Generate ordered migration checklist
5. **Effort Estimate** — Calculate hours based on file count + complexity

## Output Format
```markdown
## Migration Plan: CI3 → CI4
### Breaking Changes
### Step-by-Step Guide
### Code Examples
### Estimated Effort: X hours
```

## Risk Classification
- **Risk Level:** High
- **Side Effects:** May suggest file modifications
- **Requires Approval:** Yes (before any file changes)
