---
title: "Sirius Community / Pro Bifurcation - Implementation Plan"
description: "Grounded implementation strategy for splitting Sirius into a canonical public core and a private, commercially licensed Sirius Pro extension layer owned by OpenSecurity."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2026-07-29"
author: "Development Team"
tags:
  [
    "project-plan",
    "open-core",
    "sirius-pro",
    "entitlements",
    "extension-contracts",
    "release-engineering",
  ]
categories: ["development", "planning", "architecture", "operations"]
difficulty: "advanced"
prerequisites: ["docker", "docker-compose", "go", "nextjs", "postgres", "rabbitmq"]
related_docs:
  - "README.tasks.md"
  - "README.new-project.md"
  - "README.architecture.md"
  - "README.engine-component-pinning.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "bifurcation",
    "open core",
    "sirius pro",
    "public core private extension",
    "entitlements",
    "capability",
    "extension registry",
    "core.lock",
    "release manifest",
  ]
---

# Sirius Community / Pro Bifurcation - Implementation Plan

## Project Overview

**Goal**: Bifurcate Sirius into a canonical, fully independent open-source Community
Edition (`SiriusScan/Sirius` + public components) and a private, commercially licensed
Sirius Pro distribution (`OpenSecurity-Infosec/*`) that consumes immutable public
releases and adds proprietary modules — without ever exporting source from private to
public.

**Governing decision (to be ratified as ADR-001)**:

> Sirius Community remains the canonical public core and independently runnable
> distribution. Sirius Pro is a private, commercially licensed superset assembled from
> immutable public Sirius components and proprietary extension modules. Shared behavior
> is implemented in public packages and contracts; Pro behavior depends on those
> interfaces. Source is not automatically exported from Pro into Community.

**Community commitment (industry-support posture)**: Community stays a complete,
useful vulnerability-management platform. Security fixes, scanner fidelity
improvements, and core remediation data are always public-first. No existing public
feature is moved behind the Pro boundary. Pro sells organizational scale: enterprise
identity, executive/compliance reporting, governance, multi-workspace, fleet control,
enterprise integrations, HA, and commercial support.

## Ground Truth (verified 2026-07-29)

This plan is grounded in the current state of the repository, not the idealized
architecture. The facts below drive the sequencing.

**Strong existing seams (build on these):**

- Compose overlays already exist (`docker-compose.{dev,build,prod,installer}.yaml`);
  all six services pull `ghcr.io/siriusscan/<name>:${IMAGE_TAG:-latest}`. A Pro
  overlay is a natural fit.
- `sirius-engine/Dockerfile` already pins six external component repos by tag or full
  SHA (`GO_API_COMMIT_SHA=v0.0.18`, `APP_SCANNER_COMMIT_SHA=<sha>`, ...), enforced by
  `check-pin-consistency.yml`. This is the model for how Pro pins Community.
- `sirius-api` (Go/Fiber) already registers routes through a `RouteSetter` interface
  (`sirius-api/routes/routes.go`); `go-api v0.0.18` is already the shared SDK used by
  API and engine. `go-api` is the natural home for public contracts.

**Gaps that are prerequisites (must be fixed before Pro work):**

1. **Destructive schema init**: `go-api` `initializeSchema()` calls
   `dropTablesInOrder()` before GORM `AutoMigrate`. No Pro migration ownership is
   safe until schema initialization is non-destructive and migration-driven.
2. **Migrations don't run in production**: the production `sirius-api` image omits the
   `/go-api` migrations tree and `runMigrations()` silently skips. Migration execution
   must become an explicit, owned step with a `schema_migrations_core` ledger.
3. **No release discipline for consumers**: only three tags exist (`v1.0.0` newest),
   HEAD is ~81 commits past `v1.0.0`, and `IMAGE_TAG` defaults to `latest`. Pro cannot
   pin digests against this. A real release cadence and digest manifest are required.
4. **Two engine components are unpinned**: `app-system-monitor` and
   `app-administrator` are cloned at branch tip in the engine build, violating the
   pinning policy Pro will rely on.
5. **No message envelope**: RabbitMQ traffic is ad hoc JSON on direct queues
   (`scan`, `scan_control`, `agent_commands`, ...). No versioning, no correlation IDs.
6. **No UI extension mechanism**: navigation is hardcoded in
   `sirius-ui/src/components/Sidebar.tsx`; tRPC routers are manually listed in
   `src/server/api/root.ts`. No feature flags, no edition awareness.
7. **No entitlement code anywhere**: licensing/capability enforcement is greenfield.

