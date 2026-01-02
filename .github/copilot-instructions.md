# GitHub Copilot Instructions for API Faker

## Code Quality Standards

### General Principles

- Write clean, self-documenting code with meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Follow DRY (Don't Repeat Yourself) principle
- Prefer composition over inheritance
- Use pure functions where possible to improve testability
- Code should be SOLID compliant

### Code Style

- Use consistent naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants
  - `camelCase` for file names
- Use 2 spaces for indentation
- Add semicolons at the end of statements
- Use single quotes for strings (except when avoiding escaping)
- Maximum line length: 120 characters
- Add trailing commas in multi-line objects and arrays

### TypeScript Best Practices

- Always add explicit type annotations for function parameters and return types
- Use interfaces for object shapes and types for unions/aliases
- Avoid `any` type - use `unknown` if type is truly unknown
- Leverage TypeScript utility types (Partial, Pick, Omit, etc.)
- Use strict mode in tsconfig.json

### Documentation

- Add JSDoc comments for all exported functions, classes, and interfaces
- Include:
  - Brief description of purpose
  - `@param` for each parameter with type and description
  - `@returns` with type and description
  - `@example` with usage examples
  - `@throws` for possible errors
- Keep inline comments minimal and only for complex logic

### Error Handling

- Use typed errors with meaningful error messages
- Validate input parameters early in functions
- Throw errors for exceptional cases, return error objects for expected failures
- Document all possible errors in function documentation

### Testing

- Write unit tests for all public APIs
- Aim for high test coverage (>80%)
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert pattern
- Mock external dependencies

### Performance

- Avoid premature optimization
- Use appropriate data structures (Map/Set vs Object/Array)
- Be mindful of memory leaks (event listeners, timers)
- Consider lazy loading for heavy operations

### Dependencies

- Minimize external dependencies
- Keep dependencies up to date
- Use exact versions for production dependencies
- Document why each dependency is needed

### Git Commits

- Write clear, descriptive commit messages
- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

### Security

- Never commit sensitive data (API keys, secrets)
- Validate and sanitize all external input
- Use security best practices for npm packages

## Project-Specific Guidelines

- Prioritize API consistency and predictability
- Design intuitive and developer-friendly interfaces
- Provide sensible defaults while allowing customization
- Include comprehensive examples in documentation
- Consider backward compatibility for breaking changes

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All functions are documented
- [ ] Tests are included and passing
- [ ] No unnecessary dependencies added
- [ ] Error handling is comprehensive
- [ ] Performance implications considered
- [ ] Security vulnerabilities addressed
