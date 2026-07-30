#!/usr/bin/env bash
# Generate platform-scoped CycloneDX JSON SBOMs for Community release images.
#
# For each of the six inventory OCI index digests, resolve linux/amd64 and
# linux/arm64 child manifest digests and scan those exact platform refs.
# Produces 12 assets: sbom-<component>-<tag>-linux-amd64|arm64.cdx.json
#
# Usage:
#   bash scripts/generate-release-sboms.sh \
#     --inventory path/to/core-build-inventory.json \
#     --tag v1.1.0 \
#     --outdir ./sboms
#
# Overrides for tests:
#   SYFT_CMD — scanner command (IMAGE -o cyclonedx-json=FILE)
#   RELEASE_IMAGE_INSPECT_RAW_CMD — prints OCI index JSON for a digest ref
#     (default: docker buildx imagetools inspect --raw)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/release-components.sh
source "${SCRIPT_DIR}/release-components.sh"

die() { echo "ERROR: $*" >&2; exit 1; }

INVENTORY=""
TAG=""
OUTDIR=""

while [ $# -gt 0 ]; do
  case "$1" in
    --inventory)
      INVENTORY="${2:-}"
      shift 2
      ;;
    --tag)
      TAG="${2:-}"
      shift 2
      ;;
    --outdir)
      OUTDIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

[ -n "${INVENTORY}" ] || die "--inventory is required"
[ -f "${INVENTORY}" ] || die "inventory not found: ${INVENTORY}"
[ -n "${TAG}" ] || die "--tag is required"
printf '%s' "${TAG}" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$' || die "tag must match vMAJOR.MINOR.PATCH"
[ -n "${OUTDIR}" ] || die "--outdir is required"
command -v jq >/dev/null 2>&1 || die "jq is required"

SYFT_BIN="${SYFT_CMD:-syft}"
if [ -z "${SYFT_CMD:-}" ]; then
  command -v syft >/dev/null 2>&1 || die "syft not found on PATH (run scripts/install-release-attest-tools.sh)"
fi

inspect_index_raw() {
  local ref="$1"
  if [ -n "${RELEASE_IMAGE_INSPECT_RAW_CMD:-}" ]; then
    # shellcheck disable=SC2086
    ${RELEASE_IMAGE_INSPECT_RAW_CMD} "${ref}"
  else
    docker buildx imagetools inspect --raw "${ref}"
  fi
}

platform_digest_from_index() {
  local index_json="$1"
  local os="$2"
  local arch="$3"
  local digests
  digests="$(printf '%s' "${index_json}" | jq -r \
    --arg os "${os}" --arg arch "${arch}" '
      [.manifests[]?
        | select((.platform.os // "") == $os)
        | select((.platform.architecture // "") == $arch)
        | .digest
      ] | unique | .[]
    ')"
  local count
  count="$(printf '%s\n' "${digests}" | grep -c . || true)"
  [ "${count}" -eq 1 ] || die "expected exactly one ${os}/${arch} digest in index, found ${count}"
  printf '%s' "${digests}" | grep -Eq '^sha256:[a-f0-9]{64}$' \
    || die "invalid ${os}/${arch} digest: ${digests}"
  printf '%s' "${digests}"
}

mkdir -p "${OUTDIR}"
generated=0

for component in "${RELEASE_COMPONENTS[@]}"; do
  digest="$(jq -r --arg c "${component}" '.images[$c].digest // empty' "${INVENTORY}")"
  ref="$(jq -r --arg c "${component}" '.images[$c].ref // empty' "${INVENTORY}")"
  printf '%s' "${digest}" | grep -Eq '^sha256:[a-f0-9]{64}$' \
    || die "missing/invalid digest for ${component}"
  printf '%s' "${ref}" | grep -Eq "@sha256:[a-f0-9]{64}$" \
    || die "inventory ref for ${component} must be digest-pinned (@sha256): ${ref}"
  printf '%s' "${ref}" | grep -Eq ':latest(@|$)|/latest@' \
    && die "mutable latest input forbidden for ${component}: ${ref}"
  [ "${ref}" = "ghcr.io/siriusscan/${component}@${digest}" ] \
    || die "inventory ref/digest mismatch for ${component}: ref=${ref} digest=${digest}"

  echo "Resolving platform digests from index ${ref}"
  index_json="$(inspect_index_raw "${ref}")"
  [ -n "${index_json}" ] || die "empty index inspect for ${ref}"

  # Exactly the two supported image platforms must be present (attestations ignored).
  found_platforms="$(printf '%s' "${index_json}" | jq -r '
    [.manifests[]?
      | select((.platform.os // "") == "linux")
      | select((.platform.architecture // "") == "amd64" or (.platform.architecture // "") == "arm64")
      | "\(.platform.os)/\(.platform.architecture)"
    ] | unique | sort | join(",")
  ')"
  [ "${found_platforms}" = "linux/amd64,linux/arm64" ] \
    || die "index ${ref} must expose exactly linux/amd64 and linux/arm64 image platforms; found: ${found_platforms:-<none>}"

  for platform_entry in "${RELEASE_SBOM_PLATFORMS[@]}"; do
    platform="${platform_entry%%:*}"
    slug="${platform_entry##*:}"
    os="${platform%%/*}"
    arch="${platform##*/}"
    platform_digest="$(platform_digest_from_index "${index_json}" "${os}" "${arch}")"
    platform_ref="ghcr.io/siriusscan/${component}@${platform_digest}"
    printf '%s' "${platform_ref}" | grep -Eq "@sha256:[a-f0-9]{64}$" \
      || die "platform ref not immutable for ${component}/${slug}"

    asset="$(release_sbom_asset_name "${component}" "${TAG}" "${slug}")"
    out="${OUTDIR}/${asset}"
    echo "Generating SBOM ${asset} from ${platform_ref}"
    ${SYFT_BIN} "${platform_ref}" -o "cyclonedx-json=${out}"
    [ -s "${out}" ] || die "SBOM not written: ${out}"
    jq -e '.bomFormat == "CycloneDX"' "${out}" >/dev/null \
      || die "SBOM is not CycloneDX JSON: ${out}"
    generated=$((generated + 1))
  done
done

expected="$(release_expected_sbom_count)"
[ "${generated}" -eq "${expected}" ] || die "expected ${expected} SBOMs, generated ${generated}"
echo "OK generated ${generated} platform-scoped CycloneDX SBOMs in ${OUTDIR}"
