#!/bin/bash

# Sirius Agent Identity Quick Linting
# Fast validation for CI/CD - checks only critical items

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AGENTS_DIR="../../.cursor/agents"
SCRIPT_DIR="$(dirname "$0")"

# Required YAML front matter fields
REQUIRED_FIELDS=("name" "title" "description" "role_type" "version" "last_updated" "llm_context" "context_window_target")

# Length constraints
MIN_LINES=150
MAX_LINES=500

# Counters
TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0

# Functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if file has YAML front matter
check_yaml_front_matter() {
    local file="$1"
    
    if ! head -n 1 "$file" | grep -q "^---$"; then
        error "Missing YAML front matter in $(basename $file)"
        return 1
    fi
    
    return 0
}

# Extract YAML front matter
extract_yaml() {
    local file="$1"
    local yaml_start=0
    local yaml_end=0
    local line_num=0
    
    while IFS= read -r line; do
        ((line_num++))
        if [ "$line" = "---" ]; then
            if [ $yaml_start -eq 0 ]; then
                yaml_start=$line_num
            else
                yaml_end=$line_num
                break
            fi
        fi
    done < "$file"
    
    if [ $yaml_start -gt 0 ] && [ $yaml_end -gt 0 ]; then
        sed -n "${yaml_start},${yaml_end}p" "$file"
    fi
}

# Quick check required fields
check_required_fields() {
    local file="$1"
    local yaml_content
    local missing_fields=()
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        error "Could not extract YAML from $(basename $file)"
        return 1
    fi
    
    for field in "${REQUIRED_FIELDS[@]}"; do
        if ! echo "$yaml_content" | grep -q "^${field}:"; then
            missing_fields+=("$field")
        fi
    done
    
    if [ ${#missing_fields[@]} -gt 0 ]; then
        error "Missing fields in $(basename $file): ${missing_fields[*]}"
        return 1
    fi
    
    return 0
}

# Quick length check
check_length() {
    local file="$1"
    local line_count=$(wc -l < "$file")
    
    if [ $line_count -lt $MIN_LINES ] || [ $line_count -gt $MAX_LINES ]; then
        error "$(basename $file) length ($line_count) outside valid range ($MIN_LINES-$MAX_LINES)"
        return 1
    fi
    
    return 0
}

# Quick validation
quick_validate() {
    local file="$1"
    local errors=0
    
    if ! check_yaml_front_matter "$file"; then
        ((errors++))
    fi
    
    if ! check_required_fields "$file"; then
        ((errors++))
    fi
    
    if ! check_length "$file"; then
        ((errors++))
    fi
    
    return $errors
}

# Main script
log "Quick agent identity validation..."

# Find all agent files
for file in "$AGENTS_DIR"/*.agent.md; do
    if [ -f "$file" ]; then
        ((TOTAL_FILES++))
        if quick_validate "$file"; then
            ((PASSED_FILES++))
        else
            ((FAILED_FILES++))
        fi
    fi
done

# Summary
echo ""
log "Quick Validation Summary: $PASSED_FILES/$TOTAL_FILES passed"

if [ $FAILED_FILES -eq 0 ]; then
    success "Quick validation passed!"
    exit 0
else
    error "Quick validation failed for $FAILED_FILES file(s)"
    exit 1
fi


