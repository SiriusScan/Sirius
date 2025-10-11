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

## GitHub Issue Integration

### When to Create Issues

Create a GitHub issue when:

- **Discovering bugs** that need tracking and documentation
- **Planning new features** that require design discussion
- **Making significant changes** that affect multiple components
- **Working on complex fixes** that need implementation planning
- **Documenting work** for future reference and team visibility

### When to Skip Issues

Skip GitHub issues when:

- **Making trivial fixes** (typos, minor documentation updates)
- **Making emergency hotfixes** that need immediate deployment
- **Working on local experiments** that may not be merged
- **Making simple, obvious changes** with no discussion needed

### Issue Creation Process

```bash
# 1. Identify the problem or feature
# 2. Go to GitHub repository
# 3. Click "Issues" → "New Issue"
# 4. Use descriptive title format:
#    - Bug: "Fix: [component] brief description"
#    - Feature: "Feature: [component] brief description"
#    - Enhancement: "Enhancement: [component] brief description"

# 5. Document in the issue:
#    - Problem statement or feature description
#    - Current behavior (for bugs)
#    - Expected behavior (for bugs) or desired outcome (for features)
#    - Implementation plan (if known)
#    - Testing strategy
#    - Affected components
```

### Issue Template

```markdown
## Problem Statement

Brief description of the issue or feature need

## Current Behavior

What happens now (for bugs)

## Expected Behavior

What should happen (for bugs) or what we want to build (for features)

## Implementation Plan

- [ ] Step 1: Description
- [ ] Step 2: Description
- [ ] Step 3: Description

## Testing Strategy

How to verify the fix works

## Affected Components

- Component 1
- Component 2

## Additional Context

Any relevant information, logs, screenshots, etc.
```

### Linking Branches to Issues

Use issue numbers in branch names:

```bash
# Format: <type>/<issue-number>-<brief-description>
git checkout -b fix/123-container-startup-issue
git checkout -b feature/456-user-authentication
git checkout -b docs/789-update-readme
```

### Documenting Implementation Plans in Issues

After creating an issue, add the implementation plan as a comment:

```markdown
## Implementation Plan

### Phase 1: Diagnosis

- [x] Identified root cause in Dockerfiles
- [x] Documented current vs expected behavior
- [x] Created step-by-step fix plan

### Phase 2: Implementation

- [ ] Update sirius-api Dockerfile
- [ ] Update sirius-engine Dockerfile
- [ ] Update sirius-ui Dockerfile
- [ ] Update startup scripts

### Phase 3: Testing

- [ ] Test production mode builds
- [ ] Test development mode builds
- [ ] Verify all services start correctly
- [ ] Check process monitoring

### Phase 4: Deployment

- [ ] Merge to main branch
- [ ] Verify production deployment
- [ ] Close issue with results
```

## Branching Strategy

### When to Create a Branch

Create a feature branch when:

- **Working on a GitHub issue** that requires tracked changes
- **Working on a new feature** that will take multiple commits
- **Making significant changes** that might break existing functionality
- **Experimenting** with new approaches or technologies
- **Working on something** that others might need to review

### When to Commit Directly to Main

Commit directly to main when:

- **Making small fixes** (typos, minor bugs, documentation updates)
- **No GitHub issue exists** and the change is trivial
- **You're already on main** and the change is simple
- **The change is isolated** and won't affect other functionality
- **You're confident** the change won't break anything

### Branch Naming

Use simple, descriptive names:

```bash
# Without issue number (simple changes)
feature/user-authentication
fix/docker-build-issue
docs/update-readme
experiment/new-scanner

# With issue number (tracked work)
fix/123-docker-build-issue
feature/456-user-authentication
docs/789-update-readme

# Bad examples
branch1
test
work
my-changes
```

## Complete GitHub Workflow

### Full Issue → Branch → Commit → Merge Cycle

This is the recommended workflow for all significant changes:

```bash
# 1. CREATE GITHUB ISSUE
# - Go to GitHub repository
# - Create new issue with problem/feature description
# - Document implementation plan in issue comments
# - Note issue number (e.g., #123)

# 2. CREATE FEATURE BRANCH
git checkout main
git pull origin main
git checkout -b fix/123-brief-description

# 3. IMPLEMENT CHANGES
# - Make your code changes
# - Update documentation as needed
# - Follow implementation plan from issue

# 4. RUN PRE-COMMIT CHECKS
cd testing/container-testing
make validate-all

# 5. COMMIT CHANGES
git add .
git commit -m "fix: brief description

- Detailed change 1
- Detailed change 2
- Closes #123"

# 6. PUSH BRANCH
git push origin fix/123-brief-description

# 7. TEST ON BRANCH
# Verify changes work as expected
# Run all relevant tests

# 8. MERGE TO MAIN
git checkout main
git pull origin main
git merge fix/123-brief-description

# 9. PUSH TO MAIN
git push origin main

# 10. UPDATE GITHUB ISSUE
# - Add comment with test results
# - Confirm deployment successful
# - Close issue (or let "Closes #123" in commit do it)

# 11. CLEANUP BRANCH
git branch -d fix/123-brief-description
git push origin --delete fix/123-brief-description
```

### Workflow Decision Matrix

| Situation                             | Create Issue? | Create Branch? | Workflow              |
| ------------------------------------- | ------------- | -------------- | --------------------- |
| **Bug affecting multiple components** | ✅ Yes        | ✅ Yes         | Full GitHub workflow  |
| **New feature development**           | ✅ Yes        | ✅ Yes         | Full GitHub workflow  |
| **Complex fix requiring planning**    | ✅ Yes        | ✅ Yes         | Full GitHub workflow  |
| **Documentation updates (major)**     | ✅ Yes        | ✅ Yes         | Full GitHub workflow  |
| **Small bug fix**                     | ⚠️ Optional   | ⚠️ Optional    | Simplified workflow   |
| **Typo fix**                          | ❌ No         | ❌ No          | Direct commit to main |
| **Emergency hotfix**                  | ⚠️ Optional   | ✅ Yes         | Fast-track workflow   |

### Simplified Workflow (Small Changes)

For minor fixes that don't need full issue tracking:

```bash
# 1. Create branch (optional but recommended)
git checkout -b fix/small-bug-description

# 2. Make changes
# ... edit files ...

# 3. Run pre-commit checks
cd testing/container-testing && make validate-all

# 4. Commit and push
git add .
git commit -m "fix: small bug description"
git push origin fix/small-bug-description

# 5. Merge to main
git checkout main
git merge fix/small-bug-description
git push origin main

# 6. Cleanup
git branch -d fix/small-bug-description
```

### Fast-Track Workflow (Emergency Fixes)

For critical issues requiring immediate deployment:

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue

# 2. Make minimal fix
# ... fix the critical issue ...

# 3. Quick validation
cd testing/container-testing && make test-health

# 4. Commit and merge immediately
git add .
git commit -m "hotfix: critical issue description"
git checkout main
git merge hotfix/critical-issue
git push origin main

# 5. Create retroactive issue
# Document what happened and why
# Track follow-up work if needed
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

[optional body with details]

[optional footer with issue references]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Testing changes
- **refactor**: Code refactoring
- **chore**: Maintenance tasks
- **hotfix**: Emergency critical fix

### Referencing Issues in Commits

Use issue references to link commits to GitHub issues:

```bash
# Close an issue automatically
git commit -m "fix: resolve container startup issue

- Fixed system-monitor binary paths
- Added app-administrator to production builds
- Updated startup scripts for both dev and prod

Closes #123"

# Reference without closing
git commit -m "feat: add user authentication

Related to #456"

# Reference multiple issues
git commit -m "fix: update Docker configurations

Fixes #123, fixes #124, related to #125"
```

### Closing Keywords

