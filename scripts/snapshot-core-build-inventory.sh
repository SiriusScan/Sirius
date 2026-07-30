#!/usr/bin/env bash
# Snapshot the six public GHCR multi-arch digests currently referenced by
# IMAGE_SOURCE_TAG (default: latest), retag them immutably as sha-<commit>,
# optionally smoke-test Compose on that snapshot tag, and write
# core-build-inventory.json.
#
# Usage:
#   bash scripts/snapshot-core-build-inventory.sh \
#     --commit <full-40-char-sha> \
#     [--repo SiriusScan/Sirius] \
#     [--source-tag latest] \
#     [--output core-build-inventory.json] \
#     [--smoke 0|1]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

SOURCE_COMMIT=""
SOURCE_REPO="${SOURCE_REPO:-SiriusScan/Sirius}"
SOURCE_TAG="${SOURCE_TAG:-latest}"
OUTPUT_PATH=""
DO_SMOKE="${DO_SMOKE:-1}"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-siriusscan}"
# Test hook
CORE_MANIFEST_INSPECT_CMD="${CORE_MANIFEST_INSPECT_CMD:-}"

COMPONENTS=(
  sirius-ui
  sirius-api
  sirius-engine
  sirius-postgres
  sirius-rabbitmq
  sirius-valkey
)

die() { echo "ERROR: $*" >&2; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"; }
is_git_sha() { printf '%s' "$1" | grep -Eq '^[a-f0-9]{40}$'; }
is_sha256_digest() { printf '%s' "$1" | grep -Eq '^sha256:[a-f0-9]{64}$'; }

while [ "$#" -gt 0 ]; do
  case "$1" in
    --commit) SOURCE_COMMIT="${2:-}"; shift 2 ;;
    --repo) SOURCE_REPO="${2:-}"; shift 2 ;;
    --source-tag) SOURCE_TAG="${2:-}"; shift 2 ;;
    --output|-o) OUTPUT_PATH="${2:-}"; shift 2 ;;
    --smoke) DO_SMOKE="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${SOURCE_COMMIT}" ] || die "--commit is required"
is_git_sha "${SOURCE_COMMIT}" || die "commit must be a full 40-char git SHA"
[ -n "${OUTPUT_PATH}" ] || OUTPUT_PATH="${PROJECT_ROOT}/core-build-inventory.json"
require_cmd jq
if [ -z "${CORE_MANIFEST_INSPECT_CMD}" ]; then
  require_cmd docker
fi

inspect_json() {
  local ref="$1"
  if [ -n "${CORE_MANIFEST_INSPECT_CMD}" ]; then
    # shellcheck disable=SC2086
    ${CORE_MANIFEST_INSPECT_CMD} "${ref}"
  else
    docker buildx imagetools inspect "${ref}" --format '{{json .}}'
  fi
}

resolve_digest() {
  local ref="$1"
  local digest
  digest="$(inspect_json "${ref}" | jq -r '.manifest.digest // empty')"
  is_sha256_digest "${digest}" || die "invalid digest for ${ref}: ${digest:-<empty>}"
  printf '%s' "${digest}"
}

SNAPSHOT_TAG="sha-${SOURCE_COMMIT}"
echo "Resolving digests from mutable source tag '${SOURCE_TAG}' once..." >&2

DIGESTS=()
for component in "${COMPONENTS[@]}"; do
  src_ref="${REGISTRY}/${IMAGE_NAMESPACE}/${component}:${SOURCE_TAG}"
  digest="$(resolve_digest "${src_ref}")"
  DIGESTS+=("${digest}")
  echo "  ${component}: ${digest}" >&2
done

if [ -z "${CORE_MANIFEST_INSPECT_CMD}" ]; then
  echo "Ensuring write-once snapshot tag ${SNAPSHOT_TAG} from @sha256 digests..." >&2
  i=0
  for component in "${COMPONENTS[@]}"; do
    digest="${DIGESTS[$i]}"
    bash "${PROJECT_ROOT}/scripts/ghcr-ensure-write-once-tag.sh" \
      "${REGISTRY}/${IMAGE_NAMESPACE}/${component}" \
      "${SNAPSHOT_TAG}" \
      "${digest}"
    i=$((i + 1))
  done

  if [ "${DO_SMOKE}" = "1" ]; then
    echo "Smoke-testing public compose on immutable tag ${SNAPSHOT_TAG}..." >&2
    bash "${PROJECT_ROOT}/scripts/validate-public-compose-path.sh" "${SNAPSHOT_TAG}"
  fi
else
  echo "Skipping docker retag/smoke (CORE_MANIFEST_INSPECT_CMD set)" >&2
fi

GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
images_json='{}'
i=0
for component in "${COMPONENTS[@]}"; do
  digest="${DIGESTS[$i]}"
  ref="${REGISTRY}/${IMAGE_NAMESPACE}/${component}@${digest}"
  images_json="$(jq -c \
    --arg c "${component}" \
    --arg digest "${digest}" \
    --arg ref "${ref}" \
    '. + {($c): {digest: $digest, ref: $ref}}' <<<"${images_json}")"
  i=$((i + 1))
done

jq -n \
  --arg apiVersion "siriusscan.dev/v1" \
  --arg kind "CoreBuildInventory" \
  --arg generated_at "${GENERATED_AT}" \
  --arg repository "${SOURCE_REPO}" \
  --arg commit "${SOURCE_COMMIT}" \
  --arg snapshot_tag "${SNAPSHOT_TAG}" \
  --argjson images "${images_json}" \
  '{
    apiVersion: $apiVersion,
    kind: $kind,
    generated_at: $generated_at,
    source: {
      repository: $repository,
      commit: $commit,
      snapshot_tag: $snapshot_tag
    },
    images: $images
  }' > "${OUTPUT_PATH}"

bash "${PROJECT_ROOT}/scripts/validate-core-manifest.sh" \
  --mode inventory \
  --expect-commit "${SOURCE_COMMIT}" \
  "${OUTPUT_PATH}"

echo "Wrote ${OUTPUT_PATH}" >&2
