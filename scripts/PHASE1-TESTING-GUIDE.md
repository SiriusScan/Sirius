# Phase 1 Testing Guide

## Overview

This guide provides instructions for testing the Phase 1 implementation of the scan source tracking system. These scripts validate that the core data overwrite issue has been resolved.

## Prerequisites

- Go API running on `http://localhost:9001`
- `curl` command available
- `jq` for JSON parsing (install with `brew install jq` on macOS)
- Database accessible (PostgreSQL recommended)

## Test Scripts

### 1. `test-phase1-populate.sh`

**Purpose**: Populates test data to validate source-aware functionality

**What it does**:

- Creates 5 test hosts with different scan scenarios
- Tests multi-source data preservation
- Tests temporal tracking functionality
- Tests backward compatibility
- Tests same CVE from multiple sources
- Tests port source attribution

**Usage**:

```bash
./scripts/test-phase1-populate.sh
```

### 2. `test-phase1-verify.sh`

**Purpose**: Verifies that Phase 1 implementation is working correctly

**What it tests**:

- Multi-source data is preserved (no overwriting)
- Source attribution works correctly
- Temporal tracking functions properly
- Backward compatibility is maintained
- Same CVE from different sources creates separate records
- Port source attribution works
- New API endpoints are available
- Database schema is updated

**Usage**:

```bash
./scripts/test-phase1-verify.sh
```

### 3. `test-phase1-cleanup.sh`

**Purpose**: Removes test data and test scripts after validation

**What it does**:

- Deletes all test hosts via API
- Removes test scripts
- Self-destructs after cleanup
- Provides database cleanup options

**Usage**:

```bash
./scripts/test-phase1-cleanup.sh
```

## Testing Workflow

### Step 1: Ensure System is Ready

```bash
# Check API is running
curl -s http://localhost:9001/hosts | jq .

# Verify database connection
# (Database should be accessible for complete testing)
```

### Step 2: Populate Test Data

```bash
./scripts/test-phase1-populate.sh
```

**Expected Result**:

- All API calls return 200-299 status codes
- No error messages during population
- Test data summary shows 5 hosts created

### Step 3: Verify Implementation

```bash
./scripts/test-phase1-verify.sh
```

**Expected Result**:

- All tests pass (green checkmarks)
- Summary shows 0 failed tests
- Success message: "🎉 ALL TESTS PASSED!"

### Step 4: Clean Up

```bash
./scripts/test-phase1-cleanup.sh
```

**Expected Result**:

- Test data removed from system
- Test scripts deleted
- System ready for production

## Test Scenarios Covered

### Scenario 1: Multi-Source Data Loss Prevention

- **Host**: 192.168.1.100
- **Sources**: nmap + agent
- **Test**: Both sources' vulnerabilities should coexist
- **Critical**: Verifies the core problem is fixed

### Scenario 2: Temporal Tracking

- **Host**: 192.168.1.200
- **Source**: nmap (rescanned)
- **Test**: first_seen ≠ last_seen timestamps
- **Critical**: Verifies timeline functionality

### Scenario 3: Backward Compatibility

- **Host**: 192.168.1.300
- **Source**: legacy API
- **Test**: Old API still works, assigns "unknown" source
- **Critical**: Verifies existing clients don't break

### Scenario 4: Multiple Sources on Same CVE

- **Host**: 192.168.1.400
- **Sources**: manual + rustscan
- **Test**: Same CVE creates separate records per source
- **Critical**: Verifies source isolation

### Scenario 5: Port Source Attribution

- **Host**: 192.168.1.500
- **Source**: nmap
- **Test**: Ports are attributed to discovery source
- **Critical**: Verifies port tracking works

## Expected API Endpoints

After Phase 1 implementation, these endpoints should be available:

```
POST /host/with-source          # New source-aware host creation
GET  /host/{ip}/with-sources    # Get host with source attribution
GET  /host/{ip}/history         # Get scan history timeline
GET  /sources/coverage          # Source coverage statistics
POST /host                      # Legacy endpoint (backward compatibility)
GET  /host/{ip}                 # Legacy endpoint
```

## Troubleshooting

### Test Population Fails

- Check API is running: `curl http://localhost:9001/hosts`
- Verify database connectivity
- Check API logs for errors
- Ensure new endpoints are implemented

### Verification Tests Fail

- Review specific failed test messages
- Check if database schema migration completed
- Verify source attribution fields exist
- Confirm new API functions replace `Association(...).Replace()`

### API Returns 404 Errors

- New endpoints may not be implemented yet
- Check API routing configuration
- Verify handler functions are registered

### Database Schema Issues

- Run database migration scripts
- Check if junction tables have new fields
- Verify indexes are created properly

## Success Criteria

Phase 1 is considered successful when:

✅ **All verification tests pass**
✅ **No data loss between scan sources**
✅ **Source attribution works correctly**
✅ **Temporal tracking functions properly**
✅ **Backward compatibility maintained**
✅ **New API endpoints available**
✅ **Database schema updated correctly**

## Next Steps After Success

1. **Update task status**: Mark Phase 1 tasks as complete
2. **Proceed to Phase 2**: Begin scanner integration
3. **Document findings**: Update implementation notes
4. **Plan Phase 2 testing**: Prepare integration test scenarios

## Security Notes

- Test data uses private IP ranges (192.168.1.x)
- No real vulnerability data is exposed
- Scripts automatically clean up after testing
- Database connections should use proper credentials

---

**⚠️ IMPORTANT**: Delete all test scripts after successful verification to avoid confusion in production environments.
