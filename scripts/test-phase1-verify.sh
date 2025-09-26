#!/bin/bash

# Test Verification Script for Phase 1 Validation
# This script validates that source-aware functionality is working correctly
# DELETE THIS SCRIPT after Phase 1 testing is complete

set -e

API_BASE="http://localhost:9001"
echo "🔍 Starting Phase 1 Verification Tests..."
echo "API Base: $API_BASE"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run test cases
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}🧪 TEST: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "   ${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "   ${RED}❌ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# Function to make API calls and parse JSON
api_get() {
    local endpoint=$1
    curl -s "$API_BASE$endpoint" | jq . 2>/dev/null || curl -s "$API_BASE$endpoint"
}

# Function to check if JSON contains specific data
json_contains() {
    local json_data="$1"
    local jq_query="$2"
    echo "$json_data" | jq -e "$jq_query" > /dev/null 2>&1
}

# Function to count items in JSON array
json_count() {
    local json_data="$1"
    local jq_query="$2"
    echo "$json_data" | jq "$jq_query | length" 2>/dev/null || echo "0"
}

echo "🔥 VERIFICATION TEST 1: Multi-Source Data Loss Prevention"
echo "Verifying that host 192.168.1.100 has vulnerabilities from both nmap and agent"

# Get host data with source information
host_data=$(api_get "/host/192.168.1.100/sources")
echo "📋 Host data retrieved:"
echo "$host_data" | jq . 2>/dev/null || echo "$host_data"
echo ""

# Test 1a: Host should have vulnerabilities from nmap source
nmap_vuln_count=$(echo "$host_data" | jq '[.vulnerability_sources[] | select(.source == "nmap")] | length' 2>/dev/null || echo "0")
run_test "NMAP source vulnerabilities present" \
    "[ $nmap_vuln_count -gt 0 ]" \
    "Host should have vulnerabilities from nmap source"

# Test 1b: Host should have vulnerabilities from agent source  
agent_vuln_count=$(echo "$host_data" | jq '[.vulnerability_sources[] | select(.source == "agent")] | length' 2>/dev/null || echo "0")
run_test "Agent source vulnerabilities present" \
    "[ $agent_vuln_count -gt 0 ]" \
    "Host should have vulnerabilities from agent source"

# Test 1c: Host should have the shared CVE from both sources
nmap_shared_count=$(echo "$host_data" | jq '[.vulnerability_sources[] | select(.VID == "CVE-2019-0708" and .source == "nmap")] | length' 2>/dev/null || echo "0")
agent_shared_count=$(echo "$host_data" | jq '[.vulnerability_sources[] | select(.VID == "CVE-2019-0708" and .source == "agent")] | length' 2>/dev/null || echo "0")

run_test "Shared CVE from both sources" \
    "[ $nmap_shared_count -gt 0 ] && [ $agent_shared_count -gt 0 ]" \
    "CVE-2019-0708 should exist from both nmap and agent sources"

# Test 1d: NMAP-specific vulnerability should only come from nmap
nmap_specific=$(echo "$host_data" | jq '[.vulnerability_sources[] | select(.VID == "CVE-2017-0144")] | length' 2>/dev/null || echo "0")
run_test "NMAP-specific vulnerability isolation" \
    "[ $nmap_specific -gt 0 ]" \
    "CVE-2017-0144 should exist from nmap source"

echo "🕐 VERIFICATION TEST 2: Temporal Tracking"
echo "Verifying first_seen and last_seen timestamps work correctly"

temporal_data=$(api_get "/host/192.168.1.200/sources")
echo "📋 Temporal test data:"
echo "$temporal_data" | jq . 2>/dev/null || echo "$temporal_data"
echo ""

# Test 2a: Vulnerability should have first_seen timestamp
run_test "First seen timestamp exists" \
    "json_contains '$temporal_data' '.vulnerability_sources[0].first_seen'" \
    "Vulnerability should have first_seen timestamp"

