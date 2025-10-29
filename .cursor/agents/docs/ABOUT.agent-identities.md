---
title: "Agent Identity System"
description: "Comprehensive guide to the Sirius agent identity system for context shaping and role-based AI interactions"
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags: ["agent-identities", "ai-context", "role-based", "llm-optimization"]
categories: ["ai-tooling", "development"]
difficulty: "intermediate"
prerequisites:
  ["understanding of LLM context windows", "project structure knowledge"]
related_docs:
  - "TEMPLATE.agent-identity.md"
  - "SPECIFICATION.agent-identity.md"
  - "INDEX.agent-identities.md"
  - "GUIDE.creating-agent-identities.md"
dependencies: []
llm_context: "high"
search_keywords:
  ["agent identity", "ai context", "role definition", "agent engineering"]
---

# Agent Identity System

## Purpose

The Agent Identity System provides structured, role-specific context for AI interactions across the Sirius project. Each agent identity is a carefully crafted document that:

- **Defines role boundaries** - Clear scope and responsibilities
- **Provides essential context** - Key documentation, architecture, and patterns
- **Incentivizes fresh conversations** - Balanced detail enables confident restarts
- **Maintains programmatic integrity** - YAML front matter for automated validation
- **Adapts to all roles** - Universal template supports engineering, design, product, operations, and more

## Philosophy

### The Fresh Conversation Problem

Traditional AI interactions accumulate context over long conversations, creating dependency on conversation history. This leads to:

- **Context lock-in** - Reluctance to start fresh conversations
- **Context decay** - Important information lost in long threads
- **Inefficient context** - Mixing implementation details with role knowledge
- **Maintenance burden** - Conversations can't be validated or updated

### The Agent Identity Solution

Agent identities solve this by providing **portable, validated, maintainable context** that:

1. **Enables confident restarts** - All essential role information in 200-400 lines
2. **Stays current** - Automated validation and programmatic updates
3. **Scales to all roles** - Universal template adapts to diverse needs
4. **Integrates with documentation** - Links to comprehensive project docs

## When to Use Agent Identities

### Use Agent Identities For

- **Starting new conversations** - Fresh context for any project task
- **Role-specific work** - Focused expertise for specific domains
- **Onboarding** - Quick orientation for new team members or AI interactions
- **Context shaping** - Consistent, validated role definitions
- **Cross-role coordination** - Understanding responsibilities and interfaces

### Don't Use Agent Identities For

- **Implementation details** - Link to documentation instead
- **Temporary context** - Use conversation for one-off information
- **Project-specific state** - Use task files and project plans
- **Historical decisions** - Document in appropriate project docs

## How to Use This Guide

1. **Understand the system** - Read this document thoroughly
2. **Review the template** - Study [TEMPLATE.agent-identity.md](mdc:.cursor/agents/TEMPLATE.agent-identity.md)
3. **Check the specification** - Reference [SPECIFICATION.agent-identity.md](mdc:.cursor/agents/SPECIFICATION.agent-identity.md)
4. **Browse existing agents** - See [INDEX.agent-identities.md](mdc:.cursor/agents/INDEX.agent-identities.md)
5. **Create your agent** - Follow [GUIDE.creating-agent-identities.md](mdc:.cursor/agents/GUIDE.creating-agent-identities.md)
6. **Validate your work** - Run validation scripts before committing

## YAML Front Matter Standards

Every agent identity MUST include comprehensive YAML front matter for programmatic maintenance:

```yaml
---
name: "Agent Name"
title: "Full Title (Context)"
description: "One-line agent purpose"
role_type: "engineering|design|product|operations|qa|documentation"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Team/Person"
specialization: ["specific", "areas"]
technology_stack: ["tech1", "tech2"]
system_integration_level: "high|medium|low|none"
categories: ["backend", "frontend", "infrastructure"]
tags: ["go", "grpc", "templates"]
related_docs:
  - "README.architecture.md"
  - "README.development.md"
dependencies: []
llm_context: "high"
context_window_target: 300
---
```

### Required Fields

| Field                   | Description             | Example                                       |
| ----------------------- | ----------------------- | --------------------------------------------- |
| `name`                  | Short agent name        | "Backend API Engineer"                        |
| `title`                 | Full title with context | "Backend API Engineer (Go/Fiber)"             |
| `description`           | One-line purpose        | "Develops REST APIs using Go/Fiber framework" |
| `role_type`             | Primary role category   | "engineering", "design", "product"            |
| `version`               | Semantic version        | "1.0.0"                                       |
| `last_updated`          | ISO date                | "2025-10-25"                                  |
| `llm_context`           | AI relevance level      | "high", "medium", "low"                       |
| `context_window_target` | Target line count       | 300                                           |

