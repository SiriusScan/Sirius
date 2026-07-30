---
title: "Community Independence and Private-Leakage Checks"
description: "Standing public checks that Community never requires private access and public artifacts never leak private references."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2026-07-30"
author: "Sirius Maintainers"
tags: ["community", "independence", "leakage", "sbom", "ghcr", "ci"]
categories: ["deployment", "security", "testing"]
difficulty: "intermediate"
prerequisites: ["README.workflows.md", "ADR.001-public-core-private-extension.md"]
related_docs:
  - "README.workflows.md"
  - "../architecture/ADR.001-public-core-private-extension.md"
  - "../architecture/ADR.002-repository-ownership.md"
  - "../../dev-notes/pro-bifurcation-plan.md"
dependencies:
  - "scripts/community-independence/"
  - "scripts/test-community-independence.sh"
  - ".github/workflows/community-independence.yml"
llm_context: "high"
search_keywords:
  [
    "community independence",
    "private leakage",
    "allowlist",
    "cyclonedx",
    "anonymous ghcr",
    "core-manifest",
  ]
---

# Community Independence and Private-Leakage Checks

## Purpose

Prove the public Sirius Community edition stays independently buildable and runnable
from public artifacts only, and that public source, release archives, SBOMs, and images
do not contain private module paths, private registry references, credentials, or
high-confidence Pro runtime markers.

## When to Use

- **Primary Use Case**: Before merging changes that touch compose, workflows, release
  tooling, Dockerfiles, or dependency manifests
- **Secondary Use Cases**: Investigating suspected private leakage; verifying a public
  release still scans clean
- **Avoid When**: Expecting these checks to authorize or exercise private Pro packages —
  that is intentionally out of scope

## How to Use

### Quick Start

```bash
# Contract + canary tests (no private repo access)
bash scripts/test-community-independence.sh

# Scan tracked public source/runtime configuration
bash scripts/community-independence/scan.sh --mode source

# Anonymous public v1.1.0 source archive + 12 SBOMs (network)
out="$(mktemp -d)"
bash scripts/community-independence/download_public_release.sh --tag v1.1.0 --out-dir "${out}"
bash scripts/community-independence/scan.sh --mode release-archive --archive "${out}/source.tar.gz"
bash scripts/community-independence/scan.sh --mode sbom --tag v1.1.0 --sbom-dir "${out}/assets"

# Six digest image scan (Docker + network; does not run containers)
bash scripts/community-independence/scan.sh --mode images --manifest "${out}/assets/core-manifest.yaml"
```

### Scopes

| Mode | What it covers |
| --- | --- |
| `source` | Git-tracked public source/config; path-aware allowlist |
| `release-archive` | Public tag source archive members (safe extract semantics) |
| `sbom` | Exactly twelve v1.1.0 CycloneDX assets + marker scan |
| `images` | Six `core-manifest` digest refs, anonymous pull, no container run |
| `compose` | Rendered public Compose references only public GHCR |

### Governance allowlist

Only narrow governance documentation, task records, and program notes may describe the
public/private boundary. The allowlist lives at
`scripts/community-independence/policy/governance-allowlist.txt`.

Runtime code, Docker/Compose files, build/release scripts, and GitHub workflows are
never allowlisted—even if mistakenly added to the policy file.

### Anonymous release scan

The full CI job downloads public `v1.1.0` release assets and the source archive with
empty `GH_TOKEN` / `GITHUB_TOKEN`, pulls digest refs with an empty `DOCKER_CONFIG`, and
reuses existing public compose smoke tooling. It does not use private checkouts,
registry logins, organization secrets, or PATs.

### Limitations

- Binary blobs are skipped for text markers; layer archives are inspected, but encrypted
  or opaque payloads may not yield readable text
- High-confidence credential regexes are intentionally narrow to limit false positives
- Compose smoke requires a working Docker engine and network access to public GHCR
- Public CI must never read a real private repository to plant or verify canaries;
  synthetic runtime fixtures preserve the independence guarantee

## What It Is

### Workflow jobs

`.github/workflows/community-independence.yml`:

1. **source-contract** (pull_request + push): contract tests, source leakage scan,
   public compose/config independence with credentials emptied
2. **public-release-scan** (main push, schedule, workflow_dispatch): anonymous v1.1.0
   source/SBOM/image scan plus public Compose smoke

Permissions are `contents: read` only. Actions are full-SHA pinned.
`persist-credentials: false` on checkout.

### LLM Context

- **Primary Purpose**: Keep Community credential-free and free of private leakage
- **Key Concepts**: path-scoped allowlist, anonymous GHCR, CycloneDX SBOM set, digest refs
- **Related Systems**: core-manifest release train, public compose validation
- **Important Constraints**: no private repo access in public CI; fail closed

## Troubleshooting

| Issue | Solution |
| --- | --- |
| Governance doc fails scan | Add only an explicit docs/tasks/program path to the allowlist; never workflows/Docker |
| SBOM count failure | Ensure all twelve `sbom-<component>-<tag>-linux-*.cdx.json` assets exist |
| Image pull unauthorized | Confirm public GHCR visibility for `ghcr.io/siriusscan/*` digest refs |