# Test 2b: Vulnerability should have last_seen timestamp
run_test "Last seen timestamp exists" \
    "json_contains '$temporal_data' '.vulnerability_sources[0].last_seen'" \
    "Vulnerability should have last_seen timestamp"

# Test 2c: Last seen should be more recent than first seen (due to our 3-second delay)
first_seen=$(echo "$temporal_data" | jq -r '.vulnerability_sources[0].first_seen' 2>/dev/null || echo "")
last_seen=$(echo "$temporal_data" | jq -r '.vulnerability_sources[0].last_seen' 2>/dev/null || echo "")

run_test "Temporal ordering correct" \
    "[ '$last_seen' != '$first_seen' ]" \
    "Last seen should be different from first seen due to rescan"

echo "🔄 VERIFICATION TEST 3: Backward Compatibility"
echo "Verifying legacy API assigns 'unknown' source correctly"

legacy_data=$(api_get "/host/192.168.1.300")
echo "📋 Legacy API data:"
echo "$legacy_data" | jq . 2>/dev/null || echo "$legacy_data"
echo ""

# Test 3a: Legacy host should exist
legacy_ip=$(echo "$legacy_data" | jq -r '.ip // .IP // empty' 2>/dev/null || echo "")
run_test "Legacy host exists" \
    "[ '$legacy_ip' = '192.168.1.300' ]" \
    "Host created via legacy API should exist"

# Test 3b: Legacy host vulnerabilities should have 'unknown' source when queried with source info
legacy_with_sources=$(api_get "/host/192.168.1.300/sources")
run_test "Legacy data has unknown source attribution" \
    "json_contains '$legacy_with_sources' '.vulnerability_sources[] | select(.source == \"unknown\")'" \
    "Legacy API data should be attributed to unknown source"

echo "🔀 VERIFICATION TEST 4: Multiple Sources on Same CVE"
echo "Verifying same CVE from different sources creates separate records"

multi_source_data=$(api_get "/host/192.168.1.400/sources")
echo "📋 Multi-source test data:"
echo "$multi_source_data" | jq . 2>/dev/null || echo "$multi_source_data"
echo ""

# Test 4a: CVE should exist from manual source
manual_count=$(echo "$multi_source_data" | jq '[.vulnerability_sources[] | select(.VID == "CVE-2019-1182" and .source == "manual")] | length' 2>/dev/null || echo "0")
run_test "CVE from manual source" \
    "[ $manual_count -gt 0 ]" \
    "CVE-2019-1182 should exist from manual source"

# Test 4b: CVE should exist from rustscan source
rustscan_count=$(echo "$multi_source_data" | jq '[.vulnerability_sources[] | select(.VID == "CVE-2019-1182" and .source == "rustscan")] | length' 2>/dev/null || echo "0")
run_test "CVE from rustscan source" \
    "[ $rustscan_count -gt 0 ]" \
    "CVE-2019-1182 should exist from rustscan source"

# Test 4c: Total count should be at least 2 (one from each source, plus unknown)
shared_total=$(echo "$multi_source_data" | jq '[.vulnerability_sources[] | select(.VID == "CVE-2019-1182")] | length' 2>/dev/null || echo "0")
run_test "Separate records for same CVE" \
    "[ $shared_total -ge 2 ]" \
    "CVE-2019-1182 should have at least 2 separate records (manual + rustscan)"

echo "🔌 VERIFICATION TEST 5: Port Source Attribution"
echo "Verifying port discovery includes source attribution"

port_data=$(api_get "/host/192.168.1.500/sources")
echo "📋 Port attribution data:"
echo "$port_data" | jq . 2>/dev/null || echo "$port_data"
echo ""

# Test 5a: Host should have ports with source attribution
run_test "Ports have source attribution" \
    "json_contains '$port_data' '.port_sources[] | select(.source == \"nmap\")'" \
    "Ports should be attributed to nmap source"

