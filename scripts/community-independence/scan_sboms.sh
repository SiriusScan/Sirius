#!/usr/bin/env bash
# Validate exactly 12 Community release CycloneDX SBOMs and scan for private markers.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_SCRIPTS="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=scripts/release-components.sh
source "${REPO_SCRIPTS}/release-components.sh"

ALLOWLIST="${SCRIPT_DIR}/policy/governance-allowlist.txt"
TAG=""
DIR=""

die() { echo "ERROR: $*" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --tag) TAG="${2:-}"; shift 2 ;;
    --dir) DIR="${2:-}"; shift 2 ;;
    --allowlist) ALLOWLIST="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,4p' "$0"
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${TAG}" ] || die "--tag is required"
[ -n "${DIR}" ] || die "--dir is required"
[ -d "${DIR}" ] || die "directory not found: ${DIR}"
command -v jq >/dev/null 2>&1 || die "jq is required"

bash "${REPO_SCRIPTS}/assert-release-sbom-assets.sh" --tag "${TAG}" --dir "${DIR}"

# Exact expected asset set; reject extras that could hide private components.
shopt -s nullglob
found_assets=("${DIR}"/sbom-*-"${TAG}"-*.cdx.json)
expected="$(release_expected_sbom_count)"
[ "${#found_assets[@]}" -eq "${expected}" ] \
  || die "expected exactly ${expected} SBOM files for ${TAG}, found ${#found_assets[@]}"

for component in "${RELEASE_COMPONENTS[@]}"; do
  for platform_entry in "${RELEASE_SBOM_PLATFORMS[@]}"; do
    slug="${platform_entry##*:}"
    asset="$(release_sbom_asset_name "${component}" "${TAG}" "${slug}")"
    path="${DIR}/${asset}"
    [ -s "${path}" ] || die "empty or missing ${asset}"
    jq -e --arg c "${component}" '
      .bomFormat == "CycloneDX"
      and (.specVersion | type == "string")
      and (.metadata.component.name | type == "string")
      and (
        (.metadata.component.name | test($c; "i"))
        or (.metadata.component.name | test("sirius"; "i"))
      )
    ' "${path}" >/dev/null \
      || die "SBOM ${asset} failed CycloneDX/component checks"

    python3 "${SCRIPT_DIR}/scan_text.py" \
      --root "${DIR}" \
      --allowlist "${ALLOWLIST}" \
      --stdin-path "sbom/${asset}" < "${path}" \
      || die "private marker found in ${asset}"
  done
done

echo "OK community independence SBOM scan (${expected} assets for ${TAG})"
