# Class-ready Pro-dev cut

Date: 2026-07-31

This is an accelerated, non-production track inside the existing bifurcation
program. It does not replace or weaken the full Community/Pro acceptance criteria.
It produces a visibly distinct Pro-dev composition for class use while the complete
contract, entitlement, Reporting, and release tracks continue separately.

## Decision

Build a private companion stack in the existing private `sirius-pro` repository and
add it to the Community Compose project:

| Layer | Class-ready implementation | Boundary |
| --- | --- | --- |
| Community core | All six Community `v1.1.0` images from `core.lock.yaml`, overridden by exact `@sha256:` references | No private credentials, packages, or source required to run Community alone |
| Pro-dev API | Private Go/Fiber image with `/health`, `/api/pro/v1/status`, and a deterministic stub `/api/pro/v1/reports` route | Companion service; does not replace or import the Community API |
| Pro-dev UI | Private Next.js image on `:3100` with a prominent `PRO DEV / NON-PRODUCTION` banner, Pro status/report stub, and link to Community UI on `:3000` | Companion service until the public UI registry is ready |
| Pro-dev worker | Private Go image with a health endpoint on `:9102` and explicit idle/stub state | Does not consume Community queues until the event contract is ready |
| Entitlement | Fail closed by default; class deployment explicitly sets a dev-only allow-all provider and surfaces that mode in API/UI | No customer license, issuer, signing key, or claim of production licensing |
| Data | Read-only/no-op Pro stubs; no Pro schema or migration | Community volumes and scan data remain the rollback authority |

The private deployment directory should contain:

- `docker-compose.community-lock.yaml`: overrides `sirius-ui`, `sirius-api`,
  `sirius-migrate`, `sirius-engine`, `sirius-postgres`, `sirius-rabbitmq`, and
  `sirius-valkey` with the existing locked Community digests.
- `docker-compose.pro-dev.yaml`: adds `sirius-pro-api`, `sirius-pro-ui`, and
  `sirius-pro-worker`; every private image variable must contain `@sha256:`.
- `pro-dev.lock.yaml`: records the three tested private image digests and source
  commit. It is a class artifact, not a Pro release manifest.
- A validator that rejects mutable image references, a missing explicit dev-mode
  acknowledgement, or any attempt to add a Pro dependency to Community.

This companion shape deliberately avoids the unfinished public event, UI registry,
and engine contracts. Those contracts are blockers for the integrated product, not
for this class-only composition.

## Scope split

### A. Must ship for the class demo

- The locked Community `v1.1.0` six-image stack remains healthy on `:3000` and
  `:9001/health`.
- Three private Pro-dev images build, pass native tests, publish privately, and are
  consumed by digest.
- Pro-dev UI is visibly distinct on `:3100`; Pro-dev API and worker health checks are
  green.
- `/api/pro/v1/reports` is capability checked. With no provider it returns the
  structured `CAPABILITY_NOT_LICENSED` response; the class Compose file explicitly
  enables and labels `dev_allow_all`.
- The overlay adds no Pro migrations and can be removed while Community
  health and existing scan data remain intact.
- A pre-change database backup and the previous Community checkout/image state are
  recorded before the range change.

### B. May ship stubbed/dev

- Entitlements: explicit allow-all development provider; no signed license.
- Reporting: status/list/generate-demo response only; no PDF, CSV, scheduler,
  delivery, or report persistence.
- Worker: healthy idle/no-op loop; no queue consumption or audit-event production.
- UI: companion page instead of an integrated Community navigation entry.
- Pro API: companion service instead of a compile-time replacement build.

Every stub must be labeled `non-production`, return its current mode, and have a
test proving that the default configuration fails closed. The two required class
acknowledgements are `SIRIUS_PRO_DEV_ALLOW_ALL=true` and
`SIRIUS_PRO_DEV_ACKNOWLEDGE_NON_PRODUCTION=true`; the overlay validator must reject
missing or false values.

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

- `sirius-pro` is a skeleton at commit `16d483e`: no Compose file, Dockerfile, Go
  module, UI package, or worker exists yet.
