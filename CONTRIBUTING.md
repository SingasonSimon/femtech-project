# Contributing to FemTech

First off, thank you for considering contributing to FemTech! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by respect, empathy, and inclusivity. By participating, you are expected to uphold this standard. Please report unacceptable behavior to singason65@gmail.com.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/femtech-project.git
   cd femtech-project
   ```
3. **Set up the development environment** as described in the main README
4. **Create a new branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues. When you create a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs. actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)
- **Error messages or logs**

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a **clear and descriptive title**
- Provide **detailed description** of the proposed feature
- Explain **why this enhancement would be useful**
- Include **mockups or examples** if possible

### Your First Code Contribution 🚀

Unsure where to begin? Look for issues labeled:
- `good first issue` - Easy issues perfect for beginners
- `help wanted` - Issues that need attention

### Pull Requests 📥

- Follow the [development workflow](#development-workflow)
- Follow the [style guidelines](#style-guidelines)
- Update documentation for any changed functionality
- Add tests for new features
- Ensure all tests pass

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**:
   - Write clean, maintainable code
   - Add comments for complex logic
   - Follow the style guidelines below

3. **Test your changes**:
   ```bash
   # Frontend
   cd client && npm run dev
   
   # Backend
   cd server && npm run dev
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request** on GitHub

## Style Guidelines

### JavaScript/React

- Use **ES6+ features** (const/let, arrow functions, destructuring)
- Use **functional components** with hooks
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions
- Keep functions **small and focused**
- Use **async/await** instead of promises when possible

#### Example:

```javascript
/**
 * Fetches user profile data from the API
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object>} User profile data
 */
const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};
```

### CSS/Tailwind

- Use **Tailwind utility classes** when possible
- Follow **mobile-first** responsive design
- Use **semantic class names** for custom CSS
- Group related utilities together
- Use **dark mode variants** for all custom styles

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Utilities**: camelCase (e.g., `apiHelpers.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

### Code Organization

```
Component structure:
1. Imports
2. Component definition
3. State/hooks
4. Helper functions
5. Event handlers
6. JSX return
7. PropTypes (if using)
8. Export
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add password reset functionality

fix(tracker): correct cycle calculation logic

docs(readme): update installation instructions

refactor(api): improve error handling
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update the README** if necessary
5. **Link related issues** in the PR description
6. **Request review** from maintainers

### PR Title Format

Follow the same format as commits:
```
feat: Add amazing feature
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
How to test the changes

## Screenshots
image.png

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## Questions?

Feel free to:
- Open an issue for discussion
- Email: singason65@gmail.com
- Join our community forum

---

Thank you for contributing to FemTech! 💜