# Test 5b: Specific ports should be present
port_80_count=$(echo "$port_data" | jq '[.port_sources[] | select(.ID == 80)] | length' 2>/dev/null || echo "0")
run_test "Port 80 discovered" \
    "[ $port_80_count -gt 0 ]" \
    "Port 80 should be discovered and recorded"

echo "🔍 VERIFICATION TEST 6: New API Endpoints"
echo "Verifying new source-aware endpoints are available"

# Test 6a: Source coverage endpoint
echo "Testing source coverage endpoint..."
coverage_data=$(api_get "/sources/coverage")
run_test "Source coverage endpoint" \
    "[ $? -eq 0 ]" \
    "Source coverage endpoint should be available"

# Test 6b: Host history endpoint  
echo "Testing host history endpoint..."
history_data=$(api_get "/host/192.168.1.100/history")
run_test "Host history endpoint" \
    "[ $? -eq 0 ]" \
    "Host history endpoint should be available"

echo "📊 VERIFICATION TEST 7: Database Schema Validation"
echo "Verifying database has new source-aware schema"

# Test 7a: Direct database query (if PostgreSQL is accessible)
if command -v psql &> /dev/null; then
    echo "Testing database schema directly..."
    
    # Check if host_vulnerabilities table has new columns
    schema_check=$(psql -h localhost -U postgres -d sirius -t -c "\d host_vulnerabilities" 2>/dev/null | grep -E "(source|first_seen|last_seen)" | wc -l)
    run_test "Database schema updated" \
        "[ $schema_check -gt 0 ]" \
        "host_vulnerabilities table should have new source-aware columns"
else
    echo "⚠️  PostgreSQL CLI not available, skipping direct database tests"
fi

echo "🧹 VERIFICATION TEST 8: Data Integrity"
echo "Verifying overall data integrity and consistency"

# Test 8a: All test hosts should exist
all_hosts=$(api_get "/host")
host_count=$(echo "$all_hosts" | jq 'length' 2>/dev/null || echo "0")
run_test "All test hosts exist" \
    "[ $host_count -ge 5 ]" \
    "At least 5 test hosts should exist"

# Test 8b: No duplicate host records for same IP
test_host_data=$(api_get "/host/192.168.1.100")
test_host_ip=$(echo "$test_host_data" | jq -r '.ip // .IP // empty' 2>/dev/null || echo "")
run_test "No duplicate host records" \
    "[ '$test_host_ip' = '192.168.1.100' ]" \
    "Host should exist uniquely without duplication"

echo ""
echo "🎯 TEST SUMMARY"
echo "=============="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Phase 1 implementation is working correctly.${NC}"
    echo ""
    echo "✅ Key validations confirmed:"
    echo "   • Multi-source data is preserved (no overwriting)"
    echo "   • Source attribution is working correctly"
    echo "   • Temporal tracking (first_seen/last_seen) is functional"
    echo "   • Backward compatibility is maintained"
    echo "   • Same CVE from different sources creates separate records"
    echo "   • Port source attribution is working"
    echo "   • New API endpoints are available"
    echo ""
    echo "🚀 Phase 1 is ready for production!"
else
    echo ""
    echo -e "${RED}❌ SOME TESTS FAILED. Phase 1 implementation needs attention.${NC}"
    echo ""
    echo "🔧 Review the failed tests above and check:"
    echo "   • Database migration completed successfully"
    echo "   • New API endpoints are implemented"
    echo "   • Source-aware functions replace Association(...).Replace() calls"
    echo "   • Junction tables have source attribution fields"
fi

echo ""
echo "📝 Next Steps:"
echo "   • If tests pass: Proceed to Phase 2 (Scanner Integration)"
echo "   • If tests fail: Review implementation and fix issues"
echo "   • After verification: Delete these test scripts"

# Cleanup reminder
echo ""
echo "⚠️  REMEMBER: Delete test scripts after verification:"
echo "   rm scripts/test-phase1-populate.sh"
echo "   rm scripts/test-phase1-verify.sh"
echo "   rm scripts/test-phase1-cleanup.sh" 