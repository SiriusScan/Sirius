#!/bin/bash

# Sirius Documentation Index Completeness Linter
# Ensures all files in dev/ are referenced in the documentation index

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOCS_DIR="../../documentation/dev"
INDEX_FILE="../../documentation/README.documentation-index.md"
LOG_FILE="tmp/index-lint-$(date +%Y%m%d-%H%M%S).log"

# Create tmp directory if it doesn't exist
mkdir -p tmp

# Counters
TOTAL_FILES=0
MISSING_FILES=0
EXTRA_FILES=0

# Functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

# Get all markdown files in dev directory
get_dev_files() {
    find "$DOCS_DIR" -name "*.md" -type f | sed "s|^$DOCS_DIR/||" | sort
}

# Get files referenced in index
get_indexed_files() {
    grep -E "\[.*\]\(dev/.*\.md\)" "$INDEX_FILE" | grep -v "_This document follows" | sed 's/.*\[[^]]*\](dev\/\([^)]*\))/\1/' | sed 's/ - .*$//' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | sort | uniq
}

# Check if file is in index
check_file_in_index() {
    local file="$1"
    local indexed_files="$2"
    
    if echo "$indexed_files" | grep -q "^${file}$"; then
        return 0
    else
        return 1
    fi
}

# Check if indexed file exists
check_indexed_file_exists() {
    local indexed_file="$1"
    local dev_files="$2"
    
    if echo "$dev_files" | grep -q "^${indexed_file}$"; then
        return 0
    else
        return 1
    fi
}

# Main linting function
lint_index() {
    log "Starting index completeness linting..."
    log "Log file: $LOG_FILE"
    
    # Get file lists
    local dev_files
    local indexed_files
    
    dev_files=$(get_dev_files)
    indexed_files=$(get_indexed_files)
    
    log "Found $(echo "$dev_files" | wc -l) files in dev directory"
    log "Found $(echo "$indexed_files" | wc -l) files referenced in index"
    
    # Check for missing files (in dev but not in index)
    log ""
    log "Checking for files missing from index..."
    
    while IFS= read -r file; do
        if [ -n "$file" ]; then
            ((TOTAL_FILES++))
            if ! check_file_in_index "$file" "$indexed_files"; then
                error "File missing from index: $file"
                ((MISSING_FILES++))
            else
                success "File properly indexed: $file"
            fi
        fi
    done <<< "$dev_files"
    
    # Check for extra files (in index but not in dev)
    log ""
    log "Checking for extra files in index..."
    
    while IFS= read -r indexed_file; do
        if [ -n "$indexed_file" ]; then
            if ! check_indexed_file_exists "$indexed_file" "$dev_files"; then
                warning "File in index but not found in dev: $indexed_file"
                ((EXTRA_FILES++))
            fi
        fi
    done <<< "$indexed_files"
    
    # Summary
    log ""
    log "=== INDEX LINTING SUMMARY ==="
    log "Total dev files: $TOTAL_FILES"
    if [ $MISSING_FILES -gt 0 ]; then
        error "Missing from index: $MISSING_FILES"
    else
        success "All dev files are indexed"
    fi
    if [ $EXTRA_FILES -gt 0 ]; then
        warning "Extra files in index: $EXTRA_FILES"
    else
        success "No extra files in index"
    fi
    
    if [ $MISSING_FILES -eq 0 ] && [ $EXTRA_FILES -eq 0 ]; then
        success "Index is complete and accurate!"
        exit 0
    else
        error "Index has issues. Check the log for details."
        exit 1
    fi
}

# Run main function
lint_index "$@"
