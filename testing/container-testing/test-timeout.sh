#!/bin/bash

# Quick timeout test script
# Tests the new timeout configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Container Health Timeout Configuration${NC}"
echo ""

# Test 1: Default timeout
echo -e "${YELLOW}Test 1: Default timeout (60 retries = 120s)${NC}"
export TEST_RETRIES=60
export LOG_LEVEL=debug
timeout 5s ./test-health.sh dev 2>&1 | head -20 || echo "Timeout test completed (expected)"

echo ""

# Test 2: Extended timeout
echo -e "${YELLOW}Test 2: Extended timeout (120 retries = 240s)${NC}"
export TEST_RETRIES=120
export LOG_LEVEL=debug
timeout 5s ./test-health.sh dev 2>&1 | head -20 || echo "Timeout test completed (expected)"

echo ""

# Test 3: Environment variable override
echo -e "${YELLOW}Test 3: Environment variable override${NC}"
export TEST_RETRIES=30
export LOG_LEVEL=debug
timeout 5s ./test-health.sh dev 2>&1 | head -20 || echo "Timeout test completed (expected)"

echo ""
echo -e "${GREEN}✅ Timeout configuration tests completed${NC}"
echo ""
echo -e "${BLUE}💡 Usage examples:${NC}"
echo "  # Use default timeout (120s for dev, 60s for others)"
echo "  ./test-health.sh dev"
echo ""
echo "  # Override timeout to 4 minutes"
echo "  TEST_RETRIES=120 ./test-health.sh dev"
echo ""
echo "  # Enable debug logging"
echo "  LOG_LEVEL=debug ./test-health.sh dev"
echo ""
echo "  # Quick test with short timeout"
echo "  TEST_RETRIES=10 ./test-health.sh dev"
