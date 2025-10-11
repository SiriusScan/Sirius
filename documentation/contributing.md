---
title: "Contributing to Sirius Scan"
description: "Developer guide for contributing to the Sirius Scan vulnerability scanning platform"
template: "TEMPLATE.guide"
version: "1.0.0"
last_updated: "2025-10-11"
author: "Sirius Development Team"
tags: ["contributing", "development", "guide", "setup"]
categories: ["development", "contribution"]
difficulty: "intermediate"
prerequisites:
  - "Git version control"
  - "Docker and Docker Compose"
  - "Go 1.21+ for backend development"
  - "Node.js 20+ for frontend development"
related_docs:
  - "README.development.md"
  - "README.container-testing.md"
  - "README.git-operations.md"
dependencies:
  - "docker"
  - "git"
  - "go"
  - "node"
llm_context: "high"
search_keywords: ["contributing", "development", "setup", "testing", "workflow"]
---

# Contributing to Sirius Scan

Welcome to the Sirius Scan development community! This guide will help you set up your development environment and contribute effectively to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Development Workflow](#development-workflow)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Code Standards](#code-standards)
- [Submitting Contributions](#submitting-contributions)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites for Development

Before you begin, ensure you have the following installed:

- **Git**: Version control system
- **Docker Engine**: 20.10.0+ with Docker Compose V2
- **Go**: 1.21+ for backend development
- **Node.js**: 20+ for frontend development
- **System Requirements**: 8GB RAM minimum, 20GB free disk space
- **Understanding of Docker**: Multi-stage builds and volume mounting

### Understanding the Architecture

Sirius uses a microservices architecture with the following key components:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **sirius-ui** | Next.js 14, React | Web frontend interface |
| **sirius-api** | Go, Gin framework | REST API backend |
| **sirius-engine** | Go, multiple services | Scanner, terminal, agent services |
| **sirius-postgres** | PostgreSQL 15 | Primary data storage |
| **sirius-rabbitmq** | RabbitMQ | Message queue |
| **sirius-valkey** | Redis-compatible | Cache layer |

## 🔧 Development Environment Setup

### Step 1: Clone the Main Repository

```bash
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
```

### Step 2: Clone Component Repositories (Optional)

Only clone the components you plan to develop:

```bash
# Create development directory structure
mkdir -p ../minor-projects && cd ../minor-projects

# Clone components you want to develop
git clone https://github.com/SiriusScan/go-api.git          # REST API backend
git clone https://github.com/SiriusScan/app-scanner.git    # Scanning engine
git clone https://github.com/SiriusScan/app-terminal.git   # Terminal service
git clone https://github.com/SiriusScan/app-agent.git      # Remote agents
git clone https://github.com/SiriusScan/sirius-nse.git     # NSE scripts
git clone https://github.com/SiriusScan/app-system-monitor.git  # System monitor
git clone https://github.com/SiriusScan/app-administrator.git   # Administrator service

cd ../Sirius
```

### Step 3: Configure Development Mode

Edit `docker-compose.dev.yaml` and uncomment volume mounts for components you're developing:

```yaml
services:
  sirius-engine:
    volumes:
      # Uncomment ONLY for repositories you have cloned:
      # - ../minor-projects/app-agent:/app-agent-src        # Agent development
      # - ../minor-projects/app-scanner:/app-scanner-src    # Scanner development
      # - ../minor-projects/app-terminal:/app-terminal-src  # Terminal development
      # - ../minor-projects/go-api:/go-api                  # API development
      # - ../minor-projects/app-system-monitor:/system-monitor  # Monitor development
      # - ../minor-projects/app-administrator:/app-administrator  # Admin development
```

### Step 4: Start Development Environment

```bash
# Development mode requires BOTH config files
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d --build

# Or for a clean start
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down -v
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

**⚠️ Important**: The `docker-compose.dev.yaml` file is an override file, not a standalone configuration. You must specify both the base configuration (`docker-compose.yaml`) and the development overrides (`docker-compose.dev.yaml`) when starting services in development mode.

### Development Features

- **🔥 Hot Reload**: Live code reloading with Air for Go services
- **📝 Live Editing**: Frontend changes reflect immediately
- **🐛 Debug Mode**: Detailed logging and error reporting
- **🔍 Development Tools**: Access to Go toolchain and debugging utilities

## 🔄 Development Workflow

### Daily Development Commands

```bash
# View real-time logs
docker compose logs -f sirius-engine

# Access development container
docker exec -it sirius-engine bash

# Check live reload status
docker exec sirius-engine ps aux | grep air

# Restart specific service
docker restart sirius-engine

# Rebuild with changes (development mode)
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d --build

# Stop development environment
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down

# Clean restart (removes volumes)
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down -v
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

### Working with Individual Components

#### Backend Development (Go)

```bash
# Access the container
docker exec -it sirius-engine bash

# Run tests
go test ./...

# Build manually
go build -o binary main.go

# Check dependencies
go mod tidy
```

#### Frontend Development (Next.js)

```bash
# Access the UI container
docker exec -it sirius-ui bash

# Install dependencies
npm install

# Run development server
npm run dev

# Build production
npm run build
```

## 🧪 Testing & Quality Assurance

### Running Tests

```bash
# Run comprehensive test suite
cd testing
make test-all

# Run specific test categories
make test-build          # Container build tests
make test-health         # Health check tests
make test-integration    # Integration tests

# Run documentation validation
make lint-docs           # Full documentation linting
make lint-docs-quick     # Quick documentation checks
make lint-index          # Index completeness check
```

### Manual Testing

```bash
# Test scanner functionality
docker exec sirius-engine nmap --version
docker exec sirius-engine nmap -p 80 127.0.0.1

# Test API endpoints
curl http://localhost:9001/health
curl http://localhost:9001/api/v1/system/health

# Test database connection
docker exec sirius-postgres pg_isready
docker exec sirius-postgres psql -U postgres -d sirius -c "SELECT version();"

# Test RabbitMQ
docker exec sirius-rabbitmq rabbitmqctl status
docker exec sirius-rabbitmq rabbitmqctl list_queues
```

### Pre-Commit Testing

Before committing code, always run:

```bash
# Run all validation checks
cd testing
make validate-all

# Or use the pre-commit hook (automatically runs on commit)
git commit -m "your commit message"
```

The pre-commit hook automatically runs:
- Documentation linting (quick validation)
- Index completeness check
- Build validation (smart testing based on branch)

## 📝 Code Standards

### Git Workflow

We follow a structured Git workflow as documented in [README.git-operations.md](dev/operations/README.git-operations.md).

#### Branch Naming

```
<type>/<description>

Examples:
feature/vulnerability-export
fix/scanner-timeout
docs/api-documentation
```

#### Commit Messages

```
<type>(<scope>): <description>

[optional body]

[optional footer]

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- test: Testing changes
- refactor: Code refactoring
- chore: Maintenance tasks
- hotfix: Emergency production fix

Examples:
feat(scanner): add support for custom NSE scripts
fix(api): resolve authentication token expiration
docs(architecture): update system design documentation
test(integration): add scanner workflow tests
```

#### GitHub Integration

When working with GitHub issues:

```bash
# Create issue first
gh issue create --title "Add vulnerability export feature" --body "Description"

# Create branch linked to issue
git checkout -b feature/77-vulnerability-export

# Commit with issue reference
git commit -m "feat(export): add PDF export functionality

Refs #77"

# Push and create PR
git push origin feature/77-vulnerability-export
gh pr create --fill
```

### Code Review Process

1. **Create feature branch** from main
2. **Implement changes** with tests
3. **Run validation** suite locally
4. **Push branch** to GitHub
5. **Create Pull Request** with description
6. **Wait for review** and approval
7. **Address feedback** if needed
8. **Merge to main** after approval

### Human Validation Required

**⚠️ Important**: Before merging to main, all changes must be:
1. **Tested locally** and verified working
2. **Reviewed by maintainer**
3. **Approved explicitly** before merge

This ensures we never push broken code to production.

## 🤝 Submitting Contributions

### Pull Request Guidelines

When submitting a PR, include:

1. **Clear description** of changes
2. **Issue reference** if applicable
3. **Testing evidence** (screenshots, logs)
4. **Documentation updates** if needed
5. **Breaking changes** clearly marked

### PR Template

```markdown
## Description
[Brief description of changes]

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Local testing completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots/Evidence
[If applicable]

## Additional Notes
[Any additional context]
```

## 👥 Community Guidelines

### Code of Conduct

- **Be respectful**: Treat all contributors with respect
- **Be collaborative**: Work together to solve problems
- **Be patient**: Remember everyone is learning
- **Be constructive**: Provide helpful feedback

### Getting Help

- **Discord Community**: Real-time chat and support
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Documentation**: Comprehensive guides and references

### Contributing Areas

We welcome contributions in:

- **Code**: New features, bug fixes, optimizations
- **Documentation**: Guides, tutorials, API docs
- **Testing**: Test cases, integration tests
- **Design**: UI/UX improvements
- **Community**: Support, tutorials, blog posts

## 📚 Additional Resources

### Essential Documentation

- [Development Workflow](dev/README.development.md) - Complete development guide
- [Container Testing](dev/test/README.container-testing.md) - Testing system
- [Git Operations](dev/operations/README.git-operations.md) - Git workflow
- [Architecture](dev/architecture/README.architecture.md) - System design

### Component Repositories

- [go-api](https://github.com/SiriusScan/go-api) - REST API backend
- [app-scanner](https://github.com/SiriusScan/app-scanner) - Scanning engine
- [app-terminal](https://github.com/SiriusScan/app-terminal) - Terminal service
- [app-agent](https://github.com/SiriusScan/app-agent) - Remote agents
- [sirius-nse](https://github.com/SiriusScan/sirius-nse) - NSE scripts
- [app-system-monitor](https://github.com/SiriusScan/app-system-monitor) - System monitor
- [app-administrator](https://github.com/SiriusScan/app-administrator) - Admin service

## 🎓 Learning Path

### For New Contributors

1. **Set up development environment** (this guide)
2. **Read architecture documentation**
3. **Run the test suite** to understand coverage
4. **Pick a "good first issue"** from GitHub
5. **Submit your first PR**

### For Regular Contributors

1. **Understand the codebase** deeply
2. **Review others' PRs** to learn
3. **Propose new features** via issues
4. **Help with documentation**
5. **Mentor new contributors**

## 📞 Contact & Support

- **GitHub Issues**: Bug reports and features
- **GitHub Discussions**: Questions and ideas
- **Discord**: Real-time community chat
- **Email**: support@publickey.io

---

Thank you for contributing to Sirius Scan! Your efforts help make security scanning accessible to everyone.

