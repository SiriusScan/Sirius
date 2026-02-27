#!/bin/bash

# Validate CI/CD Overhaul Locally
#
# Tests the full build chain before pushing to production:
#   1. Build base images (go-builder, engine-tools) and tag locally
#   2. Build all application containers that depend on them
#   3. Validate docker-compose configs
#   4. Optionally run a minimal compose stack to verify startup
#
# Base images are tagged as ${REGISTRY}/${IMAGE_NAMESPACE}/sirius-base-*:latest
# so the application Dockerfiles (which use COPY --from=...) find them
# in the local Docker daemon without needing to pull from the registry.
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

REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-siriusscan}"
BASE_IMAGE_TAG="${BASE_IMAGE_TAG:-latest}"
BASE_GO_BUILDER_IMAGE="${REGISTRY}/${IMAGE_NAMESPACE}/sirius-base-go-builder:${BASE_IMAGE_TAG}"
BASE_ENGINE_TOOLS_IMAGE="${REGISTRY}/${IMAGE_NAMESPACE}/sirius-base-engine-tools:${BASE_IMAGE_TAG}"
BASE_GO_BUILDER_LATEST_IMAGE="${REGISTRY}/${IMAGE_NAMESPACE}/sirius-base-go-builder:latest"
BASE_ENGINE_TOOLS_LATEST_IMAGE="${REGISTRY}/${IMAGE_NAMESPACE}/sirius-base-engine-tools:latest"

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
log "${BLUE}  CI/CD Overhaul Local Validation${NC}"
log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
log "Project Root: $PROJECT_ROOT"
log "Log File: $LOG_FILE"
log ""

# ─────────────────────────────────────────────────────────────────────────────
# Phase 1: Build base images and tag for local use
# ─────────────────────────────────────────────────────────────────────────────
log "${YELLOW}Phase 1: Base Images${NC}"
log ""

run_step "Build sirius-base-go-builder" \
  "docker build -t ${BASE_GO_BUILDER_IMAGE} -t ${BASE_GO_BUILDER_LATEST_IMAGE} ./base-images/go-builder/" || exit 1

run_step "Build sirius-base-engine-tools (this compiles Nmap from source, may take a few minutes)" \
  "docker build -t ${BASE_ENGINE_TOOLS_IMAGE} -t ${BASE_ENGINE_TOOLS_LATEST_IMAGE} ./base-images/engine-tools/" || exit 1

# Verify base image contents
run_step "Verify go-builder has system-monitor and administrator" \
  "docker run --rm ${BASE_GO_BUILDER_LATEST_IMAGE} sh -c 'test -x /usr/local/bin/system-monitor && test -x /usr/local/bin/administrator'" || exit 1

run_step "Verify engine-tools has nmap, rustscan, pwsh" \
  "docker run --rm ${BASE_ENGINE_TOOLS_LATEST_IMAGE} sh -c 'nmap --version >/dev/null && rustscan --version >/dev/null && pwsh --version >/dev/null'" || exit 1

log ""
log "${YELLOW}Phase 2: Infrastructure Containers (use base images)${NC}"
log ""

run_step "Build sirius-postgres" \
  "docker build -t sirius-postgres:test ./sirius-postgres/" || exit 1

run_step "Build sirius-rabbitmq" \
  "docker build -t sirius-rabbitmq:test ./sirius-rabbitmq/" || exit 1

run_step "Build sirius-valkey" \
  "docker build -t sirius-valkey:test ./sirius-valkey/" || exit 1

log ""
log "${YELLOW}Phase 3: Application Containers${NC}"
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
log "${YELLOW}Phase 4: Runtime Contracts${NC}"
log ""

run_step "sirius-postgres entrypoint contract" \
  "docker run --rm --entrypoint /bin/sh sirius-postgres:test -c 'test -x /usr/local/bin/start-with-monitor.sh'" || exit 1

run_step "sirius-engine runtime binary contract (bash, nmap, rustscan, pwsh, psql)" \
  "docker run --rm --entrypoint /bin/bash sirius-engine:runtime -c 'command -v bash >/dev/null && command -v nmap >/dev/null && command -v rustscan >/dev/null && command -v pwsh >/dev/null && command -v psql >/dev/null'" || exit 1

log ""
log "${YELLOW}Phase 5: Docker Compose Validation${NC}"
log ""

export SIRIUS_API_KEY="${SIRIUS_API_KEY:-test-api-key}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-test-postgres-password}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-nextauth-secret}"
export INITIAL_ADMIN_PASSWORD="${INITIAL_ADMIN_PASSWORD:-test-admin-password}"

run_step "Base docker-compose config" \
  "docker compose config --quiet" || exit 1

run_step "Development docker-compose config" \
  "docker compose -f docker-compose.yaml -f docker-compose.dev.yaml config --quiet" || exit 1

log ""
log "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
log "${GREEN}  All builds and validations passed!${NC}"
log "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
log ""
log "You can now confidently commit and push. The CI pipeline will:"
log "  1. Build base images (build-base-images.yml) when base-images/ changes"
log "  2. Build application images on native amd64/arm64 runners (ci.yml)"
log "  3. Merge manifests and run integration tests"
log ""
log "Note: Base images must be published to ghcr.io before the first CI run"
log "      that builds application containers. Either:"
log "      a) Push base-images/ in a separate PR and let build-base-images.yml run first, or"
log "      b) Manually trigger build-base-images.yml from the Actions tab before pushing app changes."
log ""

# Optional: bring up a minimal stack to verify runtime
if $FULL_COMPOSE; then
  log "${YELLOW}Phase 6: Minimal Compose Stack (--full-compose)${NC}"
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
