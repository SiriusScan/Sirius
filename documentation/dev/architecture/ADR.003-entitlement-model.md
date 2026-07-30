---
title: "ADR-003: Capability-Based Entitlement Model"
description: "Architectural decision for capability-based licensing separate from authorization, with signed offline-verifiable licenses."
template: "TEMPLATE.reference"
llm_context: "high"
categories: ["architecture", "security", "licensing"]
tags: ["adr", "entitlements", "capabilities", "license", "sirius-pro"]
related_docs:
  - "ADR.001-public-core-private-extension.md"
  - "ADR.004-extension-contracts.md"
  - "../../product/edition-boundary.yaml"
  - "../../dev-notes/pro-bifurcation-plan.md"
---

# ADR-003: Capability-Based Entitlement Model

## Status

Accepted

## Context

Sirius Pro will gate commercial features. Scattering `if edition == "pro"` checks couples product packaging to code paths and makes future SKUs (Enterprise, add-ons, evaluation licenses) expensive. Licensing must also remain distinct from user authorization (RBAC).

## Decision

1. **Capability catalog is the unit of gating**. Features check named capabilities (for example `reporting.enterprise`, `identity.sso`), never edition string equality.
2. **Licensing and authorization are separate**. A deployment must be entitled to a capability, and the user must be permitted to use it; both checks must pass.
3. **Community provider grants community capabilities unconditionally** with no license required. Public builds never depend on a private license service.
4. **Pro licenses are asymmetrically signed** (Ed25519 recommended). The issuer retains the private key in KMS/HSM; products embed only public verification keys with key-ID rotation.
5. **Offline validation is required**, with cached verified entitlement state when a license service is unavailable.
6. **Fail closed for Pro capabilities** on invalid signatures; expire with a documented grace period; prefer read-only Pro behavior after grace where practical.
7. **Never lock customers out of their own vulnerability/scan data** after license expiration.

## Consequences

### Positive

- Packaging changes (Pro, Enterprise, add-ons) do not rewrite feature logic.
- Consistent enforcement surfaces: API middleware, workers, and informative UI.
- Offline/air-gapped deployments remain viable.

### Tradeoffs

- Capability catalog and structured errors must be maintained as a public contract.
- Retrofitting scattered edition checks later is costly — entitlements land before many Pro features.

## Implementation Notes

- Capability definitions live with the edition boundary in `documentation/product/edition-boundary.yaml` and later in a public Go capability registry (`go-api`).
- Issuer and customer tooling live in private `sirius-entitlements`.
- Structured error example: `CAPABILITY_NOT_LICENSED` with capability id and human-readable message.
- UI gating is informative only; API and worker enforcement are authoritative.