These keywords automatically close issues when commit is merged to main:

- `Closes #123`
- `Fixes #123`
- `Resolves #123`
- `Close #123`
- `Fix #123`
- `Resolve #123`

### Examples

**Simple fix with issue:**

```
fix: resolve container startup issue

Closes #123
```

**Detailed fix with issue:**

```
fix: resolve system-monitor and app-administrator startup failures

Changes:
- Updated sirius-api Dockerfile to fix binary paths
- Added app-administrator build steps to all containers
- Fixed dev mode startup scripts to use go run for source
- Updated production mode to use compiled binaries

Testing:
- Verified production mode starts both services
- Verified development mode starts both services
- Confirmed process monitoring works correctly

Closes #123
```

**Feature without issue:**

```
feat: add user authentication system

- Implemented JWT-based authentication
- Added login/logout endpoints
- Created authentication middleware
```

**Documentation update:**

```
docs: update git workflow with GitHub issue integration

- Added issue creation guidelines
- Documented full workflow cycle
- Added examples for different scenarios
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

### Scenario 1: Quick Bug Fix (No Issue)

```bash
# You're on main, need to fix a small bug
git status
# Run pre-commit checks
cd testing/container-testing && make validate-all
git add .
git commit -m "fix: resolve typo in error message"
git push origin main
```

### Scenario 2: Complex Bug Fix (With GitHub Issue)

```bash
# 1. Create GitHub issue #123: "Fix: Container startup failures"
# 2. Document diagnosis and implementation plan in issue

# 3. Create feature branch
git checkout -b fix/123-container-startup-failures

# 4. Implement fixes
# ... make changes ...

# 5. Test changes
cd testing/container-testing && make validate-all

# 6. Commit with issue reference
git add .
git commit -m "fix: resolve system-monitor and app-administrator startup failures

Changes:
- Updated Dockerfiles to build both services
- Fixed binary paths in startup scripts
- Added development mode support

Testing:
- Verified production mode startup
- Verified development mode startup
- Confirmed process monitoring

Closes #123"

# 7. Push and merge
git push origin fix/123-container-startup-failures
git checkout main
git merge fix/123-container-startup-failures
git push origin main

# 8. Cleanup
git branch -d fix/123-container-startup-failures
git push origin --delete fix/123-container-startup-failures

# 9. Verify issue closed automatically on GitHub
```

### Scenario 3: New Feature Development (With GitHub Issue)

```bash
# 1. Create GitHub issue #456: "Feature: User dashboard"
# 2. Document requirements and design in issue

# 3. Create feature branch
git checkout -b feature/456-user-dashboard

# 4. Develop feature with multiple commits
git add . && git commit -m "feat: add user dashboard layout"
git add . && git commit -m "feat: add user data fetching"
git add . && git commit -m "feat: add dashboard interactivity

Closes #456"

# 5. Push and merge
git push origin feature/456-user-dashboard
git checkout main
git merge feature/456-user-dashboard
git push origin main

# 6. Cleanup
git branch -d feature/456-user-dashboard
```

### Scenario 4: Documentation Update (No Issue)

```bash
# You're on main, updating docs
git status
# Run pre-commit checks
cd testing/container-testing && make validate-all
git add .
git commit -m "docs: update docker setup instructions"
git push origin main
```

### Scenario 5: Emergency Hotfix (With Retroactive Issue)

```bash
# 1. Critical production issue discovered
# 2. Create hotfix branch immediately
git checkout -b hotfix/critical-security-patch

# 3. Make minimal fix
# ... fix critical issue ...

# 4. Quick test
cd testing/container-testing && make test-health

# 5. Merge immediately
git add .
git commit -m "hotfix: patch critical security vulnerability"
git checkout main
git merge hotfix/critical-security-patch
git push origin main

# 6. Create retroactive GitHub issue
# - Document what happened
# - Explain the fix
# - Plan follow-up work
# - Reference the hotfix commit
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
