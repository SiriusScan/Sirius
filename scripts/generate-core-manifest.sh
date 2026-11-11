#!/usr/bin/env bash
# Generate core-manifest.yaml (JSON-compatible YAML 1.2 / pretty JSON) for a
# Community SemVer release from an immutable core-build-inventory plus
# Dockerfile pins at the release source commit.
#
# Usage:
#   bash scripts/generate-core-manifest.sh \
#     --tag v1.1.0 \
#     --commit <full-40-char-git-sha> \
#     --inventory path/to/core-build-inventory.json \
#     [--repo SiriusScan/Sirius] \
#     [--output core-manifest.yaml] \
#     [--dockerfile sirius-engine/Dockerfile] \
#     [--schema-map scripts/core-manifest/schema_map.json]
#
# Digests are taken from the inventory (never re-resolved from mutable tags).
# Fail-closed on missing pins, unknown GO_API_COMMIT_SHA mapping, or digest shape.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

RELEASE_TAG=""
SOURCE_COMMIT=""
SOURCE_REPO="${SOURCE_REPO:-SiriusScan/Sirius}"
OUTPUT_PATH=""
INVENTORY_PATH=""
DOCKERFILE="${DOCKERFILE:-${PROJECT_ROOT}/sirius-engine/Dockerfile}"
SCHEMA_MAP="${SCHEMA_MAP:-${PROJECT_ROOT}/scripts/core-manifest/schema_map.json}"
OPENAPI="${OPENAPI:-${PROJECT_ROOT}/sirius-api/contracts/openapi.v1.yaml}"
UI_VERSIONS="${UI_VERSIONS:-${PROJECT_ROOT}/sirius-ui/src/contracts/versions.json}"
AGENT_CONTRACTS_MAP="${AGENT_CONTRACTS_MAP:-${PROJECT_ROOT}/scripts/core-manifest/agent_contracts.json}"
COMPONENT_DEPENDENCIES="${COMPONENT_DEPENDENCIES:-${PROJECT_ROOT}/scripts/core-manifest/component_dependencies.json}"
API_GO_MOD="${API_GO_MOD:-${PROJECT_ROOT}/sirius-api/go.mod.prod}"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-siriusscan}"

COMPONENTS=(
  sirius-ui
  sirius-api
  sirius-engine
  sirius-postgres
  sirius-rabbitmq
  sirius-valkey
)

PIN_NAMES=(
  APP_SYSTEM_MONITOR_COMMIT_SHA
  APP_ADMINISTRATOR_COMMIT_SHA
  GO_API_COMMIT_SHA
  APP_SCANNER_COMMIT_SHA
  APP_TERMINAL_COMMIT_SHA
  SIRIUS_NSE_COMMIT_SHA
  APP_AGENT_COMMIT_SHA
  PINGPP_COMMIT_SHA
)

die() { echo "ERROR: $*" >&2; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"; }

is_semver_tag() { printf '%s' "$1" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$'; }
is_git_sha() { printf '%s' "$1" | grep -Eq '^[a-f0-9]{40}$'; }
is_sha256_digest() { printf '%s' "$1" | grep -Eq '^sha256:[a-f0-9]{64}$'; }

while [ "$#" -gt 0 ]; do
  case "$1" in
    --tag) RELEASE_TAG="${2:-}"; shift 2 ;;
    --commit) SOURCE_COMMIT="${2:-}"; shift 2 ;;
    --repo) SOURCE_REPO="${2:-}"; shift 2 ;;
    --output|-o) OUTPUT_PATH="${2:-}"; shift 2 ;;
    --inventory) INVENTORY_PATH="${2:-}"; shift 2 ;;
    --dockerfile) DOCKERFILE="${2:-}"; shift 2 ;;
    --schema-map) SCHEMA_MAP="${2:-}"; shift 2 ;;
    --openapi) OPENAPI="${2:-}"; shift 2 ;;
    --ui-versions) UI_VERSIONS="${2:-}"; shift 2 ;;
    --agent-contracts) AGENT_CONTRACTS_MAP="${2:-}"; shift 2 ;;
    --component-dependencies) COMPONENT_DEPENDENCIES="${2:-}"; shift 2 ;;
    --api-go-mod) API_GO_MOD="${2:-}"; shift 2 ;;
    --registry) REGISTRY="${2:-}"; shift 2 ;;
    --namespace) IMAGE_NAMESPACE="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${RELEASE_TAG}" ] || die "--tag is required"
