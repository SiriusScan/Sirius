# SiriusScan Repository Standards (Advisory v1)

This document defines recommended repository standards for SiriusScan projects.

The goal is consistency and professionalism without introducing blocking rules. Teams can adopt these recommendations incrementally.

## Scope

Applies to public SiriusScan repositories, starting with `Sirius` and then expanding to:

- `go-api`
- `app-scanner`
- `app-agent`
- `pingpp`
- `website`

## Recommended baseline artifacts

Each repository should include:

- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `LICENSE`
- `SUPPORT.md` (recommended for active external contribution)

## Issue and PR intake standards

Recommended defaults:

- Issue templates for bug reports and feature requests
- A security-focused intake path with explicit private-report guidance
- A PR template that captures:
  - problem statement
  - risk and validation evidence
  - docs and rollout notes

For repositories with low issue volume, start with minimal templates and expand later.

## Labels and triage hygiene

Recommended label taxonomy:

- `type:*` (for example: `type:bug`, `type:enhancement`, `type:security`)
- `status:*` (for example: `status:needs-triage`, `status:blocked`, `status:ready`)
- `sev:*` for risk level where relevant
- domain labels for components only where maintainers need them

Recommended triage SLA:

- First maintainer response within 2 business days
- Security-labeled issues reviewed as priority

## Metadata and discoverability

Each repository should have:

- A one-line description aligned with org voice
- At least 4-6 relevant topics
- A homepage URL to docs, API reference, or website
- Optional Discussions enabled where community interaction is expected

## Review and CI expectations (advisory)

Recommended defaults (not hard-gated in this phase):

- At least one maintainer review before merge
- CI should run on pull requests
- Validation evidence included in PR description
- Security-sensitive changes include rollback notes

## Adoption approach

1. Adopt standards in `Sirius` first.
2. Reuse the rollout checklist in `.github/REPO_ROLLOUT_CHECKLIST.md`.
3. Track deviations and repository-specific exceptions in the repo README or maintainer notes.
4. Revisit after adoption to decide whether any standards should become required.
