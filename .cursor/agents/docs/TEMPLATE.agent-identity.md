---
name: "Agent Name"
title: "Full Title (Technology/Context)"
description: "One-line description of agent's purpose and focus"
role_type: "engineering"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Team Name"
specialization: ["specialization1", "specialization2"]
technology_stack: ["tech1", "tech2", "tech3"]
system_integration_level: "medium"
categories: ["category1", "category2"]
tags: ["tag1", "tag2", "tag3"]
related_docs:
  - "README.architecture.md"
  - "README.development.md"
dependencies: []
llm_context: "high"
context_window_target: 300
---

# [Agent Name] ([Primary Technology/Context])

[2-3 sentence role summary explaining what this agent does, its primary focus, and its scope within the Sirius project. Be clear and specific about boundaries.]

## Key Documentation

Essential documentation for this role (link 5-10 most critical documents):

### Architecture & Design

- [System Architecture](mdc:documentation/dev/architecture/README.architecture.md) - Overall system design
- [Docker Architecture](mdc:documentation/dev/architecture/README.docker-architecture.md) - Container infrastructure

### Development & Workflow

- [Development Workflow](mdc:documentation/dev/README.development.md) - Development standards
- [Container Testing](mdc:documentation/dev/test/README.container-testing.md) - Testing requirements

### Role-Specific Documentation

- [Role-specific doc 1](mdc:path/to/doc.md) - Brief description
- [Role-specific doc 2](mdc:path/to/doc.md) - Brief description

## Project Location

