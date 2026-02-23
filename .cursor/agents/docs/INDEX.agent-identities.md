---
title: "Agent Identity Index"
description: "Central registry of all Sirius agent identities organized by role type"
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags: ["index", "agent-identities", "registry"]
categories: ["ai-tooling", "documentation"]
difficulty: "beginner"
prerequisites: []
related_docs:
  - "ABOUT.agent-identities.md"
  - "TEMPLATE.agent-identity.md"
  - "SPECIFICATION.agent-identity.md"
dependencies: []
llm_context: "high"
search_keywords: ["agent index", "agent list", "agent registry"]
---

# Agent Identity Index

Central registry of all agent identities in the Sirius project. Use this index to discover available agents and their specializations.

## Quick Reference

| Agent                                                                              | Role Type     | Integration Level | Status        |
| ---------------------------------------------------------------------------------- | ------------- | ----------------- | ------------- |
| [Backend API Engineer](mdc:.cursor/agents/backend-api-engineer.agent.md)           | engineering   | medium            | ✅ Active     |
| [CI/CD Engineer](mdc:.cursor/agents/cicd-engineer.agent.md)                        | operations    | medium            | ✅ Active     |
| [Database Storage Engineer](mdc:.cursor/agents/database-storage-engineer.agent.md) | engineering   | medium            | ✅ Active     |
| [DevOps Platform Engineer](mdc:.cursor/agents/devops-platform-engineer.agent.md)   | operations    | high              | ✅ Active     |
| [Engine Scanner Engineer](mdc:.cursor/agents/engine-scanner-engineer.agent.md)     | engineering   | medium            | ✅ Active     |
| [Frontend Engineer](mdc:.cursor/agents/frontend-engineer.agent.md)                 | engineering   | low               | ✅ Active     |
| [Project Task Coordinator](mdc:.cursor/agents/project-task-coordinator.agent.md)   | product       | none              | ✅ Active     |
| [QA Test Engineer](mdc:.cursor/agents/qa-test-engineer.agent.md)                   | qa            | low               | ✅ Active     |
| [Remote Agent Engineer](mdc:.cursor/commands/remote-agent-engineer.agent.md)       | engineering   | high              | 🔄 Converting |
| [Scanner UI Engineer](mdc:.cursor/agents/scanner-ui-engineer.agent.md)             | engineering   | low               | ✅ Active     |
| [Security Template Curator](mdc:.cursor/agents/security-template-curator.agent.md) | documentation | none              | ✅ Active     |
| [SRE Monitoring Engineer](mdc:.cursor/agents/sre-monitoring-engineer.agent.md)     | operations    | high              | ✅ Active     |
| [Maintainer Ops](mdc:.cursor/commands/bot-maintainer-ops.md)                       | operations    | high              | ✅ Active     |
| [System Architect](mdc:.cursor/agents/system-architect.agent.md)                   | engineering   | high              | ✅ Active     |
| [Technical Writer](mdc:.cursor/agents/technical-writer.agent.md)                   | documentation | none              | ✅ Active     |

## By Role Type

### Engineering

Agents focused on software development, system building, and technical implementation.

#### Backend Engineers

- **[Backend API Engineer](mdc:.cursor/agents/backend-api-engineer.agent.md)**

  - Specialization: Go/Fiber REST APIs, PostgreSQL, Valkey, RabbitMQ
  - Integration: Medium (API layer, database, message queue)
  - Tech Stack: Go, Fiber, PostgreSQL, Valkey, RabbitMQ

- **[Remote Agent Engineer](mdc:.cursor/commands/remote-agent-engineer.agent.md)**

  - Specialization: gRPC agent-server architecture, template system, vulnerability detection
  - Integration: High (gRPC, RabbitMQ, Valkey, template sync)
  - Tech Stack: Go, gRPC, Protocol Buffers, Valkey, RabbitMQ

- **[Database Storage Engineer](mdc:.cursor/agents/database-storage-engineer.agent.md)**
  - Specialization: PostgreSQL, database design, migrations, performance
  - Integration: Medium (database layer, data models)
  - Tech Stack: PostgreSQL, Prisma, SQL

#### Frontend Engineers

- **[Frontend Engineer](mdc:.cursor/agents/frontend-engineer.agent.md)**

  - Specialization: Next.js, TypeScript, React, Tailwind CSS
  - Integration: Low (API consumption, UI components)
  - Tech Stack: Next.js, TypeScript, React, Tailwind, tRPC

