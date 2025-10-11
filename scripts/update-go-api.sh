#!/bin/bash
#
# Bulk Update go-api Dependency Across All Projects
#
# This script updates the github.com/SiriusScan/go-api dependency to the
# latest version (or a specified version) across all projects in the workspace.
#
# Usage:
#   ./scripts/update-go-api.sh [version]
#
# Examples:
#   ./scripts/update-go-api.sh          # Update to latest
#   ./scripts/update-go-api.sh v0.0.10  # Update to specific version
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the root directory of the repository
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Version to update to (default: latest)
VERSION="${1:-latest}"

echo -e "${BLUE}🔄 Bulk Go API Update Script${NC}"
echo -e "${BLUE}================================${NC}\n"

if [ "$VERSION" = "latest" ]; then
    echo -e "${YELLOW}📦 Fetching latest version from GitHub...${NC}"
    LATEST_TAG=$(curl -s https://api.github.com/repos/SiriusScan/go-api/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    if [ -z "$LATEST_TAG" ]; then
        echo -e "${RED}❌ Failed to fetch latest version${NC}"
        exit 1
    fi
    VERSION="$LATEST_TAG"
    echo -e "${GREEN}✅ Latest version: $VERSION${NC}\n"
else
    echo -e "${YELLOW}📌 Updating to specified version: $VERSION${NC}\n"
fi

# Find all go.mod files that use go-api
echo -e "${BLUE}🔍 Finding projects that use go-api...${NC}"
GO_MOD_FILES=$(find "$REPO_ROOT" -name "go.mod" -type f | grep -v "minor-projects/go-api" || true)

if [ -z "$GO_MOD_FILES" ]; then
    echo -e "${YELLOW}⚠️  No projects found using go-api${NC}"
    exit 0
fi

# Filter for files that actually contain go-api dependency
PROJECTS_TO_UPDATE=()
while IFS= read -r go_mod; do
    if grep -q "github.com/SiriusScan/go-api" "$go_mod"; then
        PROJECTS_TO_UPDATE+=("$go_mod")
    fi
done <<< "$GO_MOD_FILES"

if [ ${#PROJECTS_TO_UPDATE[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No projects found with go-api dependency${NC}"
    exit 0
fi

echo -e "${GREEN}Found ${#PROJECTS_TO_UPDATE[@]} project(s) to update:${NC}"
for project in "${PROJECTS_TO_UPDATE[@]}"; do
    echo -e "  • $(dirname "$project" | sed "s|$REPO_ROOT/||")"
done
echo ""

# Ask for confirmation
read -p "$(echo -e ${YELLOW}"Continue with update? (y/N): "${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Update cancelled${NC}"
    exit 0
fi

echo ""

# Update each project
UPDATED=0
FAILED=0
for go_mod in "${PROJECTS_TO_UPDATE[@]}"; do
    PROJECT_DIR=$(dirname "$go_mod")
    PROJECT_NAME=$(basename "$PROJECT_DIR")
    
    echo -e "${BLUE}📦 Updating $PROJECT_NAME...${NC}"
    
    cd "$PROJECT_DIR"
    
    # Run go get and go mod tidy
    if go get "github.com/SiriusScan/go-api@$VERSION" && go mod tidy; then
        echo -e "${GREEN}✅ $PROJECT_NAME updated successfully${NC}\n"
        ((UPDATED++))
    else
        echo -e "${RED}❌ Failed to update $PROJECT_NAME${NC}\n"
        ((FAILED++))
    fi
done

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 Update Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ Successfully updated: $UPDATED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAILED${NC}"
fi
echo ""

if [ $UPDATED -gt 0 ]; then
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo -e "  1. Review the changes: ${BLUE}git status${NC}"
    echo -e "  2. Test the updates: ${BLUE}docker compose down && docker compose up -d --build${NC}"
    echo -e "  3. Commit the changes: ${BLUE}git add . && git commit -m 'chore(deps): update go-api to $VERSION'${NC}"
    echo ""
fi

echo -e "${GREEN}✨ Done!${NC}"

