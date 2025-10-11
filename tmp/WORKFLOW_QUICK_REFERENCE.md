# GitHub Workflow Quick Reference

## When to Create a GitHub Issue?

| Situation                         | Create Issue? |
| --------------------------------- | ------------- |
| Bug affecting multiple components | ✅ Yes        |
| New feature development           | ✅ Yes        |
| Complex fix requiring planning    | ✅ Yes        |
| Major documentation updates       | ✅ Yes        |
| Small bug fix                     | ⚠️ Optional   |
| Typo fix                          | ❌ No         |
| Emergency hotfix                  | ⚠️ Optional   |

## Full Workflow (11 Steps)

```bash
# 1. CREATE GITHUB ISSUE
# Go to GitHub → Issues → New Issue → Document problem and plan

# 2. CREATE BRANCH (replace 123 with issue number)
git checkout -b fix/123-brief-description

# 3. IMPLEMENT CHANGES
# Make your changes...

# 4. TEST
cd testing/container-testing && make validate-all

# 5. COMMIT (include issue reference)
git commit -m "fix: description

Details...

Closes #123"

# 6. PUSH
git push origin fix/123-brief-description

# 7. TEST ON BRANCH
# Verify everything works

# 8. MERGE
git checkout main && git merge fix/123-brief-description

# 9. PUSH TO MAIN
git push origin main

# 10. VERIFY ISSUE CLOSED
# Check GitHub - should auto-close

# 11. CLEANUP
git branch -d fix/123-brief-description
git push origin --delete fix/123-brief-description
```

## Commit Message Format

```
<type>: <description>

[optional body with details]

Closes #<issue-number>
```

### Types

- `fix`: Bug fix
- `feat`: New feature
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `chore`: Maintenance
- `hotfix`: Emergency fix

### Closing Keywords

- `Closes #123`
- `Fixes #123`
- `Resolves #123`

## Branch Naming

```bash
# With issue number (preferred)
fix/123-brief-description
feature/456-brief-description
docs/789-brief-description

# Without issue number (simple changes)
fix/brief-description
feature/brief-description
docs/brief-description
```

## Quick Commands

```bash
# Check current status
git status && git branch

# Run all tests
cd testing/container-testing && make validate-all

# See recent commits
git log --oneline -5

# Undo last commit (keep changes)
git reset HEAD~1

# Switch branches
git checkout <branch-name>

# Delete local branch
git branch -d <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

## Testing Commands

```bash
# Container tests
cd testing/container-testing
make test-all
make test-build
make test-health
make test-integration

# Documentation tests
make lint-docs
make lint-index

# Complete validation
make validate-all
```

## Emergency Hotfix

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue

# 2. Fix and test quickly
# ... make fix ...
cd testing/container-testing && make test-health

# 3. Merge immediately
git checkout main && git merge hotfix/critical-issue
git push origin main

# 4. Create retroactive issue documenting what happened
```

## Helpful Links

- Documentation: `documentation/dev/operations/README.git-operations.md`
- Task Management: `documentation/dev/operations/README.tasks.md`
- Testing Guide: `documentation/dev/test/README.container-testing.md`