### Optional Fields

| Field                      | Description               | Example                               |
| -------------------------- | ------------------------- | ------------------------------------- |
| `author`                   | Creator/maintainer        | "Backend Team"                        |
| `specialization`           | Specific focus areas      | ["REST APIs", "database integration"] |
| `technology_stack`         | Technologies used         | ["Go", "Fiber", "PostgreSQL"]         |
| `system_integration_level` | Integration depth         | "high", "medium", "low", "none"       |
| `categories`               | Organizational categories | ["backend", "api"]                    |
| `tags`                     | Searchable tags           | ["go", "fiber", "rest"]               |
| `related_docs`             | Key documentation         | ["README.architecture.md"]            |
| `dependencies`             | Required systems          | ["sirius-api/"]                       |

## Agent Identity Structure

Each agent identity follows this structure (200-400 lines total):

### 1. Role Summary (2-3 sentences)

Clear, concise description of the agent's purpose and scope.

### 2. Key Documentation Links (5-10 critical docs)

Direct links to essential documentation for the role:

- Architecture documents
- Development workflows
- Testing systems
- Role-specific guides

### 3. Project Location (directory structure)

Show where this role's work lives in the codebase.

### 4. Core Responsibilities (bullet list)

Clear enumeration of what this role does:

- Primary tasks
- Secondary tasks
- Collaboration points

### 5. Technology Stack (tools, languages, frameworks)

Specific technologies this role uses:

- Programming languages
- Frameworks and libraries
- Tools and services
- Development environment

### 6. System Integration (conditional)

**Include when `system_integration_level` is medium or high:**

- Integration points with other services
- Protocols and communication patterns
- Data flows and dependencies
- Architecture diagrams (when relevant)

**Depth varies by level:**

- **High**: Detailed protocols, message formats, complete data flows
- **Medium**: Key integration points, high-level protocols
- **Low**: Minimal integration notes
- **None**: Omit this section

### 7. Development Workflow (common operations)

Standard processes for this role:

- Setup and initialization
- Daily development tasks
- Testing and validation
- Deployment procedures

### 8. Code Patterns & Best Practices (2-5 examples)

**Include inline code examples for roles with specific coding patterns:**

Show good vs bad patterns, idiomatic approaches, common pitfalls.

**Omit for non-coding roles** (product, design, documentation-focused).

### 9. Common Tasks (frequent operations)

Specific, actionable commands and procedures:

- Build commands
- Test commands
- Deployment commands
- Troubleshooting commands

### 10. Troubleshooting Quick Reference

Common issues and solutions:

- Error patterns
- Debugging commands
- Quick fixes
- Where to find help

## Role-Specific Customization

The universal template adapts to different role types:

### Engineering Roles

**Characteristics:**

- Detailed technology stack
- Code patterns and examples
- System integration details
- Build and test commands

**Examples:** Backend Engineer, Frontend Engineer, DevOps Engineer

### Design Roles

**Characteristics:**

- Design tools and workflows
- Component libraries and systems
- Collaboration processes
- Review and feedback cycles

**Examples:** UX Designer, UI Designer, Design System Engineer

### Product Roles

**Characteristics:**

- Product documentation
- Stakeholder interfaces
- Decision frameworks
- Metrics and analytics

**Examples:** Product Manager, Product Owner, Business Analyst

### Operations Roles

**Characteristics:**

- Infrastructure details
- Monitoring and alerting
- Incident response
- Capacity planning

**Examples:** SRE, Platform Engineer, Infrastructure Engineer

### QA Roles

**Characteristics:**

- Testing frameworks
- Test strategies
- Bug tracking workflows
- Quality metrics

**Examples:** QA Engineer, Test Automation Engineer

### Documentation Roles

**Characteristics:**

- Documentation systems
- Writing standards
- Publishing workflows
- Maintenance procedures

**Examples:** Technical Writer, Documentation Engineer

## Validation Requirements

Agent identities must pass automated validation before commit.

### Validation Checks

1. **YAML Front Matter**

   - All required fields present
   - Valid field values (enums)
   - Proper format (dates, versions)

