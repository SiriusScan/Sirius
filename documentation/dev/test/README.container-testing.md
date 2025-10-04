---
title: "Container Testing"
description: "Comprehensive container testing system for Sirius Scan, providing automated validation of Docker builds, service health, and integration before production deployment"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["docker", "testing", "containers", "ci-cd", "validation"]
categories: ["development", "testing", "infrastructure"]
difficulty: "intermediate"
prerequisites: ["docker", "make", "bash"]
related_docs:
  - "README.development.md"
  - "ABOUT.documentation.md"
dependencies:
  - "docker-compose.yaml"
  - "testing/container-testing/"
  - "testing/Makefile"
llm_context: "high"
search_keywords:
  ["container", "testing", "docker", "health-check", "validation", "ci-cd"]
---

# Container Testing

## Purpose

This document describes the comprehensive container testing system for SiriusScan, providing automated validation of Docker builds, service health, and integration before production deployment. It serves as the definitive guide for developers and DevOps engineers who need to ensure container reliability and system integrity.

## When to Use

- **Before every production deployment** - Validate that all containers build and function correctly
- **After making changes to Dockerfiles** - Ensure modifications don't break the build process
- **During development cycles** - Catch container issues early in the development process
- **When troubleshooting container issues** - Use health checks and integration tests to diagnose problems
- **In CI/CD pipelines** - Automated validation of container builds and functionality
- **When onboarding new team members** - Understand the testing infrastructure and processes

## How to Use

### Quick Start

```bash
# Navigate to container testing directory
cd testing/container-testing

# Run complete test suite
make test-all

# Run specific test types
make test-build    # Build validation only
make test-health   # Health checks only
make test-integration  # Integration tests only

# Test specific environment
make test-dev      # Development environment
make test-prod     # Production environment
```

**Alternative: Run scripts directly from project root**

```bash
# From project root directory
./testing/container-testing/test-integration.sh
./testing/container-testing/test-health.sh
./testing/container-testing/test-build.sh
```

### Prerequisites

- Docker Engine 20.10.0+
- Docker Compose V2
- Make utility
- curl, nc (netcat), jq (for health checks)
- 4GB RAM minimum (8GB recommended)

### Step-by-Step Process

1. **Navigate to container testing directory**: `cd /path/to/Sirius/testing/container-testing`
2. **Run build tests**: `make test-build` to validate all containers build successfully
3. **Run health tests**: `make test-health` to verify services start and respond correctly
4. **Run integration tests**: `make test-integration` to test service interactions
5. **Review results**: Check test output and logs in `testing/logs/` directory

**Alternative approach** (from project root):

1. **Navigate to project root**: `cd /path/to/Sirius`
2. **Run tests directly**: `./testing/container-testing/test-integration.sh`
3. **Review results**: Check test output and logs in `testing/logs/` directory

## What It Is

### Architecture Overview

The container testing system consists of three main components:

- **Build Validation**: Tests individual container builds and Docker Compose configurations
- **Health Checks**: Validates service startup, connectivity, and basic functionality
- **Integration Tests**: Verifies inter-service communication and data flow

### Technical Details

#### Build Testing System

**Purpose**: Ensures all containers can be built successfully with correct configurations.

**Components**:

- `testing/container-testing/test-build.sh` - Main build validation script
- Tests all Docker Compose configurations (base, dev, prod)
- Validates individual container builds for all services
- Cleans up test images after completion

**Services Tested**:

- `sirius-ui` (Next.js frontend)
- `sirius-api` (Go REST API)
- `sirius-engine` (Multi-service container)
- `sirius-postgres` (Database)
- `sirius-valkey` (Cache)
- `sirius-rabbitmq` (Message queue)

**Build Targets Validated**:

- Production builds (`production`, `runner`, `runtime` stages)
- Development builds (`development` stage)
- Multi-stage Dockerfile validation

#### Health Check System

**Purpose**: Verifies that all services start correctly and respond to basic health checks.

**Components**:

- `testing/container-testing/test-health.sh` - Health validation script
- Service-specific health endpoints
- Database connectivity tests
- Port accessibility validation

**Health Checks Performed**:

1. **Container Status**: All 6 containers running and healthy
2. **UI Health**: Next.js application serving content on port 3000
3. **API Health**: Go API responding on port 9001 with `/health` endpoint
4. **Engine Health**: Process validation for sirius-engine container
5. **Database Health**: PostgreSQL connectivity and readiness
6. **Cache Health**: Valkey/Redis responding to ping commands
7. **Queue Health**: RabbitMQ broker status and connectivity
8. **Port Accessibility**: External port binding validation

#### Integration Testing System

**Purpose**: Tests inter-service communication and data flow between components.

**Components**:

- `testing/container-testing/test-integration.sh` - Integration validation script
- Service-to-service communication tests
- Database integration validation
- Message queue functionality tests

**Integration Tests**:

- API to Database connectivity
- UI to API communication
- Engine to Message Queue integration
- Cross-service data validation

### Implementation Details

#### File Structure

```
testing/
├── container-testing/
│   ├── test-build.sh          # Build validation
│   ├── test-health.sh         # Health checks
│   ├── test-integration.sh    # Integration tests
│   └── Makefile               # Container testing commands
├── logs/                      # Test execution logs
│   ├── build_test_*.log
│   ├── health_test_*.log
│   └── integration_test_*.log
└── README.md                  # Testing documentation
```

**Note**: The Makefile is located in the `container-testing/` directory and should be run from there. The test scripts can be run either from the `container-testing/` directory via Makefile or directly from the project root.

#### Makefile Integration

The testing system uses a dedicated Makefile in the `container-testing/` directory:

```makefile
# Testing targets (run from testing/container-testing/)
test-all: test-build test-health test-integration
test-build: ./test-build.sh
test-health: ./test-health.sh
test-integration: ./test-integration.sh

# Environment-specific testing
test-dev: ./test-health.sh dev
test-prod: ./test-health.sh prod
```

**Usage**:

- Run from `testing/container-testing/` directory: `make test-all`
- Or run scripts directly from project root: `./testing/container-testing/test-integration.sh`

#### Logging and Reporting

**Log Files**: All test executions create timestamped log files in `testing/logs/`

- Format: `{test_type}_test_{timestamp}.log`
- Contains: Full command output, test results, error details
- Retention: Logs are kept for troubleshooting and analysis

**Test Results**: Each test provides clear pass/fail indicators:

- ✅ PASSED: Test completed successfully
- ❌ FAILED: Test failed with error details
- Summary: Total tests, passed, failed counts

#### Environment Support

**Development Environment**:

- Uses `docker-compose.dev.yaml` overrides
- Includes volume mounts for live development
- Accounts for longer startup times due to dependency downloads

**Production Environment**:

- Uses `docker-compose.prod.yaml` overrides
- Tests production-optimized builds
- Validates production configuration

**Base Environment**:

- Uses standard `docker-compose.yaml`
- Tests default configuration
- Validates core functionality

### Advanced Topics

#### Custom Test Configuration

**Environment Variables**:

```bash
export TEST_RETRIES=120         # Retry attempts (default: 60, dev mode: 120)
export LOG_LEVEL=debug          # Logging verbosity (info, debug)
```

**Timeout Configuration**:

- **Default**: 60 retries × 2 seconds = 120 seconds total
- **Development Mode**: Automatically increases to 120 retries × 2 seconds = 240 seconds total
- **Custom**: Override with `TEST_RETRIES` environment variable

**Custom Test Execution**:

```bash
# Run with custom timeout (4 minutes)
TEST_RETRIES=120 ./testing/scripts/test-health.sh dev

# Run with debug logging
LOG_LEVEL=debug ./testing/scripts/test-health.sh dev

# Run with both custom timeout and debug logging
TEST_RETRIES=180 LOG_LEVEL=debug ./testing/scripts/test-health.sh dev
```

#### Performance Monitoring

**Resource Usage Tracking**:

- Container startup times
- Memory and CPU usage during tests
- Build time optimization
- Service response times

**Optimization Opportunities**:

- Parallel test execution
- Build cache utilization
- Service startup optimization
- Resource limit tuning

#### Security Considerations

**Test Isolation**:

- Tests run in isolated Docker networks
- No external network access during testing
- Cleanup procedures remove all test artifacts

**Security Validation**:

- Container security scanning (future enhancement)
- Vulnerability assessment (future enhancement)
- Secret management validation (future enhancement)

## Troubleshooting

### FAQ

**Q: Why do health tests fail with "API not ready yet" errors?**
A: The sirius-api service takes time to download Go dependencies in development mode. The health check automatically increases timeout to 4 minutes for dev mode, and includes fallback validation for this scenario.

**Q: Why does development mode take longer than production mode?**
A: Development mode downloads Go dependencies at runtime, which can take 2-4 minutes depending on your internet connection. Production mode pre-builds these dependencies, so it starts much faster.

**Q: How do I run tests for a specific service only?**
A: Modify the test scripts to comment out unwanted services, or use Docker Compose to start only the services you need to test.

**Q: What if build tests fail with "target stage not found" errors?**
A: Check that Docker Compose files reference correct Dockerfile stage names. Common stages are `development`, `production`, `runtime`, and `runner`.

**Q: How can I increase test timeout for slow systems?**
A: Set the `TEST_RETRIES` environment variable: `export TEST_RETRIES=120 && make test-health` (120 retries = 4 minutes total)

