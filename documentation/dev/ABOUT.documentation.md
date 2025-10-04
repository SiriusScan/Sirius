---
title: "About Sirius Documentation"
description: "A comprehensive guide to the Sirius project's documentation system, including standards, conventions, and best practices for creating and maintaining high-quality, machine-readable documentation."
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-01-03"
author: "AI Assistant"
tags:
  ["documentation", "standards", "guidelines", "llm-friendly", "best-practices"]
categories: ["project-management", "development"]
difficulty: "beginner"
prerequisites: []
related_docs:
  - "README.documentation-index.md"
  - "TEMPLATE.documentation-standard.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "documentation standards",
    "llm documentation",
    "markdown conventions",
    "sirius docs",
  ]
---

# ABOUT Documentation

> **📚 Documentation Index**: For a complete list of all documentation files, see [README.documentation-index.md](../README.documentation-index.md)

## Purpose

This document defines the documentation standards, conventions, and processes for the Sirius project. It serves as the definitive guide for anyone creating, maintaining, or using documentation within our ecosystem, with special emphasis on LLM-consumable structure and machine readability.

## When to Use This Guide

- **Before creating any new documentation** - Understand our standards first
- **When updating existing documentation** - Ensure consistency with our conventions
- **When troubleshooting documentation issues** - Reference our established patterns
- **During code reviews** - Verify documentation meets our standards
- **When onboarding new team members** - Provide clear documentation guidelines
- **For LLM context building** - Ensure documentation is optimally structured for AI consumption

## How to Use This Guide

1. **Start with the documentation index** - Review [README.documentation-index.md](../README.documentation-index.md) to see all available documentation
2. **Read the Lexicon** - Understand our naming conventions and terminology
3. **Review File Types** - Know which template to use for different documentation needs
4. **Follow the Standards** - Use our template structure for consistency
5. **Add Front Matter** - Include YAML metadata for machine readability
6. **Link Documents** - Establish relationships between related documentation
7. **Update as Needed** - Keep this guide current with project evolution

## What This Documentation System Is

### Core Philosophy

Our documentation system is designed around **layered information architecture** where the most critical information appears first, followed by increasingly detailed technical content. This ensures that users can quickly find what they need without wading through irrelevant details.

**LLM Optimization**: Every document is structured to provide maximum context to Large Language Models, with clear metadata, relationships, and machine-readable front matter.

### File Naming Conventions

#### Lexicon of File Types

| File Type           | Prefix             | Purpose                              | Example                              | Template Used                   |
| ------------------- | ------------------ | ------------------------------------ | ------------------------------------ | ------------------------------- |
| **ABOUT**           | `ABOUT.`           | Explains how to use documentation    | `ABOUT.documentation.md`             | TEMPLATE.about                  |
| **TEMPLATE**        | `TEMPLATE.`        | Defines structure for document types | `TEMPLATE.documentation-standard.md` | TEMPLATE.template               |
| **README**          | `README.`          | Primary documentation for a topic    | `README.container-testing.md`        | TEMPLATE.documentation-standard |
| **GUIDE**           | `GUIDE.`           | Step-by-step instructions            | `GUIDE.deployment.md`                | TEMPLATE.guide                  |
| **REFERENCE**       | `REFERENCE.`       | Technical specifications             | `REFERENCE.api-endpoints.md`         | TEMPLATE.reference              |
| **TROUBLESHOOTING** | `TROUBLESHOOTING.` | Problem-solving focused              | `TROUBLESHOOTING.docker-issues.md`   | TEMPLATE.troubleshooting        |
| **ARCHITECTURE**    | `ARCHITECTURE.`    | System design and structure          | `ARCHITECTURE.system-overview.md`    | TEMPLATE.architecture           |
| **API**             | `API.`             | API documentation and specifications | `API.endpoints.md`                   | TEMPLATE.api                    |

#### Naming Rules

1. **All prefixes are fully capitalized** (ABOUT, TEMPLATE, README, etc.)
2. **Descriptive suffixes** use kebab-case (container-testing, api-endpoints)
3. **File extensions** are always `.md` for Markdown files
4. **No spaces** in filenames - use hyphens instead
5. **Version suffixes** for multiple versions (e.g., `README.deployment-v2.md`)

### Directory Structure

