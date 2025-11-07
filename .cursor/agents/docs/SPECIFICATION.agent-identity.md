---
title: "Agent Identity Specification"
description: "Technical specification for agent identity format, validation, and requirements"
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags: ["specification", "agent-identity", "validation", "standards"]
categories: ["ai-tooling", "documentation"]
difficulty: "advanced"
prerequisites: ["ABOUT.agent-identities.md", "YAML knowledge"]
related_docs:
  - "ABOUT.agent-identities.md"
  - "TEMPLATE.agent-identity.md"
  - "GUIDE.creating-agent-identities.md"
dependencies: []
llm_context: "medium"
search_keywords:
  ["agent spec", "validation rules", "field definitions", "requirements"]
---

# Agent Identity Specification

## Document Purpose

This specification defines the technical requirements, constraints, and validation rules for agent identity files in the Sirius project.

## File Naming Convention

**Format:** `[name].agent.md`

**Rules:**

- Lowercase with hyphens for spaces
- Must end with `.agent.md` extension
- Descriptive of role (e.g., `backend-api-engineer.agent.md`)
- No special characters except hyphens

**Examples:**

- ✅ `backend-api-engineer.agent.md`
- ✅ `frontend-ui-engineer.agent.md`
- ✅ `system-architect.agent.md`
- ❌ `BackendEngineer.agent.md` (wrong case)
- ❌ `backend_engineer.agent.md` (underscore not allowed)
- ❌ `engineer.md` (missing .agent)

## YAML Front Matter Specification

### Required Fields

#### `name` (string)

**Description:** Short, human-readable agent name

**Format:** Title case, 2-5 words

**Examples:**

- "Backend API Engineer"
- "Frontend Engineer"
- "System Architect"
- "UX Designer"

**Validation:**

- Must be present
- Must be string
- Length: 10-50 characters
- No special characters except spaces and hyphens

#### `title` (string)

**Description:** Full descriptive title with context

**Format:** `[Name] ([Technology/Context])`

**Examples:**

- "Backend API Engineer (Go/Fiber)"
- "Frontend Engineer (Next.js/React)"
- "System Architect (Microservices)"
- "UX Designer (Figma/Component Libraries)"

**Validation:**

- Must be present
- Must be string
- Length: 20-100 characters
- Should include parenthetical context

#### `description` (string)

**Description:** One-line purpose statement

**Format:** Single sentence, action-oriented

**Examples:**

- "Develops REST APIs using Go/Fiber framework with PostgreSQL integration"
- "Builds responsive UIs with Next.js, TypeScript, and Tailwind CSS"
- "Defines system architecture and ensures component integration"

**Validation:**

- Must be present
- Must be string
- Length: 30-150 characters
- Should be single sentence

#### `role_type` (enum)

**Description:** Primary role category

**Valid Values:**

- `engineering` - Software engineers, developers
- `design` - UX/UI designers, design engineers
- `product` - Product managers, product owners
- `operations` - DevOps, SRE, infrastructure
- `qa` - QA engineers, test automation
- `documentation` - Technical writers, doc engineers

**Validation:**

- Must be present
- Must be one of valid values
- Case-sensitive

#### `version` (string)

**Description:** Semantic version of agent identity

**Format:** `MAJOR.MINOR.PATCH`

**Versioning Rules:**

- **PATCH** (x.x.1): Typos, link updates, minor corrections
- **MINOR** (x.1.0): New sections, expanded content, additional patterns
- **MAJOR** (2.0.0): Role redefinition, structure changes, breaking updates

**Examples:**

- "1.0.0" - Initial version
- "1.0.1" - Fixed typo in command
- "1.1.0" - Added new troubleshooting section
- "2.0.0" - Restructured for new architecture

**Validation:**

- Must be present
- Must match semver format: `\d+\.\d+\.\d+`

#### `last_updated` (string)

**Description:** Last modification date

**Format:** ISO 8601 date: `YYYY-MM-DD`

**Examples:**

- "2025-10-25"
- "2025-01-15"

**Validation:**

- Must be present
- Must match format: `\d{4}-\d{2}-\d{2}`
- Must be valid date

#### `llm_context` (enum)

**Description:** AI relevance and priority level

**Valid Values:**

- `high` - Critical for understanding project, always include
- `medium` - Important for specific tasks
- `low` - Reference material, include when relevant

**Usage Guidelines:**

- **High**: Core engineering roles, system architects, critical infrastructure
- **Medium**: Specialized roles, focused domains
- **Low**: Auxiliary roles, documentation-only, narrow scope

**Validation:**

- Must be present
- Must be one of valid values
- Case-sensitive

#### `context_window_target` (integer)

**Description:** Target line count for agent identity

**Format:** Integer between 150 and 500

**Guidelines:**

- **150-250**: Minimal roles, focused scope
- **250-350**: Standard roles, balanced detail
- **350-450**: Complex roles, high integration
- **450-500**: Maximum, exceptional cases only

**Validation:**

- Must be present
- Must be integer
- Must be between 150 and 500

### Optional Fields

#### `author` (string)

**Description:** Creator or maintaining team

