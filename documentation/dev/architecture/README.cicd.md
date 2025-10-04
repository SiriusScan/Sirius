---
title: "Sirius CI/CD Pipeline"
description: "Comprehensive guide to the Sirius Continuous Integration and Continuous Deployment pipeline, including workflows, testing strategies, and deployment processes."
template: "TEMPLATE.architecture"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["cicd", "pipeline", "github-actions", "docker", "testing", "deployment"]
categories: ["architecture", "operations"]
difficulty: "intermediate"
prerequisites: ["docker", "github-actions", "git"]
related_docs:
  - "README.docker-architecture.md"
  - "README.developer-guide.md"
  - "README.container-testing.md"
dependencies:
  - ".github/workflows/ci.yml"
  - "testing/container-testing/"
  - "scripts/switch-env.sh"
llm_context: "high"
search_keywords:
  [
    "cicd",
    "pipeline",
    "github actions",
    "docker testing",
    "continuous integration",
    "deployment",
    "workflow"
  ]
---

# Sirius CI/CD Pipeline

## Overview

The Sirius CI/CD pipeline provides automated testing, building, and deployment of the multi-service Sirius application. The pipeline is designed to be efficient, reliable, and developer-friendly while maintaining high quality standards.

## Pipeline Architecture

### Workflow Structure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Quick Checks  │    │  Full Testing   │    │   Deployment    │
│   (Pre-commit)  │───▶│   (CI/CD)       │───▶│   (Production)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Trigger Strategy

| Event | Quick Checks | Full Testing | Deployment |
|-------|-------------|--------------|------------|
| **Feature Branch Push** | ✅ Yes | ❌ No | ❌ No |
| **Pull Request** | ✅ Yes | ✅ Yes | ❌ No |
| **Main Branch Push** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Hotfix Push** | ✅ Yes | ✅ Yes | ✅ Yes |

## Quick Checks (Pre-commit)

**Purpose**: Fast validation to catch obvious issues before commit

**Duration**: ~30 seconds

**What's Tested**:
- Docker Compose configuration validation
- Documentation linting
- Basic syntax checks
- Code formatting

**Commands**:
```bash
# Pre-commit validation
make build-all          # Validate all Docker Compose configs
make lint-docs-quick    # Quick documentation checks
```

## Full Testing (CI/CD)

**Purpose**: Comprehensive testing of all changes

**Duration**: ~5-10 minutes

**What's Tested**:
- Docker container builds (all services)
- Service health checks
- Integration testing
- Cross-service communication
- Production build validation

**Commands**:
```bash
# Full CI testing
make test-all           # Complete test suite
make validate-all       # Full validation with docs
```

## Environment Strategy

### Development Testing

**Trigger**: Feature branch pushes, local development

**Configuration**: Uses development Docker Compose setup

**Testing Level**: Quick validation only

**Purpose**: Catch basic issues early

### Integration Testing

**Trigger**: Pull requests, main branch pushes

**Configuration**: Uses production Docker Compose setup

**Testing Level**: Full test suite

**Purpose**: Validate complete integration before merge

### Production Deployment

**Trigger**: Main branch pushes, hotfixes

**Configuration**: Production-optimized builds

**Testing Level**: Full validation + deployment

**Purpose**: Deploy tested, validated code

## Service Detection and Building

### Change Detection

The CI pipeline intelligently detects which services have changed:

```yaml
# Example change detection
if changes in sirius-ui/ → build sirius-ui
if changes in sirius-api/ → build sirius-api  
if changes in sirius-engine/ → build sirius-engine
if changes in docker-compose*.yaml → build all services
```

### Build Strategy

**Incremental Building**: Only build services that have changed

**Parallel Building**: Build multiple services simultaneously

**Caching**: Use Docker layer caching for faster builds

**Multi-Platform**: Build for both AMD64 and ARM64 architectures

## Testing Infrastructure

### Test Categories

1. **Build Tests**
   - Individual container builds
   - Multi-stage build validation
   - Architecture compatibility

2. **Health Tests**
   - Service startup validation
   - Health endpoint checks
   - Resource availability

3. **Integration Tests**
   - Cross-service communication
   - Database connectivity
   - Message queue functionality

### Test Environment

