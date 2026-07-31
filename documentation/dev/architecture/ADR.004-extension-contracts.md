---
title: "ADR-004: Extension Contracts"
description: "Public extension seams for API modules, UI registry, events, and engine enrichment that Pro consumes without forking Community."
template: "TEMPLATE.reference"
llm_context: "high"
categories: ["architecture", "api", "ui"]
tags: ["adr", "extensions", "contracts", "modules", "go-api", "ui-registry"]
related_docs:
  - "ADR.001-public-core-private-extension.md"
  - "ADR.003-entitlement-model.md"
  - "README.go-api-sdk.md"
  - "README.api-openapi-contract.md"
  - "../../dev-notes/pro-bifurcation-plan.md"
---

# ADR-004: Extension Contracts

## Status

Accepted

## Context

Today the API registers Fiber routes through a `RouteSetter` interface wired in `main.go`, the UI hardcodes navigation and manually lists tRPC routers, and RabbitMQ messages are ad hoc JSON without envelopes. Pro cannot safely extend these surfaces without forking public files unless versioned contracts exist.

## Decision

1. **Go contracts live in public `go-api`**. Evolve `RouteSetter` into a `Module` interface with identity, version, route/job/event registration, required capabilities, and health.
2. **Compile-time registration for v1**. Community builds register core modules in a replaceable build file; Pro builds register core plus proprietary modules. No runtime-loaded plugins initially.
3. **UI uses a build-time extension registry** (`SiriusUIExtension` for routes, navigation, widgets, settings, `requiredCapabilities`). Pro UI images clone public `sirius-ui` at a pinned SHA and overlay private modules (same composition pattern as the engine).
4. **Events use a CloudEvents-compatible envelope** (type, schema version, source, correlation ID, idempotency key) with JSON schemas validated in CI; Pro queues use a `pro.*` namespace.
5. **API namespaces**: `/api/v1` public, `/api/pro/v1` Pro-only, `/api/internal/v1` inter-service.
6. **Engine exposes enrichment/scoring/scheduling interfaces** with deterministic ordering and health reporting; Community runs with empty Pro registries.
7. **Database ownership**: core migrations use `schema_migrations_core`; Pro uses a dedicated `pro` schema and `schema_migrations_pro`. Core must tolerate Pro tables being absent.

## Consequences

### Positive

- Pro extends Community without modifying public routers or Sidebar.
- Contract tests can detect breaking changes before Pro upgrade.
- Community behavior remains unchanged with zero Pro modules loaded.

### Tradeoffs

- Inventory and migration work is required before the first Pro vertical.
- Compile-time overlays defer dynamic third-party plugins (acceptable for v1).

## Implementation Notes

- Existing seam to build on: `sirius-api/routes/routes.go` `RouteSetter`.
- Do not publish npm packages on day one; pin+overlay mirrors engine component pins.
- A test extension adding one API route, one UI page, and one event consumer is the Phase 3 exit criterion.
- Community `/api/v1` OpenAPI, route classification, and reserved-namespace policy live in
  [README.api-openapi-contract.md](README.api-openapi-contract.md) and
  `sirius-api/contracts/`.