```
documentation/
├── dev/                              # Development documentation
│   ├── ABOUT.documentation.md        # This file
│   ├── templates/                    # Document templates
│   │   ├── TEMPLATE.about.md
│   │   ├── TEMPLATE.documentation-standard.md
│   │   ├── TEMPLATE.guide.md
│   │   ├── TEMPLATE.reference.md
│   │   ├── TEMPLATE.troubleshooting.md
│   │   ├── TEMPLATE.architecture.md
│   │   └── TEMPLATE.api.md
│   ├── architecture/                 # System architecture docs
│   │   ├── ARCHITECTURE.system-overview.md
│   │   └── ARCHITECTURE.data-flow.md
│   ├── operations/                   # Operations documentation
│   │   ├── README.git-operations.md
│   │   └── README.terraform-deployment.md
│   ├── test/                         # Testing documentation
│   │   ├── README.container-testing.md
│   │   └── GUIDE.testing-workflows.md
│   ├── api/                          # API documentation
│   │   ├── API.endpoints.md
│   │   └── REFERENCE.api-specs.md
│   └── dev-notes/                    # Development notes
│       ├── TROUBLESHOOTING.docker-issues.md
│       └── GUIDE.development-setup.md
├── production/                       # Production documentation
│   ├── README.deployment.md
│   ├── GUIDE.monitoring.md
│   └── TROUBLESHOOTING.production-issues.md
├── user/                            # End-user documentation
│   ├── GUIDE.getting-started.md
│   └── GUIDE.user-workflows.md
└── archive/                         # Historical documentation
    └── README.legacy-systems.md
```

### YAML Front Matter Standards

Every documentation file MUST include YAML front matter for machine readability:

```yaml
---
title: "Document Title"
description: "Brief description of the document's purpose"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Document Author"
tags: ["docker", "testing", "containers"]
categories: ["development", "testing"]
difficulty: "intermediate"
prerequisites: ["docker", "make"]
related_docs:
  - "README.deployment.md"
  - "GUIDE.docker-setup.md"
dependencies:
  - "docker-compose.yaml"
  - "testing/scripts/"
llm_context: "high"
search_keywords: ["container", "testing", "docker", "health-check"]
---
```

#### Front Matter Fields

| Field             | Required | Description                      | Example                                  |
| ----------------- | -------- | -------------------------------- | ---------------------------------------- |
| `title`           | ✅       | Human-readable document title    | "Container Testing"                      |
| `description`     | ✅       | Brief purpose description        | "Comprehensive container testing system" |
| `template`        | ✅       | Template used to create document | "TEMPLATE.documentation-standard"        |
| `version`         | ✅       | Document version                 | "1.0.0"                                  |
| `last_updated`    | ✅       | Last modification date           | "2025-01-03"                             |
| `author`          | ❌       | Document author                  | "Development Team"                       |
| `tags`            | ❌       | Searchable tags                  | ["docker", "testing"]                    |
| `categories`      | ❌       | Document categories              | ["development", "testing"]               |
| `difficulty`      | ❌       | Complexity level                 | "beginner", "intermediate", "advanced"   |
| `prerequisites`   | ❌       | Required knowledge               | ["docker", "make"]                       |
| `related_docs`    | ❌       | Related documentation            | ["README.deployment.md"]                 |
| `dependencies`    | ❌       | Required files/systems           | ["docker-compose.yaml"]                  |
| `llm_context`     | ❌       | LLM relevance level              | "high", "medium", "low"                  |
| `search_keywords` | ❌       | Search optimization              | ["container", "testing"]                 |

### Document Structure Standards

Every documentation file follows our **Standard Documentation Template**:

1. **YAML Front Matter** - Machine-readable metadata
2. **Purpose** - What this document is for
3. **When to Use** - When to reference this document
4. **How to Use** - How to apply the information
5. **What It Is** - Detailed technical content
6. **Troubleshooting** - Problem-solving section
   - **FAQ** - Frequently asked questions
   - **Command Reference** - Common commands
   - **Lessons Learned** - Timestamped insights
7. **Related Documentation** - Links to related docs
8. **LLM Context** - Additional context for AI systems

### Content Guidelines

#### Writing Style

- **Clear and Concise** - Get to the point quickly
- **Technical Accuracy** - Verify all technical details
- **Consistent Terminology** - Use our established lexicon
- **Actionable Content** - Provide specific steps, not vague guidance
- **LLM-Friendly** - Structure content for AI consumption

