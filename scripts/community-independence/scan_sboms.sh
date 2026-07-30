#!/usr/bin/env bash
# Validate exactly 12 Community release CycloneDX SBOMs and scan for private markers.
#
# Syft platform SBOMs do not encode an OCI platform field inside the JSON.
# Platform coverage is enforced by filename slug (linux-amd64 / linux-arm64) plus
# requiring exactly two distinct metadata.component.version child digests per
# component across those assets.
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
      sed -n '2,8p' "$0"
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

shopt -s nullglob
found_assets=("${DIR}"/sbom-*-"${TAG}"-*.cdx.json)
expected="$(release_expected_sbom_count)"
[ "${#found_assets[@]}" -eq "${expected}" ] \
  || die "expected exactly ${expected} SBOM files for ${TAG}, found ${#found_assets[@]}"

for component in "${RELEASE_COMPONENTS[@]}"; do
  expected_name="ghcr.io/siriusscan/${component}"
  versions=()
  for platform_entry in "${RELEASE_SBOM_PLATFORMS[@]}"; do
    slug="${platform_entry##*:}"
    asset="$(release_sbom_asset_name "${component}" "${TAG}" "${slug}")"
    path="${DIR}/${asset}"
    [ -s "${path}" ] || die "empty or missing ${asset}"

    jq -e --arg name "${expected_name}" '
      .bomFormat == "CycloneDX"
      and (.specVersion | type == "string")
      and .metadata.component.name == $name
      and (.metadata.component.version | type == "string")
      and (.metadata.component.version | test("^sha256:[a-f0-9]{64}$"))
    ' "${path}" >/dev/null \
      || die "SBOM ${asset} failed exact name/version CycloneDX checks (want name=${expected_name}, version=sha256:<64hex>)"

    ver="$(jq -r '.metadata.component.version' "${path}")"
    versions+=("${ver}")

    python3 "${SCRIPT_DIR}/scan_text.py" \
      --root "${DIR}" \
      --allowlist "${ALLOWLIST}" \
      --stdin-path "sbom/${asset}" < "${path}" \
      || die "private marker found in ${asset}"
  done

  # Exactly two platform assets => exactly two digests, and they must differ.
  [ "${#versions[@]}" -eq 2 ] || die "expected two platform SBOMs for ${component}"
  [ "${versions[0]}" != "${versions[1]}" ] \
    || die "duplicate platform child digest for ${component}: ${versions[0]}"
  uniq_count="$(printf '%s\n' "${versions[@]}" | sort -u | wc -l | tr -d ' ')"
  [ "${uniq_count}" -eq 2 ] || die "expected two distinct digests for ${component}"
done

echo "OK community independence SBOM scan (${expected} assets for ${TAG})"
echo "NOTE: platform identity is enforced via filename slug + distinct child digests; Syft JSON has no platform field."
