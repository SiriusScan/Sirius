---
title: "Documentation Testing"
description: "Comprehensive documentation testing system for Sirius project, providing automated validation of documentation quality, structure, and completeness using specialized linters."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["documentation", "testing", "linting", "validation", "quality"]
categories: ["development", "testing", "documentation"]
difficulty: "intermediate"
prerequisites: ["markdown", "yaml", "bash"]
related_docs:
  - "README.container-testing.md"
  - "ABOUT.documentation.md"
dependencies:
  - "scripts/documentation/"
  - "testing/Makefile"
llm_context: "high"
search_keywords:
  ["documentation", "testing", "linting", "validation", "yaml", "markdown"]
---

# Documentation Testing

## Purpose

This document describes the comprehensive documentation testing system for the Sirius project, providing automated validation of documentation quality, structure, and completeness. It serves as the definitive guide for developers and technical writers who need to ensure documentation meets our standards and is optimized for LLM consumption.

## When to Use

- **Before committing documentation changes** - Validate that all documentation meets our standards
- **During documentation reviews** - Ensure consistency and completeness across all docs
- **When creating new documentation** - Verify proper structure and metadata
- **In CI/CD pipelines** - Automated validation of documentation quality
- **When troubleshooting documentation issues** - Use linters to identify specific problems
- **For LLM optimization** - Ensure documentation is properly structured for AI consumption

## How to Use

### Quick Start

```bash
# Navigate to container testing directory
cd testing/container-testing

# Run complete documentation testing
make lint-docs

# Run quick documentation checks
make lint-docs-quick

# Check documentation index completeness
make lint-index

# Run all validation including documentation
make validate-all
```

### Prerequisites

- Bash shell environment
- `yq` utility (for full YAML validation)
- `grep`, `sed`, `awk` (standard Unix tools)
- Make utility
- Git (for pre-commit hooks)

### Step-by-Step Process

1. **Navigate to container testing directory**: `cd /path/to/Sirius/testing/container-testing`
2. **Run quick checks**: `make lint-docs-quick` for basic validation
3. **Run full linting**: `make lint-docs` for comprehensive validation
4. **Check index completeness**: `make lint-index` to verify all files are indexed
5. **Review results**: Check output and logs in `tmp/` directory

## What It Is

### Architecture Overview

The documentation testing system consists of three main components:

- **YAML Front Matter Validation**: Ensures all documents have complete and valid metadata
- **Template Compliance Checking**: Verifies documents follow their specified templates
- **Index Completeness Validation**: Ensures all documentation files are properly indexed

### Technical Details

#### YAML Front Matter Validation

**Purpose**: Ensures all documentation files have complete and valid YAML front matter.

**Components**:

- `scripts/documentation/lint-docs.sh` - Main validation script
- `scripts/documentation/lint-quick.sh` - Quick validation script
- Validates required and optional fields
- Checks field value validity

**Required Fields**:

- `title` - Human-readable document title
- `description` - Brief purpose description
- `template` - Template used to create document
- `version` - Document version
- `last_updated` - Last modification date

**Optional Fields**:

- `author` - Document author
- `tags` - Searchable tags
- `categories` - Document categories
- `difficulty` - Complexity level (beginner, intermediate, advanced)
- `prerequisites` - Required knowledge
- `related_docs` - Related documentation
- `dependencies` - Required files/systems
- `llm_context` - LLM relevance level (high, medium, low)
- `search_keywords` - Search optimization

**Validation Rules**:

- YAML syntax must be valid
- Required fields must be present
- Field values must match valid options
- Template references must exist
- Related documents must exist

#### Template Compliance Checking

**Purpose**: Verifies that documents follow their specified template structure.

**Components**:

- Template file parsing and section extraction
- Document section comparison
- Missing section detection
- Custom document support

**Supported Templates**:

- `TEMPLATE.documentation-standard` - Standard documentation
- `TEMPLATE.guide` - Step-by-step guides
- `TEMPLATE.troubleshooting` - Problem-solving docs
- `TEMPLATE.about` - About documents
- `TEMPLATE.reference` - Technical specifications
- `TEMPLATE.architecture` - System design docs
- `TEMPLATE.api` - API documentation
- `TEMPLATE.template` - Template documents
- `TEMPLATE.custom` - Custom documents (no compliance checking)

**Compliance Rules**:

- Documents must have all required sections from their template
- Section headings must match exactly
- Custom documents are exempt from compliance checking
- Meta-documents (ABOUT files) are exempt from compliance checking

#### Index Completeness Validation

**Purpose**: Ensures all documentation files are properly referenced in the documentation index.

**Components**:

- `scripts/documentation/lint-index.sh` - Index validation script
- File discovery in `documentation/dev/` directory
- Index parsing and link extraction
- Missing file detection
- Extra file detection

**Validation Rules**:

- All files in `dev/` must be referenced in the index
- All referenced files must exist in `dev/`
- No duplicate references allowed
- Footer links are excluded from validation

### Implementation Details

#### File Structure

```
scripts/documentation/
├── lint-docs.sh              # Full documentation linting
├── lint-quick.sh             # Quick documentation checks
└── lint-index.sh             # Index completeness validation

testing/
├── Makefile                  # Testing commands
└── tmp/                      # Linting logs and output
    ├── documentation-lint-*.log
    └── index-lint-*.log
```

#### Makefile Integration

The documentation testing system integrates with the testing Makefile:

```makefile
# Documentation testing targets
lint-docs: ../scripts/documentation/lint-docs.sh
lint-docs-quick: ../scripts/documentation/lint-quick.sh
lint-index: ../scripts/documentation/lint-index.sh

# Full validation including documentation
validate-all: build-all test-all lint-docs
```

#### Logging and Reporting

**Log Files**: All linting executions create timestamped log files in `tmp/`

- Format: `{lint_type}-{timestamp}.log`
- Contains: Full validation output, errors, warnings
- Retention: Logs are kept for troubleshooting

**Validation Results**: Each validation provides clear indicators:

- ✅ PASSED: Validation completed successfully
- ❌ FAILED: Validation failed with error details
- ⚠️ WARNING: Non-critical issues found
- Summary: Total files, passed, failed counts

#### Pre-commit Integration

**Pre-commit Hook**: `.git/hooks/pre-commit` runs documentation validation:

1. **Quick documentation linting** - Basic validation
2. **Index completeness check** - Ensures all files are indexed
3. **Build tests** - Validates system still works

**Hook Behavior**:

- Runs from project root or testing directory
- Fails commit if validation fails
- Provides clear error messages
- Suggests fixes for common issues

### Advanced Topics

#### Custom Validation Rules

**Environment Variables**:

```bash
export DOCS_DIR="../documentation/dev"     # Documentation directory
export TEMPLATES_DIR="../documentation/dev/templates"  # Templates directory
export LOG_LEVEL="debug"                   # Logging verbosity
```

**Custom Validation**:

```bash
# Run with custom documentation directory
DOCS_DIR="../custom-docs" make lint-docs

# Run with debug logging
LOG_LEVEL="debug" make lint-docs

# Run with custom template directory
TEMPLATES_DIR="../custom-templates" make lint-docs
```

#### Template Development

**Creating New Templates**:

1. **Copy base template**: `cp TEMPLATE.template.md TEMPLATE.new-type.md`
2. **Define structure**: Add required sections for new document type
3. **Update validation**: Add new template to `VALID_TEMPLATES` array
4. **Test validation**: Run `make lint-docs` to verify template works

**Template Requirements**:

- Must include YAML front matter
- Must define clear section structure
- Must be self-documenting
- Must follow naming conventions

#### LLM Optimization

**Context Building**:

- Rich metadata in front matter
- Consistent structure across documents
- Clear relationships between documents
- Comprehensive search keywords

**AI-Friendly Features**:

- Structured content for predictable parsing
- Detailed descriptions for AI understanding
- Working examples with expected outputs
- Comprehensive troubleshooting information

## Troubleshooting

### FAQ

**Q: Why do I get "Template file not found" warnings?**
A: The quick linter looks for template files in the wrong location. This is a known issue and doesn't affect functionality. Use `make lint-docs` for accurate validation.

**Q: Why does index linting fail with "Missing from index" errors?**
A: Some documentation files are not referenced in the documentation index. Add them to `documentation/README.documentation-index.md` or remove unused files.

**Q: How do I fix "Invalid difficulty value" errors?**
A: Difficulty must be one of: "beginner", "intermediate", "advanced". Check your YAML front matter for typos.

**Q: Why do I get "Missing section" warnings?**
A: Your document is missing required sections from its template. Compare your document structure with the template file.

