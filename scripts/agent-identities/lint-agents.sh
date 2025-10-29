#!/bin/bash

# Sirius Agent Identity Linting System
# Validates agent identity quality, consistency, and compliance

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
LOG_FILE="tmp/agent-lint-$(date +%Y%m%d-%H%M%S).log"

# Create tmp directory if it doesn't exist
mkdir -p tmp

# Required YAML front matter fields
REQUIRED_FIELDS=("name" "title" "description" "role_type" "version" "last_updated" "llm_context" "context_window_target")
OPTIONAL_FIELDS=("author" "specialization" "technology_stack" "system_integration_level" "categories" "tags" "related_docs" "dependencies")

# Valid values for specific fields
VALID_ROLE_TYPES=("engineering" "design" "product" "operations" "qa" "documentation")
VALID_LLM_CONTEXTS=("high" "medium" "low")
VALID_INTEGRATION_LEVELS=("none" "low" "medium" "high")

# Length constraints
MIN_LINES=150
MAX_LINES=500
TARGET_MIN=200
TARGET_MAX=400

# Counters
TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0
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
}

# Check if file has YAML front matter
check_yaml_front_matter() {
    local file="$1"
    local has_yaml=false
    
    if head -n 1 "$file" | grep -q "^---$"; then
        has_yaml=true
    fi
    
    if [ "$has_yaml" = false ]; then
        error "Missing YAML front matter in $file"
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

# Check required fields
check_required_fields() {
    local file="$1"
    local yaml_content
    local missing_fields=()
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        return 1
    fi
    
    for field in "${REQUIRED_FIELDS[@]}"; do
        if ! echo "$yaml_content" | grep -q "^${field}:"; then
            missing_fields+=("$field")
        fi
    done
    
    if [ ${#missing_fields[@]} -gt 0 ]; then
        error "Missing required fields in $file: ${missing_fields[*]}"
        return 1
    fi
    
    return 0
}

# Validate enumerated field values
validate_enum_fields() {
    local file="$1"
    local yaml_content
    local errors=0
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        return 1
    fi
    
    # Check role_type
    local role_type=$(echo "$yaml_content" | grep "^role_type:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"')
    if [ -n "$role_type" ]; then
        local valid=false
        for valid_type in "${VALID_ROLE_TYPES[@]}"; do
            if [ "$role_type" = "$valid_type" ]; then
                valid=true
                break
            fi
        done
        if [ "$valid" = false ]; then
            error "Invalid role_type '$role_type' in $file. Must be one of: ${VALID_ROLE_TYPES[*]}"
            ((errors++))
        fi
    fi
    
    # Check llm_context
    local llm_context=$(echo "$yaml_content" | grep "^llm_context:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"')
    if [ -n "$llm_context" ]; then
        local valid=false
        for valid_ctx in "${VALID_LLM_CONTEXTS[@]}"; do
            if [ "$llm_context" = "$valid_ctx" ]; then
                valid=true
                break
            fi
        done
        if [ "$valid" = false ]; then
            error "Invalid llm_context '$llm_context' in $file. Must be one of: ${VALID_LLM_CONTEXTS[*]}"
            ((errors++))
        fi
    fi
    
    # Check system_integration_level (optional)
    local integration_level=$(echo "$yaml_content" | grep "^system_integration_level:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"')
    if [ -n "$integration_level" ]; then
        local valid=false
        for valid_level in "${VALID_INTEGRATION_LEVELS[@]}"; do
            if [ "$integration_level" = "$valid_level" ]; then
                valid=true
                break
            fi
        done
        if [ "$valid" = false ]; then
            error "Invalid system_integration_level '$integration_level' in $file. Must be one of: ${VALID_INTEGRATION_LEVELS[*]}"
            ((errors++))
        fi
    fi
    
    return $errors
}

# Validate version format (semver)
validate_version() {
    local file="$1"
    local yaml_content
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        return 1
    fi
    
    local version=$(echo "$yaml_content" | grep "^version:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"')
    if [ -n "$version" ]; then
        if ! echo "$version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
            error "Invalid version format '$version' in $file. Must be semver (e.g., 1.0.0)"
            return 1
        fi
    fi
    
    return 0
}

# Validate date format (ISO 8601)
validate_date() {
    local file="$1"
    local yaml_content
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        return 1
    fi
    
    local date=$(echo "$yaml_content" | grep "^last_updated:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"')
    if [ -n "$date" ]; then
        if ! echo "$date" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
            error "Invalid date format '$date' in $file. Must be YYYY-MM-DD"
            return 1
        fi
    fi
    
    return 0
}

# Check length constraints
check_length() {
    local file="$1"
    local line_count=$(wc -l < "$file")
    
    if [ $line_count -lt $MIN_LINES ]; then
        error "File $file is too short ($line_count lines). Minimum: $MIN_LINES"
        return 1
    elif [ $line_count -gt $MAX_LINES ]; then
        error "File $file is too long ($line_count lines). Maximum: $MAX_LINES"
        return 1
    elif [ $line_count -lt $TARGET_MIN ] || [ $line_count -gt $TARGET_MAX ]; then
        warning "File $file length ($line_count lines) outside target range ($TARGET_MIN-$TARGET_MAX)"
    fi
    
    return 0
}

# Check context window target
check_context_target() {
    local file="$1"
    local yaml_content
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        return 1
    fi
    
    local target=$(echo "$yaml_content" | grep "^context_window_target:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"')
    if [ -n "$target" ]; then
        # Only check if it's a valid integer
        if [[ "$target" =~ ^[0-9]+$ ]]; then
            if [ "$target" -lt $MIN_LINES ] || [ "$target" -gt $MAX_LINES ]; then
                warning "context_window_target $target in $file outside valid range ($MIN_LINES-$MAX_LINES)"
            fi
        fi
    fi
    
    return 0
}

# Validate file naming
check_filename() {
    local file="$1"
    local basename=$(basename "$file")
    
    if ! echo "$basename" | grep -qE '^[a-z0-9-]+\.agent\.md$'; then
        error "Invalid filename format: $basename. Must match [a-z0-9-]+.agent.md"
        return 1
    fi
    
    return 0
}

# Main validation function
validate_file() {
    local file="$1"
    local file_errors=0
    
    log "Validating $file..."
    
    # Check filename format
    if ! check_filename "$file"; then
        ((file_errors++))
    fi
    
    # Check YAML front matter exists
    if ! check_yaml_front_matter "$file"; then
        ((file_errors++))
        return 1  # Can't continue without YAML
    fi
    
    # Check required fields
    if ! check_required_fields "$file"; then
        ((file_errors++))
    fi
    
    # Validate enum fields
    if ! validate_enum_fields "$file"; then
        ((file_errors++))
    fi
    
    # Validate version format
    if ! validate_version "$file"; then
        ((file_errors++))
    fi
    
    # Validate date format
    if ! validate_date "$file"; then
        ((file_errors++))
    fi
    
    # Check length constraints
    if ! check_length "$file"; then
        ((file_errors++))
    fi
    
    # Check context window target
    check_context_target "$file"
    
    if [ $file_errors -eq 0 ]; then
        success "$(basename $file) passed validation"
        return 0
    else
        error "$(basename $file) failed validation with $file_errors error(s)"
        return 1
    fi
}

# Main script
log "Starting agent identity validation..."
log "Agents directory: $AGENTS_DIR"
log "=================================================="

# Find all agent files
for file in "$AGENTS_DIR"/*.agent.md; do
    if [ -f "$file" ]; then
        ((TOTAL_FILES++))
        if validate_file "$file"; then
            ((PASSED_FILES++))
        else
            ((FAILED_FILES++))
        fi
        echo ""
    fi
done

# Summary
log "=================================================="
log "Validation Summary:"
log "  Total files: $TOTAL_FILES"
log "  Passed: $PASSED_FILES"
log "  Failed: $FAILED_FILES"
log "  Warnings: $WARNINGS"
log "=================================================="

if [ $FAILED_FILES -eq 0 ]; then
    success "All agent identities passed validation!"
    if [ $WARNINGS -gt 0 ]; then
        warning "Validation passed with $WARNINGS warning(s)"
        exit 0
    fi
    exit 0
else
    error "Validation failed for $FAILED_FILES agent identit(y|ies)"
    exit 1
fi

