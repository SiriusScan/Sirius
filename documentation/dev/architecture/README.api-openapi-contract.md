---
title: "Community API OpenAPI Contract"
description: "Versioned OpenAPI contract, route classification inventory, and CI drift checks for the Sirius Community Fiber API."
template: "TEMPLATE.reference"
version: "1.0.0"
last_updated: "2026-07-31"
author: "Development Team"
tags: ["api", "openapi", "contracts", "fiber", "bifurcation"]
categories: ["architecture", "api"]
difficulty: "intermediate"
prerequisites:
  - "ADR.004-extension-contracts.md"
  - "README.auth-surface-matrix.md"
related_docs:
  - "ADR.004-extension-contracts.md"
  - "README.auth-surface-matrix.md"
  - "README.go-api-sdk.md"
  - "../../dev-notes/pro-bifurcation-plan.md"
dependencies:
  - "sirius-api/contracts/openapi.v1.yaml"
  - "sirius-api/contracts/route_classification.yaml"
  - "sirius-api/testdata/community_routes.golden"
llm_context: "high"
search_keywords:
  [
    "openapi",
    "api contract",
    "route classification",
    "api/v1",
    "api/pro/v1",
    "api/internal/v1",
    "X-Request-ID",
    "X-API-Key",
  ]
---

# Community API OpenAPI Contract

## Purpose

This reference describes the published Community API contract for bifurcation
task 3.2: the machine-readable route classification inventory, the versioned
OpenAPI document for `/api/v1`, reserved Pro/internal namespaces, and the
blocking CI checks that keep those artifacts aligned with the live Fiber route
table.

## When to Use

- **Primary Use Case**: Changing, reviewing, or consuming Community HTTP routes
- **Secondary Use Cases**: Preparing Pro consumers that depend on `/api/v1`
- **Edge Cases**: Investigating auth, correlation IDs, or inconsistent error shapes
- **Avoid When**: Looking for Pro runtime handlers (they are not in this repository)

## How to Use

### Quick Start

```bash
# Validate OpenAPI + classification against the checked-in golden inventory
cd sirius-api
go test ./internal/contract/ -count=1

# Validate against the live Fiber mount (ordering preserved from task 3.1)
go test . -run 'TestCommunityRouteInventory|TestLiveRouteContractCoverage' -count=1
```

### Artifact Locations

| Artifact | Path |
| --- | --- |
| OpenAPI 3.0.3 contract | `sirius-api/contracts/openapi.v1.yaml` |
| Semantic breaking baseline | `sirius-api/contracts/openapi.v1.baseline.yaml` |
| Route classification inventory | `sirius-api/contracts/route_classification.yaml` |
| Ordered live-route golden | `sirius-api/testdata/community_routes.golden` |
| Operation-removal fixture | `sirius-api/contracts/fixtures/breaking_openapi.missing_operation.yaml` |
| Validator package | `sirius-api/internal/contract/` |

### Updating the Contract

1. Change handlers/routes only when the product behavior must change.
2. Remount and refresh the golden if the live inventory intentionally changes:
   `UPDATE_GOLDEN=1 go test . -run TestCommunityRouteInventory -count=1`
3. Update `route_classification.yaml` so every golden line has exactly one
   path/method classification in the same order (`public`, `internal`, or
   `deprecated`). Keep fixed routes registered before parameterized siblings.
4. Update `openapi.v1.yaml` for every live `/api/v1` operation. Do not invent
   behavior the handlers do not provide.
5. Run `go test ./internal/contract/ -count=1`. Semantic breaking detection
   compares the published contract to `openapi.v1.baseline.yaml` and rejects
   removed operations, removed/changed security, removed response codes,
   schema/type changes, and newly required parameters/request fields.
6. When the published contract change is intentionally accepted, copy
   `openapi.v1.yaml` over `openapi.v1.baseline.yaml` in the same change set:
   `cp sirius-api/contracts/openapi.v1.yaml sirius-api/contracts/openapi.v1.baseline.yaml`
7. Keep the operation-removal fixture failing coverage validation.

## What It Is

### Classification Model

Every live Community route from the 74-line Fiber inventory is classified:

| Class | Meaning |
| --- | --- |
| `public` | Community product surface (may still require `X-API-Key`) |
| `internal` | Ops/service surface intended for future `/api/internal/v1` |
| `deprecated` | Duplicate, alias, or probe route that must not be extended |

Classification is path/method-specific and order-preserving. CI fails on missing,
extra, or reordered entries relative to the live inventory.

### OpenAPI Coverage

`openapi.v1.yaml` documents the current `/api/v1` surface only:

- Actual methods and paths from the live inventory
- `X-API-Key` security requirement
- `X-Request-ID` correlation behavior
- Current error shapes and a documented canonical future shape
- Useful request/response schemas where handlers define stable fields

Legacy product routes (`/host`, `/vulnerability`, `/templates`,
`/api/agent-templates`, `/app`) remain classified but are outside the versioned
OpenAPI document until a later migration.

### Reserved Namespaces

Per ADR-004, the OpenAPI `info.x-sirius-reserved-namespaces` extension reserves:

- `/api/pro/v1` — Pro-only edition routes
- `/api/internal/v1` — inter-service routes

Community does not register handlers under those prefixes. The public contract
must not import or access private packages/repositories.

### Auth and Correlation

| Concern | Current behavior |
| --- | --- |
| Auth | `X-API-Key` required for all `/api/v1` routes via `APIKeyMiddleware` |
| Auth bypass | Only `GET /health` is skipped (outside OpenAPI) |
| Correlation | Fiber `requestid.New()` defaults: header `X-Request-ID`; echo client value or generate via `utils.UUID` (RFC4122 v4-formatted seeded counter, not `google/uuid`); store in locals key `requestid`; present on success and error responses |

### Error Shapes

Handlers are not fully migrated to one error envelope. The contract documents:

1. Dominant current shape: `{ "error": "<string>" }`
2. Event details shape: `{ "error": "<string>", "details": "<string>" }`
3. Scan-control shape: `{ "success": false, "error": "<string>" }`
4. Canonical future shape (documented only):
   `{ "error": { "code", "message", "details" }, "request_id" }`

### CI Enforcement

The API build job in `.github/workflows/ci.yml` runs:

1. Existing module/route golden tests from task 3.1
2. Live Fiber ↔ classification ↔ OpenAPI coverage tests
3. `internal/contract` suite, including the breaking OpenAPI fixture that removes
   `GET /api/v1/scans/status` and must fail validation

### TypeScript Client

No generated TypeScript client is published yet. The UI already consumes the API
through existing typed helpers; bulk client generation is deferred until there is
a clear repository consumer and deterministic generation path.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `classification mismatch` | Golden/order changed without inventory update | Refresh golden and classification together |
| `live /api/v1 route missing from OpenAPI` | New `/api/v1` route not documented | Add the operation to `openapi.v1.yaml` |
| `OpenAPI /api/v1 operation not present` | Spec invents a route | Remove or correct the OpenAPI path |
| Breaking fixture passes | Fixture no longer removes a required op | Restore the missing-operation fixture |
| Docker build fails on deps | `go.mod.prod` / `go.sum.prod` stale | Sync from `go.mod` / `go.sum` |

## Related Documentation

- [ADR.004 Extension Contracts](ADR.004-extension-contracts.md)
- [Auth Surface Matrix](README.auth-surface-matrix.md)
- [Pro bifurcation plan](../../dev-notes/pro-bifurcation-plan.md)
