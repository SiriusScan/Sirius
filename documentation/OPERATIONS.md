# Sirius Operations & Troubleshooting Runbook

This document contains operational procedures, verification runbooks, and advanced troubleshooting for Sirius maintainers and operators. For getting started, see the [README](../README.md).

## Clean Rollout Verification (Fresh Clone)

Use this sequence to validate a production rollout from a fresh checkout.

```bash
# 1) Start from a clean runtime state
docker compose down -v --remove-orphans

# 2) Generate runtime secrets/config
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets

# 3) Build from local source deterministically (no registry pulls)
env -u SIRIUS_API_KEY -u POSTGRES_PASSWORD -u NEXTAUTH_SECRET -u INITIAL_ADMIN_PASSWORD \
SIRIUS_IMAGE_PULL_POLICY=never docker compose up -d --build

# 4) Confirm all services are healthy
docker compose ps

# 5) Validate API auth behavior
curl -i http://localhost:9001/host/            # expect 401 (no key)
RUNTIME_KEY=$(docker inspect sirius-api --format '{{range .Config.Env}}{{println .}}{{end}}' | rg '^SIRIUS_API_KEY=' | sed 's/^SIRIUS_API_KEY=//')
curl -i -H "X-API-Key: ${RUNTIME_KEY}" http://localhost:9001/host/   # expect 200

# 6) Ensure startup regressions are absent
docker compose logs --no-color sirius-ui sirius-engine | rg -i "ENOTFOUND|permission denied|Failed to open log file"
```

If step 6 returns any lines, capture full logs and investigate before rollout.

## Release Image Propagation Verification

Use this path to validate what operators experience when running pulled release images.

```bash
# 1) Ensure local builds are not used
docker compose down -v --remove-orphans

# 2) Generate runtime secrets/config
docker compose -f docker-compose.installer.yaml run --rm sirius-installer --non-interactive --no-print-secrets

# 3) Pull and run release images for the selected tag
export IMAGE_TAG=v1.0.0
export SIRIUS_IMAGE_PULL_POLICY=always
docker compose up -d

# 4) Verify running container image IDs match pulled release images
bash scripts/verify-release-images.sh
```

Expected result: all checks print a pass and no service is running an unexpected local image.

## Runtime Auth Contract Verification

Use this check any time you run `reset`, switch between source/release mode, or see `401` and DB auth errors.

```bash
bash scripts/verify-runtime-auth-contract.sh
```

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

# Fresh start without shell variable shadowing
env -u SIRIUS_API_KEY -u POSTGRES_PASSWORD -u NEXTAUTH_SECRET -u INITIAL_ADMIN_PASSWORD \
SIRIUS_IMAGE_PULL_POLICY=never docker compose up -d --build

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
