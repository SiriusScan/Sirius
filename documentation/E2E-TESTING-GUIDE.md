# End-to-End Testing Guide

## Overview

This guide provides comprehensive instructions for running the Sirius E2E test suite, which validates the complete source attribution functionality across all scanner types and user workflows.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Test Suite Architecture](#test-suite-architecture)
3. [Running the Tests](#running-the-tests)
4. [Test Descriptions](#test-descriptions)
5. [Interpreting Results](#interpreting-results)
6. [Troubleshooting](#troubleshooting)
7. [Continuous Integration](#continuous-integration)

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows with WSL
- **Dependencies**:
  - bash shell
  - curl
  - jq (optional, for JSON parsing)
- **Network Access**: Access to API and UI services

### Service Requirements

**Required Services:**

- Sirius API (default: http://localhost:9001)
- PostgreSQL Database (accessible via API)

**Optional Services:**

- Sirius UI (default: http://localhost:3000)
- RabbitMQ (for scanner integration tests)

### Environment Setup

```bash
# Set custom URLs if needed
export API_BASE_URL="http://localhost:9001"
export UI_BASE_URL="http://localhost:3000"

# Ensure services are running
docker-compose up -d  # or your preferred method
```

## Test Suite Architecture

### Test Coverage

The E2E test suite covers the following areas:

1. **API Connectivity** - Basic service health checks
2. **Legacy Compatibility** - Backward compatibility with existing clients
3. **Source Attribution** - Proper source detection and attribution
4. **Multi-Source Integrity** - Data preservation across multiple scanner sources
5. **Performance** - Response time validation
6. **Data Consistency** - Database integrity checks

### Test Data

- **Test Host IPs**: 192.168.1.100, 192.168.1.101
- **Test CVEs**: CVE-2023-E2E-LEGACY, CVE-2023-E2E-NMAP, CVE-2023-E2E-AGENT
- **Scanner Types**: nmap, rustscan, naabu, agent, manual

## Running the Tests

### Quick Start

```bash
# Run the complete E2E test suite
./scripts/test-e2e-suite.sh
```

### Custom Configuration

```bash
# Run with custom API URL
API_BASE_URL="http://production-api:9001" ./scripts/test-e2e-suite.sh

# Run with custom timeout settings
TIMEOUT=30 ./scripts/test-e2e-suite.sh
```

### Docker Environment

```bash
# Run tests in containerized environment
docker run --rm --network host \
  -v $(pwd):/workspace \
  -w /workspace \
  curlimages/curl:latest \
  ./scripts/test-e2e-suite.sh
```

## Test Descriptions

### Test 1: API Connectivity

**Purpose**: Verify basic API service availability
**Method**: GET /health endpoint
**Success Criteria**: HTTP 200 response

### Test 2: Legacy Host Submission

**Purpose**: Validate backward compatibility with existing API clients
**Method**: POST /host without source headers
**Success Criteria**: Host created with 'unknown' source attribution

### Test 3: Network Scanner Submission

**Purpose**: Test source-aware network scanner integration
**Method**: POST /host with nmap headers
**Success Criteria**: Host created with 'nmap' source attribution

### Test 4: Agent Submission

**Purpose**: Test source-aware agent scanner integration
**Method**: POST /host with agent headers
**Success Criteria**: Host created with 'agent' source attribution

### Test 5: Multi-Source Data Integrity

**Purpose**: Verify data preservation when multiple sources scan same host
**Method**: Sequential submissions from different sources
**Success Criteria**: Both sources preserved, no data loss

### Test 6: Source Attribution Endpoints

**Purpose**: Validate new source-aware API endpoints
**Method**: GET /host/{ip}/sources, /host/{ip}/history, /host/source-coverage
**Success Criteria**: All endpoints return expected data structures

### Test 7: Database Consistency

**Purpose**: Verify database integrity and expected data structure
**Method**: Validate host data contains required fields
**Success Criteria**: Response contains ip, vulnerabilities, ports fields

### Test 8: Performance Baseline

**Purpose**: Ensure acceptable response times with source attribution
**Method**: Measure API response time
**Success Criteria**: Response time < 2000ms

### Test 9: Vulnerability Data Format

**Purpose**: Validate vulnerability data structure includes source info
**Method**: Check vulnerability response format
**Success Criteria**: Response contains vid, description, sources fields

### Test 10: Cross-Scanner Compatibility

**Purpose**: Test multiple scanner types on same infrastructure
**Method**: Submit data from rustscan and naabu
**Success Criteria**: Both scanner sources tracked correctly

## Interpreting Results

### Success Output

```
🚀 Starting Sirius E2E Test Suite
================================================
API Base URL: http://localhost:9001
UI Base URL: http://localhost:3000

✅ PASS: API Connectivity
✅ PASS: Legacy Host Submission
✅ PASS: Network Scanner Submission
...
================================================
📊 E2E Test Suite Results
================================================
Total Tests: 10
Passed: 10
Failed: 0
🎉 All tests passed! System is ready for production.
```

### Test Results Directory

Each test run creates a timestamped results directory:

```
test-results-e2e-{timestamp}/
├── test_1_API_Connectivity.result
├── test_2_Legacy_Host_Submission.result
├── ...
└── e2e_suite_result.txt
```

### Result Files

- **Individual Test Results**: `PASS` or `FAIL` for each test
- **Overall Result**: `test-results-e2e-{timestamp}/e2e_suite_result.txt`

## Troubleshooting

### Common Issues

#### Service Unavailable

**Error**: `❌ API service not available at http://localhost:9001`
**Solution**:

1. Verify services are running: `docker-compose ps`
2. Check service logs: `docker-compose logs sirius-api`
3. Verify network connectivity: `curl http://localhost:9001/health`

#### Database Connection Issues

**Error**: Tests fail with database-related errors
**Solution**:

1. Check PostgreSQL status: `docker-compose logs postgres`
2. Verify database migrations: `docker-compose exec sirius-api ./migrate`
3. Reset database if needed: `docker-compose down -v && docker-compose up -d`

#### Test Data Conflicts

**Error**: Tests fail due to existing data
**Solution**:

1. The test suite includes cleanup procedures
2. Manual cleanup: Delete test hosts via API
3. Database reset: Clear test data manually

#### Performance Test Failures

**Error**: `Performance baseline failed: {time}ms (should be < 2000ms)`
**Solution**:

1. Check system load: `top` or `htop`
2. Verify database performance
3. Adjust performance thresholds if needed

### Debug Mode

```bash
# Run tests with verbose output
set -x
./scripts/test-e2e-suite.sh
```

### Manual Test Execution

```bash
# Test individual components
curl -s http://localhost:9001/health
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100","hostname":"test"}' \
  http://localhost:9001/host
```

## Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start services
        run: docker-compose up -d
      - name: Wait for services
        run: sleep 30
      - name: Run E2E tests
        run: ./scripts/test-e2e-suite.sh
      - name: Archive test results
        uses: actions/upload-artifact@v2
        with:
          name: e2e-test-results
          path: test-results-e2e-*/
```

### Jenkins Integration

```groovy
pipeline {
    agent any
    stages {
        stage('Setup') {
            steps {
                sh 'docker-compose up -d'
                sh 'sleep 30'
            }
        }
        stage('E2E Tests') {
            steps {
                sh './scripts/test-e2e-suite.sh'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-results-e2e-*/**'
                }
            }
        }
    }
}
```

## Test Environment Validation

### Pre-Test Checklist

- [ ] All required services are running
- [ ] Database is accessible and migrated
- [ ] Network connectivity is available
- [ ] Previous test data is cleaned up
- [ ] Required environment variables are set

### Post-Test Validation

- [ ] All tests passed or issues documented
- [ ] Test data is cleaned up
- [ ] Results are archived
- [ ] Performance metrics are within acceptable ranges

## Performance Benchmarks

### Expected Performance

| Test Type                | Target Time | Acceptable Range |
| ------------------------ | ----------- | ---------------- |
| API Health Check         | < 100ms     | < 500ms          |
| Host Submission          | < 500ms     | < 1000ms         |
| Source Attribution Query | < 200ms     | < 1000ms         |
| Multi-Source Integrity   | < 1000ms    | < 2000ms         |

### Performance Monitoring

```bash
# Measure individual API calls
time curl -s http://localhost:9001/health

# Monitor during test execution
htop # or top

# Check database performance
docker-compose exec postgres psql -U sirius -d sirius -c "
  SELECT query, mean_time, calls
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;"
```

## Security Considerations

### Test Data Security

- Test data uses non-production IPs and dummy CVEs
- No sensitive information is transmitted
- Test cleanup prevents data leakage

### Network Security

- Tests only use localhost/internal network communication
- No external API calls or data transmission
- Firewall rules may need adjustment for containerized testing

## Next Steps

After successful E2E testing:

1. **Performance Testing** (Phase 4.2)
2. **Documentation Updates** (Phase 4.3)
3. **Deployment Procedures** (Phase 4.4)
4. **User Training** (Phase 4.5)
5. **Monitoring Setup** (Phase 4.6)

## Support

For issues with the E2E test suite:

1. Check this documentation for common solutions
2. Review test logs in the results directory
3. Verify service logs for underlying issues
4. Contact the development team with specific error messages and environment details

---

_This document is part of the Sirius Scan Source Attribution project (Phase 4.1: End-to-End Testing)_