#### Information Layering

1. **Executive Summary** - High-level overview (2-3 sentences)
2. **Quick Reference** - Essential information for immediate use
3. **Detailed Content** - Comprehensive technical details
4. **Reference Material** - Commands, examples, troubleshooting
5. **LLM Context** - Additional context for AI systems

#### Code Examples

- **Always include working examples**
- **Use syntax highlighting** for code blocks
- **Provide context** for complex examples
- **Test examples** before including them
- **Include expected outputs** for verification

### Template System

#### Template Files

Template files define the structure for specific types of documentation. They serve as:

- **Consistency enforcers** - Ensure all docs follow the same pattern
- **Quality checklists** - Remind authors of required sections
- **Onboarding tools** - Help new contributors understand expectations
- **LLM context builders** - Provide structured context for AI systems

#### Template Types

1. **TEMPLATE.about** - For ABOUT documents
2. **TEMPLATE.documentation-standard** - For README documents
3. **TEMPLATE.guide** - For step-by-step guides
4. **TEMPLATE.reference** - For technical specifications
5. **TEMPLATE.troubleshooting** - For problem-solving docs
6. **TEMPLATE.architecture** - For system design docs
7. **TEMPLATE.api** - For API documentation

#### Using Templates

1. **Copy the appropriate template** for your document type
2. **Fill in YAML front matter** with complete metadata
3. **Fill in each section** according to the template structure
4. **Add LLM context** where appropriate
5. **Link related documentation** in the front matter
6. **Review against the template** before finalizing

### Document Relationships

#### Linking Strategy

- **Front Matter Links** - Use `related_docs` for primary relationships
- **Inline Links** - Use markdown links for specific references
- **Cross-References** - Link to specific sections when relevant
- **Dependency Tracking** - Use `dependencies` field for required files

#### Relationship Types

1. **Prerequisites** - Documents that should be read first
2. **Related Topics** - Documents covering similar subjects
3. **Dependencies** - Documents that depend on this one
4. **References** - Documents that reference this one
5. **Troubleshooting** - Documents that help solve problems

### LLM Optimization

#### Context Building

- **Rich Metadata** - Comprehensive front matter for AI understanding
- **Structured Content** - Consistent sections for predictable parsing
- **Clear Relationships** - Document links for context building
- **Search Keywords** - Optimized for AI search and retrieval

#### AI-Friendly Features

- **Consistent Formatting** - Predictable structure for parsing
- **Rich Descriptions** - Detailed explanations for AI understanding
- **Code Examples** - Working examples with expected outputs
- **Troubleshooting** - Comprehensive problem-solving information

### Maintenance Standards

#### Update Triggers

Documentation should be updated when:

- **New features are added** - Document new functionality
- **Bugs are fixed** - Update troubleshooting sections
- **Processes change** - Reflect new workflows
- **Issues are discovered** - Add to FAQ or lessons learned
- **Dependencies change** - Update related document links

#### Review Process

1. **Technical accuracy** - Verify all technical details
2. **Completeness** - Ensure all required sections are present
3. **Clarity** - Check for clear, understandable language
4. **Consistency** - Verify adherence to our standards
5. **LLM Readability** - Ensure AI-friendly structure
6. **Link Validation** - Verify all links are working

### Quality Assurance

#### Pre-Publication Checklist

- [ ] YAML front matter complete and accurate
- [ ] Follows appropriate template structure
- [ ] All code examples tested and working
- [ ] Technical details verified for accuracy
- [ ] Spelling and grammar checked
- [ ] Links and references validated
- [ ] Consistent with project terminology
- [ ] LLM context optimized
- [ ] Related documents linked

#### Post-Publication

- **Monitor usage** - Track which sections are referenced most
- **Collect feedback** - Note areas that need clarification
- **Update regularly** - Keep content current with project evolution
- **LLM Performance** - Monitor AI system usage and effectiveness

## Troubleshooting

### FAQ

**Q: Which template should I use for a new document?**
A: Check the template mapping in the File Types table. Most documents use `TEMPLATE.documentation-standard`, but specialized templates exist for specific document types.

**Q: How detailed should the YAML front matter be?**
A: Include all required fields and as many optional fields as relevant. More metadata improves LLM context and searchability.

