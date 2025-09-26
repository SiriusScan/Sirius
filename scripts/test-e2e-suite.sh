#!/bin/bash

# ============================================================================
# Sirius E2E Test Suite
# 
# Comprehensive end-to-end testing for source attribution functionality
# Tests complete workflows across all scanner types and frontend integration
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:9001}"
UI_BASE_URL="${UI_BASE_URL:-http://localhost:3000}"
TEST_HOST_IP="192.168.1.100"
TEST_HOST_IP_2="192.168.1.101"
TEST_TIMESTAMP=$(date +%s)
RESULTS_DIR="test-results-e2e-${TEST_TIMESTAMP}"

# Create test results directory
mkdir -p "${RESULTS_DIR}"

echo -e "${BLUE}🚀 Starting Sirius E2E Test Suite${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "API Base URL: ${API_BASE_URL}"
echo -e "UI Base URL: ${UI_BASE_URL}"
echo -e "Results Directory: ${RESULTS_DIR}"
echo ""

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${YELLOW}📋 Test ${TESTS_TOTAL}: ${test_name}${NC}"
    
    if $test_function; then
        echo -e "${GREEN}✅ PASS: ${test_name}${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "PASS" > "${RESULTS_DIR}/test_${TESTS_TOTAL}_$(echo ${test_name} | tr ' ' '_').result"
    else
        echo -e "${RED}❌ FAIL: ${test_name}${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "FAIL" > "${RESULTS_DIR}/test_${TESTS_TOTAL}_$(echo ${test_name} | tr ' ' '_').result"
    fi
    echo ""
}

# Function to cleanup test data
cleanup_test_data() {
    echo -e "${YELLOW}🧹 Cleaning up test data...${NC}"
    
    # Clean up test hosts
    curl -s -X DELETE "${API_BASE_URL}/host/${TEST_HOST_IP}" || true
    curl -s -X DELETE "${API_BASE_URL}/host/${TEST_HOST_IP_2}" || true
    
    # Additional cleanup as needed
    sleep 2
}

# Function to check service availability
check_services() {
    echo -e "${BLUE}🔍 Checking service availability...${NC}"
    
    # Check API service
    if ! curl -s --max-time 10 "${API_BASE_URL}/health" > /dev/null 2>&1; then
        echo -e "${RED}❌ API service not available at ${API_BASE_URL}${NC}"
        exit 1
    fi
    
    # Check UI service (optional)
    if ! curl -s --max-time 10 "${UI_BASE_URL}" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  UI service not available at ${UI_BASE_URL} (continuing with API tests)${NC}"
    fi
    
    echo -e "${GREEN}✅ Services are available${NC}"
    echo ""
}

# ============================================================================
# Test Functions
# ============================================================================

# Test 1: Basic API Connectivity
test_api_connectivity() {
    local response=$(curl -s -w "%{http_code}" "${API_BASE_URL}/health")
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        return 0
    else
        echo "HTTP Status: $http_code"
        return 1
    fi
}

# Test 2: Legacy Host Submission (Backward Compatibility)
test_legacy_host_submission() {
    local payload='{
        "hid": "e2e-test-legacy",
        "os": "Ubuntu",
        "osversion": "22.04",
        "ip": "'${TEST_HOST_IP}'",
        "hostname": "test-host-legacy",
        "ports": [{"id": 22, "protocol": "tcp", "state": "open"}],
        "vulnerabilities": [{"vid": "CVE-2023-E2E-LEGACY", "description": "E2E Test Legacy Vulnerability", "title": "Legacy Test CVE"}]
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${API_BASE_URL}/host")
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        echo "Legacy host submission successful"
        return 0
    else
        echo "HTTP Status: $http_code"
        echo "Response: ${response%???}"
        return 1
    fi
}

