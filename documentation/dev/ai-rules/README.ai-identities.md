---
title: "Agent Identity System"
description: "Comprehensive guide to the agent identity generation system for AI context shaping"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags: ["ai", "agents", "context", "documentation", "automation"]
categories: ["development", "ai-rules"]
difficulty: "intermediate"
prerequisites:
  - "TypeScript/Node.js knowledge"
  - "Understanding of YAML and Markdown"
  - "Familiarity with project structure"
related_docs:
  - "ABOUT.documentation.md"
  - "README.development.md"
  - "cursor_rules.mdc"
dependencies:
  - "scripts/agent-identities/"
  - ".cursor/agents/"
llm_context: "high"
search_keywords:
  ["agent", "identity", "ai", "context", "generation", "templates", "cursor"]
---

# Agent Identity System

## Purpose

The Agent Identity System provides structured, role-specific context for AI interactions across the Sirius project. Each agent identity is a carefully crafted document (~1200-1500 lines) that enables confident fresh conversations by providing essential role context.

### Why Agent Identities?

**Problem:** Long-running AI conversations accumulate context but become unwieldy over time. Starting fresh means losing valuable project-specific knowledge.

**Solution:** Comprehensive agent identities that provide:

- Role-specific project context
- Technology stack and architecture details
- Development workflows and best practices
- Common tasks and troubleshooting guides
- Integration with broader system

### Key Benefits

- **Fresh Conversations:** Start new AI sessions with full context
- **Role-Specific Focus:** Targeted expertise for specific domains
- **Consistency:** Validated, standardized role definitions
- **Always Current:** Auto-generated sections stay synchronized with code
- **Efficient Context:** Optimized for LLM context windows

## System Overview

### Architecture

The system combines **manual narrative** (philosophy, best practices) with **auto-generated sections** (file structure, ports, dependencies, configurations) to create comprehensive agent identities.

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Identity System                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │   Template   │──────▶│   Generation    │                 │
│  │   (Manual)   │      │     Engine      │                 │
│  └──────────────┘      └────────┬────────┘                 │
│                                  │                           │
│  ┌──────────────────────────────▼────────────────────────┐ │
│  │              Data Extractors                          │ │
│  │  • File Structure  • Ports    • Dependencies         │ │
│  │  • Configs         • Docs     • Code Patterns        │ │
│  └──────────────────────────────┬────────────────────────┘ │
│                                  │                           │
│  ┌──────────────────────────────▼────────────────────────┐ │
│  │              Generated Agent Identity                 │ │
│  │              (1200-1500 lines)                        │ │
│  └──────────────────────────────┬────────────────────────┘ │
│                                  │                           │
│  ┌──────────────────────────────▼────────────────────────┐ │
│  │              Validation System                        │ │
│  │  • YAML Metadata  • Content    • Sync Check          │ │
│  │  • File Paths     • Line Count • Standards           │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Templates (`.cursor/agents/templates/`)

Manual narrative sections that define:

- Role summary and philosophy
- Best practices and wisdom
- Development approaches
- Key responsibilities

#### 2. Configuration (`.cursor/agents/config/`)

YAML files that specify:

- Product paths and metadata
- Generation settings
- Data extraction rules
- Output locations

#### 3. Generation Engine (`scripts/agent-identities/src/generators/`)

TypeScript modules that extract:

- Directory structures
- Port mappings from docker-compose
- Dependencies from go.mod/package.json
- Configuration examples
- Code patterns from documentation

#### 4. Validation System (`scripts/agent-identities/src/validators/`)

Automated checks for:

- YAML front matter completeness
- Content structure and length
- Staleness detection
- File path validity

## Quick Start

### Install Dependencies

```bash
cd /Users/oz/Projects/Sirius-Project/Sirius/scripts/agent-identities
npm install
```

### Generate Agent Identities

```bash
# Generate all identities
cd /Users/oz/Projects/Sirius-Project/Sirius/testing/container-testing
make regenerate-agents

# Generate specific identity
make regenerate-agent PRODUCT=agent-engineer
```

