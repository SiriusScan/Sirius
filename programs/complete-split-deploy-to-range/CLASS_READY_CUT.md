# Class-ready Pro-dev cut

Date: 2026-07-31

This is an accelerated, non-production track inside the existing bifurcation
program. It does not replace or weaken the full Community/Pro acceptance criteria.
It establishes a private Pro working-tree / Compose build root on the range so that
development mutations stay in `OpenSecurity-Infosec/sirius-pro`, while Community is
consumed only as immutable digests. Full contract, entitlement, Reporting, and
release tracks continue separately.

## Decision

**Success for this cut** is that private `OpenSecurity-Infosec/sirius-pro` is the
**sole mutable Compose and build root** on the approved range host, checked out at
`/home/agi/sirius-pro`. Community is consumed only through `core.lock.yaml`
immutable digests for tag `v1.1.0`. Canonical operator ports `:3000` (UI) and
`:9001` (API) are owned by the Pro-owned Compose project. `/home/agi/Sirius` is
retired from the development path (read-only pin of the locked Community tag, or
unused).

**Companion sidecars alone do not satisfy this cutoff.** Private services listening
only on `:3100` / `:9101` / `:9102` while Community continues to own `:3000` /
`:9001` from `/home/agi/Sirius` leave the range as a Community development surface
and are insufficient, even if those sidecars are healthy.

| Layer | Class-ready implementation | Boundary |
| --- | --- | --- |
| Private build root | Range development and Compose project live under `/home/agi/sirius-pro` from private `sirius-pro` | Sole mutable working tree for Pro-dev on the range |
| Community core | Six Community `v1.1.0` images from `core.lock.yaml`, referenced only by exact `@sha256:` digests | No private credentials required to run Community alone elsewhere; on the range, Pro Compose owns the project that pulls those digests |
| Canonical ports | Pro-owned Compose project binds `:3000` and `:9001` | Operator and instructor paths stay on the existing ports |
| `/home/agi/Sirius` | Detached read-only pin of `v1.1.0` or left unused; not the active Compose project directory | Not a development write path; no local Community forks or private Community clones |
| Optional Pro-dev stubs | Private API/UI/worker stubs may exist, but only as overlays inside the Pro-owned project | Sidecars on `:3100`/`:9101`/`:9102` are optional and **not** the acceptance signal |
| Shared fixes | Bugfixes that belong in Community remain public-first per ADR-001/ADR-002 | No private Community fork; no exporting private commits into public as the product model |
| Product features | None required for this cut | No Reporting, entitlements platform, event contract, UI registry, or engine interface work |

The private repository should contain (exact layout may evolve in private work, but
the range outcome above is fixed):

- `core.lock.yaml`: already pins Community `v1.1.0` source commit and six release
  digests; remains the only Community input.
- A Pro-owned Compose project that pulls those locked digests and owns `:3000` /
  `:9001` (and any optional Pro-dev services).
- A validator that rejects mutable image references for locked Community and private
  images, and rejects treating `/home/agi/Sirius` as the active development Compose
  root.
- Optional class artifacts (`pro-dev.lock.yaml`, stub services) that must not redefine
  success away from the private build-root cutoff.

This shape deliberately avoids unfinished public event, UI registry, engine, and
entitlement contracts. Those remain blockers for the integrated product, not for
establishing the private working-tree cutoff.

## Non-goals

- Private fork or private clone of Community as the product model.
- Making shared Community fixes land first (or only) in private trees.
- Shipping Enterprise Reporting, signed licenses, event contracts, UI registry,
  engine interfaces, or other product features for this cut.
- Claiming that healthy companion sidecars on non-canonical ports complete the cut.
- Weakening Community independence, leakage controls, or the full program acceptance
  criteria.

## Scope split

### A. Must ship for the class demo

- Private `sirius-pro` is the sole mutable Compose/build root on the range at
  `/home/agi/sirius-pro`.
- Community is consumed only via `core.lock.yaml` immutable digests for `v1.1.0`
  (source commit `b61b47b468cfc5c837a5bde50eeafe52df4fe10d` and the six locked
  image digests).
- The Pro-owned Compose project owns canonical ports `:3000` and `:9001`; health
  probes against those ports succeed from the approved client path.
- `/home/agi/Sirius` is not used as the active development Compose project
  (read-only pin of `v1.1.0` or unused).
- No private Community fork; public-first shared fixes per ADR-001/ADR-002 remain
  policy.
