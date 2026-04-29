# SKILL: TDD Red-Green-Refactor
## Metadata
- **ID:** tdd-cycle
- **Category:** testing
- **Risk Level:** Medium
- **Tags:** tdd, phpunit, testing, red-green-refactor
- **Version:** 1.0.0
- **Author:** Cortexo Team

## Description
Implements the TDD cycle: write failing tests (Red), implement minimal code (Green), refactor for quality (Refactor). Generates PHPUnit test files.

## Trigger
- Manual: User provides feature description

## Input
- Feature description (natural language)
- Optional: existing code context, test framework preference

## Steps
1. **Red** — Write failing test cases based on feature description
2. **Green** — Write minimal code to make tests pass
3. **Refactor** — Clean up code, extract methods, improve naming
4. **Verify** — Confirm all tests still pass after refactor

## Output Format
```markdown
## TDD Cycle
### 🔴 Red Phase — Failing Tests
### 🟢 Green Phase — Minimal Code
### 🔵 Refactor Phase — Clean Code
```

## Risk Classification
- **Risk Level:** Medium
- **Side Effects:** Generates new test files (write operation)
- **Requires Approval:** Yes (before writing files)
