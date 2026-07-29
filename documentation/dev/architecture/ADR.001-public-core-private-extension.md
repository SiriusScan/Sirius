---
title: "ADR-001: Public Core / Private Extension Model"
description: "Architectural decision that Sirius Community is the canonical public core and Sirius Pro is a private extension layer that consumes immutable public artifacts."
template: "TEMPLATE.reference"
llm_context: "high"
categories: ["architecture", "product", "open-core"]
tags: ["adr", "bifurcation", "sirius-pro", "open-core", "community"]
related_docs:
  - "ADR.002-repository-ownership.md"
  - "ADR.003-entitlement-model.md"
  - "ADR.004-extension-contracts.md"
  - "ADR.005-versioning-and-release-policy.md"
  - "../../dev-notes/pro-bifurcation-plan.md"
---

# ADR-001: Public Core / Private Extension Model

## Status

Accepted

## Context

Sirius is positioned as both an open-source vulnerability-management platform and a commercial Pro edition. Two common open-core patterns were considered: developing everything privately and periodically exporting a sanitized public tree, versus keeping Community as the canonical public core and assembling Pro from versioned public dependencies plus private modules.

The public repository already behaves as a distribution and composition root (six GHCR images, compose overlays, engine component pins). A private-upstream/export model would create leakage risk, merge friction, and contributor provenance problems.

## Decision

1. **Sirius Community is the canonical public core** and must remain independently buildable, testable, and runnable from public artifacts only.
2. **Sirius Pro is a private, commercially licensed superset** assembled from immutable public Sirius components (images, modules, contracts) plus proprietary extension modules.
3. **Shared implementation flows public-first**: OpenSecurity engineering lands reusable foundations in the public repository, then Pro consumes them through versioned dependencies.
4. **Private-to-public source export is forbidden** as the primary development model. Proprietary code must never become an upstream dependency of the open-source distribution.
5. **Community remains complete**: security fixes, scanner fidelity improvements, and essential remediation data stay public. Pro sells organizational scale, not a crippled scanner.

## Consequences

### Positive

- Community contributors work against the canonical core.
- Clear licensing and supply-chain boundary between public and private code.
- Existing compose overlays and component-pin patterns map cleanly to Pro consumption.
- Shared fixes benefit industry users immediately.

### Tradeoffs

- Pro features that need shared primitives require linked public and private PRs.
- Public core must invest in extension seams before many Pro features ship.
- Release discipline (tags, digests, contracts) becomes mandatory for Pro consumers.

## Implementation Notes

- Track delivery in `tasks/pro-bifurcation.json` and `documentation/dev-notes/pro-bifurcation-plan.md`.
- Feature classification lives in `documentation/product/edition-boundary.yaml`.
- Do not bootstrap Pro by cloning `SiriusScan/Sirius` into a private fork.
