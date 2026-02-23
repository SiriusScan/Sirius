#!/usr/bin/env bash
set -euo pipefail

required_containers=(sirius-postgres sirius-api sirius-engine sirius-ui)
for name in "${required_containers[@]}"; do
  if ! docker inspect "$name" >/dev/null 2>&1; then
    echo "❌ Missing container: $name"
    exit 1
  fi
done

extract_env() {
  local container="$1"
  local key="$2"
  docker inspect "$container" --format '{{range .Config.Env}}{{println .}}{{end}}' \
    | rg "^${key}=" | sed "s/^${key}=//"
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

ui_key="$(extract_env sirius-ui SIRIUS_API_KEY)"
api_key="$(extract_env sirius-api SIRIUS_API_KEY)"
engine_key="$(extract_env sirius-engine SIRIUS_API_KEY)"

postgres_db_pw="$(extract_env sirius-postgres POSTGRES_PASSWORD)"
api_db_pw="$(extract_env sirius-api POSTGRES_PASSWORD)"
engine_db_pw="$(extract_env sirius-engine POSTGRES_PASSWORD)"

echo "Runtime key fingerprints:"
echo "  sirius-ui:     $(mask_value "$ui_key")"
echo "  sirius-api:    $(mask_value "$api_key")"
echo "  sirius-engine: $(mask_value "$engine_key")"

if [ -z "$ui_key" ] || [ -z "$api_key" ] || [ -z "$engine_key" ]; then
  echo "❌ One or more services are missing SIRIUS_API_KEY"
  exit 1
fi

if [ "$ui_key" != "$api_key" ] || [ "$api_key" != "$engine_key" ]; then
  echo "❌ SIRIUS_API_KEY mismatch across services (key split-brain detected)"
  exit 1
fi
echo "✅ SIRIUS_API_KEY parity check passed"

if [ -z "$postgres_db_pw" ] || [ -z "$api_db_pw" ] || [ -z "$engine_db_pw" ]; then
  echo "❌ One or more services are missing POSTGRES_PASSWORD"
  exit 1
fi

if [ "$postgres_db_pw" != "$api_db_pw" ] || [ "$api_db_pw" != "$engine_db_pw" ]; then
  echo "❌ POSTGRES_PASSWORD mismatch across postgres/api/engine"
  exit 1
fi
echo "✅ POSTGRES_PASSWORD parity check passed"

if docker exec sirius-postgres sh -lc "grep -E -q 'psql[^\\n]*\\|\\| true|ALTER ROLE[^\\n]*\\|\\| true' /usr/local/bin/start-with-monitor.sh"; then
  echo "❌ Running postgres entrypoint still contains permissive psql reconciliation fallback"
  exit 1
fi
echo "✅ Postgres reconciliation script does not contain permissive psql fallback"

unauth_code="$(curl -s -o /tmp/sirius-auth-unauth.out -w '%{http_code}' "http://localhost:9001/host/" || true)"
if [ "$unauth_code" != "401" ]; then
  echo "❌ Expected unauthenticated /host/ to return 401, got $unauth_code"
  exit 1
fi
echo "✅ Unauthenticated API contract check passed"

auth_code="$(curl -s -o /tmp/sirius-auth-auth.out -w '%{http_code}' -H "X-API-Key: $api_key" "http://localhost:9001/host/" || true)"
if [ "$auth_code" = "401" ] || [ "$auth_code" = "403" ] || [ "$auth_code" = "000" ]; then
  echo "❌ Authenticated /host/ request failed with status $auth_code"
  exit 1
fi
echo "✅ Authenticated API contract check passed (status $auth_code)"

if ! docker exec sirius-postgres sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" >/dev/null'; then
  echo "❌ Postgres runtime credential probe failed"
  exit 1
fi
echo "✅ Postgres runtime credential probe passed"

echo "✅ Runtime auth contract verification succeeded"
