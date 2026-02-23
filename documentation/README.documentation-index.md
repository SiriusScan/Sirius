---
title: "Documentation Index"
description: "Complete index of all documentation files in the Sirius project, organized by category and purpose"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2026-02-22"
author: "Development Team"
tags: ["documentation", "index", "reference", "organization"]
categories: ["documentation", "reference"]
difficulty: "beginner"
prerequisites: []
related_docs: []
dependencies: []
llm_context: "high"
search_keywords:
  ["documentation", "index", "files", "organization", "reference"]
---

# Documentation Index

This document provides a complete index of all documentation files in the Sirius project, organized by category and purpose.

## Core Documentation

### System Documentation

- [ABOUT.documentation.md](dev/ABOUT.documentation.md) - Documentation standards and system overview
- [README.development.md](dev/README.development.md) - Development environment setup and workflow
- [README.developer-guide.md](dev/README.developer-guide.md) - Comprehensive developer guide for Sirius project
- [QUICK-REFERENCE.md](dev/QUICK-REFERENCE.md) - Quick reference guide for common operations
- [QUICKREF.template-types.md](dev/QUICKREF.template-types.md) - Quick reference for documentation template types
- [README.logging-conventions.md](dev/development/README.logging-conventions.md) - Structured logging conventions and standards
- [README.sirius-event-log.md](dev/development/README.sirius-event-log.md) - Sirius event logging system and event management
- [README.ui-style-guide.md](dev/development/README.ui-style-guide.md) - UI style guide and design system documentation

### Contributing

- [contributing.md](contributing.md) - Complete guide for contributing to Sirius Scan, including development setup and workflows

## Architecture Documentation

### System Architecture

- [README.architecture.md](dev/architecture/README.architecture.md) - System architecture and component relationships
- [README.architecture-quick-reference.md](dev/architecture/README.architecture-quick-reference.md) - Concise architectural overview for LLM context
- [README.system-monitor.md](dev/architecture/README.system-monitor.md) - System monitoring architecture and implementation
- [README.administrator.md](dev/architecture/README.administrator.md) - Administrator service architecture and design
- [README.cicd.md](dev/architecture/README.cicd.md) - CI/CD pipeline architecture and workflows
- [README.go-api-sdk.md](dev/architecture/README.go-api-sdk.md) - Go API SDK architecture, design patterns, and integration guide
- [README.auth-surface-matrix.md](dev/architecture/README.auth-surface-matrix.md) - Authentication and authorization policy matrix across API surfaces
- [ADR.startup-secrets-model.md](dev/architecture/ADR.startup-secrets-model.md) - Architectural decision record for installer-first startup and secrets model
- [ARCHITECTURE.nse-repository-management.md](dev/architecture/ARCHITECTURE.nse-repository-management.md) - NSE repository management architecture
- [README.docker-architecture.md](dev/architecture/README.docker-architecture.md) - Comprehensive Docker setup and container architecture

## Application Documentation

### Agent System

- [README.agent-system.md](dev/apps/agent/README.agent-system.md) - Agent system architecture and design
- [README.agent-template-api.md](dev/apps/agent/README.agent-template-api.md) - API endpoints for managing agent vulnerability detection templates
- [README.agent-template-ui.md](dev/apps/agent/README.agent-template-ui.md) - User interface workflows for managing agent templates

### Scanner

- [README.scanner.md](dev/apps/scanner/README.scanner.md) - Scanner application documentation
- [ARCHITECTURE.scanner-data-flow.md](dev/apps/scanner/ARCHITECTURE.scanner-data-flow.md) - End-to-end scanner data flow (UI → ValKey → persistence)
- [ARCHITECTURE.sub-scans.md](dev/apps/scanner/ARCHITECTURE.sub-scans.md) - Sub-scan architecture (network/agent, progress, cancellation)
- [ARCHITECTURE.host-deduplication.md](dev/apps/scanner/ARCHITECTURE.host-deduplication.md) - Host deduplication and multi-source attribution

