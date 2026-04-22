#!/usr/bin/env bash
# Runtime auth contract: internal API key comes from the mounted
# SIRIUS_API_KEY_FILE secret, POSTGRES_PASSWORD parity, engine env, API HTTP
# behavior.
#
# Container names default to docker-compose.yaml `container_name` values (project: sirius).
# Override for other projects, e.g. CI:
#   export SIRIUS_CONTRACT_CONTAINER_UI=sirius-test-sirius-ui-1
#   export SIRIUS_CONTRACT_CONTAINER_API=sirius-test-sirius-api-1
#   export SIRIUS_CONTRACT_CONTAINER_ENGINE=sirius-test-sirius-engine-1
#   export SIRIUS_CONTRACT_CONTAINER_POSTGRES=sirius-test-sirius-postgres-1
#
# Host URL for curl (published API port on the host):
#   export SIRIUS_API_PUBLIC_URL=http://localhost:9001
#
set -euo pipefail

: "${SIRIUS_CONTRACT_CONTAINER_UI:=sirius-ui}"
: "${SIRIUS_CONTRACT_CONTAINER_API:=sirius-api}"
: "${SIRIUS_CONTRACT_CONTAINER_ENGINE:=sirius-engine}"
: "${SIRIUS_CONTRACT_CONTAINER_POSTGRES:=sirius-postgres}"
: "${SIRIUS_API_PUBLIC_URL:=http://localhost:9001}"
SIRIUS_API_PUBLIC_URL="${SIRIUS_API_PUBLIC_URL%/}"

CTR_UI="$SIRIUS_CONTRACT_CONTAINER_UI"
CTR_API="$SIRIUS_CONTRACT_CONTAINER_API"
CTR_ENGINE="$SIRIUS_CONTRACT_CONTAINER_ENGINE"
CTR_POSTGRES="$SIRIUS_CONTRACT_CONTAINER_POSTGRES"

required_containers=("$CTR_POSTGRES" "$CTR_API" "$CTR_ENGINE" "$CTR_UI")
for name in "${required_containers[@]}"; do
  if ! docker inspect "$name" >/dev/null 2>&1; then
    echo "❌ Missing container: $name (override SIRIUS_CONTRACT_CONTAINER_* if using a non-default compose project)"
    exit 1
  fi
done

extract_env() {
  local container="$1"
  local key="$2"
  # NOTE: use grep, not rg — ripgrep is not preinstalled on GitHub-hosted
  # ubuntu-latest runners. The trailing `|| true` previously masked the
  # `rg: command not found` failure, silently returning empty for every
  # key and tripping the POSTGRES_PASSWORD parity check downstream.
  docker inspect "$container" --format '{{range .Config.Env}}{{println .}}{{end}}' \
    | grep "^${key}=" | sed "s/^${key}=//" || true
}

# Effective key inside the container (trimmed file contents only).
resolve_file_backed_api_key() {
  local container="$1"
  docker exec "$container" sh -lc \
    'if [ -r "${SIRIUS_API_KEY_FILE:-}" ]; then tr -d "\r\n" < "$SIRIUS_API_KEY_FILE"; fi'
}