[ -n "${SOURCE_COMMIT}" ] || die "--commit is required"
[ -n "${INVENTORY_PATH}" ] || die "--inventory is required"
is_semver_tag "${RELEASE_TAG}" || die "tag must match vMAJOR.MINOR.PATCH (got: ${RELEASE_TAG})"
is_git_sha "${SOURCE_COMMIT}" || die "commit must be a full 40-char git SHA (got: ${SOURCE_COMMIT})"
[ -f "${INVENTORY_PATH}" ] || die "inventory not found: ${INVENTORY_PATH}"
[ -f "${DOCKERFILE}" ] || die "Dockerfile not found: ${DOCKERFILE}"
[ -f "${SCHEMA_MAP}" ] || die "schema map not found: ${SCHEMA_MAP}"
[ -f "${OPENAPI}" ] || die "OpenAPI contract not found: ${OPENAPI}"
REST_CONTRACT="$(sed -nE 's/^  x-sirius-contract-version: "([0-9]+\.[0-9]+\.[0-9]+)"$/\1/p' "${OPENAPI}")"
[[ "${REST_CONTRACT}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "OpenAPI contract version missing or invalid"
[ -n "${OUTPUT_PATH}" ] || OUTPUT_PATH="${PROJECT_ROOT}/core-manifest.yaml"
require_cmd jq
[ -f "${AGENT_CONTRACTS_MAP}" ] || die "agent contract map missing"
[ -f "${UI_VERSIONS}" ] || die "UI contract versions not found: ${UI_VERSIONS}"
jq -e '(keys | sort) == ["server_extension", "ui_extension"] and all(.[]; type == "string" and test("^[0-9]+\\.[0-9]+\\.[0-9]+$"))' "${UI_VERSIONS}" >/dev/null || die "invalid UI contract versions"
UI_CONTRACTS="$(jq -c . "${UI_VERSIONS}")"

extract_pin() {
  local name="$1"
  local value
  value="$(grep -E "^ARG ${name}=" "${DOCKERFILE}" | head -n 1 | sed -E "s/^ARG ${name}=//" || true)"
  value="${value%%$'\r'}"
  [ -n "${value}" ] || die "missing Dockerfile pin default: ${name}"
  printf '%s' "${value}"
}

# Validate inventory with strict Go parser first.
bash "${PROJECT_ROOT}/scripts/validate-core-manifest.sh" \
  --mode inventory \
  --expect-commit "${SOURCE_COMMIT}" \
  "${INVENTORY_PATH}"

inv_commit="$(jq -r '.source.commit' "${INVENTORY_PATH}")"
[ "${inv_commit}" = "${SOURCE_COMMIT}" ] || die "inventory commit ${inv_commit} != --commit ${SOURCE_COMMIT}"

PIN_VALUES=()
for pin in "${PIN_NAMES[@]}"; do
  PIN_VALUES+=("$(extract_pin "${pin}")")
done

GO_API_VERSION=""
AGENT_COMMIT=""
SCANNER_COMMIT=""
i=0
for pin in "${PIN_NAMES[@]}"; do
  if [ "${pin}" = "GO_API_COMMIT_SHA" ]; then
    GO_API_VERSION="${PIN_VALUES[$i]}"
  fi
  if [ "${pin}" = "APP_SCANNER_COMMIT_SHA" ]; then
    SCANNER_COMMIT="${PIN_VALUES[$i]}"
  fi
  if [ "${pin}" = "APP_AGENT_COMMIT_SHA" ]; then
    AGENT_COMMIT="${PIN_VALUES[$i]}"
  fi
  i=$((i + 1))
done
[ -n "${GO_API_VERSION}" ] || die "GO_API_COMMIT_SHA pin is empty"

if ! jq -e --arg v "${GO_API_VERSION}" 'has($v)' "${SCHEMA_MAP}" >/dev/null; then
  die "GO_API_COMMIT_SHA ${GO_API_VERSION} has no entry in ${SCHEMA_MAP}"
fi
jq -e --arg v "${AGENT_COMMIT}" '.[$v] | type == "object" and (.agent_protocol | type == "string") and (.agent_admission | type == "string")' "${AGENT_CONTRACTS_MAP}" >/dev/null || die "agent contract mapping missing for ${AGENT_COMMIT}"
AGENT_CONTRACTS="$(jq -c --arg v "${AGENT_COMMIT}" '.[$v]' "${AGENT_CONTRACTS_MAP}")"
[ -f "${COMPONENT_DEPENDENCIES}" ] || die "component dependencies missing"
[ -f "${API_GO_MOD}" ] || die "API production go.mod missing"
API_SDK_VERSION="$(awk '$1 == "github.com/SiriusScan/go-api" { print $2 }' "${API_GO_MOD}")"
[[ "${API_SDK_VERSION}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "API production go-api version missing or not a release"
# The API binary uses go.mod.prod while its migrator is built from this pin.
# Fail if the release tag mapping is missing or does not describe that pin.
API_SDK_COMMIT="$(jq -r --arg v "${API_SDK_VERSION}" '.sdk_releases[$v] // empty' "${COMPONENT_DEPENDENCIES}")"
[ "${API_SDK_COMMIT}" = "${GO_API_VERSION}" ] || die "API go-api release does not match migrator pin"
COMPONENT_SDKS="$(jq -ce --arg source "${SOURCE_COMMIT}" --arg sdk "${API_SDK_VERSION}" --arg sdkcommit "${API_SDK_COMMIT}" --arg scanner "${SCANNER_COMMIT}" --arg agent "${AGENT_COMMIT}" '
  . as $root | ($root["app-scanner"][$scanner] // error("unknown scanner source")) as $s |
  ($root["app-agent"][$agent] // error("unknown agent source")) as $a |
  {"sirius-api": {source_commit:$source, go_api_version:$sdk, go_api_commit:$sdkcommit},
   "app-scanner": ($s + {source_commit:$scanner}), "app-agent": ($a + {source_commit:$agent})}' "${COMPONENT_DEPENDENCIES}")"
SDK_CONTRACTS="$(jq -c --arg v "${GO_API_VERSION}" '.[$v].contracts // {}' "${SCHEMA_MAP}")"
LEDGER_TABLE="$(jq -r --arg v "${GO_API_VERSION}" '.[$v].ledger_table' "${SCHEMA_MAP}")"
LATEST_MIGRATION="$(jq -r --arg v "${GO_API_VERSION}" '.[$v].latest_migration' "${SCHEMA_MAP}")"
[ -n "${LEDGER_TABLE}" ] && [ "${LEDGER_TABLE}" != "null" ] || die "schema map ledger_table missing for ${GO_API_VERSION}"
[ -n "${LATEST_MIGRATION}" ] && [ "${LATEST_MIGRATION}" != "null" ] || die "schema map latest_migration missing for ${GO_API_VERSION}"

IMAGE_DIGESTS=()
for component in "${COMPONENTS[@]}"; do
  digest="$(jq -r --arg c "${component}" '.images[$c].digest // empty' "${INVENTORY_PATH}")"
  is_sha256_digest "${digest}" || die "inventory missing/invalid digest for ${component}: ${digest:-<empty>}"
  IMAGE_DIGESTS+=("${digest}")
done

GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# Build deterministic JSON (also valid YAML 1.2) with stable key order via jq.
pins_json='{}'
i=0
for pin in "${PIN_NAMES[@]}"; do
  pins_json="$(jq -c --arg k "${pin}" --arg v "${PIN_VALUES[$i]}" '. + {($k): $v}' <<<"${pins_json}")"
  i=$((i + 1))
done

images_json='{}'
i=0
for component in "${COMPONENTS[@]}"; do
  digest="${IMAGE_DIGESTS[$i]}"
  ref="${REGISTRY}/${IMAGE_NAMESPACE}/${component}@${digest}"
  images_json="$(jq -c \
    --arg c "${component}" \
    --arg tag "${RELEASE_TAG}" \
    --arg digest "${digest}" \
    --arg ref "${ref}" \
    '. + {($c): {tag: $tag, digest: $digest, ref: $ref}}' <<<"${images_json}")"
  i=$((i + 1))
done

jq -n \
  --arg apiVersion "siriusscan.dev/v1" \
  --arg kind "CoreManifest" \
  --arg release_tag "${RELEASE_TAG}" \
  --arg generated_at "${GENERATED_AT}" \
  --arg repository "${SOURCE_REPO}" \
  --arg commit "${SOURCE_COMMIT}" \
  --arg source_tag "${RELEASE_TAG}" \
  --arg ledger_table "${LEDGER_TABLE}" \
  --arg latest_migration "${LATEST_MIGRATION}" \
  --arg go_api_version "${GO_API_VERSION}" \
  --arg rest_contract "${REST_CONTRACT}" \
  --argjson ui_contracts "${UI_CONTRACTS}" \
  --argjson sdk_contracts "${SDK_CONTRACTS}" \
  --argjson agent_contracts "${AGENT_CONTRACTS}" \
  --argjson component_sdks "${COMPONENT_SDKS}" \
  --argjson component_pins "${pins_json}" \
  --argjson images "${images_json}" \
  '{
    apiVersion: $apiVersion,
    kind: $kind,
    metadata: {
      release_tag: $release_tag,
      generated_at: $generated_at,
      source: {
        repository: $repository,
        commit: $commit,
        tag: $source_tag
      }
    },
    schema: {
      ledger_table: $ledger_table,
      latest_migration: $latest_migration,
      go_api_version: $go_api_version
    },
    contracts: ({ rest_api: $rest_contract } + $ui_contracts + $sdk_contracts + $agent_contracts),
    component_dependencies: $component_sdks,
    component_pins: $component_pins,
    images: $images
  }' > "${OUTPUT_PATH}"

echo "Wrote ${OUTPUT_PATH}" >&2