- **[Scanner UI Engineer](mdc:.cursor/agents/scanner-ui-engineer.agent.md)**
  - Specialization: Scanner interface, scan management, results visualization
  - Integration: Low (API consumption for scans)
  - Tech Stack: Next.js, TypeScript, React, Tailwind

#### Infrastructure Engineers

- **[Engine Scanner Engineer](mdc:.cursor/agents/engine-scanner-engineer.agent.md)**

  - Specialization: Vulnerability scanning, nmap, rustscan, naabu integration
  - Integration: Medium (message queues, scan orchestration)
  - Tech Stack: Go, nmap, rustscan, naabu, RabbitMQ

- **[System Architect](mdc:.cursor/agents/system-architect.agent.md)**
  - Specialization: System architecture, microservices, data flows, cross-cutting design
  - Integration: High (entire system, all services)
  - Tech Stack: Architecture patterns, Docker, microservices

### Operations

Agents focused on infrastructure, deployment, and system reliability.

- **[DevOps Platform Engineer](mdc:.cursor/agents/devops-platform-engineer.agent.md)**

  - Specialization: Docker, container orchestration, deployment automation
  - Integration: High (entire platform, all containers)
  - Tech Stack: Docker, Docker Compose, bash, infrastructure tools

- **[CI/CD Engineer](mdc:.cursor/agents/cicd-engineer.agent.md)**

  - Specialization: Build pipelines, automated testing, deployment workflows
  - Integration: Medium (CI/CD systems, build processes)
  - Tech Stack: GitHub Actions, testing frameworks, deployment tools

- **[SRE Monitoring Engineer](mdc:.cursor/agents/sre-monitoring-engineer.agent.md)**
  - Specialization: System monitoring, alerting, observability, incident response
  - Integration: High (monitoring all services, metrics collection)
  - Tech Stack: Monitoring tools, metrics systems, alerting platforms

- **[Maintainer Ops](mdc:.cursor/commands/bot-maintainer-ops.md)**
  - Specialization: Issue triage taxonomy, ChatOps command handling, evidence-driven review
  - Integration: High (issues, PRs, workflows, runbooks, test evidence)
  - Tech Stack: GitHub Actions, issue forms, labels, container/security test harnesses

### QA

Agents focused on quality assurance, testing, and validation.

- **[QA Test Engineer](mdc:.cursor/agents/qa-test-engineer.agent.md)**
  - Specialization: Test strategies, test automation, quality metrics
  - Integration: Low (test interfaces, validation)
  - Tech Stack: Testing frameworks, Playwright, container testing

### Product

Agents focused on product management, coordination, and stakeholder communication.

- **[Project Task Coordinator](mdc:.cursor/agents/project-task-coordinator.agent.md)**
  - Specialization: Task management, project planning, coordination
  - Integration: None (process-focused, not technical)
  - Tech Stack: Task Master CLI, project management tools

### Documentation

Agents focused on technical writing, documentation, and knowledge management.

- **[Technical Writer](mdc:.cursor/agents/technical-writer.agent.md)**

  - Specialization: Technical documentation, API docs, user guides
  - Integration: None (documentation-focused)
  - Tech Stack: Markdown, documentation systems, templates

- **[Security Template Curator](mdc:.cursor/agents/security-template-curator.agent.md)**
  - Specialization: Vulnerability templates, CVE tracking, template validation
  - Integration: None (template content focused)
  - Tech Stack: YAML, vulnerability databases, CVE resources

## Complete List

### System Files

- [ABOUT.agent-identities.md](mdc:.cursor/agents/ABOUT.agent-identities.md) - Agent identity system documentation
- [TEMPLATE.agent-identity.md](mdc:.cursor/agents/TEMPLATE.agent-identity.md) - Universal agent identity template
- [SPECIFICATION.agent-identity.md](mdc:.cursor/agents/SPECIFICATION.agent-identity.md) - Technical specification
- [INDEX.agent-identities.md](mdc:.cursor/agents/INDEX.agent-identities.md) - This index
- [GUIDE.creating-agent-identities.md](mdc:.cursor/agents/GUIDE.creating-agent-identities.md) - Creation guide
- [REFERENCE.integration-levels.md](mdc:.cursor/agents/REFERENCE.integration-levels.md) - Integration patterns

### Active Agents (Alphabetical)