## Architecture Decisions (Phase 0 ADRs)

| ADR | Decision |
| --- | --- |
| ADR-001 | Public-core / private-extension model; private→public export forbidden |
| ADR-002 | Repository ownership: `SiriusScan` = public surface; `OpenSecurity-Infosec` = commercial (`sirius-pro`, `sirius-entitlements`, `sirius-release`) |
| ADR-003 | Capability-based entitlements (no `if edition == "pro"` checks); signed offline-verifiable licenses; fail-closed for Pro capabilities, never lock users out of their scan data |
| ADR-004 | Extension contracts live in public `go-api` (Go) and a public UI extension registry (TypeScript); compile-time registration for v1, no runtime plugins |
| ADR-005 | Versioning and release: SemVer, exact minor alignment Pro↔Core initially, digest-pinned release manifests, promotion by retag not rebuild |

## Technical Strategy

### 1) Public-core hardening first (Phase 1)

Fix the data layer and release discipline before any private repository exists:

- Replace destructive `initializeSchema()` in `go-api` with guarded, forward-only
  numbered migrations recorded in `schema_migrations_core`.
- Introduce an explicit migrator entrypoint so production deployments run core
  migrations deterministically (engine or API container invoking a `migrate` command,
  or a dedicated one-shot compose service).
- Pin `app-system-monitor` and `app-administrator` in the engine Dockerfile and add
  them to pin-consistency CI.
- Cut `v1.1.0` from current HEAD; make the existing
  `publish-release-image-tags.yml` + `verify-ghcr-release-tag.yml` pair a gated
  release train; emit `core-manifest.yaml` per release with all six image digests,
  component pins, and schema version.
- Add SBOM generation (Syft) and image signing (Cosign) to the public pipeline.

### 2) Private repositories and supply chain (Phase 2)

Bootstrap `OpenSecurity-Infosec/{sirius-pro, sirius-entitlements, sirius-release}`
from skeletons (never by cloning the public repo). Branch protection, CODEOWNERS,
private GHCR namespace, secret scanning, and two standing leakage-prevention tests:

- **Community independence**: public repo builds, tests, and runs with zero private
  credentials (run in a credential-less CI job).
- **Leakage scan**: public images, SBOMs, and source archives contain no private
  module paths, registry references, or Pro strings.

### 3) Extension contracts in the public core (Phase 3)

- **API**: evolve `RouteSetter` into a `Module` interface in `go-api`
  (`ID()`, `Version()`, `RegisterRoutes`, `RegisterJobs`, `RegisterEventHandlers`,
  `RequiredCapabilities()`, `Health()`); Community registers modules in a build file
  the Pro build replaces; publish OpenAPI for `/api/v1`; reserve `/api/pro/v1`.
- **Events**: introduce a CloudEvents-compatible envelope in `go-api/sirius/queue`
  (type, schema version, source, correlation ID, idempotency key); wrap existing
  queues additively; JSON schemas validated in CI; Pro queues namespaced `pro.*`.
- **UI**: build-time extension registry (`SiriusUIExtension`: routes, navigation,
  dashboard widgets, settings panels, required capabilities); migrate `Sidebar.tsx`
  navigation and existing pages into registry declarations; capability provider
  context fed by the API. The Pro UI image builds by cloning public `sirius-ui` at a
  pinned SHA and overlaying private extension modules — the same pattern the engine
  already uses for components (avoids premature npm package publication).
- **Engine**: `ResultEnricher`, `RiskScorer`, and scheduling-policy interfaces in
  `go-api` with deterministic ordering and health reporting.

Exit criterion: a test extension can add one API route, one UI page, and one event
consumer without touching core files, and Community behavior is byte-for-byte
unchanged with zero extensions loaded.

### 4) Entitlement platform (Phase 4)

- Capability catalog defined publicly in `go-api` (e.g. `scanning.core`,
  `identity.multi_user_local`, `reporting.enterprise`, `identity.sso`,
  `workspaces.multiple`) with a Community provider that grants community
  capabilities unconditionally — public code never needs a license.
- Signed license format (Ed25519; issuer keeps private key in KMS, products embed
  only public verification keys with key-ID rotation), offline validation, grace
  period, cached entitlement state, structured `CAPABILITY_NOT_LICENSED` errors.
- Enforcement at API middleware and workers (authoritative) and UI (informative).
  License expiration never blocks access to existing scan data.
- Private `sirius-entitlements` holds the issuer service and customer tooling.

