---
title: "SDK Release Process"
description: "Comprehensive guide for releasing new versions of the Sirius Go API SDK and updating dependent projects"
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["operations", "sdk", "releases"]
tags: ["go-api", "versioning", "github-actions", "ci-cd", "deployment"]
related_docs:
  - "../architecture/README.go-api-sdk.md"
  - "README.development.md"
  - "../../../minor-projects/go-api/README.md"
search_keywords: ["sdk", "release", "version", "deployment", "go-api", "dependencies", "breaking-changes"]
---

# SDK Release Process

## Overview

This document describes how to release new versions of the **Sirius Go API SDK** (`github.com/SiriusScan/go-api`) and propagate updates to dependent projects.

**Key Concepts:**
- **Automated releases** via GitHub Actions CI/CD
- **Semantic versioning** for version management
- **Dependency updates** across multiple projects
- **Breaking change communication** via CHANGELOG

## Quick Reference

### Release New SDK Version

```bash
# Automatic release (recommended)
cd /path/to/go-api
git add .
git commit -m "feat: add new feature"
git push origin main
# → CI/CD creates new patch version automatically

# Manual version bump
git tag v0.0.12
git push origin v0.0.12
# → CI/CD creates GitHub release
```

### Update Dependent Project

```bash
cd /path/to/dependent-project

# Update go.mod version
# Change: github.com/SiriusScan/go-api v0.0.10
# To: github.com/SiriusScan/go-api v0.0.11

go mod tidy
go build ./...  # Verify build
go test ./...   # Run tests

git commit -am "chore: update go-api SDK to v0.0.11"
```

## Automated Release Process (Recommended)

### How It Works

The go-api repository has a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **Triggers on push to `main` branch**
2. **Runs tests and linting**
3. **Auto-increments patch version** (v0.0.10 → v0.0.11)
4. **Creates Git tag**
5. **Generates GitHub release** with auto-generated notes
6. **Notifies main Sirius repo** via repository_dispatch event

### Workflow File

**Location:** `go-api/.github/workflows/ci.yml`

**Jobs:**
- `test-and-lint`: Runs tests and linters
- `release`: Creates new version and release (only on main push)
- `notify-main-repo`: Sends notification to dependent repos

### Step-by-Step Process

#### Step 1: Make Changes to SDK

```bash
cd /path/to/go-api
git checkout -b feature/my-changes

# Make your changes
# - Edit code files
# - Add tests
# - Update documentation

# Test locally
go test ./...
go build ./...
```

#### Step 2: Update CHANGELOG.md

**Always update CHANGELOG.md** before releasing:

```markdown
## [Unreleased]

### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Modification description

### BREAKING CHANGE (if applicable)
- Description of breaking change
- Migration guide
```