2. **Content Structure**

   - Required sections present
   - Role-appropriate sections
   - Length constraints (200-400 lines warning)

3. **Documentation Links**

   - Links to existing files
   - Proper mdc: format
   - No broken references

4. **Index Completeness**
   - Agent listed in INDEX
   - Metadata matches front matter
   - Cross-references valid

### Running Validation

```bash
# Full validation
cd testing/container-testing
make lint-agents

# Quick validation
make lint-agents-quick

# Index validation
make lint-agent-index

# Complete validation
make validate-all
```

## Maintenance Standards

### Update Triggers

Update agent identities when:

- **Role responsibilities change**
- **Technology stack updates**
- **System architecture evolves**
- **Documentation structure changes**
- **Integration patterns shift**
- **Best practices improve**

### Version Management

- **Patch version** (1.0.0 → 1.0.1): Minor corrections, link updates
- **Minor version** (1.0.0 → 1.1.0): New sections, expanded content
- **Major version** (1.0.0 → 2.0.0): Role redefinition, structure changes

### Review Process

1. **Technical accuracy** - Verify all technical details
2. **Completeness** - Ensure all required sections present
3. **Clarity** - Check for clear, understandable language
4. **Validation** - Run automated validation
5. **Length check** - Confirm 200-400 line target
6. **Link verification** - Test all documentation links

## Integration with Development Workflow

### Pre-Commit Validation

The pre-commit hook automatically validates agent identities:

- Checks YAML front matter
- Validates required fields
- Verifies length constraints
- Updates index if needed

### CI/CD Integration

Agent validation is part of the complete validation suite:

```bash
make validate-all  # Includes lint-agents
```

### Documentation System

Agent identities complement the documentation system:

- **Agent identities**: Role-specific context
- **Documentation**: Comprehensive technical details
- **Task files**: Project-specific state
- **Cursor rules**: Development guidelines

## Quality Assurance

### Pre-Publication Checklist

- [ ] YAML front matter complete and valid
- [ ] All required sections present
- [ ] Length within 200-400 lines
- [ ] Code examples tested (if applicable)
- [ ] Documentation links verified
- [ ] Role-appropriate content depth
- [ ] Integration level appropriate
- [ ] Validation scripts pass
- [ ] Listed in INDEX
- [ ] Cross-references valid

### Post-Publication

- Monitor usage patterns
- Collect feedback
- Update regularly with project evolution
- Track context window effectiveness
- Refine based on AI interaction quality

## Troubleshooting

### Common Issues

| Issue                | Symptoms                 | Solution                                   |
| -------------------- | ------------------------ | ------------------------------------------ |
| Missing front matter | Validation fails         | Add complete YAML header                   |
| Invalid field values | Enum validation error    | Check SPECIFICATION.md for valid values    |
| Broken doc links     | Link validation fails    | Verify file paths, use correct mdc: format |
| Length violations    | Warning about line count | Balance detail vs conciseness              |
| Index mismatch       | Index validation fails   | Run lint-agent-index, update INDEX.md      |
| Role ambiguity       | Unclear responsibilities | Sharpen role definition, check examples    |

### Debugging Commands

```bash
# Check agent status
cd testing/container-testing
make lint-agents

# Find agents by type
grep -r "role_type:" .cursor/agents/

# Check integration level distribution
grep -r "system_integration_level:" .cursor/agents/

# Validate specific agent
../../scripts/agent-identities/lint-agents.sh .cursor/agents/backend-api-engineer.agent.md
```

## Best Practices

### Writing Effective Agent Identities

1. **Start with role clarity** - Define boundaries clearly
2. **Link generously** - Reference comprehensive docs
3. **Show, don't tell** - Use code examples when relevant
4. **Balance detail** - Enough context, not too much
5. **Think fresh starts** - Would this enable a new conversation?
6. **Validate early** - Run scripts during development
7. **Review examples** - Study existing agents
8. **Test with AI** - Verify context effectiveness

### Maintaining Agent Identities

1. **Update proactively** - Don't wait for issues
2. **Version appropriately** - Follow semver guidelines
3. **Cross-reference** - Keep related agents in sync
4. **Monitor effectiveness** - Track AI interaction quality
5. **Gather feedback** - Learn from usage patterns
6. **Automate validation** - Trust the pre-commit hooks

---

_This document is the foundation of our agent identity system. Keep it updated as our practices evolve._