**Examples:**

- "Backend Team"
- "Sirius Core Team"
- "Design Team"

**Validation:**

- Optional
- If present, must be string
- Length: 3-50 characters

#### `specialization` (array of strings)

**Description:** Specific areas of focus within role

**Examples:**

```yaml
specialization: ["REST APIs", "database integration", "caching"]
specialization: ["component design", "accessibility", "responsive layouts"]
specialization: ["gRPC", "template system", "vulnerability detection"]
```

**Validation:**

- Optional
- If present, must be array
- 1-5 items recommended
- Each item: 3-50 characters

#### `technology_stack` (array of strings)

**Description:** Technologies, languages, frameworks used

**Examples:**

```yaml
technology_stack: ["Go", "Fiber", "PostgreSQL", "Docker"]
technology_stack: ["TypeScript", "React", "Next.js", "Tailwind"]
technology_stack: ["Figma", "Storybook", "Design Tokens"]
```

**Validation:**

- Optional
- If present, must be array
- 1-10 items recommended
- Each item: 2-30 characters

#### `system_integration_level` (enum)

**Description:** Depth of system integration knowledge required

**Valid Values:**

- `none` - No system integration (pure UI, documentation)
- `low` - Minimal integration (frontend, simple services)
- `medium` - Moderate integration (APIs, backend services)
- `high` - Deep integration (infrastructure, distributed systems)

**Impact on Content:**

- **none**: Omit System Integration section
- **low**: Brief integration notes, high-level only
- **medium**: Key integration points, protocols overview
- **high**: Detailed protocols, message formats, data flows, architecture diagrams

**Validation:**

- Optional (defaults to "medium" if omitted)
- If present, must be one of valid values
- Case-sensitive

#### `categories` (array of strings)

**Description:** Organizational categories for grouping

**Common Values:**

- "backend", "frontend", "infrastructure"
- "api", "ui", "database"
- "security", "monitoring", "testing"
- "design", "product", "operations"

**Validation:**

- Optional
- If present, must be array
- 1-5 items recommended
- Each item: 3-30 characters

#### `tags` (array of strings)

**Description:** Searchable tags for discovery

**Examples:**

```yaml
tags: ["go", "fiber", "rest", "api"]
tags: ["react", "nextjs", "typescript", "tailwind"]
tags: ["docker", "kubernetes", "infrastructure"]
```

**Validation:**

- Optional
- If present, must be array
- 3-10 items recommended
- Each item: 2-30 characters

#### `related_docs` (array of strings)

**Description:** Key documentation references

**Format:** Relative paths to documentation files

**Examples:**

```yaml
related_docs:
  - "README.architecture.md"
  - "README.development.md"
  - "README.api-design.md"
```

**Validation:**

- Optional
- If present, must be array
- 3-10 items recommended
- Each item should be valid file path

#### `dependencies` (array of strings)

**Description:** Required systems, services, or components

**Examples:**

```yaml
dependencies: ["sirius-api/", "PostgreSQL", "RabbitMQ"]
dependencies: []  # No dependencies
```

**Validation:**

- Optional
- If present, must be array
- Each item: 3-50 characters

## Content Structure Specification

### Total Length Constraints

**Target Range:** 200-400 lines

**Validation Levels:**

- **✅ Optimal:** 200-400 lines
- **⚠️ Warning:** 150-199 or 401-500 lines
- **❌ Error:** < 150 or > 500 lines

**Breakdown:**

- YAML front matter: 15-30 lines
- Content: 185-370 lines
- Buffer for formatting: ~10-20 lines

### Required Sections

All agent identities MUST include these sections:

#### 1. Role Summary

**Location:** Immediately after YAML front matter

**Length:** 2-3 sentences (50-150 words)

**Content:**

- What the role does
- Primary technologies/focus
- Scope and boundaries

#### 2. Key Documentation

**Length:** 5-10 links with descriptions

**Format:**

```markdown
## Key Documentation

### Architecture & Design

- [Doc Name](mdc:path/to/doc.md) - Brief description

### Development & Workflow

- [Doc Name](mdc:path/to/doc.md) - Brief description

### Role-Specific Documentation

- [Doc Name](mdc:path/to/doc.md) - Brief description
```

#### 3. Project Location

**Length:** 10-20 lines

**Format:** Directory tree showing relevant code locations

#### 4. Core Responsibilities

**Length:** 8-15 bullet points

**Categories:**

- Primary Responsibilities (3-5 items)
- Secondary Responsibilities (2-4 items)
- Collaboration Points (2-4 items)

#### 5. Technology Stack

**Length:** 15-30 lines

**Subsections:**

- Programming Languages
- Frameworks & Libraries
- Tools & Services
- Development Environment

#### 6. Development Workflow

**Length:** 20-40 lines

**Subsections:**

- Setup & Initialization
- Daily Development Tasks
- Testing & Validation
- Build & Deployment

#### 7. Common Tasks

**Length:** 20-40 lines

**Format:** Categorized tasks with commands

#### 8. Troubleshooting Quick Reference

**Length:** 20-40 lines

**Subsections:**