### Validate Identities

```bash
# Full validation
make lint-agents

# Check for staleness
make check-agent-sync
```

### Use in Cursor

Use as slash commands (recommended):

```
/bot-agent-engineer
/bot-api-engineer
/bot-ui-engineer
/bot-maintainer-ops
```

Or reference directly:

```markdown
@bot-agent-engineer.md
```

## Creating Agent Identities

### Step 1: Create Template

Create `.cursor/agents/templates/<name>.template.md`:

```markdown
---
name: "My Agent"
title: "My Agent (product/Tech)"
description: "Brief role description"
role_type: engineering
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
specialization: ["skill1", "skill2"]
technology_stack: ["Tech1", "Tech2"]
system_integration_level: high
categories: ["category"]
tags: ["tag1", "tag2"]
related_docs: ["doc1.md"]
dependencies: ["path/"]
llm_context: high
context_window_target: 1400
---

# My Agent

<!-- MANUAL SECTION -->

**Role Philosophy**

This agent develops [product] with focus on [key areas].
Primary responsibilities include [list].

<!-- END MANUAL SECTION -->

## Key Documentation

<!-- AUTO-GENERATED: documentation-links -->
<!-- END AUTO-GENERATED -->

## Project Location

<!-- AUTO-GENERATED: file-structure -->
<!-- END AUTO-GENERATED -->

## Technology Stack

<!-- AUTO-GENERATED: dependencies -->
<!-- END AUTO-GENERATED -->

## System Integration

<!-- AUTO-GENERATED: ports -->
<!-- END AUTO-GENERATED -->

## Configuration

<!-- AUTO-GENERATED: config-examples -->
<!-- END AUTO-GENERATED -->

## Development Workflow

<!-- MANUAL SECTION: workflow -->

**Key Development Practices**

- Start development in docker container
- Test before committing
- Follow project standards
<!-- END MANUAL SECTION -->

## Best Practices

<!-- MANUAL SECTION: best-practices -->

**Core Principles**

1. **Principle 1** - Description
2. **Principle 2** - Description
<!-- END MANUAL SECTION -->
```

### Step 2: Create Configuration

Create `.cursor/agents/config/<name>.config.yaml`:

```yaml
product: my-product
product_path: /path/to/product
docker_service_name: my-service

metadata:
  name: "My Agent"
  title: "My Agent (product/Tech)"
  description: "Brief description"
  role_type: engineering
  version: "1.0.0"
  last_updated: "2025-10-25"
  author: "Sirius Team"
  specialization: ["skill1", "skill2"]
  technology_stack: ["Tech1", "Tech2"]
  system_integration_level: high
  categories: ["category"]
  tags: ["tag1", "tag2"]
  related_docs: ["doc1.md"]
  dependencies: ["path/"]
  llm_context: high
  context_window_target: 1400

generation:
  include_file_structure: true
  file_structure_depth: 3
  file_structure_ignore: [node_modules, dist, bin]

  include_ports: true
  ports_config:
    "8080": "HTTP server"

  include_dependencies: true
  dependencies_source: go.mod
  dependencies_grouping:
    "Category":
      - "package-name"

  include_config_examples: true
  config_files:
    - path: config/server.yaml
      title: "Server Configuration"

  extract_code_patterns_from_docs:
    - documentation/dev/file.md

template_path: .cursor/agents/templates/<name>.template.md
output_path: .cursor/agents/<name>.agent.md
```

### Step 3: Generate and Validate

```bash
# Generate
npm run generate -- --product=<name>

# Validate
npm run validate

# Check output
cat .cursor/agents/<name>.agent.md
```

## Template System

### Section Markers

#### AUTO-GENERATED Sections

Content between these markers is replaced on each generation:

```markdown
<!-- AUTO-GENERATED: section-name -->

This content will be replaced by the generator

<!-- END AUTO-GENERATED -->
```

**Available Sections:**

