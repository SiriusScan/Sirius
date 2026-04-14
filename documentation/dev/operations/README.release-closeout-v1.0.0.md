---
title: "Sirius v1.0.0 Release Closeout"
description: "Final push, merge, validation, and launch closeout evidence for the Sirius v1.0.0 major release."
template: "TEMPLATE.guide"
llm_context: "high"
categories: ["operations", "release", "deployment"]
tags: ["release", "v1.0.0", "closeout", "validation", "rollout"]
related_docs:
  - "README.git-operations.md"
  - "README.workflows.md"
  - "README.docker-container-deployment.md"
  - "README.api-key-operations.md"
  - "../../OPERATIONS.md"
---

# Sirius v1.0.0 Release Closeout

This document records final push/merge completion evidence for the Sirius v1.0.0 major release.

## Launch References

- PR merge record: https://github.com/SiriusScan/Sirius/pull/90
- Release page: https://github.com/SiriusScan/Sirius/releases/tag/v1.0.0
- Launch closeout issue: https://github.com/SiriusScan/Sirius/issues/93
- Stabilization backlog: https://github.com/SiriusScan/Sirius/issues/92

## Release Integrity Evidence

- PR `#90` status: merged into `main` (`v1` -> `main`)
- Merge commit: `014c89b441ab697654afb205e1960dcef74bfac3`
- Main release commit: `221b8001de3a580b7741f912cffa1ab8199d63e0`
- Main repo tag `v1.0.0` points to release commit `221b8001de3a580b7741f912cffa1ab8199d63e0`
- Release notes published (non-draft, non-prerelease)

## Distribution Gate Evidence

### Container image availability

- `ghcr.io/siriusscan/sirius-ui:latest` available
- `ghcr.io/siriusscan/sirius-api:latest` available
- `ghcr.io/siriusscan/sirius-engine:latest` available
- At initial closeout, `v1.0.0` semver tags were not yet consistently published on GHCR for all stack images (historical `manifest unknown` on some application images; infrastructure images require the same [Publish Release Image Tags](../../../.github/workflows/publish-release-image-tags.yml) step as the app trio).

Note: direct retag-and-push attempt from local environment was blocked by GHCR token scope restrictions. Versioned tags for operators are published via the **Publish Release Image Tags** workflow using CI credentials.

### Post-closeout: third-party pulls and issue #119

External operators who set `IMAGE_TAG=v1.0.0` (or any semver) need **six** matching tags on GHCR and **public** package visibility. If any image lacks the tag or a package remains private, `docker compose pull` fails with `not found` / `manifest unknown` while maintainer machines may still succeed when authenticated to GHCR ([issue #119](https://github.com/SiriusScan/Sirius/issues/119)).

**Remediation (maintainers):** follow the [GHCR distribution checklist](../../../OPERATIONS.md#maintainer-ghcr-distribution-checklist-public-operators): set each org package to Public, run **Publish Release Image Tags** with `source_tag=latest` and `target_tag=v1.0.0`, then confirm anonymously with `bash scripts/verify-ghcr-public-access.sh v1.0.0`. The **Verify GHCR Release Tag** workflow ([verify-ghcr-release-tag.yml](../../../.github/workflows/verify-ghcr-release-tag.yml)) runs the same check on every published release and weekly.

**Suggested reply for issue #119 (after tags and visibility are fixed):** confirm all six anonymous pulls for `v1.0.0`, link the successful workflow run, and recommend leaving `IMAGE_TAG` blank for `latest` unless pinning.

### Runtime smoke validation

Release stack boot with required `SIRIUS_API_KEY` succeeded.

- `docker compose ps`: all core services healthy (`sirius-ui`, `sirius-api`, `sirius-engine`, `sirius-postgres`, `sirius-rabbitmq`, `sirius-valkey`)
- API health: `GET http://localhost:9001/health` returns healthy JSON with `version: "1.0.0"`
- UI health proxy: `GET http://localhost:3000/` returns `200 OK`
- Engine gRPC listener: `localhost:50051` reachable

## Repo Hygiene and Freeze

- Main repo working tree is clean except local planning artifacts under `.cursor/plans/`.
- Freeze policy for immediate post-release window:
  - no feature merges to `main`
  - only release-blocking hotfixes linked to stabilization backlog issue
  - all hotfixes require rollback notes and validation evidence

## Cross-Repo Release Matrix

| Repository | Tag | Commit |
| --- | --- | --- |
| Sirius (main) | `v1.0.0` | `221b8001de3a580b7741f912cffa1ab8199d63e0` |
| app-scanner | `v1.0.0` | `7821c8ea73093f7fbc89bf4749e8e07a7c76f499` |

## Rollback Reference

If rollback is required:

1. redeploy previous known-good image tags in compose inputs
2. restart stack and confirm service health checks (`/health`, UI `200`, gRPC port)
3. capture incident details and owner in stabilization backlog issue
4. roll forward with a hotfix PR after validation