- Pre-change database backup and prior Community checkout/image state are recorded
  before the range change.
- No Pro schema/migration is required for this cut; Community volumes and scan data
  remain the rollback authority where volumes are reused.

### B. May ship stubbed/dev (optional; not acceptance)

- Private Pro-dev API/UI/worker stubs and non-canonical ports (`:3100`, `:9101`,
  `:9102`) may be present inside the Pro-owned project.
- Explicit `non-production` / fail-closed entitlement stubs if useful for demos.
- Digested private images and a class `pro-dev.lock.yaml`.

These do **not** replace the must-ship private build-root and canonical-port
criteria.

### C. Deferred to the full program

- Public event envelope, UI registry, engine interfaces, and full compatibility
  harness (Phase 3.3-3.6).
- Capability catalog integration, signed offline licenses, KMS/key rotation, grace,
  renewal, and lifecycle matrices (Phase 4).
- Pro schema, migrations, real event consumption, scheduling, PDF/CSV output, audit
  history, and integrated Reporting UI/API/worker (Phase 5).
- Nightly compatibility, full SBOM/provenance/signing promotion, release manifests,
  and promotion-by-retag (Phase 6).
- Counsel, EULA/customer distribution, customer licenses, production deployment,
  and any external release claim.

## Evidence and blockers at cut selection

- `sirius-pro` previously started as a skeleton; local private work may already
  include companion stubs (for example services on `:9101`/`:3100`/`:9102`). Those
  stubs are **not** cutoff completion.
- `sirius-pro/core.lock.yaml` already pins Community `v1.1.0` source commit
  `b61b47b468cfc5c837a5bde50eeafe52df4fe10d` and all six release digests.
- Community main advances separately; it is not the immutable six-image class input.
  Use the `v1.1.0` lock for this cut.
- The last independent range receipt (2026-07-31) says VMID 220 was started and
  Community UI/API returned 200. The installed checkout was previously recorded as
  `/home/agi/Sirius` using mutable `latest`; live state must be re-read before change.
- Companion sidecars published privately while `/home/agi/Sirius` still owns
  `:3000`/`:9001` do **not** meet success.
- Private repositories are outside the public Sirius checkout; private source must
  not be staged in Community as a workaround.
- Private Pro images, GHCR pull credentials, and a network-capable operator session
  remain execution blockers for the deployment gate—not for documenting this cutoff.

No additional public product contract is a blocker for the private build-root cut.
The real blockers are private Compose/build-root implementation that owns the
canonical ports, private image publication as needed, GHCR read access on the guest,
backup/approval gates, and a network-capable operator session for the approved
deployment gate.

## Ordered execution checklist

### 1. Implement and validate the private build root — agent

Run the next agent cycle with
`/Users/oz/Projects/Sirius-Project/private/sirius-pro` as a writable workspace. Own
only that repository. Establish a Pro-owned Compose project that:

1. Consumes Community solely via `core.lock.yaml` digests (`v1.1.0`).
2. Owns `:3000` and `:9001` in the rendered Compose project.
3. Treats companion sidecars as optional overlays, not as success.
4. Rejects mutable Community/private image references in validation.

Required validation after the files exist (adjust paths to the private layout):

```bash
cd /Users/oz/Projects/Sirius-Project/private/sirius-pro
# Native tests for any private packages that exist
# Compose/config validation that lists rendered images and requires @sha256:
bash scripts/validate-pro-dev-compose.sh
git diff --check
```

Commit locally in private; do not push without a human gate.

### 2. Review, publish, and record private images — human gates

1. Human reviews the local private diff and explicitly approves push/PR/merge.
2. Human separately approves any private image workflow dispatch required for the
   Pro-owned project.
3. Digests used on the range are recorded; this class cut does not claim deferred
   Phase 6 promotion guarantees.
4. Human provisions a least-privilege `read:packages` credential to the range guest
   when private images are required. Do not commit it or copy it into Compose/YAML.

### 3. Re-enter the range read-only — human/operator

The previously proven access path is:

```bash
ssh -i ~/.ssh/dev01_agi -o BatchMode=yes \
  -o ProxyCommand="ssh -i ~/.ssh/dev01_agi -o BatchMode=yes -W %h:%p agi@192.168.123.200" \
  agi@10.0.10.20
```

Before approval to change anything, collect:

```bash
# Current Community path (legacy; must not remain the active Pro-dev root)
cd /home/agi/Sirius
git status --short --branch
git rev-parse HEAD
docker compose ps
docker ps --format '{{.Names}} {{.Image}} {{.Status}}'
curl -fsS http://127.0.0.1:9001/health
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/

# Target private root (may be absent before cutover)
ls -la /home/agi/sirius-pro 2>/dev/null || true
```

If this path fails, stop and report whether the failure is jump-host SSH, guest SSH,
VM power, or guest service health. Do not add routes, firewall rules, or restart VMID
220 without a separate range-owner approval.

### 4. Back up and stage — human deployment gate

After range-owner approval, preserve the existing state without exposing secrets:

```bash
install -d -m 700 /home/agi/backups
cd /home/agi/Sirius
git rev-parse HEAD > /home/agi/backups/sirius-pre-pro-dev.git-sha
docker ps --no-trunc --format '{{.Names}} {{.Image}} {{.Status}}' \
  > /home/agi/backups/sirius-pre-pro-dev.containers.txt
docker exec sirius-postgres sh -lc \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > /home/agi/backups/sirius-pre-pro-dev.dump
test -s /home/agi/backups/sirius-pre-pro-dev.dump
```

Stage the reviewed private tree at `/home/agi/sirius-pro`. Retire `/home/agi/Sirius`
from the development path: either leave it unused or move it to a detached
read-only pin of public `v1.1.0` (same commit as `core.lock.yaml`). Do not develop
against `/home/agi/Sirius` after cutover.

```bash
# Optional read-only Community pin (not the active Compose root)
cd /home/agi/Sirius
test -z "$(git status --porcelain --untracked-files=no)"
git fetch --tags origin v1.1.0
git checkout --detach v1.1.0
test "$(git rev-parse HEAD)" = b61b47b468cfc5c837a5bde50eeafe52df4fe10d
```

Existing ignored `.env` and secret files remain Vault-derived runtime mirrors;
copy or re-point them into the Pro-owned project as the operator runbook requires,
without committing secrets.

Log in to GHCR only via standard input from the human-provided ephemeral environment
when private images are required:

```bash
printf '%s' "$SIRIUS_PRO_GHCR_PULL_TOKEN" | \
  docker login ghcr.io --username "$SIRIUS_PRO_GHCR_USER" --password-stdin
unset SIRIUS_PRO_GHCR_PULL_TOKEN
```

### 5. Render, deploy, and verify — agent observes; human executes

Deploy from `/home/agi/sirius-pro` as the Compose project directory (exact compose
file names follow the private repository layout). The project must own `:3000` and
`:9001` and pull Community only by locked digests.

Illustrative shape (adjust `-f` paths to the private tree):

```bash
cd /home/agi/sirius-pro
docker compose --env-file .env \
  --project-directory /home/agi/sirius-pro -p sirius \
  -f <pro-owned-compose-files> \
  config --images

docker compose --env-file .env \
  --project-directory /home/agi/sirius-pro -p sirius \
  -f <pro-owned-compose-files> \
  pull

docker compose --env-file .env \
  --project-directory /home/agi/sirius-pro -p sirius \
  -f <pro-owned-compose-files> \
  up -d
```

Acceptance probes (canonical ports are required):

```bash
curl -fsS http://127.0.0.1:9001/health
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
# Confirm active Compose project directory is /home/agi/sirius-pro
# Confirm rendered Community images match core.lock.yaml digests
# Confirm /home/agi/Sirius is not the active project directory
```

Optional sidecar probes (`:9101`, `:3100`, `:9102`) may be recorded if those
services exist; they are **not** sufficient for acceptance.

The instructor then verifies the scan/UI path on the canonical ports from the
approved client path.

### 6. Prove Community-data rollback / restore — human deployment gate

Do not use `down --volumes` or delete any volume without a separate destructive
approval. Prove that core data remains readable after cutover operations, and that
the Pro-owned project can be reconciled without destroying Community volumes.

Verify an existing scan remains readable. Capture evidence before any further
overlay changes. Human approval is required before restoring or advancing state.

## Immediate human gate

Approve documentation of this private build-root cutoff on the Community feature
branch, then continue private `sirius-pro` implementation so the range Compose root
moves to `/home/agi/sirius-pro` with locked Community digests on `:3000`/`:9001`.
Do not treat companion sidecars alone as done. Do not approve range mutation,
publication, or deployment without the separate gates above.
