#!/usr/bin/env bash
set -euo pipefail

# Local CI Integration Test
# Mirrors the hardened ci.yml integration test step exactly.
# Uses locally-available images (default: local-prod tag).
#
# Usage:
#   ./testing/ci-local-integration-test.sh                    # uses local-prod tag
#   ./testing/ci-local-integration-test.sh latest              # uses latest tag
#   IMAGE_TAG=v1.0.0 ./testing/ci-local-integration-test.sh   # uses v1.0.0 tag

IMAGE_TAG="${1:-${IMAGE_TAG:-local-prod}}"
REGISTRY="ghcr.io"
IMAGE_NAMESPACE="siriusscan"
COMPOSE_FILE="docker-compose.ci-local-test.yml"
PROJECT_NAME="sirius-ci-local"

# Portable timeout — macOS lacks coreutils `timeout`
if command -v timeout &>/dev/null; then
  TIMEOUT_CMD="timeout"
elif command -v gtimeout &>/dev/null; then
  TIMEOUT_CMD="gtimeout"
else
  TIMEOUT_CMD=""
fi

run_with_timeout() {
  local secs="$1"; shift
  if [ -n "$TIMEOUT_CMD" ]; then
    "$TIMEOUT_CMD" "$secs" "$@"
  else
    local pid
    "$@" &
    pid=$!
    ( sleep "$secs" && kill "$pid" 2>/dev/null ) &
    local watcher=$!
    wait "$pid" 2>/dev/null
    local rc=$?
    kill "$watcher" 2>/dev/null; wait "$watcher" 2>/dev/null
    return $rc
  fi
}

echo "============================================="
echo "  Local CI Integration Test"
echo "  Image tag: $IMAGE_TAG"
echo "============================================="

cleanup() {
  echo ""
  echo "🧹 Cleaning up..."
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" down --volumes --remove-orphans 2>/dev/null || true
  rm -f "$COMPOSE_FILE"
}
trap cleanup EXIT

# --- Generate compose file (same as ci.yml heredoc) ---
cat > "$COMPOSE_FILE" << EOF
name: ${PROJECT_NAME}
services:
  sirius-postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sirius_test
    tmpfs:
      - /var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10

  sirius-rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

  sirius-valkey:
    image: valkey/valkey:latest
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

  sirius-ui:
    image: ${REGISTRY}/${IMAGE_NAMESPACE}/sirius-ui:${IMAGE_TAG}
    environment:
      - NODE_ENV=production
      - SKIP_ENV_VALIDATION=1
      - DATABASE_URL=postgresql://postgres:postgres@sirius-postgres:5432/sirius_test
      - NEXTAUTH_SECRET=test-secret
      - INITIAL_ADMIN_PASSWORD=test-admin-password
      - NEXTAUTH_URL=http://localhost:3000
      - SIRIUS_API_URL=http://sirius-api:9001
      - NEXT_PUBLIC_SIRIUS_API_URL=http://localhost:9001
      - SIRIUS_API_KEY=ci-placeholder-api-key
    depends_on:
      sirius-postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -q --tries=1 -O /dev/null http://127.0.0.1:3000/"]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 15s

  sirius-api:
    image: ${REGISTRY}/${IMAGE_NAMESPACE}/sirius-api:${IMAGE_TAG}
    environment:
      - GO_ENV=production
      - API_PORT=9001
      - POSTGRES_HOST=sirius-postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=sirius_test
      - POSTGRES_PORT=5432
      - VALKEY_HOST=sirius-valkey
      - VALKEY_PORT=6379
      - RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/
      - LOG_LEVEL=info
      - SIRIUS_API_KEY=ci-placeholder-api-key
    depends_on:
      sirius-postgres:
        condition: service_healthy
      sirius-rabbitmq:
        condition: service_healthy
      sirius-valkey:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -q --tries=1 -O /dev/null http://127.0.0.1:9001/health"]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 10s

  sirius-engine:
    image: ${REGISTRY}/${IMAGE_NAMESPACE}/sirius-engine:${IMAGE_TAG}
    environment:
      - GO_ENV=production
      - ENGINE_MAIN_PORT=5174
      - GRPC_AGENT_PORT=50051
      - POSTGRES_HOST=sirius-postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=sirius_test
      - POSTGRES_PORT=5432
      - VALKEY_HOST=sirius-valkey
      - VALKEY_PORT=6379
      - RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/
      - LOG_LEVEL=info
      - SIRIUS_API_KEY=ci-placeholder-api-key
      - SIRIUS_API_URL=http://sirius-api:9001
    depends_on:
      sirius-postgres:
        condition: service_healthy
      sirius-rabbitmq:
        condition: service_healthy
      sirius-valkey:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "bash", "-c", "echo > /dev/tcp/127.0.0.1/50051"]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 10s
EOF

echo "📄 Generated $COMPOSE_FILE"

