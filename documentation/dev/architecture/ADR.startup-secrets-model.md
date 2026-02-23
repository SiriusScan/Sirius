---
title: "ADR: Startup and Secrets Model"
description: "Architectural decision record for installer-first startup and stateless infrastructure API key validation."
template: "TEMPLATE.reference"
llm_context: "high"
categories: ["architecture", "security", "operations"]
tags: ["adr", "startup", "secrets", "apikey", "docker", "installer"]
related_docs:
  - "README.auth-surface-matrix.md"
  - "README.api-key-operations.md"
  - "README.docker-container-deployment.md"
---

# ADR: Startup and Secrets Model

## Status

Accepted

## Context

Sirius startup historically depended on manual environment setup and a bootstrap pattern that could create drift between runtime configuration and persistent key state. The platform also tolerated insecure defaults in startup and seeding paths.

## Decision

1. **Installer-first startup**: a first-run installer is the canonical setup path for generating and merging required secrets/config.
2. **Stateless infrastructure key path**: `SIRIUS_API_KEY` from runtime environment is the authority for service-to-service root authentication.
3. **Dynamic key lifecycle in Valkey**: user-generated API keys continue to be managed in Valkey.
4. **Secure fail-fast runtime**: production startup and seeding flows must fail when required secrets are missing.

## Consequences

### Positive

- Deterministic behavior during restart and key rotation.
- Reduced operational complexity from bootstrap reconciliation state.
- Better first-time user experience with automated secret generation.
- Clear separation between infrastructure auth and user key lifecycle.

### Tradeoffs

- Stricter env requirements may break permissive legacy startup paths until migrated.
- CI/test and deployment scripts must be updated to provide required variables.

## Implementation Notes

- Use `docker-compose.installer.yaml` as the canonical installer entrypoint.
- Ensure compose contracts explicitly require auth-critical variables.
- Update runbooks and deployment documentation in lockstep with runtime changes.
