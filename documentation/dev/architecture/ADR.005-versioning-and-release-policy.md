---
title: "ADR-005: Versioning and Release Policy"
description: "SemVer, Pro/Core compatibility alignment, digest-pinned release manifests, and promotion-by-retag for Community and Pro distributions."
template: "TEMPLATE.reference"
llm_context: "high"
categories: ["architecture", "operations", "release"]
tags: ["adr", "semver", "release", "digests", "core.lock", "compatibility"]
related_docs:
  - "ADR.001-public-core-private-extension.md"
  - "ADR.002-repository-ownership.md"
  - "README.engine-component-pinning.md"
  - "README.cicd.md"
  - "../../dev-notes/pro-bifurcation-plan.md"
---

# ADR-005: Versioning and Release Policy

## Status

Accepted

## Context

Community currently publishes primarily via mutable `latest` tags, with sparse SemVer tags and no digest manifest for consumers. Sirius Pro cannot safely depend on floating tags. Engine component pinning already demonstrates the correct pattern (tag or full SHA + CI consistency checks).

## Decision

1. **Semantic versioning** for Community and Pro releases:
   - major: breaking API, event, schema, or extension contract
   - minor: backward-compatible features
   - patch: backward-compatible bug and security fixes
2. **Aligned release trains** (`Core 1.x` / `Pro 1.x`) without requiring exact patch alignment.
3. **Initial compatibility rule**: `Pro 1.x.y` requires `Core >=1.x.0 and <1.(x+1).0`. Relax only after contracts mature.
4. **Pro pins immutable references**: image digests (`@sha256:...`), Git tags/commits, Go module versions, and contract versions in `core.lock.yaml` / release manifests.
5. **Mutable tags (`latest`) are forbidden** in Pro release artifacts and production customer deployments.
6. **Promotion copies or retags tested digests**; do not rebuild production images after acceptance testing.
7. **Shared fixes land publicly first**, then flow into Pro via dependency updates (Renovate/Dependabot).
8. **Every Community release emits a `core-manifest.yaml`** listing the six image digests, component pins, and schema version.

## Consequences

### Positive

- Deterministic Pro provenance and reproducible installs.
- Compatibility matrix is explicit and testable.
- Existing `publish-release-image-tags.yml` / `verify-ghcr-release-tag.yml` become a gated release train.

### Tradeoffs

- Community must maintain a real release cadence for Pro to track.
- Exact-minor alignment is stricter until contracts stabilize.

## Implementation Notes

- Engine pin policy in `README.engine-component-pinning.md` is the model for Pro→Community pins.
- Public release train (`publish-release-image-tags.yml`) generates 12 platform-scoped Syft CycloneDX SBOMs (`linux/amd64` + `linux/arm64`) and Cosign keyless signatures (canonical GitHub Actions OIDC / Fulcio identity on `SiriusScan/Sirius@refs/heads/main`) for all six inventory index digests before publishing a GitHub Release. See [README.workflows.md](../deployment/README.workflows.md) for the verification identity policy.
- Nightly Pro compatibility runs against public `main` provide early breakage signal.
