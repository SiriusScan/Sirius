#!/usr/bin/env bash
# Generate one CycloneDX JSON SBOM per Community image from inventory digests.
#
# Usage:
#   bash scripts/generate-release-sboms.sh \
#     --inventory path/to/core-build-inventory.json \
#     --tag v1.1.0 \
#     --outdir ./sboms
#
# Inputs must be immutable @sha256 refs from the inventory (never :latest).
# Override scanner with SYFT_CMD for tests (must accept IMAGE -o cyclonedx-json=FILE).
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
      sed -n '2,14p' "$0"
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

mkdir -p "${OUTDIR}"

for component in "${RELEASE_COMPONENTS[@]}"; do
  digest="$(jq -r --arg c "${component}" '.images[$c].digest // empty' "${INVENTORY}")"
  ref="$(jq -r --arg c "${component}" '.images[$c].ref // empty' "${INVENTORY}")"
  printf '%s' "${digest}" | grep -Eq '^sha256:[a-f0-9]{64}$' \
    || die "missing/invalid digest for ${component}"
  printf '%s' "${ref}" | grep -Eq "@sha256:[a-f0-9]{64}$" \
    || die "inventory ref for ${component} must be digest-pinned (@sha256): ${ref}"
  printf '%s' "${ref}" | grep -Eq ':latest(@|$)|/latest@' \
    && die "refutable mutable latest input forbidden for ${component}: ${ref}"
  [ "${ref}" = "ghcr.io/siriusscan/${component}@${digest}" ] \
    || die "inventory ref/digest mismatch for ${component}: ref=${ref} digest=${digest}"

  asset="$(release_sbom_asset_name "${component}" "${TAG}")"
  out="${OUTDIR}/${asset}"
  echo "Generating SBOM ${asset} from ${ref}"
  # Exact digest only — never a mutable tag.
  ${SYFT_BIN} "${ref}" -o "cyclonedx-json=${out}"
  [ -s "${out}" ] || die "SBOM not written: ${out}"
  jq -e '.bomFormat == "CycloneDX"' "${out}" >/dev/null \
    || die "SBOM is not CycloneDX JSON: ${out}"
done

echo "OK generated ${#RELEASE_COMPONENTS[@]} CycloneDX SBOMs in ${OUTDIR}"