mask_value() {
  local value="$1"
  if [ -z "$value" ]; then
    echo "<empty>"
    return
  fi
  local len=${#value}
  if [ "$len" -le 10 ]; then
    echo "${value:0:2}***"
    return
  fi
  echo "${value:0:6}...${value: -4}"
}

assert_file_only_api_key_contract() {
  local container="$1"
  local label="$2"
  local file_key
  local configured_env_key

  file_key="$(resolve_file_backed_api_key "$container")"
  configured_env_key="$(extract_env "$container" SIRIUS_API_KEY)"

  if [ -n "$configured_env_key" ]; then
    echo "❌ ${label} still has legacy SIRIUS_API_KEY configured in container env"
    exit 1
  fi

  if [ -z "$file_key" ]; then
    echo "❌ ${label} is missing a readable file-backed internal API key"
    exit 1
  fi
}

assert_file_only_api_key_contract "$CTR_UI" "sirius-ui"
assert_file_only_api_key_contract "$CTR_API" "sirius-api"
assert_file_only_api_key_contract "$CTR_ENGINE" "sirius-engine"

ui_key="$(resolve_file_backed_api_key "$CTR_UI")"
api_key="$(resolve_file_backed_api_key "$CTR_API")"
engine_key="$(resolve_file_backed_api_key "$CTR_ENGINE")"

postgres_db_pw="$(extract_env "$CTR_POSTGRES" POSTGRES_PASSWORD)"
api_db_pw="$(extract_env "$CTR_API" POSTGRES_PASSWORD)"
engine_db_pw="$(extract_env "$CTR_ENGINE" POSTGRES_PASSWORD)"
engine_api_base_url="$(extract_env "$CTR_ENGINE" API_BASE_URL)"
engine_sirius_api_url="$(extract_env "$CTR_ENGINE" SIRIUS_API_URL)"
engine_agent_id="$(extract_env "$CTR_ENGINE" AGENT_ID)"
engine_host_id="$(extract_env "$CTR_ENGINE" HOST_ID)"

echo "Runtime key fingerprints:"
echo "  ui ($CTR_UI):     $(mask_value "$ui_key")"
echo "  api ($CTR_API):    $(mask_value "$api_key")"
echo "  engine ($CTR_ENGINE): $(mask_value "$engine_key")"

if [ -z "$ui_key" ] || [ -z "$api_key" ] || [ -z "$engine_key" ]; then
  echo "❌ One or more services are missing readable SIRIUS_API_KEY_FILE secret data"
  exit 1
fi

echo "✅ File-only internal API key contract check passed"

if [ "$ui_key" != "$api_key" ] || [ "$api_key" != "$engine_key" ]; then
  echo "❌ Internal API key mismatch across services (key split-brain detected)"
  exit 1
fi
echo "✅ Internal API key parity check passed"

if [ -z "$postgres_db_pw" ] || [ -z "$api_db_pw" ] || [ -z "$engine_db_pw" ]; then
  echo "❌ One or more services are missing POSTGRES_PASSWORD"
  exit 1
fi

if [ "$postgres_db_pw" != "$api_db_pw" ] || [ "$api_db_pw" != "$engine_db_pw" ]; then
  echo "❌ POSTGRES_PASSWORD mismatch across postgres/api/engine"
  exit 1
fi
echo "✅ POSTGRES_PASSWORD parity check passed"

if [ -z "$engine_sirius_api_url" ] || [ -z "$engine_agent_id" ] || [ -z "$engine_host_id" ]; then
  echo "❌ sirius-engine is missing one or more required runtime env values (SIRIUS_API_URL, AGENT_ID, HOST_ID)"
  exit 1
fi
if [ -n "$engine_api_base_url" ] && [ -n "$engine_sirius_api_url" ]; then
  if [ "${engine_api_base_url%/}" != "${engine_sirius_api_url%/}" ]; then
    echo "❌ API_BASE_URL must equal SIRIUS_API_URL on engine (got API_BASE_URL=${engine_api_base_url} SIRIUS_API_URL=${engine_sirius_api_url})"
    exit 1
  fi
fi
echo "✅ sirius-engine runtime env contract check passed"

if docker exec "$CTR_POSTGRES" test -f /usr/local/bin/start-with-monitor.sh 2>/dev/null; then
  if docker exec "$CTR_POSTGRES" sh -lc "grep -E -q 'psql[^\\n]*\\|\\| true|ALTER ROLE[^\\n]*\\|\\| true' /usr/local/bin/start-with-monitor.sh"; then
    echo "❌ Running postgres entrypoint still contains permissive psql reconciliation fallback"
    exit 1
  fi
  echo "✅ Postgres reconciliation script does not contain permissive psql fallback"
else
  echo "ℹ️  Skipping custom postgres entrypoint check (not Sirius postgres image)"
fi

if ! docker exec "$CTR_ENGINE" bash -lc 'for bin in bash curl psql pkill nmap rustscan pwsh; do command -v "$bin" >/dev/null || exit 1; done'; then
  echo "❌ sirius-engine runtime binary contract check failed"
  exit 1
fi
echo "✅ sirius-engine runtime binary contract check passed"

if ! docker exec "$CTR_ENGINE" bash -lc '/bin/bash -n /start-enhanced.sh && grep -q "validate_required_binary \"psql\"" /start-enhanced.sh'; then
  echo "❌ sirius-engine startup script contract check failed"
  exit 1
fi
echo "✅ sirius-engine startup script contract check passed"

HOST_PROBE="${SIRIUS_API_PUBLIC_URL}/host/"
unauth_code="$(curl -sS --max-time 15 -o /tmp/sirius-auth-unauth.out -w '%{http_code}' "$HOST_PROBE" || true)"
if [ "$unauth_code" != "401" ]; then
  echo "❌ Expected unauthenticated /host/ to return 401, got $unauth_code (URL: $HOST_PROBE)"
  exit 1
fi
echo "✅ Unauthenticated API contract check passed"

auth_code="$(curl -sS --max-time 15 -o /tmp/sirius-auth-auth.out -w '%{http_code}' -H "X-API-Key: $api_key" "$HOST_PROBE" || true)"
if [ "$auth_code" = "401" ] || [ "$auth_code" = "403" ] || [ "$auth_code" = "000" ]; then
  echo "❌ Authenticated /host/ request failed with status $auth_code"
  exit 1
fi
if ! [[ "$auth_code" =~ ^[0-9]+$ ]]; then
  echo "❌ Unexpected curl HTTP code output: $auth_code"
  exit 1
fi
if [ "$auth_code" -lt 200 ] || [ "$auth_code" -ge 300 ]; then
  echo "❌ Authenticated /host/ expected HTTP 2xx, got $auth_code"
  exit 1
fi
echo "✅ Authenticated API contract check passed (status $auth_code)"

if ! docker exec "$CTR_POSTGRES" sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" >/dev/null'; then
  echo "❌ Postgres runtime credential probe failed"
  exit 1
fi
echo "✅ Postgres runtime credential probe passed"

echo "✅ Runtime auth contract verification succeeded"
