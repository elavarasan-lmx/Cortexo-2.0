# SKILL: Security Scanner
## Metadata
- **ID:** security-scan
- **Category:** security
- **Risk Level:** Low
- **Tags:** owasp, cwe, sql-injection, xss, csrf
- **Version:** 1.0.0
- **Author:** Cortexo Team

## Description
Static analysis security scan mapping findings to OWASP Top 10 and CWE IDs. Covers SQL injection, XSS, CSRF, path traversal, command injection, and insecure deserialization.

## Trigger
- Manual: User selects "Security Scan" from agent runner
- Pipeline: Runs as a stage in CI/CD pipeline

## Input
- Source code (PHP, JavaScript, or any supported language)
- Optional: specific files to scan, severity threshold

## Steps
1. **Tokenize** — Parse source files into AST
2. **Pattern Match** — Check against known vulnerability patterns
3. **Data Flow** — Trace user input through code paths
4. **CWE Map** — Map each finding to CWE ID
5. **OWASP Map** — Categorize by OWASP Top 10
6. **Report** — Generate findings table with severity + remediation

## Output Format
```markdown
## Security Scan Report
| ID | Issue | CWE | OWASP | Severity | Line |
| Remediation steps for each finding |
```

## Risk Classification
- **Risk Level:** Low
- **Side Effects:** None (read-only analysis)
- **Requires Approval:** No