**Q: What if I need to deviate from the standard template?**
A: Document the deviation in the document itself, update the front matter accordingly, and consider whether a new template is needed.

**Q: How do I establish document relationships?**
A: Use the `related_docs` field in front matter for primary relationships and inline markdown links for specific references.

**Q: What's the difference between tags and categories?**
A: Tags are specific keywords for search, categories are broader groupings for organization and navigation.

**Q: How often should I update the FAQ section?**
A: Update it every time you encounter a new question or problem related to the document's topic.

**Q: What's the purpose of the LLM context field?**
A: It helps AI systems understand the document's relevance and importance for different types of queries and tasks.

**Q: How do I handle version-specific information?**
A: Include version information in the front matter and clearly mark version-specific sections in the content.

**Q: What if I find an error in existing documentation?**
A: Fix it immediately, update the version number, and add an entry to the "Lessons Learned" section.

### Command Reference

```bash
# Create new documentation from template
cp documentation/dev/templates/TEMPLATE.documentation-standard.md documentation/new-doc.md

# Validate YAML front matter
yamllint documentation/*.md

# Validate Markdown syntax
markdownlint documentation/*.md

# Check for broken links
markdown-link-check documentation/*.md

# Generate table of contents
doctoc documentation/README.container-testing.md

# Search documentation by tags
grep -r "tags:" documentation/ | grep "docker"

# Find documents by category
grep -r "categories:" documentation/ | grep "testing"

# Extract LLM context documents
grep -r "llm_context: high" documentation/

# Validate document relationships
grep -r "related_docs:" documentation/

# Check template usage
grep -r "template:" documentation/
```

### Common Issues and Solutions

| Issue                 | Symptoms                           | Solution                                                |
| --------------------- | ---------------------------------- | ------------------------------------------------------- |
| Missing front matter  | No YAML metadata at document top   | Add complete YAML front matter with required fields     |
| Broken links          | 404 errors in related documents    | Update link paths and validate with markdown-link-check |
| Template mismatch     | Document doesn't follow template   | Compare document structure with specified template      |
| Missing relationships | No related_docs in front matter    | Add related_docs field with relevant document links     |
| Inconsistent tags     | Tags don't follow conventions      | Standardize tags using established tag vocabulary       |
| Outdated metadata     | Last_updated doesn't match content | Update last_updated field when making changes           |

### Debugging Steps

1. **Check front matter**: Verify YAML syntax and required fields
2. **Validate template usage**: Compare document structure with template
3. **Test links**: Use markdown-link-check to find broken links
4. **Verify relationships**: Check that related_docs links are valid
5. **Review LLM context**: Ensure content is optimized for AI consumption
6. **Check consistency**: Verify terminology and formatting standards

### Log Analysis

**Front Matter Validation**:

```bash
# Check for missing required fields
grep -L "title:" documentation/*.md
grep -L "template:" documentation/*.md

# Validate YAML syntax
find documentation/ -name "*.md" -exec head -20 {} \; | grep -A 20 "^---"
```

**Link Validation**:

```bash
# Check for broken internal links
grep -r "\[.*\](" documentation/ | grep -v "http"

# Validate related_docs links
grep -r "related_docs:" documentation/ | cut -d: -f3
```

**Template Usage**:

```bash
# Check template compliance
grep -r "template:" documentation/ | cut -d: -f3 | sort | uniq -c
```

### Performance Troubleshooting

**LLM Context Optimization**:

- Ensure rich metadata in front matter
- Use consistent structure across documents
- Include comprehensive troubleshooting information
- Maintain up-to-date relationships

**Search Optimization**:

- Use descriptive tags and keywords
- Include relevant categories
- Maintain consistent terminology
- Update search_keywords regularly

### Lessons Learned

**2025-01-03**: Established comprehensive documentation standards with LLM optimization. Key insight: YAML front matter and structured relationships significantly improve AI system effectiveness.

**2025-01-03**: Created template system with specialized templates for different document types. Lesson: Specialized templates improve consistency and reduce cognitive load for authors.

**2025-01-03**: Implemented document relationship tracking through front matter. Benefit: Enables AI systems to build comprehensive context and understand document dependencies.

**2025-01-03**: Added LLM-specific optimization features including context levels and search keywords. Advantage: Improves AI system performance and document discoverability.

---

_This document is the foundation of our documentation system. Keep it updated as our standards evolve._