- `file-structure` - Directory tree
- `ports` - Port mappings with descriptions
- `dependencies` - Dependency list with grouping
- `config-examples` - Configuration file contents
- `documentation-links` - Related documentation
- `code-patterns` - Code patterns from docs
- `common-tasks` - Task examples from docs
- `troubleshooting` - Troubleshooting guides

#### MANUAL Sections

Content between these markers is preserved:

```markdown
<!-- MANUAL SECTION -->

This content is preserved across generations

<!-- END MANUAL SECTION -->

<!-- MANUAL SECTION: specific-name -->

Named manual sections for organization

<!-- END MANUAL SECTION -->
```

### When to Use Each

| Use AUTO-GENERATED for:      | Use MANUAL for:               |
| ---------------------------- | ----------------------------- |
| File paths and structure     | Role philosophy and narrative |
| Port mappings                | Best practices wisdom         |
| Dependencies and versions    | Development approaches        |
| Configuration examples       | Troubleshooting insights      |
| Code patterns from docs      | Key responsibilities          |
| System architecture diagrams | Integration considerations    |

## Data Extractors

### File Structure Extractor

**Purpose:** Generate directory trees with depth control

**Configuration:**

```yaml
generation:
  include_file_structure: true
  file_structure_depth: 3
  file_structure_ignore: [node_modules, dist, bin, .git]
```

**Output Example:**

```
app-agent/
├── cmd/
│   ├── agent/          # Agent client entry point
│   └── server/         # gRPC server entry point
├── internal/
│   ├── agent/          # Agent business logic
│   └── server/         # Server implementation
└── proto/              # Protocol Buffer definitions
```

### Port Extractor

**Purpose:** Extract port mappings from docker-compose.yaml

**Configuration:**

```yaml
generation:
  include_ports: true
  ports_config:
    "50051": "gRPC server (bidirectional streams)"
    "8080": "HTTP health check endpoint"
```

**Output Example:**

```markdown
| Port  | Purpose                             |
| ----- | ----------------------------------- |
| 50051 | gRPC server (bidirectional streams) |
| 8080  | HTTP health check endpoint          |
```

### Dependency Extractor

**Purpose:** Parse and group dependencies from go.mod or package.json

**Configuration:**

```yaml
generation:
  include_dependencies: true
  dependencies_source: go.mod
  dependencies_grouping:
    "gRPC & Networking":
      - "google.golang.org/grpc"
      - "google.golang.org/protobuf"
    "Storage":
      - "github.com/valkey-io/valkey-go"
```

**Output Example:**

```markdown
### gRPC & Networking

- `google.golang.org/grpc` v1.60.0
- `google.golang.org/protobuf` v1.32.0

### Storage

- `github.com/valkey-io/valkey-go` v1.0.36
```

### Config Extractor

**Purpose:** Extract configuration file contents

**Configuration:**

```yaml
generation:
  include_config_examples: true
  config_files:
    - path: config/server.yaml
      title: "Server Configuration"
    - path: config/agent.yaml
      title: "Agent Configuration"
```

### Documentation Extractor

**Purpose:** Extract code patterns and best practices from documentation

**Configuration:**

```yaml
generation:
  extract_code_patterns_from_docs:
    - documentation/dev/apps/README.agent-system.md
    - documentation/dev/architecture/README.agent-system.md
```

## Validation System

### YAML Front Matter Validation

**Required Fields:**

- `name` (string)
- `title` (string)
- `description` (string)
- `role_type` (enum: engineering, design, product, operations, qa, documentation)
- `version` (semver: 1.0.0)
- `last_updated` (YYYY-MM-DD)
- `author` (string)
- `llm_context` (enum: high, medium, low)

**Validated:**

```bash
✅ All required fields present
✅ Enum values valid
✅ Version format correct (1.0.0)
✅ Date format correct (2025-10-25)
```

### Content Validation

**Checks:**

- Line count: 150-2000 (hard limits)
- Target range: 800-1500 (warnings)
- Required sections present
- Proper section markers

### Sync Validation

**Purpose:** Detect when agent identities are stale

**How it works:**

1. Parse `_generated_at` timestamp from YAML
2. Check `_source_files` modification times
3. Compare timestamps
4. Report stale files