- Common Issues (table format)
- Debugging Commands
- Quick Fixes
- When to Escalate
- Useful Resources

### Conditional Sections

#### System Integration

**Required When:** `system_integration_level` is "medium" or "high"

**Omit When:** `system_integration_level` is "low" or "none"

**Length:**

- **High:** 40-80 lines (detailed)
- **Medium:** 20-40 lines (overview)

**Subsections:**

- Integration Architecture (with diagram for "high")
- Communication Protocols
- Data Flows
- Key Integration Points

#### Code Patterns & Best Practices

**Required When:** `role_type` is "engineering"

**Optional When:** `role_type` is "operations" or "qa"

**Omit When:** `role_type` is "design", "product", or "documentation"

**Length:** 30-60 lines (2-5 code examples)

**Format:** Each pattern includes:

- Pattern name and description
- Good example (✅)
- Bad example (❌) - optional
- Key considerations

## Section Length Guidelines

| Section               | Min Lines | Max Lines | Target |
| --------------------- | --------- | --------- | ------ |
| Role Summary          | 3         | 8         | 5      |
| Key Documentation     | 10        | 20        | 15     |
| Project Location      | 8         | 20        | 12     |
| Core Responsibilities | 10        | 20        | 15     |
| Technology Stack      | 15        | 35        | 25     |
| System Integration\*  | 20        | 80        | 40     |
| Development Workflow  | 20        | 45        | 30     |
| Code Patterns\*       | 25        | 70        | 45     |
| Common Tasks          | 20        | 50        | 35     |
| Troubleshooting       | 20        | 45        | 30     |

\* Conditional sections

## Code Example Guidelines

### When to Include Code

- **Always**: Engineering roles with programming
- **Sometimes**: Operations, QA, documentation (scripts, configs)
- **Never**: Pure design, product, non-technical roles

### Code Example Format

```[language]
// Brief description of what this shows

// ✅ GOOD: Why this is good
[good-example]

// ❌ BAD: Why this is bad
[bad-example]
```

### Code Example Constraints

- **Examples per section:** 2-5
- **Lines per example:** 10-30
- **Total code lines:** 50-150 (engineering roles)
- **Language specificity:** Match role's primary language

## Validation Rules

### Automated Checks

The validation system checks:

1. **YAML Completeness**

   - All required fields present
   - Field values match specifications
   - Enum values are valid
   - Date formats correct
   - Version format correct

2. **Content Structure**

   - Required sections present
   - Conditional sections appropriate
   - Section order matches template
   - Length within constraints

3. **Link Validity**

   - Documentation links resolve
   - mdc: format correct
   - No broken references
   - External links accessible

4. **Index Consistency**
   - Agent listed in INDEX
   - Metadata matches front matter
   - Cross-references valid
   - No orphaned files

### Manual Review Points

Reviewers should verify:

- Role definition clarity
- Appropriate technical depth
- Accurate code examples
- Up-to-date documentation links
- Relevant troubleshooting content
- Appropriate length balance

## Integration Level Matrix

| Level      | UI/Design | Frontend | Backend | Infrastructure | System Arch |
| ---------- | --------- | -------- | ------- | -------------- | ----------- |
| **none**   | ✅        | ❌       | ❌      | ❌             | ❌          |
| **low**    | ✅        | ✅       | ❌      | ❌             | ❌          |
| **medium** | ❌        | ✅       | ✅      | ✅             | ❌          |
| **high**   | ❌        | ❌       | ✅      | ✅             | ✅          |

## Role Type Requirements

### Engineering

**Required:**

- Technology Stack section
- Code Patterns section
- Development Workflow section
- Build/test commands

**Optional:**

- System Integration (based on level)

### Design

**Required:**

- Design tools and workflows
- Component libraries
- Collaboration processes

**Omit:**

- Code Patterns
- System Integration

### Product

**Required:**

- Product documentation
- Stakeholder interfaces
- Decision frameworks

**Omit:**

- Code Patterns
- System Integration
- Technical workflows

### Operations

**Required:**

- Infrastructure details
- Monitoring and alerting
- Incident response

**Optional:**

- Code Patterns (for IaC)
- System Integration (typically "high")

### QA

**Required:**

- Testing frameworks
- Test strategies
- Quality metrics

**Optional:**

- Code Patterns (for test automation)
- System Integration (typically "low" or "medium")

### Documentation

**Required:**

- Documentation systems
- Writing standards
- Publishing workflows

**Omit:**

- Code Patterns
- System Integration
- Technical workflows

## Version History Best Practices

### Changelog Location

Maintain version history in a comment block at end of file:

```markdown
---

## Version History

### 2.0.0 (2025-10-25)

- Restructured for new architecture
- Added gRPC integration details
- Updated all code examples

### 1.1.0 (2025-09-15)

- Added troubleshooting section
- Expanded code patterns
- Updated documentation links

### 1.0.1 (2025-08-20)

- Fixed broken documentation links
- Corrected typos in commands

### 1.0.0 (2025-08-01)

- Initial release
```

---

_This specification is the authoritative source for agent identity requirements. Validation scripts enforce these rules._
