---
title: "OpenSecurity and SiriusScan Relationship"
description: "Public statement of OpenSecurity's commercial sponsorship of Sirius and the public-first commitment for shared platform work."
template: "TEMPLATE.about"
version: "1.0.0"
last_updated: "2026-07-29"
author: "Development Team"
tags: ["governance", "opensecurity", "community", "open-core", "dco"]
categories: ["documentation", "governance"]
difficulty: "beginner"
prerequisites: []
related_docs:
  - "architecture/ADR.001-public-core-private-extension.md"
  - "architecture/ADR.002-repository-ownership.md"
  - "../contributing.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "opensecurity",
    "siriusscan",
    "sponsorship",
    "public-first",
    "dco",
    "community",
  ]
---

# OpenSecurity and SiriusScan Relationship

## Purpose

This document states how OpenSecurity relates to the public SiriusScan project and how shared platform work is expected to flow.

## Ownership and sponsorship

- **OpenSecurity** owns the Sirius commercial product strategy, trademark governance, Sirius Pro intellectual property, commercial licensing, customer support, and private repositories under `OpenSecurity-Infosec`.
- **SiriusScan** (GitHub organization) hosts the Community Edition, public components, public releases, and community contribution surface.
- OpenSecurity **sponsors** the public Sirius project and commits to keeping Community a complete, independently usable vulnerability-management platform.

## Public-first commitment

Shared behavior required by both Community and Pro is implemented in public packages and contracts first, then consumed by Pro through versioned dependencies.

The following are never acceptable as the primary model:

- Developing shared foundations only in private repositories
- Periodically exporting or sanitizing private commits into the public tree
- Requiring private credentials to build, test, or run Community

Security fixes, scanner fidelity improvements, and essential remediation data remain public.

## Contribution terms (DCO)

Pending final counsel review, contributions to public SiriusScan repositories are expected to use a **Developer Certificate of Origin (DCO)** sign-off (`Signed-off-by`) on commits. This keeps contribution friction low for an MIT-licensed project while affirming contributor rights to submit the work.

A Contributor License Agreement (CLA) is not required for Community contributions unless counsel later determines otherwise. Commercial redistribution terms for Pro remain under OpenSecurity's commercial license (counsel review required before customer distribution).

## Trademark

The Sirius name and branding may be controlled even while Community source is MIT-licensed. Forks should not imply official OpenSecurity endorsement. Detailed trademark rules will be published alongside commercial licensing materials.

## Related decisions

- [ADR-001: Public Core / Private Extension](architecture/ADR.001-public-core-private-extension.md)
- [ADR-002: Repository Ownership](architecture/ADR.002-repository-ownership.md)
- Edition boundary: [`documentation/product/edition-boundary.yaml`](../product/edition-boundary.yaml)
