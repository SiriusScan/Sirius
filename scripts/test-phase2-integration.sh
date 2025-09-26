#!/bin/bash

# Phase 2 Integration Test Suite
# Tests source attribution functionality across all scanner types
# Validates multi-source scenarios and data integrity

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_BASE_URL="http://localhost:9001"
TEST_HOST_IP="192.168.1.100"
TEST_CVE_1="CVE-2017-0144"  # EternalBlue
TEST_CVE_2="CVE-2019-0708"  # BlueKeep
TEST_CVE_3="CVE-2021-34527" # PrintNightmare

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test helper functions
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    ((TOTAL_TESTS++))
    log_info "Running test: $test_name"
    
    if $test_function; then
        log_success "$test_name"
    else
        log_error "$test_name"
    fi
    echo ""
}

# API helper functions
api_post() {
    local endpoint="$1"
    local data="$2"
    local expected_status="${3:-200}"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$API_BASE_URL$endpoint")
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [[ "$http_code" -eq "$expected_status" ]]; then
        echo "$body"
        return 0
    else
        log_error "API call failed. Expected: $expected_status, Got: $http_code"
        echo "$body"
        return 1
    fi
}

api_get() {
    local endpoint="$1"
    local expected_status="${2:-200}"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X GET \
        -H "Content-Type: application/json" \
        "$API_BASE_URL$endpoint")
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [[ "$http_code" -eq "$expected_status" ]]; then
        echo "$body"
        return 0
    else
        log_error "API call failed. Expected: $expected_status, Got: $http_code"
        echo "$body"
        return 1
    fi
}

# Test functions
test_api_connectivity() {
    log_info "Testing API connectivity..."
    if api_get "/host" >/dev/null 2>&1; then
        return 0
    else
        log_error "Cannot connect to API at $API_BASE_URL"
        return 1
    fi
}

test_legacy_host_submission() {
    log_info "Testing legacy host submission (backward compatibility)..."
    
    local host_data='{
        "ip": "'$TEST_HOST_IP'",
        "hostname": "test-legacy-host",
        "os": "Linux",
        "ports": [
            {
                "port": 22,
                "protocol": "tcp",
                "state": "open",
                "service": "ssh"
            }
        ],
        "vulnerabilities": [
            {
                "vid": "'$TEST_CVE_1'",
                "title": "EternalBlue SMB Vulnerability",
                "description": "Legacy submission test",
                "severity": "critical",
                "cvss_score": 9.3,
                "port": 445
            }
        ]
    }'
    
    if api_post "/host" "$host_data" 200 >/dev/null; then
        # Verify the host was created with legacy source
        local host_response
        host_response=$(api_get "/host/$TEST_HOST_IP")
        if echo "$host_response" | grep -q "$TEST_HOST_IP"; then
            return 0
        else
            log_error "Legacy host not found after submission"
            return 1
        fi
    else
        return 1
    fi
}

test_source_aware_nmap_submission() {
    log_info "Testing source-aware nmap submission..."
    
    local host_data='{
        "host": {
            "ip": "192.168.1.101",
            "hostname": "test-nmap-host",
            "os": "Linux",
            "ports": [
                {
                    "port": 80,
                    "protocol": "tcp",
                    "state": "open",
                    "service": "http"
                }
            ],
            "vulnerabilities": [
                {
                    "vid": "'$TEST_CVE_2'",
                    "title": "BlueKeep RDP Vulnerability",
                    "description": "Nmap source test",
                    "severity": "critical",
                    "cvss_score": 9.8,
                    "port": 3389
                }
            ]
        },
        "source": {
            "name": "nmap",
            "version": "7.94",
            "config": "ports:1-1000;aggressive:true;template:comprehensive"
        }
    }'
    
    if api_post "/host/with-source" "$host_data" 200 >/dev/null; then
        # Verify source attribution
        local host_response
        host_response=$(api_get "/host/192.168.1.101/sources")
        if echo "$host_response" | grep -q "nmap" && echo "$host_response" | grep -q "7.94"; then
            return 0
        else
            log_error "Nmap source attribution not found"
            return 1
        fi
    else
        return 1
    fi
}

