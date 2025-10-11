# SiriusScan Container Testing Infrastructure

This directory contains comprehensive testing infrastructure for SiriusScan's Docker containerized microservices architecture.

## Overview

The testing infrastructure provides automated validation of:

- **Container Builds**: Individual Docker image builds
- **Service Health**: Health checks and basic functionality
- **Integration**: End-to-end service communication
- **Configuration**: Docker Compose validation

## Quick Start

```bash
# Run all tests
make test-all

# Run specific test types
make test-build      # Test container builds
make test-health     # Test service health
make test-integration # Test service integration

# Start development environment
make dev

# Start production environment
make prod
```

## Test Scripts

### 1. Build Tests (`test-build.sh`)

Tests individual container builds and Docker Compose configurations.

**What it tests:**

- Base, development, and production Docker Compose configurations
- sirius-ui production and development builds
- sirius-api runner and development builds
- sirius-engine runtime and development builds

**Usage:**

```bash
./testing/scripts/test-build.sh
```

**Output:**

- ✅ PASSED: Configuration validations
- ❌ FAILED: Build failures with detailed logs
- 📊 Summary report with pass/fail counts

### 2. Health Tests (`test-health.sh`)

Tests service health checks and basic functionality.

**What it tests:**

- Container startup and readiness
- Health check endpoints
- Database connectivity (PostgreSQL, Valkey)
- Message queue connectivity (RabbitMQ)
- Service-to-service communication
- Port accessibility

**Usage:**

```bash
# Test base environment
./testing/scripts/test-health.sh

# Test development environment
./testing/scripts/test-health.sh dev

# Test production environment
./testing/scripts/test-health.sh prod
```

**Output:**

- 🏥 Health check results for each service
- 🔗 Service communication validation
- 📊 Comprehensive health report

### 3. Integration Tests (`test-integration.sh`)

Tests end-to-end service integration and functionality.

**What it tests:**

- API endpoint functionality
- Database operations
- Service communication flows
- Authentication flows
- Scanning functionality
- Error handling

**Usage:**

```bash
# Test base environment
./testing/scripts/test-integration.sh

# Test development environment
./testing/scripts/test-integration.sh dev

# Test production environment
./testing/scripts/test-integration.sh prod
```

**Output:**

- 🔗 API endpoint validation
- 🗄️ Database operation tests
- 🔐 Authentication flow tests
- 🔍 Scanning functionality tests
- ⚠️ Error handling validation

## Configuration Files

### Docker Compose Configurations

- **`docker-compose.yaml`**: Base production configuration with health checks
- **`docker-compose.dev.yaml`**: Development overrides with hot reloading and volume mounts

### Test Configuration

- **`testing/scripts/`**: Test execution scripts
- **`testing/logs/`**: Test execution logs (auto-created)
- **`Makefile`**: Easy command interface

## Test Results

### Log Files

All test executions generate detailed logs in `testing/logs/`:

- `build_test_YYYYMMDD_HHMMSS.log`
- `health_test_YYYYMMDD_HHMMSS.log`
- `integration_test_YYYYMMDD_HHMMSS.log`

### Exit Codes

- **0**: All tests passed
- **1**: One or more tests failed

### Test Reports

Each test script provides:

- Real-time colored output
- Detailed command execution logs
- Pass/fail summary with counts
- Specific failure details

## Development Workflow

### 1. Pre-commit Testing

```bash
# Quick validation before committing
make ci-test
```

### 2. Full Validation

```bash
# Complete validation before deployment
make validate
```

### 3. Development Testing

```bash
# Start development environment
make dev

# Run health tests
make test-health

# Check logs
make logs
```

### 4. Production Testing

```bash
# Test production configuration
make build-prod

# Run production health tests
make test-health prod
```

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Docker daemon is running
   - Verify sufficient disk space
   - Check network connectivity for git clones

2. **Health Check Failures**

   - Ensure all services are running
   - Check port conflicts
   - Verify service dependencies

3. **Integration Test Failures**
   - Check database connectivity
   - Verify API endpoints are responding
   - Check service communication

### Debug Commands

```bash
# Check service status
make status

# View service logs
make logs

# Check individual container logs
docker compose logs sirius-ui
docker compose logs sirius-api
docker compose logs sirius-engine
```

### Cleanup

```bash
# Clean up everything
make clean

# Stop services only
make stop
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Container Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Container Tests
        run: make ci-test
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    stages {
        stage('Build Test') {
            steps {
                sh 'make test-build'
            }
        }
        stage('Health Test') {
            steps {
                sh 'make test-health'
            }
        }
        stage('Integration Test') {
            steps {
                sh 'make test-integration'
            }
        }
    }
}
```

## Best Practices

### 1. Test Execution Order

1. **Build Tests**: Validate configurations and builds
2. **Health Tests**: Verify basic functionality
3. **Integration Tests**: Test end-to-end flows

### 2. Environment Testing

- Test all three environments (base, dev, prod)
- Use appropriate environment for each test type
- Clean up between test runs

### 3. Log Management

- Review logs for detailed failure information
- Archive logs for historical analysis
- Use log rotation for long-running tests

### 4. Performance Considerations

- Tests run in parallel where possible
- Use appropriate timeouts for service startup
- Clean up test containers and images

## Contributing

### Adding New Tests

1. Create test function in appropriate script
2. Add test to main execution flow
3. Update documentation
4. Test the new test function

### Modifying Existing Tests

1. Update test logic
2. Verify test still passes
3. Update documentation if needed
4. Test in all environments

## Support

For issues with the testing infrastructure:

1. Check the troubleshooting section
2. Review test logs for specific errors
3. Verify Docker and Docker Compose installation
4. Check service dependencies and configuration
