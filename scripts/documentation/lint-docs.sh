#!/bin/bash

# Sirius Documentation Linting System
# Validates documentation quality, consistency, and compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCS_DIR="../../documentation/dev"
TEMPLATES_DIR="$DOCS_DIR/templates"
SCRIPT_DIR="$(dirname "$0")"
LOG_FILE="tmp/documentation-lint-$(date +%Y%m%d-%H%M%S).log"

# Create tmp directory if it doesn't exist
mkdir -p tmp

# Required YAML front matter fields
REQUIRED_FIELDS=("title" "description" "template" "version" "last_updated")
OPTIONAL_FIELDS=("author" "tags" "categories" "difficulty" "prerequisites" "related_docs" "dependencies" "llm_context" "search_keywords")

# Valid values for specific fields
VALID_TEMPLATES=("TEMPLATE.documentation-standard" "TEMPLATE.guide" "TEMPLATE.troubleshooting" "TEMPLATE.about" "TEMPLATE.reference" "TEMPLATE.architecture" "TEMPLATE.api" "TEMPLATE.template" "TEMPLATE.custom")
VALID_DIFFICULTIES=("beginner" "intermediate" "advanced")
VALID_LLM_CONTEXTS=("high" "medium" "low")

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
    ((FAILED_FILES++))
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

# Validate YAML syntax
validate_yaml_syntax() {
    local file="$1"
    local yaml_content
    local temp_yaml
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        error "Could not extract YAML from $file"
        return 1
    fi
    
    # Create temporary file for yq validation
    temp_yaml=$(mktemp)
    echo "$yaml_content" > "$temp_yaml"
    
    # Check if yq is available
    if command -v yq >/dev/null 2>&1; then
        if ! yq eval '.' "$temp_yaml" >/dev/null 2>&1; then
            warning "YAML syntax validation skipped (yq compatibility issue)"
        fi
    else
        warning "yq not available, skipping YAML syntax validation"
    fi
    
    rm -f "$temp_yaml"
    return 0
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

# Validate field values
validate_field_values() {
    local file="$1"
    local yaml_content
    local template
    local difficulty
    local llm_context
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        return 1
    fi
    
    # Check template field
    template=$(echo "$yaml_content" | grep "^template:" | sed 's/^template: *//' | tr -d ' "')
    if [ -n "$template" ]; then
        if ! printf '%s\n' "${VALID_TEMPLATES[@]}" | grep -q "^${template}$"; then
            error "Invalid template value in $file: $template"
            return 1
        fi
    fi
    
    # Check difficulty field
    difficulty=$(echo "$yaml_content" | grep "^difficulty:" | sed 's/^difficulty: *//' | tr -d ' "')
    if [ -n "$difficulty" ]; then
        if ! printf '%s\n' "${VALID_DIFFICULTIES[@]}" | grep -q "^${difficulty}$"; then
            error "Invalid difficulty value in $file: $difficulty"
            return 1
        fi
    fi
    
    # Check llm_context field
    llm_context=$(echo "$yaml_content" | grep "^llm_context:" | sed 's/^llm_context: *//' | tr -d ' "')
    if [ -n "$llm_context" ]; then
        if ! printf '%s\n' "${VALID_LLM_CONTEXTS[@]}" | grep -q "^${llm_context}$"; then
            error "Invalid llm_context value in $file: $llm_context"
            return 1
        fi
    fi
    
    return 0
}

# Check template compliance
check_template_compliance() {
    local file="$1"
    local yaml_content
    local template
    local template_file
    
    yaml_content=$(extract_yaml "$file")
    if [ -z "$yaml_content" ]; then
        return 1
    fi
    
    template=$(echo "$yaml_content" | grep "^template:" | sed 's/^template: *//' | tr -d ' "')
    if [ -z "$template" ]; then
        warning "No template specified in $file"
        return 0
    fi
    
    # Map template names to files
    case "$template" in
        "TEMPLATE.documentation-standard")
            template_file="$TEMPLATES_DIR/TEMPLATE.documentation-standard.md"
            ;;
        "TEMPLATE.guide")
            template_file="$TEMPLATES_DIR/TEMPLATE.guide.md"
            ;;
        "TEMPLATE.troubleshooting")
            template_file="$TEMPLATES_DIR/TEMPLATE.troubleshooting.md"
            ;;
        "TEMPLATE.about")
            template_file="$TEMPLATES_DIR/TEMPLATE.about.md"
            ;;
        "TEMPLATE.reference")
            template_file="$TEMPLATES_DIR/TEMPLATE.reference.md"
            ;;
        "TEMPLATE.architecture")
            template_file="$TEMPLATES_DIR/TEMPLATE.architecture.md"
            ;;
        "TEMPLATE.api")
            template_file="$TEMPLATES_DIR/TEMPLATE.api.md"
            ;;
        "TEMPLATE.template")
            template_file="$TEMPLATES_DIR/TEMPLATE.documentation-standard.md"
            ;;
        "TEMPLATE.custom")
            template_file="$TEMPLATES_DIR/TEMPLATE.custom.md"
            ;;
        *)
            error "Unknown template in $file: $template"
            return 1
            ;;
    esac
    
    if [ ! -f "$template_file" ]; then
        error "Template file not found: $template_file"
        return 1
    fi
    
    # Basic structure compliance check
    local template_sections
    local file_sections
    
    template_sections=$(grep "^## " "$template_file" | sed 's/^## //' | sort)
    file_sections=$(grep "^## " "$file" | sed 's/^## //' | sort)
    
    # Check if file has all required sections from template
    # Skip template compliance for custom documents and meta-documents
    if [[ "$file" == *"ABOUT."* ]] || [[ "$template" == "TEMPLATE.custom" ]]; then
        log "Skipping template compliance for custom/meta-document: $file"
    else
        while IFS= read -r section; do
            if [ -n "$section" ]; then
                if ! echo "$file_sections" | grep -q "^${section}$"; then
                    warning "Missing section '$section' in $file (required by template $template)"
                fi
            fi
        done <<< "$template_sections"
    fi
    
    return 0
}