**Format:** Follow [Keep a Changelog](https://keepachangelog.com/) standard

#### Step 3: Commit and Push

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature

Detailed description of changes...

BREAKING CHANGE: Field renamed
- OldField → NewField
- Update code to use NewField"

# Push to trigger CI/CD
git push origin main
```

#### Step 4: Monitor CI/CD

1. **Check GitHub Actions**: Go to `github.com/SiriusScan/go-api/actions`
2. **Wait for workflows to complete**:
   - ✅ `test-and-lint` must pass
   - ✅ `release` creates new tag
   - ✅ `notify-main-repo` sends notification
3. **Verify new release**: Check `github.com/SiriusScan/go-api/releases`

#### Step 5: Verify Release

```bash
# Fetch new tags
git fetch --tags

# Check latest tag
git tag -l "v*" --sort=-version:refname | head -1
# Should show new version (e.g., v0.0.11)

# View release on GitHub
# https://github.com/SiriusScan/go-api/releases/latest
```

**Expected Results:**
- ✅ New Git tag created (e.g., `v0.0.11`)
- ✅ GitHub release with auto-generated notes
- ✅ Release includes commit history since last version
- ✅ CI/CD tests passed

## Manual Release Process

### When to Use

- **Major/minor version bumps** (e.g., v0.0.x → v0.1.0)
- **Pre-release versions** (e.g., v0.1.0-beta.1)
- **CI/CD failures** (automated release fails)
- **Hotfix releases** (skip normal workflow)

### Step 1: Determine New Version

**Semantic Versioning Rules:**
- **MAJOR** (x.0.0): Breaking changes, incompatible API
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, backward compatible

**Examples:**
- `v0.0.10` → `v0.0.11` (bug fix)
- `v0.0.11` → `v0.1.0` (new feature, major milestone)
- `v0.1.0` → `v1.0.0` (stable API, breaking changes)

### Step 2: Create Tag

```bash
cd /path/to/go-api

# Ensure main is up to date
git checkout main
git pull origin main

# Create annotated tag
git tag -a v0.1.0 -m "Release v0.1.0

New Features:
- Feature 1
- Feature 2

Bug Fixes:
- Fix 1
- Fix 2"

# Push tag
git push origin v0.1.0
```

### Step 3: Create GitHub Release

**Option A: Automatic (via CI/CD)**
- Pushing the tag triggers `release` workflow
- GitHub release auto-generated

**Option B: Manual**
1. Go to `github.com/SiriusScan/go-api/releases/new`
2. Select tag: `v0.1.0`
3. Set title: `v0.1.0`
4. Add release notes (copy from CHANGELOG.md)
5. Click "Publish release"

### Step 4: Verify

```bash
# Check tag exists
git ls-remote --tags origin | grep v0.1.0

# View release
curl -s https://api.github.com/repos/SiriusScan/go-api/releases/latest | jq .tag_name
```

## Updating Dependent Projects

### Identifying Dependents

**Known projects using go-api:**
- `app-scanner` - Port scanning engine
- `app-agent` - Agent management system
- `sirius-api` (via container) - REST API server
- `sirius-engine` (via container) - Core scanning engine

**Find all dependents:**
```bash
cd /path/to/Sirius-Project
grep -r "github.com/SiriusScan/go-api" . --include="go.mod"
```

### Update Process for Each Project

#### Step 1: Update go.mod

**File:** `project/go.mod`

**Before:**
```go
module github.com/SiriusScan/app-scanner

replace github.com/SiriusScan/go-api => ../go-api //Development

require (
    github.com/SiriusScan/go-api v0.0.10  // Old version
    // ... other dependencies
)
```

**After:**
```go
module github.com/SiriusScan/app-scanner

replace github.com/SiriusScan/go-api => ../go-api //Development

require (
    github.com/SiriusScan/go-api v0.0.11  // New version
    // ... other dependencies
)
```

**Notes:**
- Keep `replace` directive for local development
- Update only the version number in `require`

#### Step 2: Download Dependencies

```bash
cd /path/to/dependent-project

# Update dependencies
go mod tidy

# Verify go.sum updated
git diff go.sum
```

#### Step 3: Check for Breaking Changes

**Read CHANGELOG.md** in go-api:
```bash
cat ../go-api/CHANGELOG.md
```

**Look for:**
- `BREAKING CHANGE:` sections
- Renamed fields/functions
- Removed functionality
- Schema changes

#### Step 4: Update Code

**Example: Port.ID → Port.Number breaking change**

**Find all references:**
```bash
grep -rn "port\.ID" . --include="*.go"
```

**Update code:**
```go
// Before (v0.0.10)
ports := make([]int, len(host.Ports))
for i, port := range host.Ports {
    ports[i] = port.ID  // ❌ Field removed
}

// After (v0.0.11)
ports := make([]int, len(host.Ports))
for i, port := range host.Ports {
    ports[i] = port.Number  // ✅ New field name
}
```

#### Step 5: Test Build

```bash
# Build project
go build -o /dev/null .

# If build fails, fix compilation errors
# Usually related to renamed/removed fields
```

#### Step 6: Run Tests

```bash
# Run unit tests
go test ./...

# Run integration tests (if applicable)
go test ./... -tags=integration
```

#### Step 7: Commit Changes

```bash
git add go.mod go.sum

# If code changes needed
git add path/to/changed/files.go

# Commit
git commit -m "chore: update go-api SDK to v0.0.11

Updates for go-api v0.0.11 breaking changes:
- Fixed port.ID references to port.Number
- Updated dependency version
- Verified build and tests pass

Breaking changes in go-api v0.0.11:
- Port.ID renamed to Port.Number
- See go-api CHANGELOG.md for details"

git push origin main
```

### Container-Based Projects

**Projects:** `sirius-api`, `sirius-engine`

These projects run in Docker containers and use **replace directives with volume mounts**.

#### docker-compose.dev.yaml Configuration

```yaml
services:
  sirius-engine:
    volumes:
      - ../minor-projects/go-api:/go-api:ro
      - ../minor-projects/app-scanner:/app-scanner
```

#### go.mod in Container

```go
replace github.com/SiriusScan/go-api => /go-api
```

#### Update Process

**Changes to go-api are automatically visible** in containers due to volume mount. No version update needed during development.

**For production builds:**
1. Update go.mod version (same as above)
2. Rebuild Docker images
3. Deploy new images

**Restart containers to reload code:**
```bash
docker compose -f docker-compose.dev.yaml restart sirius-engine
docker compose -f docker-compose.dev.yaml restart sirius-api
```

## Breaking Changes

### Definition

**A breaking change is any modification that requires code changes in dependent projects.**

**Examples:**
- ✅ Renaming exported fields (e.g., `Port.ID` → `Port.Number`)
- ✅ Changing function signatures
- ✅ Removing exported types/functions
- ✅ Changing return types
- ✅ Database schema changes (non-backward-compatible)
- ❌ Adding new fields (backward compatible)
- ❌ Adding new functions (backward compatible)
- ❌ Internal implementation changes (not breaking)

### Communicating Breaking Changes

#### 1. Commit Message

Use **conventional commit format** with `BREAKING CHANGE:` footer:

```
feat: rename Port.ID to Port.Number

This resolves conflict with GORM auto-increment ID field.

BREAKING CHANGE: Port.ID renamed to Port.Number
- Update all references from port.ID to port.Number
- Port numbers now stored in Number field
- Database migration required (see migrations/005)
```

#### 2. CHANGELOG.md

Document in CHANGELOG with clear migration guide:

```markdown
## [0.0.11] - 2025-10-26

### Fixed

#### 🔴 CRITICAL: Port.ID Schema Conflict

- **BREAKING CHANGE:** Renamed `Port.ID` field to `Port.Number`
  - `Port.ID int` → `Port.Number int`
  - Resolves duplicate key violations

### Upgrading

**Before:**
```go
port := sirius.Port{ID: 22, Protocol: "tcp"}
```

**After:**
```go
port := sirius.Port{Number: 22, Protocol: "tcp"}
```
```

#### 3. GitHub Release Notes

Include breaking changes prominently:

```markdown
# v0.0.11

## ⚠️ BREAKING CHANGES

### Port.ID → Port.Number

The `Port.ID` field has been renamed to `Port.Number` to resolve database conflicts.

**Migration Required:**
- Update all `port.ID` references to `port.Number`
- Run database migration 005
- See CHANGELOG.md for details

## What's Changed
- Full list of changes...
```

#### 4. Migration Guide

Create detailed migration guide in SDK docs:

**File:** `go-api/docs/migrations/v0.0.10-to-v0.0.11.md`

```markdown
# Migrating from v0.0.10 to v0.0.11

## Breaking Changes

### 1. Port.ID → Port.Number

**Find affected code:**
```bash
grep -rn "port\.ID" . --include="*.go"
```

**Update pattern:**
- Replace `port.ID` with `port.Number`
- Replace `Port{ID:` with `Port{Number:`

## Database Migration

Run migration script:
```bash
docker exec sirius-engine bash -c "cd /tmp/migrations && go run 005_fix_critical_schema_issues/main.go"
```

## Verification

1. Build succeeds: `go build ./...`
2. Tests pass: `go test ./...`
3. No compilation errors
```

### Version Bumping Strategy

**Pre-1.0.0 (current):**
- Breaking changes can occur in patch releases
- Document clearly in CHANGELOG
- Notify dependent project maintainers

**Post-1.0.0 (future):**
- Breaking changes ONLY in major versions
- Deprecation warnings before removal
- Longer support windows for old versions

## Automation Scripts

### Script 1: Update Dependents

**File:** `go-api/scripts/update-dependents.sh`

```bash
#!/bin/bash
# Update go-api version across all dependent projects

set -e

NEW_VERSION=$1
if [ -z "$NEW_VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v0.0.11"
    exit 1
fi

PROJECTS=("app-scanner" "app-agent")
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🚀 Updating go-api to $NEW_VERSION across dependent projects..."

for project in "${PROJECTS[@]}"; do
    PROJECT_PATH="$BASE_DIR/minor-projects/$project"
    
    if [ ! -d "$PROJECT_PATH" ]; then
        echo "⚠️  Project $project not found at $PROJECT_PATH"
        continue
    fi
    
    echo ""
    echo "📦 Updating $project..."
    cd "$PROJECT_PATH"
    
    # Update go.mod
    sed -i '' "s|github.com/SiriusScan/go-api v[0-9.]*|github.com/SiriusScan/go-api $NEW_VERSION|g" go.mod
    
    # Run go mod tidy
    go mod tidy
    
    # Test build
    echo "  🔨 Testing build..."
    if go build -o /dev/null .; then
        echo "  ✅ Build successful"
    else
        echo "  ❌ Build failed - manual intervention required"
        continue
    fi
    
    # Run tests
    echo "  🧪 Running tests..."
    if go test ./... -short; then
        echo "  ✅ Tests passed"
    else
        echo "  ⚠️  Tests failed - review required"
    fi
    
    # Commit changes
    git add go.mod go.sum
    git commit -m "chore: update go-api SDK to $NEW_VERSION" || echo "  ℹ️  No changes to commit"
    
    echo "  ✅ $project updated successfully"
done

echo ""
echo "✅ All projects updated to go-api $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Review and test changes manually"
echo "  2. Push commits: git push origin main"
echo "  3. Monitor dependent project CI/CD"
```

**Usage:**
```bash
cd /path/to/go-api
./scripts/update-dependents.sh v0.0.11
```

### Script 2: Check Versions

**File:** `go-api/scripts/check-versions.sh`

```bash
#!/bin/bash
# Check which version of go-api each dependent project is using

BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PROJECTS=("app-scanner" "app-agent")

echo "📊 go-api version check across projects"
echo "========================================"
echo ""

# Get latest go-api version
cd "$BASE_DIR/minor-projects/go-api"
LATEST_VERSION=$(git tag -l "v*" --sort=-version:refname | head -1)
echo "Latest go-api version: $LATEST_VERSION"
echo ""

for project in "${PROJECTS[@]}"; do
    PROJECT_PATH="$BASE_DIR/minor-projects/$project"
    
    if [ ! -f "$PROJECT_PATH/go.mod" ]; then
        echo "⚠️  $project: go.mod not found"
        continue
    fi
    
    CURRENT_VERSION=$(grep "github.com/SiriusScan/go-api" "$PROJECT_PATH/go.mod" | grep -v "replace" | awk '{print $2}')
    
    if [ "$CURRENT_VERSION" == "$LATEST_VERSION" ]; then
        echo "✅ $project: $CURRENT_VERSION (up to date)"
    else
        echo "⚠️  $project: $CURRENT_VERSION (outdated, latest: $LATEST_VERSION)"
    fi
done

echo ""
echo "To update a project:"
echo "  ./scripts/update-dependents.sh $LATEST_VERSION"
```

**Usage:**
```bash
cd /path/to/go-api
./scripts/check-versions.sh
```

## Testing & Verification

### Pre-Release Testing

**Before releasing SDK:**

1. **Unit tests pass:**
   ```bash
   cd go-api
   go test ./...
   ```

2. **Lint checks pass:**
   ```bash
   golangci-lint run
   ```

3. **Build succeeds:**
   ```bash
   go build ./...
   ```

4. **Local integration test:**
   ```bash
   cd ../app-scanner
   # Ensure replace directive active
   go build .
   go test ./...
   ```

### Post-Release Verification

**After releasing SDK:**

1. **Version tag exists:**
   ```bash
   git ls-remote --tags origin | grep v0.0.11
   ```

2. **GitHub release created:**
   - Visit: `https://github.com/SiriusScan/go-api/releases/latest`
   - Verify: Tag, release notes, timestamp

3. **Module available:**
   ```bash
   go list -m github.com/SiriusScan/go-api@v0.0.11
   ```

4. **Dependent project builds:**
   ```bash
   cd app-scanner
   go get github.com/SiriusScan/go-api@v0.0.11
   go build .
   ```

### Integration Testing

**Full scan pipeline test:**

```bash
# Start all services
docker compose -f docker-compose.dev.yaml up -d

# Submit test scan
docker exec sirius-rabbitmq rabbitmqadmin publish \
  exchange=amq.default routing_key=scan \
  payload='{"id":"sdk-test","targets":[{"value":"192.168.1.100","type":"single_ip"}],"options":{"template_id":"quick"},"priority":3}'

# Monitor logs
docker logs --follow sirius-engine | grep -i "error\|duplicate"
docker logs --follow sirius-postgres | grep -i "error\|duplicate"

# Check results
docker exec sirius-api curl http://localhost:8080/hosts
```

**Success criteria:**
- ✅ Scan completes without errors
- ✅ No database constraint violations
- ✅ Data stored correctly in database
- ✅ All containers running stably

## Troubleshooting

### Issue: CI/CD Release Fails

**Symptoms:**
- GitHub Actions workflow fails
- No new tag/release created

**Solutions:**

1. **Check workflow logs:**
   - Go to `github.com/SiriusScan/go-api/actions`
   - Click failed workflow
   - Review error messages

2. **Common causes:**
   - Tests failing → Fix tests
   - Lint errors → Run `golangci-lint run` locally
   - Permission issues → Check GitHub token permissions

3. **Manual workaround:**
   - Create tag manually (see Manual Release Process)
   - Skip automated release

### Issue: Dependent Project Won't Build

**Symptoms:**
```
go: github.com/SiriusScan/go-api@v0.0.11: invalid version: unknown revision v0.0.11
```

**Solutions:**

1. **Check version exists:**
   ```bash
   git ls-remote --tags https://github.com/SiriusScan/go-api | grep v0.0.11
   ```

2. **Clear Go module cache:**
   ```bash
   go clean -modcache
   go mod download
   ```

3. **Use replace directive temporarily:**
   ```go
   replace github.com/SiriusScan/go-api => ../go-api
   ```

### Issue: Breaking Changes Cause Errors

**Symptoms:**
```
port.ID undefined (type sirius.Port has no field or method ID)
```

**Solutions:**

1. **Read CHANGELOG:**
   ```bash
   cat ../go-api/CHANGELOG.md | grep -A 10 "BREAKING CHANGE"
   ```

2. **Find all affected code:**
   ```bash
   grep -rn "port\.ID" . --include="*.go"
   ```

3. **Apply migration:**
   - Follow migration guide in CHANGELOG
   - Update all references
   - Test build: `go build ./...`

### Issue: Database Schema Mismatch

**Symptoms:**
```
ERROR: column "id" does not exist in table "ports"
```

**Solutions:**

1. **Run database migration:**
   ```bash
   docker exec sirius-engine bash -c "cd /tmp/migrations && go run 005_fix_critical_schema_issues/main.go"
   ```

2. **Verify migration applied:**
   ```bash
   docker exec sirius-postgres psql -U postgres -d sirius -c "\d ports"
   ```

3. **If migration fails:**
   - Backup database
   - Drop and recreate schema
   - Re-run scans to populate data

## Rollback Procedures

### Rolling Back SDK Release

**If new release causes critical issues:**

1. **Identify previous stable version:**
   ```bash
   git tag -l "v*" --sort=-version:refname | head -5
   # Example: v0.0.11 (broken), v0.0.10 (last stable)
   ```

2. **Revert main branch:**
   ```bash
   cd go-api
   git revert <commit-hash>  # Commit that introduced issues
   git push origin main
   ```

3. **Create hotfix release:**
   ```bash
   git tag v0.0.12
   git push origin v0.0.12
   # CI/CD creates new release with reverted changes
   ```

4. **Update dependent projects:**
   ```bash
   ./scripts/update-dependents.sh v0.0.12
   ```

### Rolling Back Dependent Project

**If update breaks a dependent project:**

1. **Revert go.mod:**
   ```bash
   cd app-scanner
   git checkout HEAD~1 go.mod go.sum
   ```

2. **Restore dependencies:**
   ```bash
   go mod download
   ```

3. **Test:**
   ```bash
   go build ./...
   go test ./...
   ```

4. **Commit rollback:**
   ```bash
   git commit -am "revert: rollback go-api to v0.0.10 due to issues"
   git push origin main
   ```

## Best Practices

### Development

- ✅ **Always update CHANGELOG.md** before releasing
- ✅ **Use conventional commits** for clear history
- ✅ **Test locally** with replace directive first
- ✅ **Run full test suite** before releasing
- ✅ **Document breaking changes** prominently
- ✅ **Create migration guides** for major changes
- ❌ **Don't skip pre-release testing**
- ❌ **Don't make breaking changes without warning**

### Release Management

- ✅ **Use semantic versioning** correctly
- ✅ **Let CI/CD handle releases** (automated)
- ✅ **Verify release succeeds** before updating dependents
- ✅ **Update all dependents together** (avoid version drift)
- ✅ **Monitor dependent project CI/CD** after updates
- ❌ **Don't skip version numbers**
- ❌ **Don't release without testing**

### Communication

- ✅ **Announce breaking changes** in advance
- ✅ **Provide migration guides** for complex changes
- ✅ **Update documentation** with releases
- ✅ **Tag team members** in PRs with breaking changes
- ❌ **Don't surprise teams** with undocumented changes

## References

### Related Documentation

- [Go API SDK Architecture](../architecture/README.go-api-sdk.md) - SDK design and structure
- [Development Workflow](README.development.md) - General development practices
- [go-api README](../../../minor-projects/go-api/README.md) - SDK quick start
- [go-api CHANGELOG](../../../minor-projects/go-api/CHANGELOG.md) - Version history

### External Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Last Updated:** 2025-10-26  
**Process Owner:** Sirius DevOps Team  
**Review Schedule:** Quarterly






