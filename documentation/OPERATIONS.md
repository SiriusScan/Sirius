# Sirius Operations & Troubleshooting Runbook

This document contains operational procedures, verification runbooks, and advanced troubleshooting for Sirius maintainers and operators. For getting started, see the [README](../README.md).

## Clean Rollout Verification (Fresh Clone)

Use this sequence to validate a production rollout from a fresh checkout.

```bash
# 1) Start from a clean runtime state
docker compose down -v --remove-orphans

# 2) Generate runtime secrets/config
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets

# 3) Build from local source deterministically
docker compose -f docker-compose.yaml -f docker-compose.build.yaml up -d --build

# 4) Confirm all services are healthy
docker compose ps

# 5) Validate API auth behavior
curl -i http://localhost:9001/host/            # expect 401 (no key)
# Internal key: prefer the mounted secret file path inside the container, else env.
RUNTIME_KEY=$(docker exec sirius-api sh -lc 'if [ -r "${SIRIUS_API_KEY_FILE:-}" ]; then tr -d "\r\n" < "$SIRIUS_API_KEY_FILE"; elif [ -n "${SIRIUS_API_KEY:-}" ]; then printf %s "$SIRIUS_API_KEY"; fi')
curl -i -H "X-API-Key: ${RUNTIME_KEY}" http://localhost:9001/host/   # expect 200

# 6) Ensure startup regressions are absent
docker compose logs --no-color sirius-ui sirius-engine | rg -i "ENOTFOUND|permission denied|Failed to open log file"
```

If step 6 returns any lines, capture full logs and investigate before rollout.

### Migrating existing `.env` deployments to file-based internal key

If `docker compose up` errors on the `sirius_api_key` secret file, create it once from your current key (same value as `SIRIUS_API_KEY` in `.env`):

```bash
mkdir -p secrets
printf '%s\n' "$SIRIUS_API_KEY" > secrets/sirius_api_key.txt
chmod 644 secrets/sirius_api_key.txt
```

Use **`644` (owner read/write, world read)** on `secrets/sirius_api_key.txt`, not `600`. Compose bind-mounts that file into the container as `/run/secrets/sirius_api_key`; **sirius-api** runs as a non-root UID (1001) and must be able to open it. `600` keeps “other” from reading, so you get `permission denied` on `/run/secrets/sirius_api_key` even when `SIRIUS_API_KEY` is set in `.env` (older API builds failed before env fallback; current **sirius-api** falls back to `SIRIUS_API_KEY` if the file is unreadable when the env is set). The installer writes this file as `644` by default.

Re-run the installer to add `SIRIUS_API_KEY_FILE=/run/secrets/sirius_api_key` to `.env` if it is missing. Services accept **either** the file or `SIRIUS_API_KEY` during transition.

## Release Image Propagation Verification

Use this path to validate what operators experience when running pulled release images.

```bash
# 1) Ensure local builds are not used
docker compose down -v --remove-orphans

# 2) Generate runtime secrets/config
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets

# 3) Validate the public release path for a published tag
export IMAGE_TAG=v0.4.1
bash scripts/validate-public-compose-path.sh "$IMAGE_TAG"

# 4) Verify running container image IDs match pulled release images
bash scripts/verify-release-images.sh
```

Expected result: the public-stack validator passes, all checks print a pass, and no service is running an unexpected local image.

If `verify-ghcr-public-access.sh` reports `Anonymous access denied`, treat it as a registry visibility failure and stop before rollout. If it reports `Manifest missing`, the selected release tag was not published successfully. If `validate-public-compose-path.sh` fails after pull succeeds, investigate runtime contract drift before rollout.

## Runtime Auth Contract Verification

Use this check any time you run `reset`, switch between source/release mode, or see `401` and DB auth errors.

```bash
bash scripts/verify-runtime-auth-contract.sh
```

The script assumes default Docker Compose container names (`sirius-ui`, `sirius-api`, `sirius-engine`, `sirius-postgres`) and curls the API at `http://localhost:9001`. For a different Compose project name (non-default `container_name` pattern), set:

- `SIRIUS_CONTRACT_CONTAINER_UI`, `SIRIUS_CONTRACT_CONTAINER_API`, `SIRIUS_CONTRACT_CONTAINER_ENGINE`, `SIRIUS_CONTRACT_CONTAINER_POSTGRES`
- `SIRIUS_API_PUBLIC_URL` if the published API port differs

See the header comment in `scripts/verify-runtime-auth-contract.sh`.

If this script fails, do not start new scans until the mismatch is corrected.

If `sirius-engine` is still restarting after this passes, verify runtime preflight tooling:

```bash
docker exec sirius-engine sh -lc 'which psql && psql --version'
```

