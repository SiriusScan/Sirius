#!/bin/bash

# SiriusScan Container Build Test Script
# Tests individual container builds and reports results

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Check if we're in container-testing directory or testing directory
if [[ "$SCRIPT_DIR" == *"/container-testing" ]]; then
    PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
else
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
fi
LOG_DIR="$PROJECT_ROOT/testing/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/build_test_$TIMESTAMP.log"

# Create logs directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Test result tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_exit_code="${3:-0}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log "${BLUE}🧪 Testing: $test_name${NC}"
    log "Command: $test_command"
    
    if eval "$test_command" >> "$LOG_FILE" 2>&1; then
        if [ $? -eq $expected_exit_code ]; then
            log "${GREEN}✅ PASSED: $test_name${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            log "${RED}❌ FAILED: $test_name (unexpected exit code: $?)${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    else
        log "${RED}❌ FAILED: $test_name (command failed)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Main test execution
main() {
    log "${BLUE}🚀 Starting SiriusScan Container Build Tests${NC}"
    log "Timestamp: $(date)"
    log "Project Root: $PROJECT_ROOT"
    log "Log File: $LOG_FILE"
    log ""
    
    cd "$PROJECT_ROOT"
    
    # Test 1: Base Docker Compose Configuration
    run_test "Base Docker Compose Config" "docker compose config --quiet"
    
    # Test 2: Development Docker Compose Configuration
    run_test "Development Docker Compose Config" "docker compose -f docker-compose.yaml -f docker-compose.dev.yaml config --quiet"
    
    # Test 3: sirius-ui Production Build (base docker-compose.yaml is production-ready)
    run_test "sirius-ui Production Build" "docker build -t sirius-ui:test ./sirius-ui/ --target production"
    
    # Test 5: sirius-api Runner Build
    run_test "sirius-api Runner Build" "docker build -t sirius-api:test ./sirius-api/ --target runner"
    
    # Test 6: sirius-engine Development Build
    run_test "sirius-engine Development Build" "docker build -t sirius-engine:dev ./sirius-engine/ --target development"
    
    # Test 7: sirius-engine Runtime Build
    run_test "sirius-engine Runtime Build" "docker build -t sirius-engine:runtime ./sirius-engine/ --target runtime"
    
    # Test 8: sirius-ui Development Build
    run_test "sirius-ui Development Build" "docker build -t sirius-ui:dev ./sirius-ui/ --target development"
    
    # Test 9: sirius-api Development Build
    run_test "sirius-api Development Build" "docker build -t sirius-api:dev ./sirius-api/ --target development"
    
    # Cleanup test images
    log "${YELLOW}🧹 Cleaning up test images...${NC}"
    docker rmi sirius-ui:test sirius-api:test sirius-engine:dev sirius-engine:runtime sirius-ui:dev sirius-api:dev 2>/dev/null || true
    
    # Summary
    log ""
    log "${BLUE}📊 Test Summary${NC}"
    log "Total Tests: $TOTAL_TESTS"
    log "Passed: ${GREEN}$PASSED_TESTS${NC}"
    log "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log "${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        log "${RED}💥 Some tests failed. Check the log file: $LOG_FILE${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
