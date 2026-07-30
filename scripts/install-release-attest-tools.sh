#!/usr/bin/env bash
# Install version-pinned Syft and Cosign with SHA-256 verification.
# No long-lived secrets; downloads official GitHub release assets only.
#
# Usage:
#   bash scripts/install-release-attest-tools.sh [--dir <install-dir>]
#
# Defaults install to ${HOME}/.local/bin (added guidance printed for PATH).
set -euo pipefail

die() { echo "ERROR: $*" >&2; exit 1; }

SYFT_VERSION="1.50.0"
SYFT_ASSET="syft_${SYFT_VERSION}_linux_amd64.tar.gz"
SYFT_SHA256="bf7b29ff57f06da30918266a0e1c2885a8f99784798d1bdb1628886aa015d788"
SYFT_URL="https://github.com/anchore/syft/releases/download/v${SYFT_VERSION}/${SYFT_ASSET}"

COSIGN_VERSION="3.1.2"
COSIGN_ASSET="cosign-linux-amd64"
COSIGN_SHA256="f7622ed3cf22e55e1ae6377c080979ff77a22da9981c11df222a2e444991e7cf"
COSIGN_URL="https://github.com/sigstore/cosign/releases/download/v${COSIGN_VERSION}/${COSIGN_ASSET}"

INSTALL_DIR="${HOME}/.local/bin"
while [ $# -gt 0 ]; do
  case "$1" in
    --dir)
      INSTALL_DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

[ -n "${INSTALL_DIR}" ] || die "--dir requires a path"
mkdir -p "${INSTALL_DIR}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

verify_sha256() {
  local file="$1"
  local want="$2"
  local got
  got="$(sha256sum "${file}" | awk '{print $1}')"
  [ "${got}" = "${want}" ] || die "checksum mismatch for $(basename "${file}"): got=${got} want=${want}"
}

echo "Installing Syft v${SYFT_VERSION} -> ${INSTALL_DIR}/syft"
curl -fsSL --retry 3 --retry-delay 2 -o "${TMP_DIR}/${SYFT_ASSET}" "${SYFT_URL}"
verify_sha256 "${TMP_DIR}/${SYFT_ASSET}" "${SYFT_SHA256}"
tar -xzf "${TMP_DIR}/${SYFT_ASSET}" -C "${TMP_DIR}" syft
install -m 0755 "${TMP_DIR}/syft" "${INSTALL_DIR}/syft"

echo "Installing Cosign v${COSIGN_VERSION} -> ${INSTALL_DIR}/cosign"
curl -fsSL --retry 3 --retry-delay 2 -o "${TMP_DIR}/${COSIGN_ASSET}" "${COSIGN_URL}"
verify_sha256 "${TMP_DIR}/${COSIGN_ASSET}" "${COSIGN_SHA256}"
install -m 0755 "${TMP_DIR}/${COSIGN_ASSET}" "${INSTALL_DIR}/cosign"

"${INSTALL_DIR}/syft" version >/dev/null
"${INSTALL_DIR}/cosign" version >/dev/null
echo "OK installed Syft v${SYFT_VERSION} and Cosign v${COSIGN_VERSION} in ${INSTALL_DIR}"
echo "Ensure PATH includes ${INSTALL_DIR}"
