---
title: "GitHub Actions Workflow Architecture"
description: "Comprehensive guide to Sirius CI/CD pipeline structure, parallel build jobs, and deployment workflows"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-11-14"
author: "Sirius Team"
tags: ["ci-cd", "github-actions", "docker", "ghcr", "parallel-builds"]
categories: ["deployment", "automation"]
difficulty: "intermediate"
prerequisites: ["README.docker-container-deployment.md", "README.architecture.md"]
related_docs:
  - "README.docker-container-deployment.md"
  - "README.terraform-deployment.md"
  - "README.cicd.md"
dependencies:
  - ".github/workflows/ci.yml"
llm_context: "high"
search_keywords: ["ci-cd", "github-actions", "workflow", "parallel", "build", "deploy", "ghcr", "container-registry"]
---

# GitHub Actions Workflow Architecture

## Purpose

This document describes the Sirius CI/CD pipeline structure, explaining how GitHub Actions workflows orchestrate parallel container builds, validation, testing, and deployment. It's designed for developers maintaining or modifying the CI/CD pipeline and for those troubleshooting build issues.

## When to Use

- **Modifying CI/CD pipeline**: Making changes to build, test, or deployment processes
- **Troubleshooting build failures**: Understanding job dependencies and execution order
- **Adding new services**: Integrating new containers into the build pipeline
- **Optimizing build times**: Identifying parallelization opportunities
- **Debugging deployment issues**: Understanding how code reaches production

## How to Use

### Quick Reference

```bash
# Check workflow status
gh run list --workflow=ci.yml --limit 5

# Watch current run
gh run watch

# View workflow logs
gh run view <run-id> --log

# Manually trigger workflow
gh workflow run ci.yml --ref main
```

### Understanding Workflow Execution

1. **Code Push/PR**: Triggers the workflow automatically
2. **Change Detection**: Determines which services need rebuilding
3. **Parallel Builds**: UI, API, and Engine build concurrently
4. **Integration Tests**: Validates built images work together
5. **Deployment Dispatch**: Triggers downstream deployments

## What It Is

### Workflow Overview

The Sirius CI/CD pipeline is implemented in `.github/workflows/ci.yml` and follows a **parallel build architecture** that significantly reduces build times compared to sequential builds.

**Key characteristics:**

- **Parallel execution**: UI, API, and Engine containers build simultaneously
- **Smart change detection**: Only rebuilds services with code changes
- **Prebuild validation**: Runs lints/tests before expensive Docker builds
- **Multi-arch support**: Builds for both amd64 and arm64 architectures
- **Container registry integration**: Pushes to GitHub Container Registry (GHCR)

### Architecture Diagram

```
┌─────────────────┐
│ detect-changes  │ ← Determines what needs rebuilding
└────────┬────────┘
         │
         ├──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌──────────┐   │
    │build-ui│ │build-api│ │build-engine│ │  ← Run in parallel
    └───┬────┘ └───┬────┘ └─────┬────┘   │
        │          │            │         │
        └──────────┴────────────┴─────────┘
                   │
                   ▼
              ┌────────┐
              │  test  │ ← Integration testing
              └───┬────┘
                  │
        ┬─────────┴─────────┬
        ▼                   ▼
┌───────────────┐   ┌──────────────┐
│dispatch-demo- │   │dispatch-demo-│
│   deployment  │   │    canary    │
└───────────────┘   └──────────────┘
```

## Workflow Jobs

### 1. detect-changes

**Purpose**: Analyzes commits to determine which services need rebuilding.

**Triggers on**:
- Direct pushes to `main` or `sirius-demo` branches
- Pull requests to `main`
- Repository dispatch events (submodule updates)

**Outputs**:
- `sirius_ui_changes`: Boolean indicating UI code changes
- `sirius_api_changes`: Boolean indicating API code changes
- `sirius_engine_changes`: Boolean indicating Engine code changes
- `submodule_changes`: Boolean indicating submodule updates

**Change detection logic**:
```yaml
# UI changes: Any file in sirius-ui/
# API changes: Any file in sirius-api/
# Engine changes: Any file in sirius-engine/ or rabbitmq/
# Global changes: Dockerfile, docker-compose, .github/ → rebuild all
```

### 2. build-ui (Parallel)

**Purpose**: Validates and builds the Next.js UI container.

**Runs when**: `detect-changes.outputs.sirius_ui_changes == 'true'`

**Steps**:
1. **Generate metadata**: Determines image tag (`latest`, `beta`, `pr-*`)
2. **Validate UI code**: Runs `npm ci && npm run lint`
3. **Set up Docker Buildx**: Configures multi-arch builds
4. **Log in to GHCR**: Authenticates with container registry
5. **Build and push**: Creates and pushes amd64/arm64 images

**Output**: `image_tag` (e.g., `latest`, `beta`, `pr-123`)

**Build platforms**: `linux/amd64`, `linux/arm64`