**Configuration**: Production-like environment

**Database**: PostgreSQL with test data

**Cache**: Valkey (Redis-compatible)

**Message Queue**: RabbitMQ

**Network**: Isolated Docker network

## Docker Image Strategy

### Image Tagging

| Environment | Tag Pattern | Purpose |
|-------------|-------------|---------|
| **Development** | `sirius-*:dev` | Development builds |
| **Production** | `sirius-*:prod` | Production builds |
| **Base** | `sirius-*:latest` | Default builds |
| **CI** | `sirius-*:ci-{sha}` | CI-specific builds |

### Registry Management

**Primary Registry**: GitHub Container Registry (ghcr.io)

**Namespace**: siriusscan

**Image Naming**: `ghcr.io/siriusscan/sirius-{service}:{tag}`

## Workflow Jobs

### 1. Change Detection

**Purpose**: Determine which services need building

**Inputs**: Git diff, file changes

**Outputs**: Service build flags

**Duration**: ~30 seconds

### 2. Build and Push

**Purpose**: Build and push Docker images

**Inputs**: Change detection results

**Outputs**: Built and tagged images

**Duration**: ~3-5 minutes

### 3. Integration Testing

**Purpose**: Validate complete system integration

**Inputs**: Built images

**Outputs**: Test results

**Duration**: ~2-3 minutes

### 4. Deployment (Production)

**Purpose**: Deploy to production environment

**Inputs**: Tested images

**Outputs**: Deployed services

**Duration**: ~1-2 minutes

## Configuration Management

### Environment Variables

**Development**: Local `.env` files

**CI**: Generated `.env.ci.*` files

**Production**: Secure environment variables

### Docker Compose Files

**Base**: `docker-compose.yaml` - Core configuration

**Development**: `docker-compose.dev.yaml` - Development overrides

**Production**: `docker-compose.prod.yaml` - Production overrides

**CI**: `docker-compose.ci.yml` - Generated CI configuration

## Monitoring and Observability

### Build Monitoring

- Build success/failure rates
- Build duration trends
- Resource utilization

### Test Monitoring

- Test pass/fail rates
- Test duration trends
- Flaky test detection

### Deployment Monitoring

- Deployment success rates
- Service health post-deployment
- Performance metrics

## Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Build Failures** | Docker build errors | Check Dockerfile syntax, dependencies |
| **Test Failures** | Integration test errors | Check service logs, network connectivity |
| **Deployment Failures** | Service startup errors | Check environment variables, resource limits |
| **Cache Issues** | Stale builds | Clear Docker cache, rebuild with --no-cache |

### Debugging Commands

```bash
# Check CI logs
gh run list
gh run view {run-id}

# Local testing
make test-all
make logs

# Docker debugging
docker compose ps
docker compose logs {service}
```

## Best Practices

### For Developers

1. **Use feature branches** for all development
2. **Test locally** before pushing
3. **Keep commits focused** and atomic
4. **Write descriptive commit messages**
5. **Update documentation** when changing CI

### For CI/CD

1. **Keep builds fast** with proper caching
2. **Use conditional execution** based on changes
3. **Monitor build metrics** regularly
4. **Update dependencies** regularly
5. **Test CI changes** in feature branches

## Migration from Legacy CI

### What Changed

- **Simplified structure**: Removed complex submodule handling
- **Modern testing**: Integrated with current testing system
- **Better caching**: Improved Docker layer caching
- **Cleaner workflows**: Streamlined job structure

### Migration Steps

1. **Update workflows** to use new Docker Compose structure
2. **Integrate testing system** with CI pipeline
3. **Update image tagging** strategy
4. **Modernize deployment** process
5. **Update documentation** to reflect changes

## Future Enhancements

### Planned Improvements

- **Parallel testing** across multiple environments
- **Advanced caching** strategies
- **Performance testing** integration
- **Security scanning** automation
- **Rollback capabilities** for failed deployments

### Monitoring Enhancements

- **Real-time notifications** for build failures
- **Performance dashboards** for CI metrics
- **Automated rollback** triggers
- **Cost optimization** recommendations

---

_This CI/CD documentation follows the Sirius Documentation Standard. For questions about the pipeline, see [README.developer-guide.md](README.developer-guide.md)._
