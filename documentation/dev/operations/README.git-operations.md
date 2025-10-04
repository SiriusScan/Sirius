---
title: "Git Operations"
description: "Simple, practical git workflow for Sirius project development"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["git", "workflow", "development", "version-control"]
categories: ["operations", "development"]
difficulty: "beginner"
prerequisites: ["git", "docker", "testing"]
related_docs:
  - "README.development.md"
  - "README.container-testing.md"
dependencies: []
llm_context: "high"
search_keywords: ["git", "commit", "branch", "merge", "workflow", "pre-commit"]
---

# Git Operations

## Purpose

This document outlines the simple, practical git workflow used in the Sirius project. It focuses on the actual processes we use rather than theoretical best practices, making it easy for developers to understand when and how to perform git operations.

## When to Use

- **Before making any commits** - Understand pre-commit requirements
- **When starting new work** - Know whether to branch or commit directly
- **When finishing work** - Understand merge and commit strategies
- **For team coordination** - Ensure consistent git practices across the team

## How to Use

1. **Check your current situation** - Are you on main or a feature branch?
2. **Follow the appropriate workflow** - Direct commits vs. branching workflow
3. **Run pre-commit checks** - Always validate before committing
4. **Use the right commit strategy** - Direct commit vs. merge based on your situation

## What This Workflow Is

### Core Philosophy

Our git workflow is **pragmatic and simple**:

- **Direct commits to main** when working on small, isolated changes
- **Feature branches** when working on larger, multi-commit features
- **Pre-commit validation** to ensure code quality before any commit
- **No complex branching strategies** - just main and feature branches

### Workflow Decision Tree

```
Are you working on a new feature?
├── YES → Create feature branch → Work → Merge to main
└── NO → Are you on main branch?
    ├── YES → Commit directly to main
    └── NO → Continue on current branch
```

## Pre-Commit Requirements

### What You Must Do Before Every Commit

Before committing any code, you **must** run these checks:

```bash
# 1. Run container tests
cd testing/container-testing
make test-all

# 2. Validate documentation
make lint-docs
make lint-index

# 3. Check container health
docker compose ps
```

### Why These Checks Matter

- **Container tests** ensure your changes don't break the application
- **Documentation validation** keeps our docs consistent and complete
- **Container health** verifies all services are running properly

### Quick Pre-Commit Script

You can run all checks at once:

```bash
# From project root
cd testing/container-testing
make validate-all
```

## Branching Strategy

### When to Create a Branch

Create a feature branch when:

- **Working on a new feature** that will take multiple commits
- **Making significant changes** that might break existing functionality
- **Experimenting** with new approaches or technologies
- **Working on something** that others might need to review

### When to Commit Directly to Main

Commit directly to main when:

- **Making small fixes** (typos, minor bugs, documentation updates)
- **You're already on main** and the change is simple
- **The change is isolated** and won't affect other functionality
- **You're confident** the change won't break anything

### Branch Naming

Use simple, descriptive names:

```bash
# Good examples
feature/user-authentication
fix/docker-build-issue
docs/update-readme
experiment/new-scanner

# Bad examples
branch1
test
work
my-changes
```

## Commit Workflow

### Direct Commits to Main

When working directly on main:

```bash
# 1. Check you're on main
git branch

# 2. Run pre-commit checks
cd testing/container-testing
make validate-all

# 3. Stage your changes
git add .

# 4. Commit with clear message
git commit -m "fix: resolve docker build issue"

# 5. Push to main
git push origin main
```

### Feature Branch Workflow

When working on a feature branch:

```bash
# 1. Create and switch to feature branch
git checkout -b feature/new-feature

# 2. Make your changes and commit
git add .
git commit -m "feat: add new feature functionality"

# 3. Push branch to remote
git push origin feature/new-feature

# 4. When ready, merge to main
git checkout main
git merge feature/new-feature

# 5. Push updated main
git push origin main

# 6. Clean up feature branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

## Commit Message Standards

### Format

```
<type>: <description>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Testing changes
- **refactor**: Code refactoring
- **chore**: Maintenance tasks

### Examples

