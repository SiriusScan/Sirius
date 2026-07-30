---
title: "ADR-002: Repository Ownership"
description: "Ownership split between the SiriusScan public organization and OpenSecurity-Infosec private commercial repositories."
template: "TEMPLATE.reference"
llm_context: "high"
categories: ["architecture", "governance", "operations"]
tags: ["adr", "ownership", "github", "sirius-pro", "opensecurity"]
related_docs:
  - "ADR.001-public-core-private-extension.md"
  - "ADR.005-versioning-and-release-policy.md"
  - "../ABOUT.opensecurity-sirius-relationship.md"
  - "../../dev-notes/pro-bifurcation-plan.md"
---

# ADR-002: Repository Ownership

## Status

Accepted

## Context

OpenSecurity commercially owns the Sirius product, trademark, licensing, and enterprise roadmap. The SiriusScan GitHub organization hosts the public Community Edition and related open components. Without an explicit ownership map, private Pro work risks landing in the public tree or, conversely, shared foundations remaining locked in private repositories.

## Decision

1. **`SiriusScan` hosts the public surface**: Community distribution (`Sirius`), public components (`go-api`, `app-scanner`, `app-agent`, `sirius-nse`, and related repos), public releases, and community governance.
2. **`OpenSecurity-Infosec` hosts commercial private repositories**:
   - `sirius-pro` — proprietary modules, services, UI extensions, Pro migrations, Pro overlays
   - `sirius-entitlements` — license issuer, signed license format, customer tooling
   - `sirius-release` — release manifests, digests, SBOMs, promotion workflows
3. **OpenSecurity owns** Sirius Pro IP, commercial licensing, customer contracts, release signing, support lifecycle, commercial documentation, and trademark governance.
4. **Extract public components only when justified** by independent release lifecycle, multi-repo consumption, security boundary, distinct ownership, or value as a stable SDK/contract — not for organizational neatness alone.
5. **`sirius-cloud` is deferred** until a hosted control plane is an intentional product; do not mix SaaS prematurely into `sirius-pro`.

## Consequences

### Positive

- Clear permission and CODEOWNERS boundaries.
- Public CI never needs private credentials.
- Commercial release and licensing assets stay tightly permissioned.

### Tradeoffs

- Cross-org coordination for linked public/private PRs.
- Private repository bootstrap and access provisioning are explicit human-gated tasks.

## Implementation Notes

- Recommended access teams: `sirius-core-maintainers`, `sirius-pro-engineering`, `sirius-release-managers`, `sirius-license-administrators`, `sirius-support`, `sirius-security`.
- Relationship statement for community trust: `documentation/dev/ABOUT.opensecurity-sirius-relationship.md`.
