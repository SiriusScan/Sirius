#!/bin/bash

# Validate CI/CD container builds locally (no separate GHCR base images).
#
# Builds infra + application images and validates docker-compose configs.
#
# Usage: ./scripts/validate-ci-overhaul.sh [--full-compose]
#   --full-compose  Also bring up infrastructure + one app service to verify startup

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FULL_COMPOSE=false
if [[ "${1:-}" == "--full-compose" ]]; then
  FULL_COMPOSE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/testing/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/validate_ci_overhaul_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

log() {
  echo -e "$1" | tee -a "$LOG_FILE"
}

run_step() {
  local step_name="$1"
  local cmd="$2"
  log "${BLUE}▶ $step_name${NC}"
  log "  $cmd"
  if eval "$cmd" >> "$LOG_FILE" 2>&1; then
    log "${GREEN}  ✓ $step_name${NC}"
    return 0
  else
    log "${RED}  ✗ $step_name FAILED${NC}"
    log "  See $LOG_FILE for details"
    return 1
  fi
}

cd "$PROJECT_ROOT"

log ""
log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
log "${BLUE}  CI/CD container local validation${NC}"
log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
log "Project Root: $PROJECT_ROOT"
log "Log File: $LOG_FILE"
log ""

# ─────────────────────────────────────────────────────────────────────────────
# Phase 1: Infrastructure containers
# ─────────────────────────────────────────────────────────────────────────────
log "${YELLOW}Phase 1: Infrastructure Containers${NC}"
log ""

run_step "Build sirius-postgres" \
  "docker build -t sirius-postgres:test ./sirius-postgres/" || exit 1

run_step "Build sirius-rabbitmq" \
  "docker build -t sirius-rabbitmq:test ./sirius-rabbitmq/" || exit 1

run_step "Build sirius-valkey" \
  "docker build -t sirius-valkey:test ./sirius-valkey/" || exit 1

log ""
log "${YELLOW}Phase 2: Application Containers${NC}"
log ""

run_step "Build sirius-api (runner stage)" \
  "docker build -t sirius-api:test ./sirius-api/ --target runner" || exit 1

run_step "Build sirius-ui (production stage)" \
  "docker build -t sirius-ui:test ./sirius-ui/ --target production" || exit 1

run_step "Build sirius-engine (development stage)" \
  "docker build -t sirius-engine:dev ./sirius-engine/ --target development" || exit 1

run_step "Build sirius-engine (runtime stage)" \
  "docker build -t sirius-engine:runtime ./sirius-engine/ --target runtime" || exit 1

log ""
log "${YELLOW}Phase 3: Runtime Contracts${NC}"
log ""

run_step "sirius-postgres entrypoint contract" \
  "docker run --rm --entrypoint /bin/sh sirius-postgres:test -c 'test -x /usr/local/bin/start-with-monitor.sh'" || exit 1

run_step "sirius-engine runtime binary contract (bash, nmap, rustscan, pwsh, psql)" \
  "docker run --rm --entrypoint /bin/bash sirius-engine:runtime -c 'command -v bash >/dev/null && command -v nmap >/dev/null && command -v rustscan >/dev/null && command -v pwsh >/dev/null && command -v psql >/dev/null'" || exit 1

log ""
log "${YELLOW}Phase 4: Docker Compose Validation${NC}"
log ""

export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-test-postgres-password}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-nextauth-secret}"
export INITIAL_ADMIN_PASSWORD="${INITIAL_ADMIN_PASSWORD:-test-admin-password}"
mkdir -p secrets
printf '%s\n' "${SIRIUS_INTERNAL_API_KEY_TEST_VALUE:-test-api-key}" > secrets/sirius_api_key.txt

run_step "Base docker-compose config" \
  "docker compose config --quiet" || exit 1

run_step "Development docker-compose config" \
  "docker compose -f docker-compose.yaml -f docker-compose.dev.yaml config --quiet" || exit 1

log ""
log "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
log "${GREEN}  All builds and validations passed!${NC}"
log "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
log ""
log "You can now confidently commit and push. CI builds application images on"
log "native amd64/arm64 runners (ci.yml), merges manifests, and runs integration tests."
log ""

# Optional: bring up a minimal stack to verify runtime
if $FULL_COMPOSE; then
  log "${YELLOW}Phase 5: Minimal Compose Stack (--full-compose)${NC}"
  log ""
  log "Starting postgres, rabbitmq, valkey, api for 30s to verify startup..."
  docker compose up -d sirius-postgres sirius-rabbitmq sirius-valkey 2>>"$LOG_FILE" || true
  sleep 10
  docker compose up -d sirius-api 2>>"$LOG_FILE" || true
  sleep 20
  if docker compose exec -T sirius-api wget -q -O /dev/null http://127.0.0.1:9001/health 2>/dev/null; then
    log "${GREEN}  ✓ sirius-api health check passed${NC}"
  else
    log "${YELLOW}  ⚠ sirius-api may still be starting; check: docker compose logs sirius-api${NC}"
  fi
  docker compose down 2>>"$LOG_FILE" || true
  log ""
fi

# Cleanup test tags (optional, comment out to keep for debugging)
log "${YELLOW}Cleaning up test images...${NC}"
docker rmi sirius-postgres:test sirius-rabbitmq:test sirius-valkey:test sirius-api:test sirius-ui:test sirius-engine:dev sirius-engine:runtime 2>/dev/null || true
log ""

log "Full log: $LOG_FILE"
exit 0
