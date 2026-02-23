---
title: "Startup & Secrets Redesign - Project Plan"
description: "Detailed implementation strategy for installer-first startup, secure secret defaults, and stateless infrastructure API key validation."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2026-02-22"
author: "Development Team"
tags: ["project-plan", "startup", "secrets", "installer", "auth", "docker"]
categories: ["development", "planning", "security", "operations"]
difficulty: "advanced"
prerequisites: ["docker", "docker-compose", "go", "nextauth", "prisma"]
related_docs:
  - "README.tasks.md"
  - "README.new-project.md"
  - "README.api-key-operations.md"
  - "README.auth-surface-matrix.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "startup redesign",
    "secrets management",
    "installer",
    "sirius_api_key",
    "initial_admin_password",
    "docker compose hardening",
  ]
---

# Startup & Secrets Redesign - Project Plan

## Project Overview

**Goal**: Deliver a secure-by-default and low-friction startup experience for Sirius using an installer-first flow, deterministic service key behavior, and strict runtime contracts.

**Scope**:
- Build a first-run installer workflow.
- Remove insecure secret defaults and weak fallbacks.
- Keep root service API key stateless from environment while preserving Valkey-backed user-generated keys.
- Update docs, tests, and CI to match new startup and security expectations.

## Key Outcomes

1. **Installer-first onboarding** for local and automation environments.
2. **No default admin password** in seed/startup workflows.
3. **Deterministic infra key auth** independent of Valkey bootstrap state.
4. **Updated deployment docs** for compose, Terraform, and secrets hardening options.
5. **Aligned validation pipeline** across local tests and CI.

## Technical Strategy

### 1) Installer Productization
- Create an installer module that loads `.env.production.example`, merges existing `.env`, and generates missing required secrets.
- Support interactive and non-interactive modes with output safety options for CI and production automation.
- Preserve backward compatibility by keeping `setup.sh` as a transition wrapper.

### 2) Runtime Contract Hardening
- Require critical auth and seed secrets in compose files.
- Remove fallback values that mask misconfiguration in production.
- Enforce fail-fast behavior in seed and UI runtime config when required secrets are missing.

### 3) Auth Model Clarification
- Validate infra requests statelessly using `SIRIUS_API_KEY` from environment.
- Retain Valkey-backed validation only for dynamic/user-generated API keys.
- Document this split clearly in runbooks and architecture docs.

### 4) Verification and Rollout
- Update tests and CI job environments to provide required vars.
- Add optional secrets overlays (`compose`/`swarm`) for hardened deployments.
- Publish migration notes for existing users.

## Milestones

### Milestone A: Foundations
- Add task tracker and this plan note.
- Record architecture decision updates.

### Milestone B: Installer + Compatibility
- Implement installer command and internals.
- Add compatibility wrapper behavior in `setup.sh`.

### Milestone C: Runtime + Auth Hardening
- Patch compose/env/auth/seed/script behavior.
- Validate stateless root-key and dynamic key paths.

### Milestone D: Docs + Validation Pipeline
- Rewrite onboarding/deployment/runbook docs.
- Update container tests and CI workflows.

### Milestone E: Optional Hardening + Release
- Add secrets overlay files.
- Execute release verification matrix and migration notes.

## Success Criteria

- [ ] Fresh install with Docker only can generate valid config and start successfully.
- [ ] Admin login uses installer-provided/generated password; no default password remains.
- [ ] Root API key rotation works via config change and restart without Valkey state repair.
- [ ] User-generated API keys continue to work for create/list/revoke.
- [ ] CI compose checks and security suites pass with strict required variables.
- [ ] Documentation reflects installer-first and stateless root-key architecture.

## Risks and Mitigations

- **Risk**: Startup regressions due to stricter required env vars.
  - **Mitigation**: Provide explicit preflight checks and actionable error messages.
- **Risk**: Existing users may depend on old defaults.
  - **Mitigation**: Add compatibility wrapper and migration notes.
- **Risk**: CI breakage from new required vars.
  - **Mitigation**: Update CI and test scripts in same change set.

## Notes

This plan intentionally prioritizes secure defaults and deterministic behavior over permissive startup fallbacks. The migration path remains pragmatic by preserving compatibility entrypoints while moving users to the installer model.