**Example:**

```bash
⚠️  Stale: Source files modified since last generation
    Modified files: docker-compose.yaml, app-agent/go.mod
    Run: make regenerate-agents
```

### File Path Validation

**Purpose:** Verify referenced files exist

**Extracts paths from:**

- File structure sections
- Configuration examples
- Documentation links
- Code examples

**Reports:**

```bash
⚠️  Missing files:
    - config/old-config.yaml
    - documentation/removed-doc.md
```

## Commands Reference

### Generation Commands

```bash
# Generate all agent identities
cd testing/container-testing
make regenerate-agents

# Generate specific agent
make regenerate-agent PRODUCT=agent-engineer

# Direct npm usage
cd scripts/agent-identities
npm run generate -- --all
npm run generate -- --product=agent-engineer
```

### Validation Commands

```bash
# Full validation (YAML, content, sync, paths)
cd testing/container-testing
make lint-agents

# Quick validation
make lint-agents-quick

# Check sync status only
make check-agent-sync

# Direct npm usage
cd scripts/agent-identities
npm run validate
npm run check-sync
```

### Development Commands

```bash
# Install dependencies
cd scripts/agent-identities
npm install

# Build TypeScript
npm run build

# Type checking
npx tsc --noEmit
```

## Integration with Workflow

### Pre-Commit Hook

Agent identities are automatically validated when:

1. **Source files change** (docker-compose.yaml, go.mod, package.json, documentation)

   - Checks if regeneration needed
   - Warns if identities are stale
   - Prompts to regenerate or continue

2. **Agent files modified directly**
   - Runs quick validation
   - Blocks commit if validation fails

### CI/CD Integration

```bash
# In your CI pipeline
cd /Users/oz/Projects/Sirius-Project/Sirius/scripts/agent-identities
npm install
npm run validate || exit 1
```

### Makefile Integration

```bash
# Part of complete validation
make validate-all
```

## Metadata Fields

### Core Metadata

| Field                   | Type   | Required | Example                              |
| ----------------------- | ------ | -------- | ------------------------------------ |
| `name`                  | string | Yes      | "Agent Engineer"                     |
| `title`                 | string | Yes      | "Agent Engineer (app-agent/Go/gRPC)" |
| `description`           | string | Yes      | "Develops remote agent system"       |
| `role_type`             | enum   | Yes      | engineering                          |
| `version`               | semver | Yes      | 1.0.0                                |
| `last_updated`          | date   | Yes      | 2025-10-25                           |
| `author`                | string | Yes      | "Sirius Team"                        |
| `llm_context`           | enum   | Yes      | high                                 |
| `context_window_target` | number | Yes      | 1400                                 |

### Optional Metadata

| Field                      | Type  | Purpose                                  |
| -------------------------- | ----- | ---------------------------------------- |
| `specialization`           | array | Key skills and focus areas               |
| `technology_stack`         | array | Technologies used                        |
| `system_integration_level` | enum  | Integration depth (high/medium/low/none) |
| `categories`               | array | Categorization                           |
| `tags`                     | array | Search keywords                          |
| `related_docs`             | array | Documentation files                      |
| `dependencies`             | array | Required paths                           |

### Generation Metadata

Automatically added by generator:

| Field           | Type  | Purpose              |
| --------------- | ----- | -------------------- |
| `_generated_at` | ISO   | Generation timestamp |
| `_source_files` | array | Source files used    |

## Best Practices

### Template Creation

✅ **DO:**

- Keep manual sections concise but comprehensive
- Focus on philosophy and wisdom in manual sections
- Use AUTO-GENERATED for structural information
- Include inline comments for clarity
- Reference documentation rather than duplicating

❌ **DON'T:**

- Put structural info in manual sections
- Duplicate documentation content
- Exceed 1500 lines (target: 1200-1400)
- Include implementation details (link to docs)

### Configuration Design

✅ **DO:**

- Group dependencies logically
- Add descriptions to port mappings
- Set appropriate depth for file structures
- Ignore build artifacts and dependencies
- Extract patterns from authoritative docs