**Validation timing**: ~2-3 minutes (lint before Docker build)

### 3. build-api (Parallel)

**Purpose**: Validates and builds the Go API container.

**Runs when**: `detect-changes.outputs.sirius_api_changes == 'true'`

**Steps**:
1. **Generate metadata**: Determines image tag and submodule SHAs
2. **Set up Go**: Installs Go 1.24
3. **Validate API code**: Runs `go mod download && go test ./...`
4. **Set up Docker Buildx**: Configures multi-arch builds
5. **Log in to GHCR**: Authenticates with container registry
6. **Build and push**: Creates and pushes amd64/arm64 images with submodule refs

**Output**: `image_tag`

**Build args**: `GO_API_COMMIT_SHA` (for go-api submodule)

**Validation timing**: ~1-2 minutes (tests before Docker build)

### 4. build-engine (Parallel)

**Purpose**: Validates and builds the Go Engine container.

**Runs when**: `detect-changes.outputs.sirius_engine_changes == 'true'`

**Steps**:
1. **Generate metadata**: Determines image tag and all submodule SHAs
2. **Set up Go**: Installs Go 1.24
3. **Validate Engine code**: Runs `go mod download && go test ./...`
4. **Set up Docker Buildx**: Configures multi-arch builds
5. **Log in to GHCR**: Authenticates with container registry
6. **Build and push**: Creates and pushes amd64/arm64 images with all submodule refs

**Output**: `image_tag`

**Build args**: 
- `GO_API_COMMIT_SHA`
- `APP_SCANNER_COMMIT_SHA`
- `APP_TERMINAL_COMMIT_SHA`
- `SIRIUS_NSE_COMMIT_SHA`
- `APP_AGENT_COMMIT_SHA`

**Validation timing**: ~1-2 minutes (tests before Docker build)

### 5. test

**Purpose**: Validates that built containers work together in an integrated environment.

**Runs when**: At least one build job succeeds

**Dependencies**: `[detect-changes, build-ui, build-api, build-engine]`

**Steps**:
1. **Determine image tag**: Uses output from whichever build job ran
2. **Create test environment**: Generates `docker-compose.test.yml` with fresh images
3. **Start infrastructure**: Launches Postgres, RabbitMQ, Valkey
4. **Start application services**: Launches only the services that were built
5. **Run smoke tests**: Validates services are running and responsive
6. **Cleanup**: Tears down test environment

**Test configuration**:
- Uses in-memory Postgres (`tmpfs`) for speed
- Isolated test database (`sirius_test`)
- Debug-level logging for troubleshooting

### 6. dispatch-demo-deployment

**Purpose**: Triggers deployment to the demo environment when `sirius-demo` branch updates.

**Runs when**: Push to `sirius-demo` branch after successful build + test

**Dependencies**: `[detect-changes, build-ui, build-api, build-engine, test]`

**Sends to**: `SiriusScan/sirius-demo` repository with event type `sirius-demo-updated`

**Payload includes**:
- Source repo/branch/SHA
- Triggering actor
- Commit message

### 7. dispatch-demo-canary

**Purpose**: Triggers demo rebuild on every `main` branch push as a deployment canary.

**Runs when**: Push to `main` branch after successful build + test

**Dependencies**: `[detect-changes, build-ui, build-api, build-engine, test]`

**Sends to**: `SiriusScan/sirius-demo` repository with event type `sirius-main-updated`

**Purpose of canary**: Catches bad commits to `main` by immediately deploying to demo environment

## Image Tagging Strategy

### Tag Types

**`latest`**: 
- Pushed on every `main` branch commit
- Also tagged as `beta` simultaneously
- Used by default in `docker-compose.yaml`

**`beta`**:
- Alias for `latest` (same image)
- Explicitly labeled for beta testing

**`pr-{number}`**:
- Unique tag for pull request builds
- Enables testing PRs in isolation

**`dev`**:
- Fallback for other branches/events

### Tag Determination

```bash
# Pull request
TAG="pr-123"

# Push to main or repository_dispatch
TAG="latest"
also_tag_beta="true"

# Other events
TAG="dev"
```

## Prebuild Validation

Each build job runs validation **before** Docker builds to fail fast and save time.

### UI Validation

```bash
cd sirius-ui
npm ci                    # Install dependencies
npm run lint              # ESLint validation
# Docker build only if lint succeeds
```

**Typical duration**: 2-3 minutes  
**Catches**: Import errors, syntax issues, unused variables

### API Validation

```bash
cd sirius-api
go mod download           # Download dependencies
go test ./... -v          # Run tests
# Docker build only if tests pass
```

**Typical duration**: 1-2 minutes  
**Catches**: Compilation errors, failing tests, import issues

### Engine Validation

```bash
cd sirius-engine
go mod download           # Download dependencies
go test ./... -v          # Run tests
# Docker build only if tests pass
```

**Typical duration**: 1-2 minutes  
**Catches**: Compilation errors, failing tests, integration issues

