# Contributing to API Faker

Thank you for your interest in contributing to API Faker! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 9 or higher

### Installation

```bash
# Clone your fork
git clone https://github.com/your-username/api-faker.git
cd api-faker

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test
```

## Development Workflow

### Project Structure

```
api-faker/
├── src/           # Source TypeScript files
│   ├── cli.ts     # CLI entry point
│   ├── server.ts  # Express server setup
│   ├── router.ts  # REST API routes
│   ├── database.ts # Database operations
│   └── ...
├── dist/          # Compiled JavaScript (generated)
├── bin/           # CLI executable
├── examples/      # Example configurations
└── test/          # Test files (colocated with source)
```

### Available Scripts

- `pnpm build` - Build the project
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Generate coverage report
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Fix linting issues
- `pnpm typecheck` - Check TypeScript types
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Testing

We use Vitest for testing. Tests are colocated with source files:

```
src/
├── database.ts
├── database.test.ts
├── router.ts
└── router.test.ts
```

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

```typescript
describe('Feature', () => {
  it('should do something specific', () => {
    // Arrange
    const input = createTestData();

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test database.test.ts
```

## Code Style

We follow strict TypeScript and ESLint rules:

### TypeScript Guidelines

- Use explicit type annotations for function parameters and return types
- Avoid `any` type - use `unknown` if type is truly unknown
- Use interfaces for object shapes and types for unions/aliases
- Enable strict mode in tsconfig.json

### Naming Conventions

- `camelCase` for variables and functions
- `PascalCase` for classes and types
- `UPPER_SNAKE_CASE` for constants
- `camelCase` for file names

### Code Quality

- Keep functions small and focused
- Write self-documenting code with meaningful names
- Add JSDoc comments for public APIs
- Follow DRY (Don't Repeat Yourself) principle
- Prefer composition over inheritance

## Commit Guidelines

We follow the Conventional Commits specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(router): add support for custom ID field
fix(database): handle concurrent writes correctly
docs(readme): update installation instructions
test(query): add tests for pagination edge cases
```

## Pull Request Process

1. **Create a branch**: Use a descriptive name

   ```bash
   git checkout -b feat/add-custom-routes
   ```

2. **Make your changes**: Follow code style guidelines

3. **Write tests**: Ensure tests pass and coverage is maintained

4. **Update documentation**: Update README, JSDoc comments, etc.

5. **Run checks locally**:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test:run
   pnpm build
   ```

6. **Commit your changes**: Follow commit guidelines

7. **Push to your fork**:

   ```bash
   git push origin feat/add-custom-routes
   ```

8. **Create a Pull Request**: Use the PR template

9. **Address review feedback**: Make requested changes

10. **Wait for approval**: Maintainers will review and merge

### PR Requirements

- [ ] All tests pass
- [ ] Code coverage maintained or improved
- [ ] TypeScript checks pass
- [ ] ESLint checks pass
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] PR description is clear and complete

## Reporting Bugs

Use the [Bug Report](https://github.com/hamidmayeli/api-faker/issues/new?template=bug_report.md) template to report bugs.

Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Configuration (api-faker.json or CLI commands)

## Suggesting Features

Use the [Feature Request](https://github.com/hamidmayeli/api-faker/issues/new?template=feature_request.md) template to suggest features.

Include:

- Clear description of the feature
- Problem it solves
- Proposed solution
- Use cases
- Examples

## Publishing (Maintainers Only)

### NPM Publishing

The package is published as `@hamid.mayeli/api-faker` (scoped package) to avoid naming conflicts.

To publish a new version:

1. Update version in `package.json`:
   ```bash
   pnpm version patch  # or minor, major
   ```

2. Push the tag to trigger release workflow:
   ```bash
   git push --follow-tags
   ```

3. The GitHub Action will:
   - Run all tests and checks
   - Create a GitHub release
   - Publish to npm (if `NPM_TOKEN` secret is configured)

### Setting up NPM_TOKEN

1. Create an npm access token at [npmjs.com](https://www.npmjs.com/settings/tokens)
2. Add it as a secret named `NPM_TOKEN` in GitHub repository settings
3. The release workflow will automatically publish to npm

## Questions?

If you have questions, feel free to:

- Open an issue with the `question` label
- Start a discussion on GitHub Discussions
- Check existing issues and discussions

## License

By contributing to API Faker, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
