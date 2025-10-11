#!/bin/bash

# Sirius Full Build Test Script
# Runs complete build tests including Docker builds
# Use this when you want to test full builds on feature branches

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔨 Running full build tests...${NC}"

# Check if we're in the right directory
if [ ! -f "testing/container-testing/Makefile" ]; then
    echo -e "${RED}❌ Not in Sirius project root${NC}"
    echo -e "${YELLOW}💡 Run this script from the project root directory${NC}"
    exit 1
fi

# Change to container testing directory
cd testing/container-testing

# Run full build tests
echo -e "${BLUE}🧪 Running complete build test suite...${NC}"
if make test-build; then
    echo -e "${GREEN}✅ Full build tests passed!${NC}"
    echo -e "${YELLOW}💡 All Docker images built successfully${NC}"
else
    echo -e "${RED}❌ Full build tests failed${NC}"
    echo -e "${YELLOW}💡 Check the output above for specific errors${NC}"
    exit 1
fi
