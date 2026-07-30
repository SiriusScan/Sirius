#!/usr/bin/env bash
# Thin wrapper around the strict Go core-manifest validator.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

EXPECT_TAG=""
EXPECT_COMMIT=""
SKIP_DOCKERFILE_PINS=0
VERIFY_DIGESTS=0
DOCKERFILE="${DOCKERFILE:-}"
SCHEMA_MAP="${SCHEMA_MAP:-${PROJECT_ROOT}/scripts/core-manifest/schema_map.json}"
MODE="manifest"
MANIFEST=""

abspath() {
  local p="$1"
  case "${p}" in
    /*) printf '%s' "${p}" ;;
    *) printf '%s' "$(cd "$(dirname "${p}")" && pwd)/$(basename "${p}")" ;;
  esac
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --expect-tag) EXPECT_TAG="${2:-}"; shift 2 ;;
    --expect-commit) EXPECT_COMMIT="${2:-}"; shift 2 ;;
    --skip-dockerfile-pins) SKIP_DOCKERFILE_PINS=1; shift ;;
    --verify-digests) VERIFY_DIGESTS=1; shift ;;
    --dockerfile) DOCKERFILE="${2:-}"; shift 2 ;;
    --schema-map) SCHEMA_MAP="${2:-}"; shift 2 ;;
    --mode) MODE="${2:-}"; shift 2 ;;
    -h|--help)
      cat <<'EOF'
usage: validate-core-manifest.sh [flags] <file>
  --mode manifest|inventory
  --expect-tag vX.Y.Z
  --expect-commit <full-sha>
  --skip-dockerfile-pins
  --verify-digests
  --dockerfile PATH
  --schema-map PATH
EOF
      exit 0
      ;;
    -*)
      echo "ERROR: unknown flag: $1" >&2
      exit 2
      ;;
    *)
      [ -z "${MANIFEST}" ] || { echo "ERROR: unexpected argument: $1" >&2; exit 2; }
      MANIFEST="$1"
      shift
      ;;
  esac
done

[ -n "${MANIFEST}" ] || { echo "ERROR: manifest/inventory path required" >&2; exit 2; }
[ -f "${MANIFEST}" ] || { echo "ERROR: file not found: ${MANIFEST}" >&2; exit 2; }

MANIFEST="$(abspath "${MANIFEST}")"
SCHEMA_MAP="$(abspath "${SCHEMA_MAP}")"

ARGS=(-mode "${MODE}" -schema-map "${SCHEMA_MAP}")
[ -n "${EXPECT_TAG}" ] && ARGS+=(-expect-tag "${EXPECT_TAG}")
[ -n "${EXPECT_COMMIT}" ] && ARGS+=(-expect-commit "${EXPECT_COMMIT}")
[ "${SKIP_DOCKERFILE_PINS}" = "1" ] && ARGS+=(-skip-dockerfile-pins)
[ "${VERIFY_DIGESTS}" = "1" ] && ARGS+=(-verify-digests)
if [ -n "${DOCKERFILE}" ]; then
  DOCKERFILE="$(abspath "${DOCKERFILE}")"
  ARGS+=(-dockerfile "${DOCKERFILE}")
fi

cd "${PROJECT_ROOT}/scripts/core-manifest"
exec go run . "${ARGS[@]}" "${MANIFEST}"
