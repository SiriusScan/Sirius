#!/usr/bin/env bash
# Assert public Compose/config/build references only public GHCR (or public source)
# and that no private env vars/credentials appear in rendered config.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ALLOWLIST="${SCRIPT_DIR}/policy/governance-allowlist.txt"
TAG="${1:-v1.1.0}"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_ROOT}/docker-compose.yaml}"

die() { echo "ERROR: $*" >&2; exit 1; }

cd "${PROJECT_ROOT}"

# Visibly empty credentials for independence checks.
export GH_TOKEN=""
export GITHUB_TOKEN=""
export DOCKER_AUTH_CONFIG=""
EMPTY_DOCKER_CONFIG="$(mktemp -d)"
trap 'rm -rf "${EMPTY_DOCKER_CONFIG}"' EXIT
export DOCKER_CONFIG="${EMPTY_DOCKER_CONFIG}"

echo "Compose independence: DOCKER_CONFIG=${DOCKER_CONFIG} GH_TOKEN empty=$([ -z "${GH_TOKEN}" ] && echo yes || echo no)"

# Minimal env so `docker compose config` can render without installer secrets.
export IMAGE_TAG="${TAG}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-community-independence-test}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-community-independence-nextauth}"
export INITIAL_ADMIN_PASSWORD="${INITIAL_ADMIN_PASSWORD:-community-independence-admin}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:community-independence-test@sirius-postgres:5432/sirius}"
export SIRIUS_IMAGE_PULL_POLICY="${SIRIUS_IMAGE_PULL_POLICY:-always}"
mkdir -p "${PROJECT_ROOT}/secrets"
if [ ! -f "${PROJECT_ROOT}/secrets/sirius_api_key.txt" ]; then
  printf '%s\n' "community-independence-api-key" > "${PROJECT_ROOT}/secrets/sirius_api_key.txt"
fi

rendered="$(mktemp)"
IMAGE_TAG="${TAG}" docker compose -f "${COMPOSE_FILE}" config > "${rendered}"

# Every image: must be public ghcr.io/siriusscan/* (digest or tag), never private org.
while IFS= read -r image_ref; do
  [ -n "${image_ref}" ] || continue
  printf '%s' "${image_ref}" | grep -Eq '^ghcr\.io/siriusscan/[a-z0-9_-]+(@sha256:[a-f0-9]{64}|:[A-Za-z0-9._-]+)$' \
    || die "non-public or malformed compose image ref: ${image_ref}"
  printf '%s' "${image_ref}" | grep -Eiq 'opensecurity-infosec|OpenSecurity-Infosec' \
    && die "private registry/org in compose image ref: ${image_ref}"
done < <(awk '/^[[:space:]]+image:[[:space:]]/ {print $2}' "${rendered}" | sort -u)

# Rendered config must not embed private markers / credential bodies.
python3 "${SCRIPT_DIR}/scan_text.py" \
  --root "${PROJECT_ROOT}" \
  --allowlist "${ALLOWLIST}" \
  --stdin-path "compose/docker-compose.rendered.yaml" < "${rendered}" \
  || die "private marker in rendered compose config"

# Anonymous GHCR access for the tag (reuses existing public-stack tooling).
bash "${PROJECT_ROOT}/scripts/verify-ghcr-public-access.sh" "${TAG}"

rm -f "${rendered}"
echo "OK public compose independence for IMAGE_TAG=${TAG}"
