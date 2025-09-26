# Phase 2 Testing Guide

## Source Attribution Integration Tests

This guide explains how to test the Phase 2 source attribution functionality that has been implemented across the Sirius vulnerability scanning system.

## Overview

Phase 2 introduces comprehensive source attribution capabilities that track which scanner tools discovered which vulnerabilities, when they were discovered, and with what configuration. This enables:

- **Multi-source data preservation**: No data loss when multiple scanners find the same vulnerability
- **Audit trails**: Complete tracking of scan sources and configurations
- **Backward compatibility**: Existing API clients continue working unchanged
- **Enhanced reporting**: Source-specific filtering and historical views

## Test Suite Components

### 1. Integration Test Script

**File**: `scripts/test-phase2-integration.sh`

**Purpose**: Comprehensive automated testing of all source attribution functionality

**Tests Included**:

- API connectivity verification
- Legacy host submission (backward compatibility)
- Source-aware nmap submissions
- Source-aware agent submissions
- Multi-source scenarios for same host
- Automatic source detection from headers
- Backward compatibility response formats
- Data integrity across multiple sources

### 2. Running the Tests

#### Prerequisites

1. Sirius API server running on `localhost:9001`
2. Database with Phase 1 schema enhancements
3. `curl` command available

#### Execute Tests

```bash
# Run the complete integration test suite
./scripts/test-phase2-integration.sh

# The script will:
# 1. Clean up any existing test data
# 2. Run 8 comprehensive integration tests
# 3. Verify source attribution functionality
# 4. Clean up test data after completion
# 5. Provide detailed pass/fail summary
```

#### Expected Output

```
==========================================
Phase 2 Integration Test Suite
Testing Source Attribution Functionality
==========================================

[INFO] Running test: API Connectivity
[SUCCESS] API Connectivity

[INFO] Running test: Legacy Host Submission
[SUCCESS] Legacy Host Submission

[INFO] Running test: Source-Aware Nmap Submission
[SUCCESS] Source-Aware Nmap Submission

[INFO] Running test: Source-Aware Agent Submission
[SUCCESS] Source-Aware Agent Submission

[INFO] Running test: Multi-Source Same Host
[SUCCESS] Multi-Source Same Host

[INFO] Running test: Source Detection from Headers
[SUCCESS] Source Detection from Headers

[INFO] Running test: Backward Compatibility Response Format
[SUCCESS] Backward Compatibility Response Format

[INFO] Running test: Data Integrity Across Sources
[SUCCESS] Data Integrity Across Sources

==========================================
Test Summary
==========================================
Total Tests: 8
Passed: 8
Failed: 0

🎉 All tests passed! Phase 2 integration is working correctly.
```

## Test Details

### Test 1: API Connectivity

**Validates**: Basic API server availability
**Method**: GET request to `/host` endpoint
**Success Criteria**: HTTP 200 response

### Test 2: Legacy Host Submission

**Validates**: Backward compatibility for existing clients
**Method**: POST to `/host` with legacy format
**Success Criteria**:

- Host created successfully
- Legacy response format maintained
- No source information required

### Test 3: Source-Aware Nmap Submission

**Validates**: Source attribution for nmap scanner
**Method**: POST to `/host/with-source` with nmap source data
**Success Criteria**:

- Host created with source attribution
- Source information retrievable via `/host/{ip}/sources`
- Nmap version and configuration stored correctly

### Test 4: Source-Aware Agent Submission

**Validates**: Source attribution for agent scanner
**Method**: POST to `/host/with-source` with agent source data
**Success Criteria**:

- Host created with agent source attribution
- Agent version and system information stored
- Source retrievable and accurate

### Test 5: Multi-Source Same Host

**Validates**: Multiple scanners can scan same host without data loss
**Method**: Submit same host from nmap and agent sources
**Success Criteria**:

- Both sources preserved in database
- All vulnerabilities from both sources present
- No data overwriting occurs

### Test 6: Source Detection from Headers

**Validates**: Automatic source detection from HTTP headers
**Method**: POST to `/host` with X-Scanner-\* headers
**Success Criteria**:

- Source automatically detected from headers
- Correct routing to source-aware functions
- Source information stored correctly

### Test 7: Backward Compatibility Response Format

**Validates**: Legacy clients receive expected response formats
**Method**: POST with legacy User-Agent and API version headers
**Success Criteria**:

- Legacy response format maintained
- No source information in response
- Successful host creation

### Test 8: Data Integrity Across Sources