Expected result: prints `/usr/bin/psql` and a PostgreSQL client version. If missing, pull the corrected release image and recreate services.

## Scan-Stuck Troubleshooting Runbook

If scans complete in backend logs but UI remains non-terminal, run:

```bash
# 0) Do NOT use command-scoped secret overrides for single-service restarts.
# Bad (causes key drift): SIRIUS_API_KEY=local-dev docker compose up -d sirius-engine
# Good: keep secrets in .env and recreate dependent services together.

# 1) Verify API key contract is consistent across services
docker inspect sirius-ui --format '{{range .Config.Env}}{{println .}}{{end}}' | rg '^SIRIUS_API_KEY='
docker inspect sirius-api --format '{{range .Config.Env}}{{println .}}{{end}}' | rg '^SIRIUS_API_KEY='
docker inspect sirius-engine --format '{{range .Config.Env}}{{println .}}{{end}}' | rg '^SIRIUS_API_KEY='

# 2) Check engine scanner warnings and terminal status persistence
docker compose logs --no-color sirius-engine | rg -i "source-aware|status|completed|failed|warning|401"

# 3) Check UI auth/session and API bridge logs
docker compose logs --no-color sirius-ui | rg -i "JWT_SESSION_ERROR|SIRIUS_API_KEY|fetch failed|401"

# 4) Verify DB credential consistency from runtime containers
docker compose logs --no-color sirius-postgres sirius-api sirius-engine | rg -i "password authentication failed|database connection not available"

# 5) Run contract verifier
bash scripts/verify-runtime-auth-contract.sh

# 6) Verify templates endpoint is populated and not in missing/empty state
API_KEY=$(docker inspect sirius-api --format '{{range .Config.Env}}{{println .}}{{end}}' | rg '^SIRIUS_API_KEY=' | sed 's/^SIRIUS_API_KEY=//')
curl -s -D - -o /tmp/sirius-templates.json -H "X-API-Key: ${API_KEY}" http://localhost:9001/templates | rg '^HTTP/|^X-Sirius-Template-State'
python3 -c 'import json; print(len(json.load(open("/tmp/sirius-templates.json"))))'
```

If any command surfaces key/secret mismatch, re-run installer and restart:

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets
docker compose up -d --force-recreate
```

Expected result for step 6: HTTP `200` and template count `>= 1`. If `X-Sirius-Template-State: missing` or `empty` appears, `sirius-engine` has not initialized template data yet.

## Host Discovery Validation

```bash
# Confirm compose renders successfully and includes NET_RAW
docker compose config | rg "NET_RAW"

# Confirm scanner system template is canonicalized on startup
docker compose exec sirius-valkey valkey-cli GET template:quick | rg '"scan_types"'

# Run a scan from UI/API, then verify queue consumers and scan state
docker compose exec sirius-rabbitmq rabbitmqctl list_queues name consumers messages_ready messages_unacknowledged | rg "scan|scan_control"
docker compose exec sirius-valkey valkey-cli GET currentScan
```

## Emergency Recovery

### Complete System Reset

```bash
# Stop all services
docker compose down

# Remove all data (this deletes all scan data)
docker compose down -v

# Clean Docker system
docker system prune -a -f

# Recreate .env using installer (required after reset)
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets

# Fresh source rebuild
docker compose -f docker-compose.yaml -f docker-compose.build.yaml up -d --build

# Verify auth contract before interacting with UI
bash scripts/verify-runtime-auth-contract.sh
```

### Backup Current Data

```bash
# Backup database
docker exec sirius-postgres pg_dump -U postgres sirius > backup.sql

# Backup scan results directory
docker cp sirius-engine:/opt/sirius/ ./sirius-backup/
```

## Common Issues

### Container Issues

**Services fail to start:**

```bash
docker compose ps              # Check service status
docker compose logs <service>  # View service logs
docker system df              # Check disk space
```

**Infrastructure services don't start (dev overlay):**

```bash
# The dev file is an OVERRIDE file, not standalone.
# Wrong:  docker compose -f docker-compose.dev.yaml up -d
# Correct:
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

**Port already in use:**

```bash
lsof -i :3000
# Stop the conflicting process, then restart
```

### Scanner Issues

**Nmap errors or scanning failures:**

```bash
docker logs sirius-engine | grep -i nmap
docker exec sirius-engine nmap --version
docker restart sirius-engine
```

### Database Issues

**Connection failures:**

```bash
docker exec sirius-postgres pg_isready
docker logs sirius-postgres
docker exec sirius-postgres psql -U postgres -d sirius -c "SELECT version();"
```

### Message Queue Issues

**RabbitMQ connectivity or schema errors:**

```bash
docker exec sirius-rabbitmq rabbitmqctl status
docker exec sirius-rabbitmq rabbitmqctl list_queues
# For schema integrity failures, remove old volumes:
docker compose down -v && docker compose up -d
```