### 5) First vertical: class multi-user concurrent scan workspaces (Phase 5)

One representative Pro vertical to prove extension seams for the class-ready cut:
capability `identity.multi_user_local` — local multi-user identity, concurrent
owner-isolated scan workspaces (including same-IP), cancel of own live job, latest
workspace only, and owner-scoped student API keys/agents. Authoritative plan:
`documentation/dev-notes/pro-multi-user-isolation-plan.md`.

Class-cut notes: host ownership deferred; students are Scanner-focused with shared
inventory admin-only; thin static capability grant for range is OK; full Phase
3.3–3.6 event/UI/engine contracts and full Phase 4 entitlements issuer are **not**
hard blockers (harden in parallel).

**Deferred later vertical:** Enterprise Reporting (`reporting.enterprise`) —
executive/compliance reporting, scheduled PDF/CSV, dedicated `pro` schema worker,
and related overlay services — after the class multi-user cut ships.

Exit criteria include: ~19 students run concurrent owned scans with cancel isolation;
cross-owner key/agent/scan probes fail closed; Community single-admin + shared
Postgres still work; removing the Pro overlay returns a working Community deployment
with core data intact.

### 6) Release integration and compatibility automation (Phase 6)

- `core.lock.yaml` in `sirius-pro` pins the Community release by version, commit,
  image digests, component pins, and contract versions; Renovate raises dependency
  PRs on public releases.
- Pro CI: resolve lock → verify signatures/digests → build → contract compatibility
  tests → full Community regression suite → Pro E2E → entitlement tests → SBOM →
  sign → publish private images.
- Nightly compatibility run against public `main` for early breakage warning.
- Compatibility policy: `Pro 1.x.y` requires `Core >=1.x.0 <1.(x+1).0` until
  contracts mature.
- Upgrade-path tests: Community N→N+1, Pro N→N+1, Community→Pro, Pro-expired→renewed,
  Pro→Community-only runtime (data intact and readable).

## Feature Boundary (Phase 0 workshop output)

Deliverable: `documentation/product/edition-boundary.yaml` classifying every feature
as core platform, community feature, pro feature, or shared infrastructure, plus a
public feature matrix. Rubric: security fixes, scanner fidelity, and anything whose
absence makes Community misleadingly incomplete stay public; organizational scale,
compliance, governance, enterprise identity/integrations, and HA are Pro.

## Legal / Governance Workstream (parallel, Phase 0–2)

- Pro commercial license + EULA (counsel review before first customer distribution).
- Contribution terms decision (DCO recommended for an MIT project; counsel confirms).
- Trademark policy (Sirius name/brand controlled; fork naming rules).
- Third-party notices + automated dependency-license scanning in both pipelines.
- Public statement of the OpenSecurity ↔ SiriusScan relationship and the
  public-first commitment (this is the community-trust artifact; publish it early).

## Milestones

- **M0 — Boundary ratified**: ADR-001..005 merged; edition-boundary.yaml approved; no
  ambiguously classified feature; private→public export formally prohibited.
- **M1 — Core hardened**: non-destructive migrations with core ledger; migrator runs
  in production; all engine components pinned; `v1.1.0` released with digest
  manifest, SBOMs, signatures.
- **M2 — Private foundation**: three private repos live with protections;
  community-independence and leakage tests green in CI.
- **M3 — Contracts shipped**: Module interface, event envelope, OpenAPI, UI registry
  released in a tagged core version; test extension passes; Community unchanged.
- **M4 — Entitlements live**: offline-verifiable signed licenses; central
  enforcement; admin license page; expiration/grace behavior tested.
- **M5 — First vertical shipped**: class multi-user concurrent scan workspaces
  (`identity.multi_user_local`) on a tagged/core-locked Pro composition; Community
  regression suite green in Pro pipeline; overlay add/remove proven. Enterprise
  Reporting deferred.
- **M6 — Release machine**: core.lock automation, nightly compat, promotion-by-retag,
  full release manifests. Definition of Done for the platform foundation met.

## Explicitly Forbidden

- Cloning `SiriusScan/Sirius` into a private repo as the Pro starting point.
- Exporting or sanitizing private commits into the public repository.
- Public repository importing any private package, registry, or credential.
- Scattered edition string checks instead of capability checks.
- Moving existing Community features behind the Pro boundary.
- Mutable-tag (`latest`) dependencies in any Pro release artifact.

## Task Tracking

Tasks: `tasks/pro-bifurcation.json` (phases mirror this plan). Feature branch:
`feature/pro-bifurcation`.