**Validates**: Same vulnerability from multiple sources preserved
**Method**: Submit same CVE from different scanner sources
**Success Criteria**:

- Multiple source records for same vulnerability
- No data loss or corruption
- Source attribution maintained for each

## Manual Testing Scenarios

### Scenario 1: Network Scanner Integration

```bash
# Test the enhanced network scanner
cd ../minor-projects/app-scanner

# Run a scan that will use source-aware API
# (This requires actual scanner tools installed)
go run cmd/scanner/main.go --target 192.168.1.1 --template comprehensive
```

### Scenario 2: Agent Scanner Integration

```bash
# Test the enhanced agent scanner
cd ../minor-projects/app-agent

# Run agent status update with source attribution
go run cmd/agent/main.go status --api-url http://localhost:9001
```

### Scenario 3: API Source Detection

```bash
# Test automatic source detection
curl -X POST http://localhost:9001/host \
  -H "Content-Type: application/json" \
  -H "X-Scanner-Name: nmap" \
  -H "X-Scanner-Version: 7.94" \
  -H "X-Scanner-Config: aggressive-scan" \
  -d '{
    "ip": "192.168.1.200",
    "hostname": "test-host",
    "os": "Linux",
    "ports": [],
    "vulnerabilities": []
  }'

# Verify source was detected
curl http://localhost:9001/host/192.168.1.200?include_source=true
```

### Scenario 4: Multi-Source Verification

```bash
# Submit from multiple sources
curl -X POST http://localhost:9001/host/with-source \
  -H "Content-Type: application/json" \
  -d '{
    "host": {
      "ip": "192.168.1.201",
      "hostname": "multi-test",
      "os": "Linux",
      "vulnerabilities": [
        {
          "vid": "CVE-2017-0144",
          "title": "EternalBlue",
          "severity": "critical",
          "cvss_score": 9.3
        }
      ]
    },
    "source": {
      "name": "nmap",
      "version": "7.94",
      "config": "test-config"
    }
  }'

curl -X POST http://localhost:9001/host/with-source \
  -H "Content-Type: application/json" \
  -d '{
    "host": {
      "ip": "192.168.1.201",
      "hostname": "multi-test",
      "os": "Linux",
      "vulnerabilities": [
        {
          "vid": "CVE-2017-0144",
          "title": "EternalBlue",
          "severity": "critical",
          "cvss_score": 9.3
        }
      ]
    },
    "source": {
      "name": "rustscan",
      "version": "2.1.1",
      "config": "fast-scan"
    }
  }'

# Verify both sources preserved
curl http://localhost:9001/host/192.168.1.201/sources
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**

   - Verify Sirius API is running on port 9001
   - Check Docker containers are up: `docker-compose ps`
   - Restart API if needed: `docker-compose restart sirius-api`

2. **Database Schema Issues**

   - Ensure Phase 1 database migrations completed
   - Check enhanced junction tables exist
   - Verify source attribution fields present

3. **Source Detection Not Working**

   - Check API handler source detection logic
   - Verify headers being sent correctly
   - Review API logs for source detection messages

4. **Multi-Source Data Loss**
   - Verify enhanced junction tables created
   - Check source attribution in database
   - Ensure no legacy functions overwriting data

### Debug Commands

```bash
# Check API logs
docker-compose logs sirius-api

# Verify database schema
docker-compose exec sirius-db psql -U sirius -d sirius -c "\dt"

# Check enhanced junction tables
docker-compose exec sirius-db psql -U sirius -d sirius -c "\d host_vulnerabilities_enhanced"

# Test API endpoints directly
curl -v http://localhost:9001/host
curl -v http://localhost:9001/host/with-source
```

## Success Criteria

Phase 2 is considered successful when:

✅ All 8 integration tests pass  
✅ Legacy API clients continue working unchanged  
✅ Source attribution works for all scanner types  
✅ Multi-source scenarios preserve all data  
✅ Automatic source detection functions correctly  
✅ Database maintains data integrity across sources  
✅ Enhanced API endpoints provide source information  
✅ Backward compatibility maintained throughout

## Next Steps

After Phase 2 testing is complete:

1. **Phase 3**: Frontend enhancements to display source information
2. **Phase 4**: Performance testing and documentation updates
3. **Production Deployment**: Migration procedures and monitoring setup

## Support

For issues with Phase 2 testing:

1. Review test output for specific failure details
2. Check API and database logs for errors
3. Verify all Phase 1 prerequisites completed
4. Ensure proper Docker environment setup
5. Validate scanner tool versions and configurations