# Test 3: Source-Aware Network Scanner Submission
test_network_scanner_submission() {
    local payload='{
        "hid": "e2e-test-nmap",
        "os": "Linux",
        "osversion": "Ubuntu 22.04",
        "ip": "'${TEST_HOST_IP}'",
        "hostname": "test-host-nmap",
        "ports": [
            {"id": 80, "protocol": "tcp", "state": "open"},
            {"id": 443, "protocol": "tcp", "state": "open"}
        ],
        "vulnerabilities": [
            {
                "vid": "CVE-2023-E2E-NMAP",
                "description": "E2E Test Network Vulnerability",
                "title": "Network Scanner Test CVE"
            }
        ]
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "User-Agent: nmap-scanner/7.94" \
        -H "X-Scanner-Name: nmap" \
        -H "X-Scanner-Version: 7.94" \
        -d "$payload" \
        "${API_BASE_URL}/host")
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        echo "Network scanner submission successful"
        return 0
    else
        echo "HTTP Status: $http_code"
        echo "Response: ${response%???}"
        return 1
    fi
}

# Test 4: Source-Aware Agent Submission
test_agent_submission() {
    local payload='{
        "hid": "e2e-test-agent",
        "os": "Windows",
        "osversion": "Server 2019",
        "ip": "'${TEST_HOST_IP}'",
        "hostname": "test-host-agent",
        "vulnerabilities": [
            {
                "vid": "CVE-2023-E2E-AGENT",
                "description": "E2E Test Agent Vulnerability",
                "title": "Agent Scanner Test CVE"
            }
        ],
        "users": ["testuser1", "testuser2"]
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "User-Agent: sirius-agent/1.0.0" \
        -H "X-Scanner-Name: agent" \
        -H "X-Scanner-Version: 1.0.0" \
        -d "$payload" \
        "${API_BASE_URL}/host")
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        echo "Agent submission successful"
        return 0
    else
        echo "HTTP Status: $http_code"
        echo "Response: ${response%???}"
        return 1
    fi
}

# Test 5: Multi-Source Data Integrity
test_multi_source_integrity() {
    # First, submit via network scanner
    test_network_scanner_submission > /dev/null 2>&1
    
    # Then submit via agent (should merge, not replace)
    test_agent_submission > /dev/null 2>&1
    
    # Verify both sources are preserved
    local response=$(curl -s "${API_BASE_URL}/host/${TEST_HOST_IP}/sources")
    
    if echo "$response" | grep -q "nmap" && echo "$response" | grep -q "agent"; then
        echo "Multi-source data integrity verified"
        return 0
    else
        echo "Multi-source verification failed"
        echo "Response: $response"
        return 1
    fi
}

# Test 6: Source Attribution API Endpoints
test_source_attribution_endpoints() {
    # Test host sources endpoint
    local sources_response=$(curl -s "${API_BASE_URL}/host/${TEST_HOST_IP}/sources")
    if ! echo "$sources_response" | grep -q "sources"; then
        echo "Host sources endpoint failed"
        return 1
    fi
    
    # Test host history endpoint
    local history_response=$(curl -s "${API_BASE_URL}/host/${TEST_HOST_IP}/history")
    if ! echo "$history_response" | grep -q "history"; then
        echo "Host history endpoint failed"
        return 1
    fi
    
    # Test source coverage endpoint
    local coverage_response=$(curl -s "${API_BASE_URL}/host/source-coverage")
    if ! echo "$coverage_response" | grep -q "coverage"; then
        echo "Source coverage endpoint failed"
        return 1
    fi
    
    echo "All source attribution endpoints working"
    return 0
}

# Test 7: Database Consistency Check
test_database_consistency() {
    # Get host data and verify structure
    local host_response=$(curl -s "${API_BASE_URL}/host/${TEST_HOST_IP}")
    
    # Check if response contains expected fields
    if echo "$host_response" | grep -q "ip" && \
       echo "$host_response" | grep -q "vulnerabilities" && \
       echo "$host_response" | grep -q "ports"; then
        echo "Database consistency verified"
        return 0
    else
        echo "Database consistency check failed"
        echo "Response: $host_response"
        return 1
    fi
}