# --- 1. Infrastructure ---
echo ""
echo "🔧 Starting infrastructure services..."
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d sirius-postgres sirius-rabbitmq sirius-valkey

echo "⏳ Waiting for infrastructure to become healthy (timeout: 90s)..."
INFRA_START=$SECONDS
while true; do
  HEALTHY_COUNT=$(docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps --format json 2>/dev/null | \
    python3 -c "
import sys, json
svcs = [json.loads(l) for l in sys.stdin if l.strip()]
infra = [s for s in svcs if s['Service'] in ('sirius-postgres','sirius-rabbitmq','sirius-valkey')]
healthy = [s for s in infra if s.get('Health','') == 'healthy']
print(len(healthy))
" 2>/dev/null || echo "0")
  if [ "$HEALTHY_COUNT" -eq 3 ] 2>/dev/null; then break; fi
  if [ $((SECONDS - INFRA_START)) -ge 90 ]; then
    echo "❌ TIMEOUT: Infrastructure services did not become healthy within 90s"
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps
    exit 1
  fi
  sleep 3
done
echo "✅ Infrastructure healthy"

# --- 2. Application services ---
SERVICES_TO_TEST="sirius-api sirius-engine sirius-ui"

echo ""
echo "🚀 Starting application services: $SERVICES_TO_TEST"
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d $SERVICES_TO_TEST

for SVC in $SERVICES_TO_TEST; do
  case $SVC in
    sirius-api)    HEALTH_CMD="wget -q --tries=1 -O /dev/null http://127.0.0.1:9001/health" ;;
    sirius-engine) HEALTH_CMD="bash -c 'echo > /dev/tcp/127.0.0.1/50051'" ;;
    sirius-ui)     HEALTH_CMD="wget -q --tries=1 -O /dev/null http://127.0.0.1:3000/" ;;
    *) continue ;;
  esac
  echo "⏳ Waiting for $SVC (timeout: 180s)..."
  SVC_START=$SECONDS
  SVC_OK=0
  while true; do
    if docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T "$SVC" \
        sh -c "$HEALTH_CMD" 2>/dev/null; then
      SVC_OK=1; break
    fi
    if [ $((SECONDS - SVC_START)) -ge 180 ]; then break; fi
    sleep 5
  done
  if [ "$SVC_OK" -eq 0 ]; then
    echo "❌ TIMEOUT: $SVC never became healthy"
    echo ""
    echo "=== Container status ==="
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps
    echo ""
    echo "=== $SVC logs (last 50 lines) ==="
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs --tail=50 "$SVC"
    echo ""
    echo "=== $SVC container inspect ==="
    docker inspect "${PROJECT_NAME}-${SVC}-1" 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data:
  s = data[0].get('State', {})
  print(f'  Status: {s.get(\"Status\")}')
  print(f'  Running: {s.get(\"Running\")}')
  print(f'  ExitCode: {s.get(\"ExitCode\")}')
  h = s.get('Health', {})
  if h:
    print(f'  Health: {h.get(\"Status\")}')
    for log in (h.get('Log') or [])[-3:]:
      print(f'    [{log.get(\"ExitCode\")}] {log.get(\"Output\",\"\")[:200]}')
" 2>/dev/null || true
    exit 1
  fi
  echo "✅ $SVC is healthy"
done

# --- 3. Final assertions ---
echo ""
echo "📊 Service status:"
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps

echo ""
echo "🏥 Running final health assertions..."
FAILED=0
for SVC in $SERVICES_TO_TEST; do
  case $SVC in
    sirius-api)    HEALTH_CMD="wget -q --tries=1 -O /dev/null http://127.0.0.1:9001/health" ;;
    sirius-engine) HEALTH_CMD="bash -c 'echo > /dev/tcp/127.0.0.1/50051'" ;;
    sirius-ui)     HEALTH_CMD="wget -q --tries=1 -O /dev/null http://127.0.0.1:3000/" ;;
    *) continue ;;
  esac
  if docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T "$SVC" \
      sh -c "$HEALTH_CMD" 2>/dev/null; then
    echo "  ✅ $SVC passed"
  else
    echo "  ❌ $SVC FAILED"
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "❌ INTEGRATION TEST FAILED"
  echo ""
  echo "=== Failure diagnostics ==="
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps
  echo ""
  for SVC in sirius-engine sirius-api sirius-ui; do
    echo "--- $SVC logs (last 30 lines) ---"
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs --tail=30 "$SVC" 2>/dev/null || true
    echo ""
  done
  exit 1
fi

echo ""
echo "============================================="
echo "  ✅ LOCAL CI INTEGRATION TEST PASSED"
echo "============================================="
echo ""
echo "All services healthy. This matches what ci.yml will do in GitHub Actions."
echo "Safe to push and trigger the real CI pipeline."