test_source_aware_agent_submission() {
    log_info "Testing source-aware agent submission..."
    
    local host_data='{
        "host": {
            "ip": "192.168.1.102",
            "hostname": "test-agent-host",
            "os": "Ubuntu 20.04",
            "ports": [
                {
                    "port": 443,
                    "protocol": "tcp",
                    "state": "open",
                    "service": "https"
                }
            ],
            "vulnerabilities": [
                {
                    "vid": "'$TEST_CVE_3'",
                    "title": "PrintNightmare Vulnerability",
                    "description": "Agent source test",
                    "severity": "high",
                    "cvss_score": 8.8,
                    "port": 445
                }
            ]
        },
        "source": {
            "name": "sirius-agent",
            "version": "1.0.0",
            "config": "os:linux;arch:amd64;go:go1.21.0;host:test-agent"
        }
    }'
    
    if api_post "/host/with-source" "$host_data" 200 >/dev/null; then
        # Verify source attribution
        local host_response
        host_response=$(api_get "/host/192.168.1.102/sources")
        if echo "$host_response" | grep -q "sirius-agent" && echo "$host_response" | grep -q "1.0.0"; then
            return 0
        else
            log_error "Agent source attribution not found"
            return 1
        fi
    else
        return 1
    fi
}

test_multi_source_same_host() {
    log_info "Testing multiple sources for same host..."
    
    local test_ip="192.168.1.103"
    
    # Submit from nmap source
    local nmap_data='{
        "host": {
            "ip": "'$test_ip'",
            "hostname": "multi-source-host",
            "os": "Linux",
            "ports": [
                {
                    "port": 22,
                    "protocol": "tcp",
                    "state": "open",
                    "service": "ssh"
                }
            ],
            "vulnerabilities": [
                {
                    "vid": "'$TEST_CVE_1'",
                    "title": "EternalBlue from Nmap",
                    "description": "Multi-source test - nmap",
                    "severity": "critical",
                    "cvss_score": 9.3,
                    "port": 445
                }
            ]
        },
        "source": {
            "name": "nmap",
            "version": "7.94",
            "config": "multi-source-test"
        }
    }'
    
    # Submit from agent source
    local agent_data='{
        "host": {
            "ip": "'$test_ip'",
            "hostname": "multi-source-host",
            "os": "Linux",
            "ports": [
                {
                    "port": 80,
                    "protocol": "tcp",
                    "state": "open",
                    "service": "http"
                }
            ],
            "vulnerabilities": [
                {
                    "vid": "'$TEST_CVE_2'",
                    "title": "BlueKeep from Agent",
                    "description": "Multi-source test - agent",
                    "severity": "critical",
                    "cvss_score": 9.8,
                    "port": 3389
                }
            ]
        },
        "source": {
            "name": "sirius-agent",
            "version": "1.0.0",
            "config": "multi-source-test"
        }
    }'
    
    # Submit both sources
    if api_post "/host/with-source" "$nmap_data" 200 >/dev/null && \
       api_post "/host/with-source" "$agent_data" 200 >/dev/null; then
        
        # Verify both sources are present
        local sources_response
        sources_response=$(api_get "/host/$test_ip/sources")
        if echo "$sources_response" | grep -q "nmap" && echo "$sources_response" | grep -q "sirius-agent"; then
            # Verify both vulnerabilities are present
            local host_response
            host_response=$(api_get "/host/$test_ip")
            if echo "$host_response" | grep -q "$TEST_CVE_1" && echo "$host_response" | grep -q "$TEST_CVE_2"; then
                return 0
            else
                log_error "Not all vulnerabilities found from multiple sources"
                return 1
            fi
        else
            log_error "Not all sources found for multi-source host"
            return 1
        fi
    else
        return 1
    fi
}

test_source_detection_headers() {
    log_info "Testing automatic source detection from headers..."
    
    local host_data='{
        "ip": "192.168.1.104",
        "hostname": "header-detection-host",
        "os": "Linux",
        "ports": [
            {
                "port": 8080,
                "protocol": "tcp",
                "state": "open",
                "service": "http-proxy"
            }
        ],
        "vulnerabilities": []
    }'
    
    # Submit with custom headers that should be detected
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-Scanner-Name: rustscan" \
        -H "X-Scanner-Version: 2.1.1" \
        -H "X-Scanner-Config: fast-scan" \
        -d "$host_data" \
        "$API_BASE_URL/host")
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [[ "$http_code" -eq 200 ]]; then
        # Check if source was detected and attributed
        local host_response
        host_response=$(api_get "/host/192.168.1.104?include_source=true")
        if echo "$host_response" | grep -q "rustscan" && echo "$host_response" | grep -q "2.1.1"; then
            return 0
        else
            log_error "Source detection from headers failed"
            return 1
        fi
    else
        return 1
    fi
}

