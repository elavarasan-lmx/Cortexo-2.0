# SKILL: PHP Code Review
## Metadata
- **ID:** code-review-php
- **Category:** code_review
- **Risk Level:** Low
- **Tags:** php, psr-12, clean-code, security
- **Version:** 1.0.0
- **Author:** Cortexo Team

## Description
Performs a comprehensive PHP code review following PSR-12 standards, Uncle Bob's Clean Code principles, and OWASP security guidelines.

## Trigger
- Manual: User selects "Code Review" from agent runner
- Automatic: On new PR opened (if auto-review enabled)

## Input
- PHP source code (file or paste)
- Optional: project context, coding standards override

## Steps
1. **Parse** — Tokenize PHP code, identify classes, functions, variables
2. **PSR-12 Check** — Verify naming conventions, spacing, brackets
3. **Clean Code Audit** — Check function length (<20 lines), parameter count (<3), magic numbers
4. **Security Scan** — Detect SQL injection, XSS, CSRF, path traversal
5. **Performance** — Identify N+1 queries, unnecessary loops, memory leaks
6. **Report** — Generate structured review with severity ratings

## Output Format
```markdown
## Code Review Report
### 🔴 Security Issues (Critical/High/Medium)
### 🟡 Code Quality Issues
### 🟢 Positive Observations
### Score: X/100
```

## Risk Classification
- **Risk Level:** Low
- **Side Effects:** None (read-only analysis)
- **Requires Approval:** No