1. **Backend API Engineer** - `backend-api-engineer.agent.md`
2. **CI/CD Engineer** - `cicd-engineer.agent.md`
3. **Database Storage Engineer** - `database-storage-engineer.agent.md`
4. **DevOps Platform Engineer** - `devops-platform-engineer.agent.md`
5. **Engine Scanner Engineer** - `engine-scanner-engineer.agent.md`
6. **Frontend Engineer** - `frontend-engineer.agent.md`
7. **Project Task Coordinator** - `project-task-coordinator.agent.md`
8. **QA Test Engineer** - `qa-test-engineer.agent.md`
9. **Remote Agent Engineer** - `remote-agent-engineer.agent.md` (in `.cursor/commands/`)
10. **Scanner UI Engineer** - `scanner-ui-engineer.agent.md`
11. **Security Template Curator** - `security-template-curator.agent.md`
12. **SRE Monitoring Engineer** - `sre-monitoring-engineer.agent.md`
13. **System Architect** - `system-architect.agent.md`
14. **Technical Writer** - `technical-writer.agent.md`

## Agent Relationships

### Service-Level Integration

```
┌─────────────────────────────────────────────┐
│         System Architect                    │
│         (High-level coordination)           │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┼─────────┬─────────┐
    │         │         │         │
┌───▼────┐ ┌──▼───┐ ┌──▼───┐ ┌───▼────┐
│Frontend│ │Backend│ │Engine│ │DevOps │
│Engineer│ │  API  │ │Scanner│ │Platform│
└────────┘ └──┬────┘ └──────┘ └───┬────┘
              │                    │
          ┌───▼────┐          ┌────▼───┐
          │Database│          │   SRE  │
          │Storage │          │Monitor │
          └────────┘          └────────┘
```

### Development Workflow

- **System Architect** ↔ All engineering agents (architecture decisions)
- **Backend API Engineer** ↔ **Frontend Engineer** (API contracts)
- **Backend API Engineer** ↔ **Database Storage Engineer** (data models)
- **Engine Scanner Engineer** ↔ **Backend API Engineer** (scan coordination)
- **DevOps Platform Engineer** ↔ All engineers (deployment)
- **QA Test Engineer** ↔ All engineers (quality validation)
- **Technical Writer** ↔ All engineers (documentation)

### Specialized Relationships

- **Remote Agent Engineer** ↔ **Backend API Engineer** (gRPC to REST translation)
- **Scanner UI Engineer** ↔ **Engine Scanner Engineer** (scan interface)
- **Security Template Curator** ↔ **Remote Agent Engineer** (template system)
- **SRE Monitoring Engineer** ↔ **DevOps Platform Engineer** (observability)
- **Project Task Coordinator** ↔ All agents (task management)

## Statistics

**Total Agents:** 15 active + 6 system files

**By Role Type:**

- Engineering: 7 agents (50%)
- Operations: 4 agents (27%)
- QA: 1 agent (7%)
- Product: 1 agent (7%)
- Documentation: 2 agents (14%)

**By Integration Level:**

- High: 4 agents (29%)
- Medium: 5 agents (36%)
- Low: 3 agents (21%)
- None: 2 agents (14%)

**Average Context Window Target:** ~280 lines

## Using This Index

### Finding the Right Agent

1. **By Technology**: Search for your tech stack (e.g., "Go", "React", "Docker")
2. **By Role Type**: Browse the role type sections
3. **By Integration Level**: Check agents with appropriate system knowledge
4. **By Specialization**: Look at specific focus areas

### Starting a Conversation

When starting a new AI conversation:

1. Identify the appropriate agent for your task
2. Reference the agent identity file in your prompt
3. Provide task-specific context beyond the agent identity
4. Let the agent guide you through the workflow

### Creating New Agents

See [GUIDE.creating-agent-identities.md](mdc:.cursor/agents/GUIDE.creating-agent-identities.md) for complete instructions on creating new agent identities.

## Maintenance

### Last Index Update

**Date:** 2025-10-25  
**Updated By:** Sirius Team  
**Changes:** Initial index creation

### Validation

Run index validation:

```bash
cd testing/container-testing
make lint-agent-index
```

### Adding New Agents

1. Create agent using [TEMPLATE.agent-identity.md](mdc:.cursor/agents/TEMPLATE.agent-identity.md)
2. Validate with `make lint-agents`
3. Add entry to this index
4. Verify with `make lint-agent-index`
5. Update statistics and relationships

---

_This index is automatically validated by the agent identity linting system. Last validated: 2025-10-25_