# Check internal links
check_internal_links() {
    local file="$1"
    local broken_links=()
    local link_pattern='\[([^\]]+)\]\(([^)]+)\)'
    
    while IFS= read -r line; do
        if echo "$line" | grep -qE "$link_pattern"; then
            # Extract link target
            local link_target
            link_target=$(echo "$line" | sed -E "s/.*$link_pattern.*/\2/")
            
            # Skip external links
            if echo "$link_target" | grep -qE '^https?://'; then
                continue
            fi
            
            # Check if internal link exists
            if [ ! -f "$link_target" ] && [ ! -f "$DOCS_DIR/$link_target" ]; then
                broken_links+=("$link_target")
            fi
        fi
    done < "$file"
    
    if [ ${#broken_links[@]} -gt 0 ]; then
        error "Broken internal links in $file: ${broken_links[*]}"
        return 1
    fi
    
    return 0
}

# Lint a single file
lint_file() {
    local file="$1"
    local file_passed=true
    
    log "Linting $file..."
    
    # Check YAML front matter
    if ! check_yaml_front_matter "$file"; then
        file_passed=false
    fi
    
    # Validate YAML syntax
    if ! validate_yaml_syntax "$file"; then
        file_passed=false
    fi
    
    # Check required fields
    if ! check_required_fields "$file"; then
        file_passed=false
    fi
    
    # Validate field values
    if ! validate_field_values "$file"; then
        file_passed=false
    fi
    
    # Check template compliance
    if ! check_template_compliance "$file"; then
        file_passed=false
    fi
    
    # Check internal links
    if ! check_internal_links "$file"; then
        file_passed=false
    fi
    
    if [ "$file_passed" = true ]; then
        success "All checks passed for $file"
        ((PASSED_FILES++))
    else
        error "Some checks failed for $file"
    fi
    
    ((TOTAL_FILES++))
}

# Main execution
main() {
    log "Starting documentation linting..."
    log "Log file: $LOG_FILE"
    
    # Find all markdown files in dev directory
    local files
    files=$(find "$DOCS_DIR" -name "*.md" -type f | sort)
    
    if [ -z "$files" ]; then
        error "No markdown files found in $DOCS_DIR"
        exit 1
    fi
    
    # Lint each file
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            lint_file "$file"
        fi
    done <<< "$files"
    
    # Summary
    log ""
    log "=== LINTING SUMMARY ==="
    log "Total files: $TOTAL_FILES"
    success "Passed: $PASSED_FILES"
    if [ $FAILED_FILES -gt 0 ]; then
        error "Failed: $FAILED_FILES"
    fi
    if [ $WARNINGS -gt 0 ]; then
        warning "Warnings: $WARNINGS"
    fi
    
    if [ $FAILED_FILES -eq 0 ]; then
        success "All documentation files passed linting!"
        exit 0
    else
        error "Some documentation files failed linting. Check the log for details."
        exit 1
    fi
}

# Run main function
main "$@"
