#!/usr/bin/env bash
# Anonymous registry checks use a temporary DOCKER_CONFIG inside this script.
# Do not wrap the entire shell in DOCKER_CONFIG=... when invoking this script:
# `docker compose config` needs your normal Docker config to resolve the compose file.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_ROOT}/docker-compose.yaml}"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-siriusscan}"

if [ "$#" -gt 0 ]; then
  TAGS=("$@")
else
  TAGS=("latest")
fi

export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-test-postgres-password}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-test-nextauth-secret}"
export INITIAL_ADMIN_PASSWORD="${INITIAL_ADMIN_PASSWORD:-test-admin-password}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:test-postgres-password@sirius-postgres:5432/sirius}"
export SIRIUS_IMAGE_PULL_POLICY="${SIRIUS_IMAGE_PULL_POLICY:-always}"

if [ ! -f "${PROJECT_ROOT}/secrets/sirius_api_key.txt" ]; then
  mkdir -p "${PROJECT_ROOT}/secrets"
  printf '%s\n' "${SIRIUS_INTERNAL_API_KEY_TEST_VALUE:-test-api-key}" > "${PROJECT_ROOT}/secrets/sirius_api_key.txt"
fi

anonymous_manifest_check() {
  local image_ref="$1"
  local docker_config
  local err
  local rc

  docker_config="$(mktemp -d)"

  set +e
  err="$(DOCKER_CONFIG="${docker_config}" docker manifest inspect "${image_ref}" 2>&1 >/dev/null)"
  rc=$?
  set -e

  rm -rf "${docker_config}"

  if [ "${rc}" -eq 0 ]; then
    echo "  PASS ${image_ref}"
    return 0
  fi

  if printf '%s' "${err}" | grep -qiE 'unauthorized|denied|forbidden'; then
    echo "::error::Anonymous access denied for ${image_ref}. GHCR package visibility is not public or token-based visibility enforcement failed."
    return 1
  fi

  if printf '%s' "${err}" | grep -qiE 'manifest unknown|no such manifest|not found'; then
    echo "::error::Manifest missing for ${image_ref}. The tag was not published or was published under a different name."
    return 1
  fi

  echo "::error::Unable to verify ${image_ref}: ${err}"
  return 1
}

for tag in "${TAGS[@]}"; do
  echo "Verifying anonymous GHCR access for IMAGE_TAG=${tag}"

  image_refs=()
  while IFS= read -r image_ref; do
    image_refs+=("${image_ref}")
  done < <(
    IMAGE_TAG="${tag}" docker compose -f "${COMPOSE_FILE}" config \
      | awk '/^[[:space:]]+image:[[:space:]]/ {print $2}' \
      | grep "^${REGISTRY}/${IMAGE_NAMESPACE}/" \
      | sort -u
  )

  if [ "${#image_refs[@]}" -eq 0 ]; then
    echo "::error::No GHCR image references found in ${COMPOSE_FILE} for IMAGE_TAG=${tag}"
    exit 1
  fi

  failures=0
  for image_ref in "${image_refs[@]}"; do
    if ! anonymous_manifest_check "${image_ref}"; then
      failures=1
    fi
  done

  if [ "${failures}" -ne 0 ]; then
    exit 1
  fi
done

echo "All compose-rendered GHCR images are anonymously readable."
