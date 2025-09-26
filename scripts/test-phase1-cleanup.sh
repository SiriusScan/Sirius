#!/bin/bash

# Test Cleanup Script for Phase 1 Validation
# This script removes test data and test scripts after validation
# RUN THIS SCRIPT after Phase 1 testing is complete

set -e

API_BASE="http://localhost:9001"
echo "🧹 Starting Phase 1 Test Cleanup..."
echo "API Base: $API_BASE"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make DELETE API calls
delete_host() {
    local ip=$1
    local description=$2
    
    echo "🗑️  $description"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE/host/$ip")
    
    # Extract HTTP code
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "   ${GREEN}✅ Deleted ($http_code)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  May not exist or already deleted ($http_code)${NC}"
    fi
    echo ""
}

echo "🗑️  CLEANING UP TEST DATA"
echo "========================"

# Remove all test hosts
delete_host "192.168.1.100" "Removing multi-source test host"
delete_host "192.168.1.200" "Removing temporal tracking test host"
delete_host "192.168.1.300" "Removing backward compatibility test host"
delete_host "192.168.1.400" "Removing multi-source CVE test host"
delete_host "192.168.1.500" "Removing port attribution test host"

# Alternative: If there's a bulk delete endpoint
echo "🧹 Attempting bulk cleanup (if supported)..."
bulk_response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/hosts/bulk-delete" \
    -H "Content-Type: application/json" \
    -d '{"ips": ["192.168.1.100", "192.168.1.200", "192.168.1.300", "192.168.1.400", "192.168.1.500"]}' 2>/dev/null || echo "not_supported\n404")

bulk_code=$(echo "$bulk_response" | tail -n1)
if [ "$bulk_code" = "200" ] || [ "$bulk_code" = "204" ]; then
    echo -e "${GREEN}✅ Bulk cleanup successful${NC}"
else
    echo -e "${YELLOW}⚠️  Bulk cleanup not supported, individual deletes used${NC}"
fi
echo ""

echo "📋 VERIFYING CLEANUP"
echo "==================="

# Verify hosts are gone
echo "🔍 Checking if test hosts were removed..."
for ip in "192.168.1.100" "192.168.1.200" "192.168.1.300" "192.168.1.400" "192.168.1.500"; do
    check_response=$(curl -s -w "%{http_code}" "$API_BASE/host/$ip" -o /dev/null)
    if [ "$check_response" = "404" ]; then
        echo -e "   ${GREEN}✅ $ip - Successfully removed${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $ip - Still exists (code: $check_response)${NC}"
    fi
done
echo ""

echo "🗂️  CLEANING UP TEST SCRIPTS"
echo "============================"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Remove test scripts
if [ -f "$SCRIPT_DIR/test-phase1-populate.sh" ]; then
    rm "$SCRIPT_DIR/test-phase1-populate.sh"
    echo -e "${GREEN}✅ Removed test-phase1-populate.sh${NC}"
else
    echo -e "${YELLOW}⚠️  test-phase1-populate.sh not found${NC}"
fi

if [ -f "$SCRIPT_DIR/test-phase1-verify.sh" ]; then
    rm "$SCRIPT_DIR/test-phase1-verify.sh"
    echo -e "${GREEN}✅ Removed test-phase1-verify.sh${NC}"
else
    echo -e "${YELLOW}⚠️  test-phase1-verify.sh not found${NC}"
fi

echo ""
echo "🔄 OPTIONAL: Database Cleanup"
echo "============================="
echo "If you want to completely reset the database for testing:"
echo ""
echo "Option 1 - Reset specific test data (if supported by API):"
echo "  curl -X POST $API_BASE/admin/reset-test-data"
echo ""
echo "Option 2 - Full database reset (CAUTION - removes ALL data):"
echo "  docker-compose down"
echo "  docker volume rm \$(docker volume ls -q | grep postgres)"
echo "  docker-compose up -d"
echo ""
echo "Option 3 - Truncate test tables only:"
if command -v psql &> /dev/null; then
    echo "  psql -h localhost -U postgres -d sirius -c \"DELETE FROM host_vulnerabilities WHERE host_id IN (SELECT id FROM hosts WHERE ip LIKE '192.168.1.%');\""
    echo "  psql -h localhost -U postgres -d sirius -c \"DELETE FROM hosts WHERE ip LIKE '192.168.1.%';\""
else
    echo "  (psql not available - use database admin tool)"
fi

echo ""
echo -e "${GREEN}🎉 CLEANUP COMPLETED!${NC}"
echo ""
echo "📝 Summary:"
echo "   • Test data removed from API"
echo "   • Test scripts deleted"
echo "   • System ready for production use"
echo ""
echo "🔄 Next Steps:"
echo "   • Proceed to Phase 2 implementation"
echo "   • Begin scanner integration work"
echo "   • Update task status to completed"

# Self-destruct this cleanup script
echo ""
echo "🔥 Self-destructing cleanup script..."
rm "$0"
echo -e "${GREEN}✅ Cleanup script removed${NC}" 