❌ **DON'T:**

- Include every dependency
- Set depth too deep (>4)
- Extract from outdated documentation
- Forget to update related_docs

### Maintenance

✅ **DO:**

- Regenerate after major changes
- Run validation before commits
- Check sync status regularly
- Update templates when patterns emerge
- Keep configs up to date

❌ **DON'T:**

- Manually edit generated sections
- Ignore staleness warnings
- Skip validation
- Let identities drift from reality

## Troubleshooting

### Generation Fails

**Symptom:** `npm run generate` fails with errors

**Checks:**

1. Product path exists and is accessible
2. Source files (go.mod, docker-compose.yaml) exist
3. Config YAML is valid
4. Template has proper markers
5. Dependencies installed (`npm install`)

**Solution:**

```bash
# Verify paths
ls -la /path/to/product

# Validate YAML
npx js-yaml .cursor/agents/config/product.config.yaml

# Check template
grep "AUTO-GENERATED" .cursor/agents/templates/product.template.md

# Reinstall
cd scripts/agent-identities && npm install
```

### Validation Fails

**Symptom:** `npm run validate` reports errors

**Common Issues:**

| Error                   | Cause                       | Fix                   |
| ----------------------- | --------------------------- | --------------------- |
| Missing required field  | Incomplete YAML             | Add missing field     |
| Invalid enum value      | Wrong role_type/llm_context | Use valid enum value  |
| Version format invalid  | Wrong semver format         | Use 1.0.0 format      |
| Date format invalid     | Wrong date format           | Use YYYY-MM-DD        |
| Line count out of range | Too short/long              | Adjust content length |

### Staleness Detection

**Symptom:** Pre-commit warns about stale identities

**Cause:** Source files modified since last generation

**Solution:**

```bash
cd testing/container-testing

# Check what's stale
make check-agent-sync

# Regenerate all
make regenerate-agents

# Or regenerate specific
make regenerate-agent PRODUCT=agent-engineer

# Verify
make lint-agents
```

### Missing Files

**Symptom:** Validation reports missing file references

**Cause:** Agent identity references files that don't exist

**Solutions:**

1. **Files moved:** Update template references
2. **Files deleted:** Remove references from template
3. **Wrong path:** Correct path in template/config

### TypeScript Errors

**Symptom:** Build or execution errors

**Checks:**

```bash
cd scripts/agent-identities

# Type checking
npx tsc --noEmit

# Dependencies
npm install

# Node version
node --version  # Should be 20+
```

## Project Structure

```
Sirius/
├── .cursor/
│   ├── agents/
│   │   ├── templates/              # Manual templates
│   │   │   ├── agent-engineer.template.md
│   │   │   ├── api-engineer.template.md
│   │   │   └── ui-engineer.template.md
│   │   ├── config/                 # Generation configs
│   │   │   ├── agent-engineer.config.yaml
│   │   │   ├── api-engineer.config.yaml
│   │   │   └── ui-engineer.config.yaml
│   │   └── docs/                   # System documentation
│   │       ├── ABOUT.agent-identities.md
│   │       ├── TEMPLATE.agent-identity.md
│   │       ├── SPECIFICATION.agent-identity.md
│   │       ├── INDEX.agent-identities.md
│   │       └── GUIDE.creating-agent-identities.md
│   ├── commands/                   # Generated identities (slash commands)
│   │   ├── bot-agent-engineer.md
│   │   ├── bot-api-engineer.md
│   │   └── bot-ui-engineer.md
│   └── rules/
│       └── cursor_rules.mdc        # Documents system
├── scripts/
│   └── agent-identities/
│       ├── package.json            # TypeScript project
│       ├── tsconfig.json
│       ├── src/
│       │   ├── generators/         # Data extractors
│       │   │   ├── index.ts
│       │   │   ├── file-structure.ts
│       │   │   ├── ports.ts
│       │   │   ├── dependencies.ts
│       │   │   ├── config-examples.ts
│       │   │   ├── documentation.ts
│       │   │   └── merge.ts
│       │   ├── validators/         # Validation modules
│       │   │   ├── index.ts
│       │   │   ├── yaml-validator.ts
│       │   │   ├── content-validator.ts
│       │   │   ├── sync-validator.ts
│       │   │   └── file-path-validator.ts
│       │   ├── types/              # Type definitions
│       │   │   ├── agent-identity.ts
│       │   │   ├── extraction.ts
│       │   │   └── template.ts
│       │   └── utils/              # Utilities
│       │       ├── logger.ts
│       │       ├── file-reader.ts
│       │       ├── yaml-parser.ts
│       │       └── markdown-builder.ts
│       ├── lint-agents.ts          # Validation CLI
│       ├── generate-agents.ts      # Generation CLI
│       └── check-sync.ts           # Sync check CLI
├── testing/
│   └── container-testing/
│       └── Makefile                # Commands
└── documentation/
    └── dev/
        └── ai-rules/
            └── README.ai-identities.md  # This file
```