# Test 8: Performance Baseline Test
test_performance_baseline() {
    local start_time=$(date +%s%N)
    
    # Perform a standard API call
    curl -s "${API_BASE_URL}/host" > /dev/null
    
    local end_time=$(date +%s%N)
    local duration=$(((end_time - start_time) / 1000000)) # Convert to milliseconds
    
    # Check if response time is reasonable (< 2000ms)
    if [[ $duration -lt 2000 ]]; then
        echo "Performance baseline met: ${duration}ms"
        return 0
    else
        echo "Performance baseline failed: ${duration}ms (should be < 2000ms)"
        return 1
    fi
}

# Test 9: Vulnerability Data Format Validation
test_vulnerability_data_format() {
    local response=$(curl -s "${API_BASE_URL}/host/${TEST_HOST_IP}/sources")
    
    # Check if vulnerability data has required fields
    if echo "$response" | grep -q "vid" && \
       echo "$response" | grep -q "description" && \
       echo "$response" | grep -q "sources"; then
        echo "Vulnerability data format validated"
        return 0
    else
        echo "Vulnerability data format validation failed"
        echo "Response: $response"
        return 1
    fi
}

# Test 10: Cross-Scanner Compatibility
test_cross_scanner_compatibility() {
    # Test with different scanner types on same host
    local rustscan_payload='{
        "hid": "e2e-test-rustscan",
        "ip": "'${TEST_HOST_IP_2}'",
        "hostname": "test-host-rustscan",
        "ports": [{"id": 8080, "protocol": "tcp", "state": "open"}]
    }'
    
    local naabu_payload='{
        "hid": "e2e-test-naabu",
        "ip": "'${TEST_HOST_IP_2}'",
        "hostname": "test-host-naabu",
        "ports": [{"id": 9090, "protocol": "tcp", "state": "open"}]
    }'
    
    # Submit via rustscan
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "User-Agent: rustscan/2.1.1" \
        -H "X-Scanner-Name: rustscan" \
        -d "$rustscan_payload" \
        "${API_BASE_URL}/host" > /dev/null
    
    # Submit via naabu
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "User-Agent: naabu/2.1.9" \
        -H "X-Scanner-Name: naabu" \
        -d "$naabu_payload" \
        "${API_BASE_URL}/host" > /dev/null
    
    # Verify both scanners are tracked
    local response=$(curl -s "${API_BASE_URL}/host/${TEST_HOST_IP_2}/sources")
    
    if echo "$response" | grep -q "rustscan" && echo "$response" | grep -q "naabu"; then
        echo "Cross-scanner compatibility verified"
        return 0
    else
        echo "Cross-scanner compatibility failed"
        echo "Response: $response"
        return 1
    fi
}

# ============================================================================
# Main Test Execution
# ============================================================================

main() {
    echo -e "${BLUE}Starting E2E Test Suite Execution${NC}"
    echo ""
    
    # Check service availability
    check_services
    
    # Clean up any previous test data
    cleanup_test_data
    
    # Run all tests
    run_test "API Connectivity" test_api_connectivity
    run_test "Legacy Host Submission" test_legacy_host_submission
    run_test "Network Scanner Submission" test_network_scanner_submission
    run_test "Agent Submission" test_agent_submission
    run_test "Multi-Source Data Integrity" test_multi_source_integrity
    run_test "Source Attribution Endpoints" test_source_attribution_endpoints
    run_test "Database Consistency" test_database_consistency
    run_test "Performance Baseline" test_performance_baseline
    run_test "Vulnerability Data Format" test_vulnerability_data_format
    run_test "Cross-Scanner Compatibility" test_cross_scanner_compatibility
    
    # Clean up test data
    cleanup_test_data
    
    # Display results
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}📊 E2E Test Suite Results${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo -e "Total Tests: ${TESTS_TOTAL}"
    echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
    echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}🎉 All tests passed! System is ready for production.${NC}"
        echo "PASS" > "${RESULTS_DIR}/e2e_suite_result.txt"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please review and fix issues.${NC}"
        echo "FAIL" > "${RESULTS_DIR}/e2e_suite_result.txt"
        exit 1
    fi
}

# Run main function
main "$@" 