## Timing Expectations

### Before Parallelization (Sequential Builds)

| Phase | Duration |
|-------|----------|
| Change detection | ~30s |
| Build UI | ~15-20 min |
| Build API | ~20-25 min |
| Build Engine | ~30-40 min |
| Test | ~5 min |
| **Total** | **~70-90 min** |

### After Parallelization (Current)

| Phase | Duration |
|-------|----------|
| Change detection | ~30s |
| Prebuild validation (all parallel) | ~2-3 min |
| Build UI, API, Engine (all parallel) | ~30-40 min (longest wins) |
| Test | ~5 min |
| **Total** | **~40-50 min** |

**Time savings**: ~40-60% reduction (30-40 minutes faster)

## Authentication & Secrets

### Required Secrets

**`GHCR_PUSH_USER`**: GitHub username that generated the PAT  
**`GHCR_PUSH_TOKEN`**: GitHub Personal Access Token with scopes:
- `write:packages` (push images)
- `read:packages` (pull existing layers)
- `delete:packages` (cleanup, optional)
- `repo` (access repository context)

**`GITHUB_TOKEN`**: Automatically provided by GitHub Actions
- Used for repository dispatch events
- Has limited package permissions (read-only)

### Setting Up Secrets

```bash
# Repository secrets (Sirius repo)
Settings → Security → Secrets and variables → Actions

# Add GHCR_PUSH_USER (your GitHub username)
Name: GHCR_PUSH_USER
Value: your-username

# Add GHCR_PUSH_TOKEN (PAT with package scopes)
Name: GHCR_PUSH_TOKEN
Value: ghp_xxxxxxxxxxxx
```

## Troubleshooting

### Build Fails with "denied: installation not allowed"

**Cause**: Default `GITHUB_TOKEN` doesn't have package creation permission.

**Fix**: Use PAT-based authentication (already implemented with `GHCR_PUSH_USER`/`GHCR_PUSH_TOKEN`).

### Build Fails with "403 Forbidden" during push

**Cause**: PAT missing required scopes or package visibility is restricted.

**Fix**:
1. Verify PAT has `write:packages` and `read:packages` scopes
2. Check package is public: `https://github.com/orgs/SiriusScan/packages/container/sirius-{ui,api,engine}/settings`
3. Set visibility to Public (one-time change)

### Test job fails to pull images

**Cause**: Image tag mismatch or build job didn't complete.

**Fix**:
1. Check build job outputs: `needs.build-{ui,api,engine}.outputs.image_tag`
2. Verify images exist in GHCR: `https://github.com/orgs/SiriusScan/packages`
3. Check GHCR authentication in test job

### Dispatch jobs don't trigger downstream

**Cause**: Missing `GITHUB_TOKEN` permission or incorrect event type.

**Fix**:
1. Verify `GITHUB_TOKEN` has workflow permissions
2. Check downstream repo workflow listens for correct event type
3. Confirm payload format matches expectations

### Builds take longer than expected

**Expected timings** (parallel mode):
- Prebuild validation: 2-3 min
- Docker builds: 30-40 min (longest service)
- Integration test: 5 min

**Investigate if**:
- Build cache not working (check `cache-from: type=gha`)
- Network issues downloading dependencies
- Jobs running sequentially instead of parallel

## Best Practices

### When Modifying Workflows

1. **Test in PR first**: Use `pr-*` tags to test changes without affecting `latest`
2. **Preserve outputs**: Build jobs must output `image_tag` for downstream jobs
3. **Use `always()`**: Downstream jobs should use `always()` with result checks
4. **Validate locally**: Use `act` (GitHub Actions local runner) when possible
5. **Check syntax**: Run `actionlint` before committing

### Adding New Services

1. **Create build job**: Copy pattern from `build-ui/api/engine`
2. **Add change detection**: Update `detect-changes` job logic
3. **Update test job**: Add service to `docker-compose.test.yml`
4. **Update dispatch dependencies**: Include new job in `needs` array

### Optimizing Build Times

**Already implemented**:
- Parallel builds (saves 40-60%)
- Prebuild validation (fails fast)
- Docker layer caching (`cache-from: type=gha`)
- Multi-arch builds in one step

**Future opportunities**:
- Cache Go dependencies between runs
- Use `npm ci --prefer-offline` for UI builds
- Split test job into parallel service-specific tests

## Related Documentation

- **[README.docker-container-deployment.md](README.docker-container-deployment.md)**: Container registry deployment guide
- **[README.terraform-deployment.md](../operations/README.terraform-deployment.md)**: Terraform-based infrastructure deployment
- **[README.cicd.md](../architecture/README.cicd.md)**: CI/CD architecture overview
- **[README.docker-architecture.md](../architecture/README.docker-architecture.md)**: Docker multi-stage builds and architecture

## Additional Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Docker Buildx**: https://docs.docker.com/buildx/
- **GHCR Documentation**: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