### Network Issues

**Services can't communicate:**

```bash
docker exec sirius-ui ping sirius-api
docker network inspect sirius
```

### GHCR Pull Issues

**`docker compose pull` returns `unauthorized`:**

```bash
bash scripts/verify-ghcr-public-access.sh "${IMAGE_TAG:-latest}"
```

Expected result: all compose-rendered GHCR refs pass anonymously. If the script reports `Anonymous access denied`, the package visibility contract is broken and the GHCR publicization workflow or token scope needs maintenance.

**`docker compose pull` returns `manifest unknown` or `not found`:**

```bash
bash scripts/verify-ghcr-public-access.sh "${IMAGE_TAG:-latest}"
```

Expected result: the script identifies the missing tag explicitly. Re-run the publishing workflow for the missing release tag before retrying deployment.

### Maintainer: GHCR distribution checklist (public operators)

A Git tag alone does **not** create container tags on GHCR. Third parties need **all six** images (`sirius-ui`, `sirius-api`, `sirius-engine`, `sirius-postgres`, `sirius-rabbitmq`, `sirius-valkey`) published under the **same** semver tag, each package **public** for anonymous `docker pull`, plus a release `core-manifest.yaml` with digest pins.

#### Gated Community release train

Provenance is commit-scoped. Default-branch **push** CI (not `repository_dispatch`) snapshots `latest` digests to write-once `sha-<commit>` tags, smoke-tests that tag, and uploads a `core-build-inventory` artifact. Releases retag from those digests—not from mutable tags.

1. **Land the release commit on `main`** — wait for CI `core-manifest-tests` + `core-build-inventory` to succeed for that exact SHA.
2. **Create and push the Git tag** — `target_tag` must already exist (`vMAJOR.MINOR.PATCH`) and point at that commit. The publish workflow never creates Git tags.
3. **Package visibility (per package)** — In [SiriusScan org packages](https://github.com/orgs/SiriusScan/packages), set each container image to **Public** (see [issue #119](https://github.com/SiriusScan/Sirius/issues/119)).
4. **Run the gated publish workflow** — [Publish Release Image Tags](https://github.com/SiriusScan/Sirius/actions/workflows/publish-release-image-tags.yml) with `target_tag` = the existing Git tag (e.g. `v1.1.0`). Gates, in order:
   - SemVer + existing Git tag → full commit; fail if a non-draft GitHub Release already exists
   - Resolve an unexpired CI `core-build-inventory` from successful default-branch **push** runs for that commit (conflict-checked)
   - Recheck unpublished; write-once retag all six images from inventory `@sha256` refs (equal digest → skip; different → fail); anonymous access
   - Public compose smoke on the release tag
   - Generate `core-manifest.yaml` from inventory + Dockerfile pins at the tagged commit
   - Create/update a **draft** GitHub Release, upload the asset, re-download/validate, then publish. Already-published releases fail closed.
   - Explicitly `workflow_dispatch` [verify-ghcr-release-tag.yml](.github/workflows/verify-ghcr-release-tag.yml) for the tag (`GITHUB_TOKEN` does not chain `release.published`)
5. **Verify anonymously + manifest digests** — From a machine **not** logged in to `ghcr.io`:

```bash
bash scripts/verify-ghcr-public-access.sh v1.1.0
gh release download v1.1.0 --pattern core-manifest.yaml
bash scripts/validate-core-manifest.sh --expect-tag v1.1.0 --verify-digests core-manifest.yaml
```

CI ([verify-ghcr-release-tag.yml](.github/workflows/verify-ghcr-release-tag.yml)): anonymous checks always; `core-manifest.yaml` required for **v1.1.0+**. Pre-v1.1.0 tags are legacy anonymous-only so weekly checks do not break before the first manifest-bearing release.

#### `core-manifest.yaml` contract

JSON-compatible YAML 1.2 (pretty JSON). Validated by a strict Go stdlib parser (`scripts/core-manifest`) that rejects duplicate keys, unknown fields, and wrong nesting/types.

| Field | Meaning |
| --- | --- |
| `metadata.release_tag` / `metadata.source.*` | SemVer tag, source repo, full commit, tag |
| `schema.*` | From enforced `scripts/core-manifest/schema_map.json` keyed by `GO_API_COMMIT_SHA` |
| `component_pins` | All eight engine Dockerfile ARG defaults at the release commit |
| `images.*.digest` / `images.*.ref` | Digests from CI inventory (`ghcr.io/siriusscan/<image>@sha256:...`) |

When bumping `GO_API_COMMIT_SHA`, update `schema_map.json` in the same change or release generation fails.

```bash
bash scripts/test-core-manifest.sh
```