**Q: Why do integration tests fail with connection refused errors?**
A: Ensure all services are fully started before running integration tests. Use `docker compose ps` to verify service status.

**Q: How do I debug a specific test failure?**
A: Check the timestamped log file in `testing/logs/` for detailed error information and command output.

**Q: Can I run tests in parallel?**
A: Currently tests run sequentially to avoid resource conflicts. Parallel execution is planned for future enhancement.

**Q: What if I need to test with custom Docker images?**
A: Modify the test scripts to use your custom image tags, or update the Docker Compose files to reference your images.

### Command Reference

```bash
# From testing/container-testing/ directory
make test-all
make test-build
make test-health
make test-integration
make test-dev
make test-prod

# Or from project root directory
./testing/container-testing/test-build.sh
./testing/container-testing/test-health.sh dev
./testing/container-testing/test-integration.sh prod

# Docker Compose validation
docker compose config --quiet
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml config --quiet

# Service health checks
docker compose ps
docker compose logs sirius-api
curl -f http://localhost:9001/health

# Container debugging
docker exec -it sirius-engine /bin/bash
docker logs sirius-engine --tail 50 -f

# Cleanup
docker compose down -v
docker system prune -f
```

### Common Issues and Solutions

| Issue                 | Symptoms                          | Solution                                                  |
| --------------------- | --------------------------------- | --------------------------------------------------------- |
| Build failures        | "target stage not found" errors   | Check Dockerfile stage names in Compose files             |
| Health check timeouts | "service not ready" errors        | Increase timeout or check service logs                    |
| Port conflicts        | "port already in use" errors      | Stop conflicting services or change ports                 |
| Permission errors     | "permission denied" in containers | Check file permissions and Docker daemon access           |
| Network issues        | "connection refused" errors       | Verify Docker network configuration                       |
| Resource exhaustion   | Out of memory errors              | Increase Docker memory limits or close other applications |

### Debugging Steps

1. **Check service status**: `docker compose ps` to see which containers are running
2. **Review service logs**: `docker compose logs [service-name]` for error details
3. **Verify network connectivity**: `docker network ls` and `docker network inspect sirius`
4. **Test individual components**: Run health checks manually with curl commands
5. **Check resource usage**: `docker stats` to monitor CPU and memory usage
6. **Validate configuration**: `docker compose config` to check for syntax errors

### Log Analysis

**Build Test Logs**:

```bash
# View build test results
tail -f testing/logs/build_test_*.log

# Check for specific errors
grep -i "error\|failed" testing/logs/build_test_*.log
```

**Health Test Logs**:

```bash
# Monitor health check progress
tail -f testing/logs/health_test_*.log

# Find failed tests
grep -i "failed\|error" testing/logs/health_test_*.log
```

**Integration Test Logs**:

```bash
# Check integration test results
cat testing/logs/integration_test_*.log

# Analyze service communication
grep -i "connection\|timeout" testing/logs/integration_test_*.log
```

### Performance Troubleshooting

**Slow Build Times**:

- Check Docker BuildKit is enabled: `export DOCKER_BUILDKIT=1`
- Clear Docker cache: `docker builder prune`
- Use build cache mounts for dependencies

**Slow Service Startup**:

- Check system resources: `docker stats`
- Optimize Dockerfile layers
- Use multi-stage builds efficiently

**Test Execution Time**:

- Run tests in parallel (future enhancement)
- Optimize health check intervals
- Use faster base images where possible

### Lessons Learned

**2025-01-03**: Implemented comprehensive container testing system to address build reliability issues. Key insight: Automated testing prevents deployment failures and improves development confidence.

**2025-01-03**: Created health check system with fallback validation for services with longer startup times. Lesson: Account for real-world service startup patterns in test design.

**2025-01-03**: Established layered testing approach (build → health → integration). Benefit: Catches issues at appropriate levels and provides clear failure isolation.

**2025-01-03**: Implemented timestamped logging system for all test executions. Advantage: Enables detailed troubleshooting and historical analysis of test failures.

## LLM Context

[Additional context specifically for Large Language Models:]

- **Key Concepts**: Container testing involves build validation, health checks, and integration testing to ensure Docker containers work correctly before deployment
- **Technical Context**: Uses Docker Compose for orchestration, shell scripts for automation, and Make for command execution. Tests cover 6 services: UI, API, Engine, PostgreSQL, Valkey, and RabbitMQ
- **Common Patterns**: Layered testing approach (build → health → integration), automated cleanup, timestamped logging, environment-specific configurations
- **Edge Cases**: API dependency downloading in dev mode, service startup timing variations, port conflicts, resource constraints
- **Integration Points**: Connects with CI/CD pipelines, deployment processes, monitoring systems, and development workflows

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
