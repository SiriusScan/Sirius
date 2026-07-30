#!/usr/bin/env bash
# Cosign keyless sign and/or verify Community release image digests.
#
# Usage:
#   bash scripts/sign-verify-release-images.sh \
#     --inventory path/to/core-build-inventory.json \
#     --mode sign|verify|sign-and-verify
#
# Signing identity (GitHub Actions OIDC / Fulcio):
#   COSIGN_CERTIFICATE_OIDC_ISSUER
#     default: https://token.actions.githubusercontent.com
#   COSIGN_CERTIFICATE_IDENTITY_REGEXP
#     required for verify; must match the publish-release-image-tags workflow
#     certificate subject (e.g. ^https://github\.com/OWNER/REPO/\.github/workflows/publish-release-image-tags\.yml@refs/heads/.+$)
#
# Signs exact inventory @sha256 refs only (never :latest).
# Override binary with COSIGN_CMD for tests.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/release-components.sh
source "${SCRIPT_DIR}/release-components.sh"

die() { echo "ERROR: $*" >&2; exit 1; }

INVENTORY=""
MODE=""

while [ $# -gt 0 ]; do
  case "$1" in
    --inventory)
      INVENTORY="${2:-}"
      shift 2
      ;;
    --mode)
      MODE="${2:-}"
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
case "${MODE}" in
  sign|verify|sign-and-verify) ;;
  *) die "--mode must be sign, verify, or sign-and-verify" ;;
esac

command -v jq >/dev/null 2>&1 || die "jq is required"
COSIGN_BIN="${COSIGN_CMD:-cosign}"
if [ -z "${COSIGN_CMD:-}" ]; then
  command -v cosign >/dev/null 2>&1 || die "cosign not found on PATH (run scripts/install-release-attest-tools.sh)"
fi

OIDC_ISSUER="${COSIGN_CERTIFICATE_OIDC_ISSUER:-https://token.actions.githubusercontent.com}"
IDENTITY_REGEXP="${COSIGN_CERTIFICATE_IDENTITY_REGEXP:-}"

if [ "${MODE}" = "verify" ] || [ "${MODE}" = "sign-and-verify" ]; then
  [ -n "${IDENTITY_REGEXP}" ] || die "COSIGN_CERTIFICATE_IDENTITY_REGEXP is required for verify"
fi

sign_one() {
  local ref="$1"
  echo "Signing ${ref}"
  ${COSIGN_BIN} sign --yes "${ref}"
}

verify_one() {
  local ref="$1"
  echo "Verifying ${ref}"
  ${COSIGN_BIN} verify \
    --certificate-identity-regexp "${IDENTITY_REGEXP}" \
    --certificate-oidc-issuer "${OIDC_ISSUER}" \
    "${ref}"
}

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
    || die "inventory ref/digest mismatch for ${component}"

  case "${MODE}" in
    sign)
      sign_one "${ref}"
      ;;
    verify)
      verify_one "${ref}"
      ;;
    sign-and-verify)
      sign_one "${ref}"
      verify_one "${ref}"
      ;;
  esac
done

echo "OK cosign ${MODE} for ${#RELEASE_COMPONENTS[@]} digest-pinned images"
