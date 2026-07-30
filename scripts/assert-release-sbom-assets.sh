#!/usr/bin/env bash
# Fail closed if any of the six CycloneDX SBOM release assets is missing/invalid.
#
# Usage:
#   bash scripts/assert-release-sbom-assets.sh --tag v1.1.0 --dir /path/to/assets
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/release-components.sh
source "${SCRIPT_DIR}/release-components.sh"

die() { echo "ERROR: $*" >&2; exit 1; }

TAG=""
DIR=""

while [ $# -gt 0 ]; do
  case "$1" in
    --tag)
      TAG="${2:-}"
      shift 2
      ;;
    --dir)
      DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      sed -n '2,8p' "$0"
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

[ -n "${TAG}" ] || die "--tag is required"
printf '%s' "${TAG}" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$' || die "tag must match vMAJOR.MINOR.PATCH"
[ -n "${DIR}" ] || die "--dir is required"
[ -d "${DIR}" ] || die "directory not found: ${DIR}"
command -v jq >/dev/null 2>&1 || die "jq is required"

for component in "${RELEASE_COMPONENTS[@]}"; do
  asset="$(release_sbom_asset_name "${component}" "${TAG}")"
  path="${DIR}/${asset}"
  [ -f "${path}" ] || die "missing required SBOM asset: ${asset}"
  [ -s "${path}" ] || die "empty SBOM asset: ${asset}"
  jq -e '.bomFormat == "CycloneDX"' "${path}" >/dev/null \
    || die "invalid CycloneDX JSON for ${asset}"
  echo "OK ${asset}"
done

echo "OK all ${#RELEASE_COMPONENTS[@]} SBOM assets present and valid for ${TAG}"