## Operations Documentation

### Git Operations

- [README.git-operations.md](dev/operations/README.git-operations.md) - Git workflows and version control
- [README.api-key-operations.md](dev/operations/README.api-key-operations.md) - API key lifecycle and incident recovery runbook
- [README.release-closeout-v1.0.0.md](dev/operations/README.release-closeout-v1.0.0.md) - Final push, merge, and release acceptance evidence for Sirius v1.0.0
- [README.maintainer-ops-issue-review.md](dev/operations/README.maintainer-ops-issue-review.md) - Label taxonomy, triage lifecycle, and ChatOps issue/PR review controls

### Project Management

- [README.new-project.md](dev/operations/README.new-project.md) - New project development workflow and structure
- [README.tasks.md](dev/operations/README.tasks.md) - Task management system and project tracking
- [startup-secrets-redesign-plan.md](dev-notes/startup-secrets-redesign-plan.md) - Detailed implementation plan for startup and secrets redesign

### Deployment

- [README.terraform-deployment.md](dev/operations/README.terraform-deployment.md) - Terraform-based deployment processes
- [README.docker-container-deployment.md](dev/deployment/README.docker-container-deployment.md) - Docker container deployment using prebuilt registry images
- [README.workflows.md](dev/deployment/README.workflows.md) - GitHub Actions workflow architecture and parallel build system

### SDK Management

- [README.sdk-releases.md](dev/operations/README.sdk-releases.md) - SDK release process and dependency management

## Testing Documentation

### Testing Philosophy

- [ABOUT.testing.md](dev/test/ABOUT.testing.md) - Testing philosophy and approach for the Sirius project

### Container Testing

- [README.container-testing.md](dev/test/README.container-testing.md) - Container testing system and validation

### Documentation Testing

- [README.documentation-testing.md](dev/test/README.documentation-testing.md) - Documentation validation and linting

### Testing Checklists

- [CHECKLIST.testing-by-type.md](dev/test/CHECKLIST.testing-by-type.md) - Issue-type-specific testing checklists for thorough validation

## AI and Rules Documentation

### AI Rules

- [ABOUT.ai-rules.md](dev/ai-rules/ABOUT.ai-rules.md) - AI development rules and guidelines
- [README.ai-identities.md](dev/ai-rules/README.ai-identities.md) - AI identity system and agent personas
- [README.playwright.md](dev/ai-rules/README.playwright.md) - Playwright browser testing guide for automated testing and validation

## Template Documentation

### Documentation Templates

- [TEMPLATE.about.md](dev/templates/TEMPLATE.about.md) - Template for ABOUT documents
- [TEMPLATE.api.md](dev/templates/TEMPLATE.api.md) - Template for API documentation
- [TEMPLATE.architecture.md](dev/templates/TEMPLATE.architecture.md) - Template for architecture documentation
- [TEMPLATE.custom.md](dev/templates/TEMPLATE.custom.md) - Template for custom documents
- [TEMPLATE.documentation-standard.md](dev/templates/TEMPLATE.documentation-standard.md) - Standard documentation template
- [TEMPLATE.guide.md](dev/templates/TEMPLATE.guide.md) - Template for step-by-step guides
- [TEMPLATE.reference.md](dev/templates/TEMPLATE.reference.md) - Template for reference documentation
- [TEMPLATE.template.md](dev/templates/TEMPLATE.template.md) - Template for template documentation
- [TEMPLATE.troubleshooting.md](dev/templates/TEMPLATE.troubleshooting.md) - Template for troubleshooting guides

## Usage

This index serves as the central reference for all documentation in the Sirius project. Use it to:

- **Find specific documentation** by category or purpose
- **Understand the documentation structure** and organization
- **Navigate between related documents** using the links provided
- **Ensure documentation completeness** by checking against this index

## Maintenance

This index should be updated whenever:

- New documentation files are added
- Documentation files are moved or renamed
- Documentation categories are reorganized

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](dev/ABOUT.documentation.md)._