- `sirius-entitlements` is a skeleton at commit `ff1e4e2`.
- `sirius-release` has the private supply-chain bootstrap at commit `c7bbdc6`, but no
  product image pipeline has been instantiated.
- `sirius-pro/core.lock.yaml` already pins Community `v1.1.0` source commit
  `b61b47b468cfc5c837a5bde50eeafe52df4fe10d` and all six release digests.
- Community main is `a279198a3`; its API Module/OpenAPI contracts are green, but it is
  not the immutable six-image class input. Use the `v1.1.0` lock for this cut.
- The last independent range receipt (2026-07-31) says VMID 220 was started and
  Community UI/API returned 200. The installed checkout was previously recorded as
  `/home/agi/Sirius` using mutable `latest`; live state must be re-read before change.
- This agent sandbox rejects all network sockets with `Operation not permitted`, so
  it cannot re-verify the range or use the jump host. That is an execution-environment
  restriction, not evidence that VMID 220 is down.
- The private repositories are outside this run's writable workspace. Private source
  must not be staged in the public Sirius checkout as a workaround.
- This managed workspace also exposes the public repository's `.git` directory as
  read-only. The scoped documentation changes are present in the working tree, but
  `git add` fails while creating `.git/index.lock`; a later writable run must commit
  them before private implementation starts.
- Private Pro-dev image digests and a least-privilege GHCR pull credential for the
  range do not yet exist.

No additional public contract is a blocker for the companion cut. The real blockers
are private implementation, private image publication, GHCR read access on the guest,
and a network-capable operator session for the approved deployment gate.

## Ordered execution checklist

### 1. Implement and validate the private cut — agent

Run the next agent cycle with
`/Users/oz/Projects/Sirius-Project/private/sirius-pro` as a writable workspace. Own
only that repository. Add the three services and deployment files described above.

Required validation after the files exist:

```bash
cd /Users/oz/Projects/Sirius-Project/private/sirius-pro
make test
(cd apps/api && go test ./...)
(cd apps/worker && go test ./...)
npm --prefix apps/ui ci
npm --prefix apps/ui run lint
npm --prefix apps/ui run build
bash scripts/validate-pro-dev-compose.sh
git diff --check
```

The validation script must render the Community base + production override + both
private overlays with fixture-only values, list all ten rendered image references,
and reject any reference that lacks `@sha256:`. Commit locally; do not push.

### 2. Review, publish, and record private images — human gates

1. Human reviews the local private diff and explicitly approves push/PR/merge.
2. Human separately approves the private image workflow dispatch.
3. The workflow builds each image once from the accepted full source SHA, tests it,
   pushes a source-SHA tag, resolves the three digests, and writes the values used for
   `pro-dev.lock.yaml`. This class cut does not claim the deferred Phase 6 promotion
   guarantees.
4. Human provisions a least-privilege `read:packages` credential to the range guest.
   Do not commit it or copy it into Compose/YAML.

Planned dispatch shape after the private workflow exists:

```bash
gh workflow run pro-dev-images.yml \
  --repo "$SIRIUS_PRO_REPOSITORY" \
  -f source_sha=<accepted-full-40-character-sha>
```

### 3. Re-enter the range read-only — human/operator

The previously proven access path is:

```bash
ssh -i ~/.ssh/dev01_agi -o BatchMode=yes \
  -o ProxyCommand="ssh -i ~/.ssh/dev01_agi -o BatchMode=yes -W %h:%p agi@192.168.123.200" \
  agi@10.0.10.20
```

Before approval to change anything, collect:

```bash
cd /home/agi/Sirius
git status --short --branch
git rev-parse HEAD
docker compose ps
docker ps --format '{{.Names}} {{.Image}} {{.Status}}'
curl -fsS http://127.0.0.1:9001/health
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
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

The operator copies the reviewed private `deployments/` artifacts to
`/home/agi/sirius-pro/deployments/`, confirms `/home/agi/Sirius` has no tracked local
changes, fetches the public `v1.1.0` tag, and moves the public checkout to that exact
tag. Existing ignored `.env` and secret files remain Vault-derived runtime mirrors.

```bash
cd /home/agi/Sirius
test -z "$(git status --porcelain --untracked-files=no)"
git fetch --tags origin v1.1.0
git checkout --detach v1.1.0
test "$(git rev-parse HEAD)" = b61b47b468cfc5c837a5bde50eeafe52df4fe10d
```

The `v1.1.0` Community core migrator may apply core migrations on first start. The
class cut adds no Pro migration; the backup remains mandatory for the core change.

Log in to GHCR only via standard input from the human-provided ephemeral environment:

```bash
printf '%s' "$SIRIUS_PRO_GHCR_PULL_TOKEN" | \
  docker login ghcr.io --username "$SIRIUS_PRO_GHCR_USER" --password-stdin
unset SIRIUS_PRO_GHCR_PULL_TOKEN
```

### 5. Render, deploy, and verify — agent observes; human executes

Use the existing Compose project name so named Community volumes are reused:

```bash
cd /home/agi/Sirius
docker compose --env-file /home/agi/Sirius/.env \
  --project-directory /home/agi/Sirius -p sirius \
  -f /home/agi/Sirius/docker-compose.yaml \
  -f /home/agi/Sirius/docker-compose.prod.yaml \
  -f /home/agi/sirius-pro/deployments/docker-compose.community-lock.yaml \
  -f /home/agi/sirius-pro/deployments/docker-compose.pro-dev.yaml \
  config --images

docker compose --env-file /home/agi/Sirius/.env \
  --project-directory /home/agi/Sirius -p sirius \
  -f /home/agi/Sirius/docker-compose.yaml \
  -f /home/agi/Sirius/docker-compose.prod.yaml \
  -f /home/agi/sirius-pro/deployments/docker-compose.community-lock.yaml \
  -f /home/agi/sirius-pro/deployments/docker-compose.pro-dev.yaml \
  pull

docker compose --env-file /home/agi/Sirius/.env \
  --project-directory /home/agi/Sirius -p sirius \
  -f /home/agi/Sirius/docker-compose.yaml \
  -f /home/agi/Sirius/docker-compose.prod.yaml \
  -f /home/agi/sirius-pro/deployments/docker-compose.community-lock.yaml \
  -f /home/agi/sirius-pro/deployments/docker-compose.pro-dev.yaml \
  up -d
```

Acceptance probes:

```bash
curl -fsS http://127.0.0.1:9001/health
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
curl -fsS http://127.0.0.1:9101/health
curl -fsS http://127.0.0.1:9101/api/pro/v1/status
curl -fsS http://127.0.0.1:9101/api/pro/v1/reports
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3100/
curl -fsS http://127.0.0.1:9102/health
```

The status/report responses must explicitly identify `pro-dev`,
`entitlement_mode=dev_allow_all`, and stub limitations. The instructor then verifies
the Community scan path and the Pro-dev page from the approved client path.

### 6. Prove Community-only rollback — human deployment gate

Do not use `down --volumes` or delete any volume. Reconcile the project without the
Pro-dev overlay:

```bash
cd /home/agi/Sirius
docker compose --env-file /home/agi/Sirius/.env \
  --project-directory /home/agi/Sirius -p sirius \
  -f /home/agi/Sirius/docker-compose.yaml \
  -f /home/agi/Sirius/docker-compose.prod.yaml \
  -f /home/agi/sirius-pro/deployments/docker-compose.community-lock.yaml \
  up -d --remove-orphans
curl -fsS http://127.0.0.1:9001/health
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
```

Verify an existing scan remains readable. Restore the accepted Pro-dev overlay only
after that evidence is captured and the human approves it.

## Immediate human gate

Start the next bounded agent run with this Sirius repository's `.git` metadata and
the private `sirius-pro` repository writable. Approve local commits of this handoff
and implementation of the three stub images plus the two deployment overlays. Do not
approve push, publication, range mutation, or deployment yet; each remains a separate
gate above.
