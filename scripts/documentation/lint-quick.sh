#!/bin/bash

# Quick documentation linting for development
# Faster, less comprehensive checks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOCS_DIR="../../documentation/dev"

# Quick checks
quick_check() {
    local file="$1"
    local issues=0
    
    # Check if file has YAML front matter
    if ! head -n 1 "$file" | grep -q "^---$"; then
        echo -e "${RED}❌ $file: Missing YAML front matter${NC}"
        ((issues++))
    fi
    
    # Check if file has title field
    if ! grep -q "^title:" "$file"; then
        echo -e "${RED}❌ $file: Missing title field${NC}"
        ((issues++))
    fi
    
    # Check if file has description field
    if ! grep -q "^description:" "$file"; then
        echo -e "${RED}❌ $file: Missing description field${NC}"
        ((issues++))
    fi
    
    # Check if file has template field
    if ! grep -q "^template:" "$file"; then
        echo -e "${RED}❌ $file: Missing template field${NC}"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}✅ $file: Quick checks passed${NC}"
    fi
    
    return $issues
}

# Main execution
main() {
    echo -e "${BLUE}📚 Running quick documentation checks...${NC}"
    
    local total_issues=0
    local total_files=0
    
    # Find all markdown files in dev directory
    while IFS= read -r -d '' file; do
        ((total_files++))
        if ! quick_check "$file"; then
            ((total_issues++))
        fi
    done < <(find "$DOCS_DIR" -name "*.md" -type f -print0)
    
    echo ""
    echo -e "${BLUE}📊 Quick Check Summary:${NC}"
    echo -e "  Files checked: $total_files"
    echo -e "  Files with issues: $total_issues"
    
    if [ $total_issues -eq 0 ]; then
        echo -e "${GREEN}✅ All quick checks passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ $total_issues files have issues${NC}"
        exit 1
    fi
}

# Run main function
main "$@"