test_backward_compatibility_response_format() {
    log_info "Testing backward compatibility response formats..."
    
    # Test legacy client detection
    local host_data='{
        "ip": "192.168.1.105",
        "hostname": "legacy-client-host",
        "os": "Windows",
        "ports": [],
        "vulnerabilities": []
    }'
    
    # Submit with legacy User-Agent
    response=$(curl -s \
        -X POST \
        -H "Content-Type: application/json" \
        -H "User-Agent: legacy-client/1.0" \
        -H "X-API-Version: 1.0" \
        -d "$host_data" \
        "$API_BASE_URL/host")
    
    # Check response format (should be legacy format)
    if echo "$response" | grep -q "Host added successfully" && ! echo "$response" | grep -q "source"; then
        return 0
    else
        log_error "Legacy response format not maintained"
        return 1
    fi
}

test_data_integrity_across_sources() {
    log_info "Testing data integrity across multiple sources..."
    
    local test_ip="192.168.1.106"
    
    # Submit same vulnerability from different sources
    local source1_data='{
        "host": {
            "ip": "'$test_ip'",
            "hostname": "integrity-test-host",
            "os": "Linux",
            "ports": [],
            "vulnerabilities": [
                {
                    "vid": "'$TEST_CVE_1'",
                    "title": "EternalBlue",
                    "description": "From source 1",
                    "severity": "critical",
                    "cvss_score": 9.3,
                    "port": 445
                }
            ]
        },
        "source": {
            "name": "nmap",
            "version": "7.94",
            "config": "integrity-test-1"
        }
    }'
    
    local source2_data='{
        "host": {
            "ip": "'$test_ip'",
            "hostname": "integrity-test-host",
            "os": "Linux",
            "ports": [],
            "vulnerabilities": [
                {
                    "vid": "'$TEST_CVE_1'",
                    "title": "EternalBlue",
                    "description": "From source 2",
                    "severity": "critical",
                    "cvss_score": 9.3,
                    "port": 445
                }
            ]
        },
        "source": {
            "name": "rustscan",
            "version": "2.1.1",
            "config": "integrity-test-2"
        }
    }'
    
    # Submit from both sources
    if api_post "/host/with-source" "$source1_data" 200 >/dev/null && \
       api_post "/host/with-source" "$source2_data" 200 >/dev/null; then
        
        # Verify both source records exist for the same vulnerability
        local sources_response
        sources_response=$(api_get "/host/$test_ip/sources")
        
        # Count occurrences of the CVE (should be 2 - one from each source)
        local cve_count
        cve_count=$(echo "$sources_response" | grep -o "$TEST_CVE_1" | wc -l)
        
        if [[ "$cve_count" -ge 2 ]]; then
            return 0
        else
            log_error "Data integrity test failed - CVE not preserved across sources"
            return 1
        fi
    else
        return 1
    fi
}

# Cleanup function
cleanup_test_data() {
    log_info "Cleaning up test data..."
    
    # Delete test hosts (if delete endpoint exists)
    local test_ips=("192.168.1.100" "192.168.1.101" "192.168.1.102" "192.168.1.103" "192.168.1.104" "192.168.1.105" "192.168.1.106")
    
    for ip in "${test_ips[@]}"; do
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -d '{"ip": "'$ip'"}' \
            "$API_BASE_URL/host/delete" >/dev/null 2>&1 || true
    done
    
    log_info "Cleanup completed"
}

# Main test execution
main() {
    echo "=========================================="
    echo "Phase 2 Integration Test Suite"
    echo "Testing Source Attribution Functionality"
    echo "=========================================="
    echo ""
    
    # Pre-test cleanup
    cleanup_test_data
    
    # Run all tests
    run_test "API Connectivity" test_api_connectivity
    run_test "Legacy Host Submission" test_legacy_host_submission
    run_test "Source-Aware Nmap Submission" test_source_aware_nmap_submission
    run_test "Source-Aware Agent Submission" test_source_aware_agent_submission
    run_test "Multi-Source Same Host" test_multi_source_same_host
    run_test "Source Detection from Headers" test_source_detection_headers
    run_test "Backward Compatibility Response Format" test_backward_compatibility_response_format
    run_test "Data Integrity Across Sources" test_data_integrity_across_sources
    
    # Post-test cleanup
    cleanup_test_data
    
    # Test summary
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo ""
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo -e "${GREEN}🎉 All tests passed! Phase 2 integration is working correctly.${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
        exit 1
    fi
}

# Run main function
main "$@" 