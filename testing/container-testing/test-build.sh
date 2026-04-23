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

# Required compose variables for strict startup contract.
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-test-postgres-password}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-nextauth-secret}"
export INITIAL_ADMIN_PASSWORD="${INITIAL_ADMIN_PASSWORD:-test-admin-password}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:${POSTGRES_PASSWORD:-test-postgres-password}@sirius-postgres:5432/sirius}"
INTERNAL_API_KEY_TEST_VALUE="${SIRIUS_INTERNAL_API_KEY_TEST_VALUE:-test-api-key}"

# Base compose mounts ./secrets/sirius_api_key.txt — ensure a placeholder exists for `docker compose config` in CI/local runs.
if [ ! -f "$PROJECT_ROOT/secrets/sirius_api_key.txt" ]; then
    mkdir -p "$PROJECT_ROOT/secrets"
    printf '%s\n' "$INTERNAL_API_KEY_TEST_VALUE" > "$PROJECT_ROOT/secrets/sirius_api_key.txt"
fi

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

    # Test 3: Source Build Docker Compose Configuration
    run_test "Source Build Docker Compose Config" "docker compose -f docker-compose.yaml -f docker-compose.build.yaml config --quiet"

    # Test 4: sirius-postgres entrypoint contract
    run_test "sirius-postgres Entrypoint Contract" "docker build -t sirius-postgres:test ./sirius-postgres/ && docker run --rm --entrypoint /bin/sh sirius-postgres:test -lc 'test -x /usr/local/bin/start-with-monitor.sh && /bin/sh -n /usr/local/bin/start-with-monitor.sh'"
    
    # Test 5: sirius-ui Production Build (base docker-compose.yaml is production-ready)
    run_test "sirius-ui Production Build" "docker build -t sirius-ui:test ./sirius-ui/ --target production"
    
    # Test 6: sirius-api Runner Build
    run_test "sirius-api Runner Build" "docker build -t sirius-api:test ./sirius-api/ --target runner"

    # Test 7: logging clients include API key auth on protected logs routes (file/env loader + engine patch)
    run_test "Logging API Key Contract" "python3 -c \"from pathlib import Path; api_handler = Path('sirius-api/handlers/log_handler.go').read_text(); engine_dockerfile = Path('sirius-engine/Dockerfile').read_text(); assert 'infraauth.LoadSiriusAPIKey' in api_handler; assert 'GO_API_COMMIT_SHA=v0.0.18' in engine_dockerfile; assert 'git apply' not in engine_dockerfile\""

    # Test 7b: internal API key _FILE + env loader (Go)
    run_test "Internal API Key Loader Unit Tests" "( cd sirius-api && go test ./internal/infraauth/... -count=1 )"
    
    # Test 8: sirius-engine Development Build
    run_test "sirius-engine Development Build" "docker build -t sirius-engine:dev ./sirius-engine/ --target development"
    
    # Test 9: sirius-engine Runtime Build
    run_test "sirius-engine Runtime Build" "docker build -t sirius-engine:runtime ./sirius-engine/ --target runtime"

    # Test 10: sirius-engine runtime startup contract binaries
    run_test "sirius-engine Runtime Binary Contract" "docker run --rm --entrypoint /bin/bash sirius-engine:runtime -lc 'command -v bash >/dev/null && command -v curl >/dev/null && command -v psql >/dev/null && command -v pkill >/dev/null && command -v nmap >/dev/null && command -v rustscan >/dev/null && command -v pwsh >/dev/null'"

    # Test 11: sirius-engine entrypoint syntax contract
    run_test "sirius-engine Entrypoint Syntax Contract" "docker run --rm --entrypoint /bin/bash sirius-engine:runtime -lc '/bin/bash -n /start-enhanced.sh && grep -q \"validate_required_binary \\\"psql\\\"\" /start-enhanced.sh'"

    # Test 11b: sirius-engine internal API key contract is file-backed only
    run_test "sirius-engine Internal API Key File Contract" "python3 -c \"from pathlib import Path; data = Path('sirius-engine/start-enhanced.sh').read_text(); assert 'SIRIUS_API_KEY_FILE is required' in data; assert 'SIRIUS_API_KEY differs from mounted sirius_api_key secret' not in data\""
    
    # Test 12: sirius-ui Development Build
    run_test "sirius-ui Development Build" "docker build -t sirius-ui:dev ./sirius-ui/ --target development"

    # Test 12b: sirius-ui startup scripts require readable secret files
    run_test "sirius-ui Internal API Key File Contract" "python3 -c \"from pathlib import Path; prod = Path('sirius-ui/start-prod.sh').read_text(); dev = Path('sirius-ui/start-dev.sh').read_text(); assert 'require_readable_file \\\"SIRIUS_API_KEY_FILE\\\"' in prod; assert 'require_readable_file \\\"SIRIUS_API_KEY_FILE\\\"' in dev; assert 'require_env \\\"SIRIUS_API_KEY\\\"' not in prod + dev\""
    
    # Test 13: sirius-api Development Build
    run_test "sirius-api Development Build" "docker build -t sirius-api:dev ./sirius-api/ --target development"
    
    # Cleanup test images
    log "${YELLOW}🧹 Cleaning up test images...${NC}"
    docker rmi sirius-postgres:test sirius-ui:test sirius-api:test sirius-engine:dev sirius-engine:runtime sirius-ui:dev sirius-api:dev 2>/dev/null || true
    
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