**Q: How do I add a new document type?**
A: Create a new template file, add it to the validation system, and update the documentation index.

**Q: Why does pre-commit hook fail?**
A: Check the error messages in the terminal. Common issues include missing YAML front matter, invalid field values, or missing index entries.

**Q: How do I disable validation for a specific document?**
A: Use `TEMPLATE.custom` template type, which skips template compliance checking.

**Q: Can I run validation on specific files only?**
A: Modify the linting scripts to target specific files, or use grep to filter the file list.

### Command Reference

```bash
# Complete documentation validation
make lint-docs

# Quick documentation checks
make lint-docs-quick

# Index completeness validation
make lint-index

# Full system validation
make validate-all

# Manual script execution
../scripts/documentation/lint-docs.sh
../scripts/documentation/lint-quick.sh
../scripts/documentation/lint-index.sh

# Check specific validation
grep -r "template:" ../documentation/dev/
grep -r "llm_context: high" ../documentation/dev/
grep -r "difficulty:" ../documentation/dev/

# Debug validation issues
LOG_LEVEL=debug make lint-docs
tail -f tmp/documentation-lint-*.log
```

### Common Issues and Solutions

| Issue                | Symptoms                          | Solution                                            |
| -------------------- | --------------------------------- | --------------------------------------------------- |
| Missing front matter | "No YAML metadata" errors         | Add complete YAML front matter with required fields |
| Invalid field values | "Invalid difficulty value" errors | Check field values against valid options            |
| Template compliance  | "Missing section" warnings        | Compare document structure with template            |
| Index completeness   | "Missing from index" errors       | Add files to documentation index                    |
| Broken links         | "File not found" errors           | Fix file paths in related_docs                      |
| YAML syntax errors   | "YAML parse error" messages       | Fix YAML syntax in front matter                     |

### Debugging Steps

1. **Check log files**: Review timestamped logs in `tmp/` directory
2. **Run quick validation**: Use `make lint-docs-quick` for basic checks
3. **Validate YAML syntax**: Check front matter for syntax errors
4. **Compare with templates**: Ensure document follows template structure
5. **Check index entries**: Verify all files are properly indexed
6. **Test individual files**: Run validation on specific files

### Log Analysis

**Documentation Lint Logs**:

```bash
# View validation results
tail -f tmp/documentation-lint-*.log

# Check for specific errors
grep -i "error\|failed" tmp/documentation-lint-*.log

# Find warnings
grep -i "warning" tmp/documentation-lint-*.log
```

**Index Lint Logs**:

```bash
# View index validation results
cat tmp/index-lint-*.log

# Check missing files
grep "missing from index" tmp/index-lint-*.log

# Check extra files
grep "extra files in index" tmp/index-lint-*.log
```

### Performance Optimization

**Faster Validation**:

- Use `make lint-docs-quick` for development
- Run validation on specific files only
- Optimize template file parsing
- Cache validation results

**Resource Usage**:

- Monitor disk space for log files
- Clean up old log files regularly
- Use efficient file parsing methods
- Optimize regex patterns

### Lessons Learned

**2025-01-03**: Implemented comprehensive documentation testing system to ensure consistency and quality. Key insight: Automated validation prevents documentation drift and improves maintainability.

**2025-01-03**: Created template compliance checking with support for custom documents. Lesson: Flexibility is important for meta-documents and special cases.

**2025-01-03**: Established index completeness validation to ensure all documentation is discoverable. Benefit: Prevents orphaned documentation and improves navigation.

**2025-01-03**: Integrated documentation testing with pre-commit hooks for automated quality assurance. Advantage: Catches documentation issues before they reach the repository.

## LLM Context

[Additional context specifically for Large Language Models:]

- **Key Concepts**: Documentation testing involves YAML validation, template compliance, and index completeness to ensure documentation quality and consistency
- **Technical Context**: Uses shell scripts for automation, YAML parsing for metadata validation, and regex for content analysis. Tests cover 14 documentation files with 8 different templates
- **Common Patterns**: Layered validation approach (quick → full → index), automated cleanup, timestamped logging, pre-commit integration
- **Edge Cases**: Custom documents exempt from template compliance, meta-documents with unique structure, footer links excluded from index validation
- **Integration Points**: Connects with git hooks, CI/CD pipelines, development workflows, and documentation maintenance processes

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
