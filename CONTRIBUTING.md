# Contributing to ASD Healthcare Management Platform

First off, thank you for considering contributing to the ASD Healthcare Management Platform! It's people like you that make this project a great tool for the ASD community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to:
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code samples, API requests, etc.)
- **Describe the behavior you observed** and what you expected
- **Include screenshots** if applicable
- **Note your environment** (Node version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed functionality
- **Explain why this enhancement would be useful**
- **List any alternative solutions** you've considered

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Simpler issues for newcomers
- `help wanted` - Issues where we need community help

## 🔨 Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/ASD_Final_Project.git
cd ASD_Final_Project

# Add the original repository as upstream
git remote add upstream https://github.com/ORIGINAL-OWNER/ASD_Final_Project.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Install Husky hooks
npm run prepare

# Copy environment template
cp .env.example config.env

# Fill in your development credentials in config.env
```

### 3. Create a Branch

```bash
# Update your fork with the latest from upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/bug-description
```

### 4. Make Your Changes

- Write code following our [Coding Standards](#coding-standards)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass
- Run linters and formatters

### 5. Test Your Changes

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format

# Run tests (when available)
npm test
```

### 6. Commit Your Changes

Follow our [Commit Message Guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add amazing new feature"
```

### 7. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Then create a pull request on GitHub
```

## 💻 Coding Standards

### JavaScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications. Our ESLint configuration enforces these rules.

**Key Points:**
- Use 2 spaces for indentation
- Use double quotes for strings
- Use semicolons
- Use camelCase for variables and functions
- Use PascalCase for classes
- Add JSDoc comments for functions

**Example:**

```javascript
/**
 * Calculate user age from birth date
 * @param {Date} birthDate - User's birth date
 * @returns {number} - User age in years
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age;
};
```

### File Structure

```
src/
├── config/       # Configuration files
├── middleware/   # Express middleware
├── models/       # Mongoose models
├── routes/       # Express routes
├── services/     # Business logic
└── utils/        # Utility functions
```

### Naming Conventions

- **Files**: camelCase (e.g., `userService.js`)
- **Directories**: lowercase (e.g., `middleware/`)
- **Models**: PascalCase (e.g., `ParentModel`)
- **Routes**: camelCase with "Routes" suffix (e.g., `userRoutes.js`)
- **Services**: camelCase with "Services" suffix (e.g., `authServices.js`)

### Code Quality

- **ESLint**: Code must pass ESLint checks
- **Prettier**: Code must be formatted with Prettier
- **No console.error in production**: Use proper logging
- **Handle errors**: Always handle promise rejections
- **Validate inputs**: Use express-validator for API inputs

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes
- **ci**: CI/CD configuration changes
- **security**: Security improvements

### Examples

```bash
# Feature
feat(auth): add password reset functionality

# Bug fix
fix(api): resolve null pointer exception in user service

# Documentation
docs: update API endpoints in README

# Refactoring
refactor(models): simplify user model schema

# Breaking change
feat(api): change authentication response format

BREAKING CHANGE: API now returns user object instead of just token
```

### Scope

The scope should be the name of the affected module:
- `auth`
- `api`
- `models`
- `services`
- `routes`
- `config`

### Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period (.) at the end
- Limit to 72 characters

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if you changed APIs
2. **Add tests** for new functionality
3. **Run all checks**:
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```
4. **Update CHANGELOG.md** if applicable
5. **Rebase on latest main**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### PR Title

Follow the same format as commit messages:
```
feat(auth): add OAuth2 authentication
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How has this been tested?

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be in the next release!

## 🏗 Project Structure

```
ASD_Final_Project/
├── .github/
│   └── workflows/        # CI/CD workflows
├── .husky/               # Git hooks
├── config/               # App configuration
├── middleware/           # Express middleware
├── models/               # Mongoose schemas
│   └── ai/               # AI-related models
├── routes/               # API routes
│   └── ai/               # AI endpoints
├── services/             # Business logic
│   └── aiServices/       # AI services
├── utils/                # Utilities
│   └── validator/        # Input validators
├── .editorconfig         # Editor configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── docker-compose.yml    # Docker Compose config
├── Dockerfile            # Docker configuration
└── index.js              # Application entry point
```

## 🙏 Thank You!

Your contributions make this project better for the entire ASD community. We appreciate your time and effort!

---

**Questions?** Feel free to open an issue or reach out to the maintainers.
