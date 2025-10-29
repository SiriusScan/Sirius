#!/bin/bash

# Sirius Agent Identity Index Linting
# Validates agent index completeness and consistency

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AGENTS_DIR="../../.cursor/agents"
INDEX_FILE="$AGENTS_DIR/docs/INDEX.agent-identities.md"
SCRIPT_DIR="$(dirname "$0")"
LOG_FILE="tmp/index-lint-$(date +%Y%m%d-%H%M%S).log"

# Create tmp directory if it doesn't exist
mkdir -p tmp

# Counters
ERRORS=0
WARNINGS=0

# Functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
    ((WARNINGS++))
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    ((ERRORS++))
}

# Check if index file exists
check_index_exists() {
    if [ ! -f "$INDEX_FILE" ]; then
        error "Index file not found: $INDEX_FILE"
        return 1
    fi
    return 0
}

# Get all agent files
get_agent_files() {
    find "$AGENTS_DIR" -name "*.agent.md" -type f | sort
}

# Extract agents mentioned in index
get_indexed_agents() {
    if [ ! -f "$INDEX_FILE" ]; then
        return 1
    fi
    
    # Look for markdown links to .agent.md files
    grep -oE '\[.*\]\([^)]*\.agent\.md\)' "$INDEX_FILE" | \
        grep -oE '[^/]+\.agent\.md' | \
        sort -u
}

# Check for orphaned agent files
check_orphaned_files() {
    log "Checking for orphaned agent files..."
    
    local orphaned=0
    
    while IFS= read -r agent_file; do
        local basename=$(basename "$agent_file")
        
        # Skip template and system files
        if [[ "$basename" == "TEMPLATE."* ]] || \
           [[ "$basename" == "ABOUT."* ]] || \
           [[ "$basename" == "INDEX."* ]] || \
           [[ "$basename" == "GUIDE."* ]] || \
           [[ "$basename" == "REFERENCE."* ]] || \
           [[ "$basename" == "SPECIFICATION."* ]]; then
            continue
        fi
        
        # Check if mentioned in index
        if ! grep -q "$basename" "$INDEX_FILE" 2>/dev/null; then
            error "Agent file not in index: $basename"
            ((orphaned++))
        fi
    done < <(get_agent_files)
    
    if [ $orphaned -eq 0 ]; then
        success "No orphaned agent files found"
        return 0
    else
        error "Found $orphaned orphaned agent file(s)"
        return 1
    fi
}

# Check for broken index references
check_broken_references() {
    log "Checking for broken index references..."
    
    local broken=0
    
    while IFS= read -r indexed_agent; do
        local full_path="$AGENTS_DIR/$indexed_agent"
        
        if [ ! -f "$full_path" ]; then
            error "Index references non-existent file: $indexed_agent"
            ((broken++))
        fi
    done < <(get_indexed_agents)
    
    if [ $broken -eq 0 ]; then
        success "No broken index references found"
        return 0
    else
        error "Found $broken broken reference(s)"
        return 1
    fi
}

# Check index has required sections
check_index_structure() {
    log "Checking index structure..."
    
    local structure_errors=0
    
    if ! grep -q "^# Agent Identity Index" "$INDEX_FILE" 2>/dev/null; then
        error "Index missing main heading"
        ((structure_errors++))
    fi
    
    if ! grep -q "## By Role Type" "$INDEX_FILE" 2>/dev/null; then
        warning "Index missing 'By Role Type' section"
    fi
    
    if ! grep -q "## Complete List" "$INDEX_FILE" 2>/dev/null; then
        warning "Index missing 'Complete List' section"
    fi
    
    if [ $structure_errors -eq 0 ]; then
        success "Index structure is valid"
        return 0
    else
        return 1
    fi
}

# Verify metadata consistency
check_metadata_consistency() {
    log "Checking metadata consistency..."
    
    local inconsistencies=0
    
    while IFS= read -r agent_file; do
        local basename=$(basename "$agent_file")
        
        # Skip system files
        if [[ "$basename" == "TEMPLATE."* ]] || \
           [[ "$basename" == "ABOUT."* ]] || \
           [[ "$basename" == "INDEX."* ]] || \
           [[ "$basename" == "GUIDE."* ]] || \
           [[ "$basename" == "REFERENCE."* ]] || \
           [[ "$basename" == "SPECIFICATION."* ]]; then
            continue
        fi
        
        # Extract name from YAML
        local yaml_name=$(sed -n '/^---$/,/^---$/p' "$agent_file" | grep "^name:" | sed 's/name: *"\?\([^"]*\)"\?/\1/' | tr -d '"')
        
        if [ -n "$yaml_name" ]; then
            # Check if name appears in index
            if ! grep -q "$yaml_name" "$INDEX_FILE" 2>/dev/null; then
                warning "Agent name '$yaml_name' from $basename not found in index"
                ((inconsistencies++))
            fi
        fi
    done < <(get_agent_files)
    
    if [ $inconsistencies -eq 0 ]; then
        success "Metadata consistency check passed"
        return 0
    else
        warning "Found $inconsistencies metadata inconsistenc(y|ies)"
        return 0  # Just warnings, not errors
    fi
}

# Count agents by type
count_agents_by_type() {
    log "Agent counts by role type:"
    
    for role_type in "engineering" "design" "product" "operations" "qa" "documentation"; do
        local count=$(find "$AGENTS_DIR" -name "*.agent.md" -type f -exec grep -l "^role_type: *\"*${role_type}\"*" {} \; 2>/dev/null | wc -l)
        log "  $role_type: $count"
    done
}

# Main script
log "Starting agent identity index validation..."
log "Agents directory: $AGENTS_DIR"
log "Index file: $INDEX_FILE"
log "=================================================="

# Check index exists
if ! check_index_exists; then
    error "Cannot continue without index file"
    exit 1
fi

# Run all checks
check_index_structure
check_orphaned_files
check_broken_references
check_metadata_consistency

echo ""
count_agents_by_type
echo ""

# Summary
log "=================================================="
log "Index Validation Summary:"
log "  Errors: $ERRORS"
log "  Warnings: $WARNINGS"
log "=================================================="

if [ $ERRORS -eq 0 ]; then
    success "Agent identity index validation passed!"
    if [ $WARNINGS -gt 0 ]; then
        warning "Validation passed with $WARNINGS warning(s)"
    fi
    exit 0
else
    error "Index validation failed with $ERRORS error(s)"
    exit 1
fi

