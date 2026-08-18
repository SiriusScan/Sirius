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
- The Community UI registry lives under `sirius-ui/src/ui/extensions/`. Community
  declarations are registered first; a private build overlays
  `registered.ts` with additional routes, navigation, widgets, and settings
  panels. Registry construction rejects duplicate contribution IDs and route
  patterns before the application renders.
- UI contributions declare opaque `requiredCapabilities` values. The
  `SiriusCapabilityProvider` exposes a neutral `SiriusPrincipal` and capability
  checks to shared components; Community uses its static public capability
  catalog, while a private build may supply an API-backed provider without
  changing `Sidebar.tsx` or `Layout.tsx`.
- The neutral capability and principal primitives shared by the browser and the
  server live in `sirius-ui/src/contracts/capabilities.ts`. Both registries import
  that module so the informative UI gating catalog and the authoritative
  server-side enforcement catalog cannot drift; a contract test pins the
  Community catalog to `documentation/product/edition-boundary.yaml`.
- The server registry lives under `sirius-ui/src/server/extensions/`. A
  `SiriusServerExtension` declares tRPC namespaces with their
  `requiredCapabilities`, at most one `SiriusPrincipalResolver`, and optional
  session enrichers. There are two build-time overlay modules:
  `registered.ts` carries the declarations the registry validates, and
  `registered-routers.ts` carries the routers as an object literal so spreading
  them into `root.ts` preserves tRPC client type inference. `root.ts`
  cross-checks the two, so a router without a declared namespace (or a declared
  namespace with no router) fails at startup.
- The two overlay modules are separate because `trpc.ts` imports the registry to
  enforce capabilities, while router modules import `createTRPCRouter` from
  `trpc.ts`. Declaring both in one module cycles, and the overlay's routers then
  fail at load with `Cannot access 'createTRPCRouter' before initialization`. No
  module reachable from `registered.ts` may import `~/server/api/trpc`; a
  contract test enforces that on the Core modules.
- `protectedProcedure` enforces the capabilities declared for the procedure's
  namespace, so a contributed namespace is authorized without the contribution
  patching Core procedures. Principal resolution fails closed: a resolver that
  throws yields no principal, and every gated procedure is denied rather than
  inheriting another edition's capabilities.
- The single resolver slot is a replacement, not a competition. Community
  declares no resolver contribution, so the slot stays open and one
  build-selected resolver becomes authoritative; with no contribution the
  registry falls back to `communityPrincipalResolver`, which resolves any
  authenticated session to the static Community catalog. Community behavior with
  zero extensions is therefore unchanged, and an extended build replaces
  resolution without editing Community declarations.
- The server extension contract surface is frozen at v1: `SiriusServerExtension`,
  `SiriusPrincipalResolver`, `SiriusSessionEnricher`, the `registered.ts` and
  `registered-routers.ts` exports, and the capability primitives in
  `src/contracts/capabilities.ts`. Later changes
  must be additive and justified by a concrete consumer failure rather than
  anticipated need.
- `sirius-ui/scripts/contract-harness.ts` is the early-warning system for the
  extension surface. It overlays the two registration modules with a synthetic
  extension, then proves zero-overlay Community behavior, overlay composition,
  capability enforcement, fail-closed resolution, type inference for contributed
  namespaces, and source compatibility of a consumer pinned to v1. It needs no
  access to a private repository, and it restores the registration modules even
  when a check fails.
- Community `/api/v1` OpenAPI, route classification, and reserved-namespace policy live in
  [README.api-openapi-contract.md](README.api-openapi-contract.md) and
  `sirius-api/contracts/`.