[Show where this role's work lives in the codebase]

```
sirius-project/
├── component-name/              # Primary component
│   ├── src/                     # Source code
│   │   ├── main/               # Main application
│   │   └── tests/              # Test files
│   ├── config/                  # Configuration
│   └── docs/                    # Component documentation
└── related-component/           # Related components
    └── integration/             # Integration points
```

## Core Responsibilities

### Primary Responsibilities

- **Responsibility 1** - Description of primary task
- **Responsibility 2** - Description of another primary task
- **Responsibility 3** - Description of another primary task

### Secondary Responsibilities

- **Support Task 1** - Description of support task
- **Support Task 2** - Description of support task

### Collaboration Points

- **Team/Role 1** - How you collaborate, what you provide/receive
- **Team/Role 2** - How you collaborate, what you provide/receive

## Technology Stack

### Programming Languages

- **Primary Language** - Version, key features used
- **Secondary Language** - When used, purpose

### Frameworks & Libraries

- **Framework 1** - Version, purpose, key features
- **Framework 2** - Version, purpose, key features
- **Library 1** - Purpose, integration

### Tools & Services

- **Tool 1** - Purpose, usage
- **Tool 2** - Purpose, usage
- **Service 1** - Integration, purpose

### Development Environment

- **Local Setup** - Requirements, configuration
- **Container Environment** - Docker specifics, volumes
- **Dependencies** - External services, databases

## System Integration

[Include this section if system_integration_level is "medium" or "high". Omit for "low" or "none".]

### Integration Architecture

[Brief description of how this component integrates with the broader system]

```
┌─────────────────────────────────────────────┐
│           [Component Name]                   │
│  ┌─────────────┐      ┌─────────────┐      │
│  │   Module A  │◄────►│   Module B  │      │
│  └─────────────┘      └─────────────┘      │
└─────────────┬───────────────────┬───────────┘
              │                   │
              │ Protocol 1        │ Protocol 2
              ▼                   ▼
      ┌───────────────┐   ┌───────────────┐
      │  Service 1    │   │  Service 2    │
      └───────────────┘   └───────────────┘
```

### Communication Protocols

[For "high" integration level, detail protocols. For "medium", provide overview.]

- **Protocol 1** - Type (REST/gRPC/etc), purpose, endpoints
- **Protocol 2** - Type, purpose, message formats

### Data Flows

[For "high" integration level, detail data flows. For "medium", provide key flows.]

- **Flow 1**: Source → Processing → Destination
- **Flow 2**: Source → Processing → Destination

### Key Integration Points

- **Integration 1** - What connects, how, why
- **Integration 2** - What connects, how, why

## Development Workflow

### Setup & Initialization

```bash
# Clone and navigate
cd /path/to/component

# Install dependencies
[package-manager] install

# Configure environment
cp .env.example .env
# Edit .env with appropriate values

# Initialize services
[initialization-command]
```

### Daily Development Tasks

```bash
# Start development environment
[dev-start-command]

# Run in watch mode
[watch-command]

# View logs
[log-command]
```

### Testing & Validation

```bash
# Run unit tests
[unit-test-command]

# Run integration tests
[integration-test-command]

# Run linting
[lint-command]

# Run full validation
[full-validation-command]
```

### Build & Deployment

```bash
# Build for production
[build-command]

# Build container
[container-build-command]

# Deploy to environment
[deploy-command]
```

## Code Patterns & Best Practices

[Include 2-5 code examples for engineering roles. Omit for non-coding roles.]

### Pattern 1: [Pattern Name]

[Brief description of when and why to use this pattern]

```[language]
// ✅ GOOD: Clear example of correct pattern
[good-example-code]

// ❌ BAD: Example of what to avoid
[bad-example-code]
```

### Pattern 2: [Pattern Name]

[Brief description of when and why to use this pattern]

```[language]
// ✅ GOOD: Clear example of correct pattern
[good-example-code]
```

### Pattern 3: [Pattern Name]

[Brief description of when and why to use this pattern]

```[language]
// Key considerations:
// - Point 1
// - Point 2
// - Point 3

[example-code]
```

## Common Tasks

### Task Category 1

#### Task 1: [Task Name]

```bash
# Description of what this does
[command]
```

#### Task 2: [Task Name]

```bash
# Description of what this does
[command-1]
[command-2]
```

### Task Category 2

#### Task 3: [Task Name]

**Steps:**

1. First step with command: `[command]`
2. Second step with command: `[command]`
3. Third step verification: `[command]`

#### Task 4: [Task Name]

**Process:**

```bash
# Step 1: Description
[command]

# Step 2: Description
[command]

# Step 3: Verification
[verification-command]
```

## Troubleshooting Quick Reference

### Common Issues

| Issue       | Symptoms                  | Solution                   |
| ----------- | ------------------------- | -------------------------- |
| **Issue 1** | Error message or behavior | Quick fix command or steps |
| **Issue 2** | Error message or behavior | Quick fix command or steps |
| **Issue 3** | Error message or behavior | Quick fix command or steps |

### Debugging Commands

```bash
# Check system status
[status-command]

# View detailed logs
[detailed-log-command]

# Validate configuration
[config-check-command]

# Test connectivity
[connection-test-command]
```

### Quick Fixes

**Problem:** [Common problem description]

**Solution:**

```bash
# Quick fix
[fix-command]
```

**Problem:** [Another common problem]

**Solution:**

1. First step: `[command]`
2. Second step: `[command]`
3. Verify: `[verification]`

### When to Escalate

- **Issue Type 1** - Contact [Team/Person], provide [specific-info]
- **Issue Type 2** - Check [documentation/logs], escalate if [condition]
- **Issue Type 3** - File issue with [details], tag [team]

### Useful Resources

- [Resource 1](mdc:path/to/resource.md) - When to use this
- [Resource 2](mdc:path/to/resource.md) - When to use this
- [Resource 3](https://external-resource.com) - External resource

---

**Constraints & Guidelines:**

- [Key constraint or guideline 1]
- [Key constraint or guideline 2]
- [Key constraint or guideline 3]

**Related Agents:**

- [Related Agent 1](mdc:.cursor/agents/related-agent.agent.md) - Relationship description
- [Related Agent 2](mdc:.cursor/agents/related-agent.agent.md) - Relationship description

---

_Last Updated: [ISO-8601 Date] | Version: [Semantic Version]_
