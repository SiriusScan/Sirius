# Agent Identity Generation System

A TypeScript-based system for generating comprehensive agent identity files from documentation and code.

## Overview

This system combines **manual templates** (role summaries, best practices) with **auto-generated sections** (file structure, ports, dependencies, configs) to create comprehensive agent identities (~1200-1500 lines).

## Quick Start

```bash
# Install dependencies
npm install

# Generate all agent identities
npm run generate -- --all

# Generate specific agent
npm run generate -- --product=agent-engineer

# Validate agent identities
npm run validate

# Check for stale identities
npm run check-sync
```

## Commands

### Generation

```bash
# Generate all agent identities
npm run generate -- --all

# Generate specific product
npm run generate -- --product=<product-name>

# Example
npm run generate -- --product=agent-engineer
```

### Validation

```bash
# Full validation (YAML, content, sync, file paths)
npm run validate

# Check if identities need regeneration
npm run check-sync
```

### Via Makefile

```bash
cd testing/container-testing

# Generation
make regenerate-agents                    # All
make regenerate-agent PRODUCT=agent-engineer  # Specific

# Validation
make lint-agents                          # Full
make check-agent-sync                     # Sync check
```

## Project Structure

```
scripts/agent-identities/
├── package.json              # Project config
├── tsconfig.json             # TypeScript config
├── src/
│   ├── generators/           # Data extractors
│   │   ├── index.ts         # Main orchestrator
│   │   ├── file-structure.ts
│   │   ├── ports.ts
│   │   ├── dependencies.ts
│   │   ├── config-examples.ts
│   │   ├── documentation.ts
│   │   └── merge.ts
│   ├── validators/           # Validation modules
│   │   ├── yaml-validator.ts
│   │   ├── content-validator.ts
│   │   ├── sync-validator.ts
│   │   └── file-path-validator.ts
│   ├── types/                # Type definitions
│   └── utils/                # Utilities
├── lint-agents.ts            # Validation CLI
├── generate-agents.ts        # Generation CLI
└── check-sync.ts             # Sync check CLI
```

## Creating a New Agent Identity

### 1. Create Template

Create `.cursor/agents/templates/<name>.template.md`:

```markdown
---
# YAML front matter (manually maintained)
name: "My Agent"
title: "My Agent (product/Tech)"
# ... metadata
---

# My Agent

<!-- MANUAL SECTION -->
Manual narrative content
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
```

### 2. Create Config

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
  related_docs: ["doc1.md", "doc2.md"]
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
  dependencies_source: go.mod  # or package.json
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

### 3. Generate

```bash
npm run generate -- --product=<name>
```

### 4. Validate

```bash
npm run validate
```

## Template Markers

### AUTO-GENERATED Sections

Sections between these markers are auto-generated:

```markdown
<!-- AUTO-GENERATED: section-name -->
Content is replaced on each generation
<!-- END AUTO-GENERATED -->
```

### MANUAL Sections

Sections between these markers are preserved:

```markdown
<!-- MANUAL SECTION -->
Content is preserved across generations
<!-- END MANUAL SECTION -->
```

## Available Generators

### file-structure
Extracts directory tree from product path with max depth and ignore patterns.

### ports
Extracts port mappings from docker-compose.yaml for specified service.

### dependencies
Extracts and groups dependencies from go.mod or package.json.

### config-examples
Extracts and formats configuration file contents.

### documentation-links
Generates documentation links from related_docs list.

### code-patterns
Extracts code patterns, best practices, and common tasks from documentation.

## Validation

### YAML Front Matter
- Required fields present
- Enum values valid (role_type, llm_context, etc.)
- Version format (semver: 1.0.0)
- Date format (YYYY-MM-DD)

### Content
- Line count in range (150-2000)
- Warning if outside target (800-1500)
- Required sections present

### Sync Status
- Compares source file modification times
- Detects when regeneration needed
- Tracks source files via metadata

### File Paths
- Extracts file references from content
- Verifies files exist
- Reports missing files

## Generation Metadata

Generated files include metadata:

```yaml
---
# ... standard metadata ...
_generated_at: "2025-10-25T10:30:00.000Z"
_source_files:
  - "/path/to/source1"
  - "/path/to/source2"
---
```

This enables:
- Staleness detection
- Source tracking
- Regeneration decisions

## Development

### Run Tests

```bash
npm test  # (when tests are added)
```

### Build

```bash
npm run build
```

### Type Check

```bash
npx tsc --noEmit
```

## Troubleshooting

### "Cannot find module"

Ensure dependencies are installed:
```bash
npm install
```

### "Config file not found"

Check config path in command:
```bash
npm run generate -- --product=<exact-name>
```

Config must exist at `.cursor/agents/config/<exact-name>.config.yaml`

### "Template not found"

Check template_path in config file points to valid template.

### Generation Fails

Check:
1. Product path exists and is accessible
2. Source files (go.mod, docker-compose.yaml) exist
3. Config YAML is valid
4. Template has proper markers

### Validation Fails

Check:
1. YAML front matter has all required fields
2. Field values match enum options
3. Version and date formats correct
4. File is within line count limits

## Integration with Workflow

### Pre-Commit Hook

Agent identities are validated on commit when source files change.

### CI/CD

Use in CI/CD pipelines:

```bash
cd scripts/agent-identities
npm run validate || exit 1
```

### Makefile

Integrated with project Makefile:

```bash
make regenerate-agents        # Generate all
make regenerate-agent PRODUCT=name  # Generate specific
make check-agent-sync         # Check staleness
make lint-agents              # Validate all
```

## Best Practices

1. **Manual Sections:** Use for narrative, philosophy, best practices
2. **Auto-Generated Sections:** Use for structural info (files, ports, deps)
3. **Regular Regeneration:** Regenerate after major changes
4. **Validate Before Commit:** Run validation before committing
5. **Keep Templates Clean:** Don't add manual content in auto-generated sections

## Resources

- **Plan:** `/agent-identity-system.plan.md`
- **Implementation Summary:** `/AGENT-IDENTITY-GENERATION-IMPLEMENTED.md`
- **Templates:** `.cursor/agents/templates/`
- **Configs:** `.cursor/agents/config/`
- **Generated Identities:** `.cursor/agents/*.agent.md`

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-25


