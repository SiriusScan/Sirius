---
title: "Engine Component Pinning"
description: "How sirius-engine pins each minor-project at build time, where pins live, who is allowed to change them, and how to bump a component without breaking CI."
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["architecture", "deployment", "operations"]
tags: ["docker", "submodules", "pinning", "release-engineering", "ci-cd"]
related_docs:
  - "README.docker-architecture.md"
  - "README.cicd.md"
  - "../../dev-notes/SHA-AUDIT-2026-04.md"
  - "../README.development.md"
---

# Engine Component Pinning

`sirius-engine` is built from six external SiriusScan repositories that
are cloned and compiled inside the engine image. To make every build
reproducible, each repository is pinned to a single commit SHA (or, for
`go-api`, a tag). This document describes where those pins live, the
rules that govern them, and the workflow to bump one safely.

## Why pin

Without explicit pins:

- A `docker compose build` on Monday and the same command on Wednesday
  could produce different binaries (silent supply-chain drift).
- A bug introduced in a minor-project's `main` branch lands in the next
  engine image without any signal in the Sirius repo.
- Rollbacks become impossible because there is no record of *which*
  upstream commit produced a given engine image.

The `check-pin-consistency.yml` GitHub Action enforces these rules
mechanically (see `.github/workflows/check-pin-consistency.yml`).

## Pinned components

| ARG | Repository | Used by | Notes |
| --- | --- | --- | --- |
| `GO_API_COMMIT_SHA` | `SiriusScan/go-api` | All Go services in the engine + the standalone `sirius-api` image | Pinned by **tag** (`vX.Y.Z`). Tag is created in the `go-api` repo first, then bumped here. |
| `APP_SCANNER_COMMIT_SHA` | `SiriusScan/app-scanner` | Scanner binary (`/scanner`) | Full SHA. CGO build, depends on `libpcap` and `pingpp`. |
| `APP_TERMINAL_COMMIT_SHA` | `SiriusScan/app-terminal` | Terminal binary (`/terminal`) | Full SHA. |
| `SIRIUS_NSE_COMMIT_SHA` | `SiriusScan/sirius-nse` | NSE script repo bundled with the scanner | Full SHA. |
| `APP_AGENT_COMMIT_SHA` | `SiriusScan/app-agent` | Agent server (`/app-agent-src/server`) | Full SHA. |
| `PINGPP_COMMIT_SHA` | `SiriusScan/pingpp` | Fingerprinting library linked into `app-scanner` | Full SHA. |

## Where pins live

There are exactly **two** authoritative pin surfaces. They must always
agree.

1. **`sirius-engine/Dockerfile` — `ARG ..._COMMIT_SHA` defaults**

   The Dockerfile is the source of truth. Local `docker compose build`
   uses these defaults. The block lives at the top of the build stage
   and carries a `# Pin policy` comment.

2. **`.github/workflows/ci.yml` — `build-args` fallbacks**

   CI passes `${{ env.X_COMMIT_SHA || '<fallback>' }}` for every pin in
   the `build-engine` and `build-api` jobs. The `<fallback>` literals
   must match the Dockerfile defaults exactly. The `env.*` vars are
   only populated when CI is triggered by a `repository_dispatch` from
   a minor-project's release workflow (see "Bumping a pin via dispatch"
   below).

There is also a per-build override:

3. **`docker compose build --build-arg X_COMMIT_SHA=...`**

   Local engineers can override any pin to test a hot fix, but this
   override must never be committed.

## Rules

1. **No floating refs.** `main`, `master`, `HEAD`, branch names, or
   relative refs like `HEAD~1` are forbidden. Every pin must be either
   a full 40-character SHA or a semver tag.
2. **Dockerfile and CI must agree.** The
   `check-pin-consistency.yml` workflow fails any PR that drifts.
3. **Tag preferred for `go-api`.** Other Sirius services consume
   `go-api` as a Go module via `go.mod`. Bumping the tag in two places
   (its own `go.mod` and ours) is easier with a tag than a SHA.
4. **Bumps are atomic.** A pin bump PR must update the Dockerfile, the
   CI fallback, and the audit doc (current: `SHA-AUDIT-2026-04.md`,
   future: a successor file) in one change set.
5. **Every pin bump references the upstream change.** PR description
   must link to the upstream commit or tag and summarize behavior
   changes that affect the engine.

## Workflows

### Bumping a pin manually

```bash
# 1. Choose the new SHA (full 40-char) or tag.
NEW_SHA=ca1ef2fb75d2c422675eb41a27517da6aa5cf842

# 2. Edit sirius-engine/Dockerfile ARG block.
# 3. Edit .github/workflows/ci.yml build-engine fallback.
# 4. Append a row to documentation/dev-notes/SHA-AUDIT-2026-04.md
#    (or the current audit doc) describing what changed and why.

# 5. Verify locally.
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml build --no-cache sirius-engine

# 6. Open a PR. The check-pin-consistency.yml job will fail
#    if Dockerfile and CI disagree, or if you used a floating ref.
```

### Bumping a pin via repository dispatch

When a minor-project finishes its own release, its
`Notify Sirius` workflow fires a `repository_dispatch` event with:

```json
{
  "event_type": "submodule-update",
  "client_payload": {
    "submodule": "SiriusScan/app-agent",
    "commit_sha": "<40-char SHA>"
  }
}
```

The Sirius `ci.yml` workflow:

1. Derives the env-var name from `submodule` (e.g. `app-agent` →
   `APP_AGENT_COMMIT_SHA`).
2. Sets `env.APP_AGENT_COMMIT_SHA = <commit_sha>` for the run.
3. Builds the engine image with the new SHA via
   `${{ env.APP_AGENT_COMMIT_SHA || '<fallback>' }}`.

The result is published as `:latest` and `:beta`. The
**fallback in CI is intentionally not updated by the dispatch** — it
stays at the Dockerfile default until a human opens a PR. This means a
dispatch-triggered build is reproducible only as long as the dispatched
SHA exists; if you want the new SHA to be the long-lived floor, follow
the manual workflow above to land it in the Dockerfile.

### Local hot-swap (no rebuild)

For a fast iteration loop without rebuilding the image, see
`docker-compose.dev.yaml` (bind mounts) and the per-service `.air.toml`
files (live reload). See `../README.development.md` for the full
dev-mode workflow.

## Common failure modes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Dashboard shows behavior that the latest source does not implement | Engine image is stale; pin is behind upstream `main` | Bump the relevant pin (manual or dispatch) and rebuild |
| `docker compose build` produces different binaries on different machines | A pin is using a floating ref like `main` | Replace with a full SHA; the guardrail will block this in CI |
| CI green on PR but runtime explodes after merge | Dockerfile and CI fallbacks disagree, and the merged build used the CI fallback (which differs from local) | Re-run guardrail; align both surfaces |
| `app-scanner` build fails with a `sed: pattern not found` error | An old branch still has the inline sed block; that block was removed in this overhaul | Rebase onto current `main`; the patches are now real source in `app-scanner` |

## See also

- `documentation/dev-notes/SHA-AUDIT-2026-04.md` — full audit and
  per-component decision rationale captured at the time of the
  overhaul.
- `documentation/dev/architecture/README.docker-architecture.md` —
  overall engine container architecture.
- `documentation/dev/architecture/README.cicd.md` — CI/CD pipeline
  overview.
- `documentation/dev/README.development.md` — dev-mode workflow.