## Examples

### Example: Creating API Engineer Identity

**1. Create Template:**

```markdown
---
name: "API Engineer"
title: "API Engineer (sirius-api/Go/Fiber)"
description: "Develops REST API backend with Fiber framework"
role_type: engineering
# ... metadata
---

# API Engineer (sirius-api/Go/Fiber)

<!-- MANUAL SECTION -->

Develops the REST API backend for Sirius Scan using Go and Fiber framework.
Focuses on vulnerability data endpoints, scan management, and integration
with PostgreSQL, RabbitMQ, and Valkey.

<!-- END MANUAL SECTION -->

## Project Location

<!-- AUTO-GENERATED: file-structure -->
<!-- END AUTO-GENERATED -->

## Technology Stack

<!-- AUTO-GENERATED: dependencies -->
<!-- END AUTO-GENERATED -->
```

**2. Create Config:**

```yaml
product: sirius-api
product_path: /Users/oz/Projects/Sirius-Project/Sirius/sirius-api
docker_service_name: sirius-api

metadata:
  name: "API Engineer"
  # ... metadata

generation:
  include_file_structure: true
  include_dependencies: true
  dependencies_source: go.mod
  dependencies_grouping:
    "Web Framework":
      - "github.com/gofiber/fiber/v2"
    "Database":
      - "github.com/lib/pq"
```

**3. Generate:**

```bash
cd testing/container-testing
make regenerate-agent PRODUCT=api-engineer
```

## Resources

### System Documentation

- **`.cursor/agents/docs/ABOUT.agent-identities.md`** - System philosophy
- **`.cursor/agents/docs/TEMPLATE.agent-identity.md`** - Universal template
- **`.cursor/agents/docs/SPECIFICATION.agent-identity.md`** - Technical spec
- **`.cursor/agents/docs/INDEX.agent-identities.md`** - Agent registry
- **`.cursor/agents/docs/GUIDE.creating-agent-identities.md`** - Creation guide

### Implementation

- **`/agent-identity-system.plan.md`** - Implementation plan
- **`scripts/agent-identities/README.md`** - Generation system docs
- **`testing/container-testing/Makefile`** - Commands

### Related Documentation

- **`documentation/dev/ABOUT.documentation.md`** - Documentation standards
- **`documentation/dev/README.development.md`** - Development workflow
- **`.cursor/rules/cursor_rules.mdc`** - Cursor rules

## Support

### Getting Help

1. **Check documentation** in `.cursor/agents/docs/`
2. **Review examples** in existing agent identities
3. **Run validation** to get specific error messages
4. **Check logs** for generation/validation details

### Reporting Issues

When reporting issues, include:

- Command that failed
- Error message (full output)
- Config file content
- Template file content
- Node.js version (`node --version`)

### Contributing

To contribute improvements:

1. Update TypeScript generators/validators
2. Test with `npm run validate`
3. Update documentation
4. Submit PR with examples

---

**Last Updated:** 2025-10-25  
**Version:** 1.0.0  
**Maintainer:** Sirius Team
