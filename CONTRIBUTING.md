# Contributing to CodexOS

Thank you for your interest in contributing to CodexOS! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/codexos.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** your changes: `./test-system.sh`
6. **Commit** with conventional commits: `git commit -m "feat: add amazing feature"`
7. **Push** to your branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

## 📋 Development Setup

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 20+
- pnpm

### Local Development
```bash
# Clone and setup
git clone https://github.com/mchawda/codexos.git
cd codexos
./setup.sh

# Start services
docker compose up -d

# Run tests
./test-system.sh
```

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend
pytest
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd apps/web
pnpm test
pnpm test:coverage
pnpm test:e2e
```

### Load Testing
```bash
cd apps/backend
locust -f tests/load/locustfile.py
```

## 📝 Code Style

### Python (Backend)
- Use **Black** for formatting: `black .`
- Use **Ruff** for linting: `ruff check .`
- Use **MyPy** for type checking: `mypy .`
- Follow **PEP 8** guidelines

### TypeScript/JavaScript (Frontend)
- Use **ESLint** for linting: `pnpm lint`
- Use **Prettier** for formatting (configured in ESLint)
- Follow **TypeScript** best practices

### Git Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## 🔒 Security

- **Never** commit API keys or secrets
- **Always** use environment variables for sensitive data
- **Report** security issues to security@codexos.dev
- **Follow** the [Security Policy](SECURITY.md)

## 📚 Documentation

- Update relevant documentation when adding features
- Include code examples and API documentation
- Use clear, concise language
- Follow the existing documentation style

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Python/Node versions, Docker version
2. **Steps**: Clear reproduction steps
3. **Expected**: What should happen
4. **Actual**: What actually happened
5. **Logs**: Relevant error messages and logs
6. **Screenshots**: If applicable

## 💡 Feature Requests

When requesting features, please:

1. **Describe** the feature clearly
2. **Explain** the use case and benefits
3. **Consider** implementation complexity
4. **Check** if similar features exist

## 🤝 Pull Request Guidelines

### Before Submitting
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No sensitive data is included
- [ ] Commit messages follow conventions

### PR Description
- **Summary**: Brief description of changes
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How to test the changes
- **Breaking Changes**: If any, explain migration
- **Related Issues**: Link to related issues

## 🏷️ Release Process

1. **Version** bump in relevant files
2. **Changelog** update
3. **Tag** release with semantic versioning
4. **Deploy** to staging/production
5. **Announce** release

## 📞 Getting Help

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Email security@codexos.dev for security issues

## 📄 License

By contributing to CodexOS, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to CodexOS! 🎉
