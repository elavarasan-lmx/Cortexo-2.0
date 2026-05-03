# WinBull Style Guide

## Code Formatting
- **PHP:** PSR-12 standard, 4-space indentation
- **JavaScript:** 2-space indentation, single quotes, semicolons
- **SQL:** Uppercase keywords (`SELECT`, `FROM`, `WHERE`)
- **CSS:** BEM naming convention where possible

## Naming Conventions
- **PHP variables:** `$camelCase`
- **PHP classes:** `PascalCase`
- **Database tables:** `snake_case`
- **Database columns:** `snake_case`
- **JavaScript variables:** `camelCase`
- **JavaScript functions:** `camelCase`
- **CSS classes:** `kebab-case` or BEM (`block__element--modifier`)
- **Files:** `snake_case.php`, `camelCase.js`

## Git Commit Messages
Format: `[type]: brief description`

Types:
- `fix:` Bug fixes
- `feat:` New features
- `refactor:` Code restructuring
- `style:` Formatting changes
- `docs:` Documentation
- `chore:` Maintenance tasks
- `hotfix:` Critical production fixes

## API Response Format
```json
{
  "status": true/false,
  "message": "Human readable message",
  "data": {} or []
}
```

## Error Handling
- Always use try-catch in critical paths
- Log errors with context (user_id, trade_id, etc.)
- Never expose stack traces to end users
- Use appropriate HTTP status codes in API responses