```
feat: add user authentication system
fix: resolve container startup issue
docs: update docker setup guide
test: add integration tests for API
refactor: simplify database connection logic
chore: update dependencies
```

## Merge Strategy

### When to Merge

Merge feature branches when:

- **Feature is complete** and tested
- **All pre-commit checks pass**
- **Code has been reviewed** (if required)
- **No conflicts** with main branch

### How to Merge

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Merge feature branch
git merge feature/your-feature

# 4. Push merged changes
git push origin main

# 5. Delete feature branch
git branch -d feature/your-feature
```

### Merge Conflicts

If you encounter merge conflicts:

```bash
# 1. Check which files have conflicts
git status

# 2. Edit conflicted files to resolve conflicts
# Look for <<<<<<< HEAD markers

# 3. Stage resolved files
git add resolved-file.txt

# 4. Complete the merge
git commit
```

## Pull Requests (Optional)

### When to Use Pull Requests

Use pull requests when:

- **Working with a team** and want code review
- **Making significant changes** that others should review
- **Want to document** the changes before merging
- **Working on a shared feature** with other developers

### When NOT to Use Pull Requests

Skip pull requests when:

- **Working solo** on the project
- **Making small, obvious changes**
- **You're confident** in your changes
- **Time is critical** and changes are simple

## Common Scenarios

### Scenario 1: Quick Bug Fix

```bash
# You're on main, need to fix a small bug
git status
# Run pre-commit checks
cd testing/container-testing && make validate-all
git add .
git commit -m "fix: resolve typo in error message"
git push origin main
```

### Scenario 2: New Feature Development

```bash
# Create feature branch
git checkout -b feature/user-dashboard
# Make changes, commit multiple times
git add . && git commit -m "feat: add user dashboard layout"
git add . && git commit -m "feat: add user data fetching"
# When complete, merge to main
git checkout main
git merge feature/user-dashboard
git push origin main
git branch -d feature/user-dashboard
```

### Scenario 3: Documentation Update

```bash
# You're on main, updating docs
git status
# Run pre-commit checks
cd testing/container-testing && make validate-all
git add .
git commit -m "docs: update docker setup instructions"
git push origin main
```

## Troubleshooting

### Common Issues

#### Pre-commit Checks Fail

```bash
# Check what failed
cd testing/container-testing
make test-all

# Fix the issues, then retry
# Common fixes:
# - Fix failing tests
# - Update documentation
# - Restart containers: docker compose restart
```

#### Merge Conflicts

```bash
# See what files have conflicts
git status

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving, stage and commit
git add .
git commit
```

#### Wrong Branch

```bash
# If you committed to wrong branch
git log --oneline -1  # See last commit
git reset HEAD~1      # Undo last commit (keeps changes)
git checkout correct-branch
git add .
git commit -m "your message"
```

#### Forgot to Run Pre-commit Checks

```bash
# If you already committed without checks
git reset HEAD~1      # Undo commit
# Run pre-commit checks
cd testing/container-testing && make validate-all
# Re-commit
git add .
git commit -m "your message"
```

## Best Practices

### Do This

- **Always run pre-commit checks** before committing
- **Use clear, descriptive commit messages**
- **Keep commits focused** on a single change
- **Test your changes** before committing
- **Update documentation** when making structural changes

### Don't Do This

- **Don't commit broken code** - fix it first
- **Don't skip pre-commit checks** - they catch issues
- **Don't use vague commit messages** like "fix stuff"
- **Don't commit large, unrelated changes** in one commit
- **Don't force push to main** unless absolutely necessary

## Quick Reference

### Daily Workflow

```bash
# Check current status
git status
git branch

# Run pre-commit checks
cd testing/container-testing
make validate-all

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "type: description"
git push origin main
```

### Feature Development

```bash
# Start feature
git checkout -b feature/name
# ... work on feature ...
git add . && git commit -m "feat: description"

# Finish feature
git checkout main
git merge feature/name
git push origin main
git branch -d feature/name
```

### Emergency Fixes

```bash
# Quick fix on main
git status
cd testing/container-testing && make validate-all
git add .
git commit -m "fix: emergency description"
git push origin main
```

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
