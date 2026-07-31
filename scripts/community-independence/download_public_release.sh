#!/usr/bin/env bash
# Anonymously download public Community release source archive + SBOM/manifest assets.
# No GitHub token, PAT, or registry login.
set -euo pipefail

TAG=""
OUT_DIR=""
REPO_SLUG="${REPO_SLUG:-SiriusScan/Sirius}"

die() { echo "ERROR: $*" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --tag) TAG="${2:-}"; shift 2 ;;
    --out-dir) OUT_DIR="${2:-}"; shift 2 ;;
    --repo) REPO_SLUG="${2:-}"; shift 2 ;;
    -h|--help)
      echo "Usage: download_public_release.sh --tag v1.1.0 --out-dir DIR"
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${TAG}" ] || die "--tag is required"
printf '%s' "${TAG}" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$' || die "tag must be vMAJOR.MINOR.PATCH"
[ -n "${OUT_DIR}" ] || die "--out-dir is required"
mkdir -p "${OUT_DIR}/assets"

# Visibly empty credentials.
export GH_TOKEN=""
export GITHUB_TOKEN=""
unset CURL_USER CURL_PASSWORD || true

echo "Anonymous download for ${REPO_SLUG}@${TAG}"
echo "GH_TOKEN empty=$([ -z "${GH_TOKEN:-}" ] && echo yes || echo no)"

base="https://github.com/${REPO_SLUG}/releases/download/${TAG}"
archive_url="https://github.com/${REPO_SLUG}/archive/refs/tags/${TAG}.tar.gz"

curl -fsSL --retry 3 --retry-delay 2 -o "${OUT_DIR}/source.tar.gz" "${archive_url}" \
  || die "failed to download source archive anonymously"

curl -fsSL --retry 3 --retry-delay 2 -o "${OUT_DIR}/assets/core-manifest.yaml" \
  "${base}/core-manifest.yaml" \
  || die "failed to download core-manifest.yaml anonymously"

# shellcheck source=scripts/release-components.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/release-components.sh"

for component in "${RELEASE_COMPONENTS[@]}"; do
  for platform_entry in "${RELEASE_SBOM_PLATFORMS[@]}"; do
    slug="${platform_entry##*:}"
    asset="$(release_sbom_asset_name "${component}" "${TAG}" "${slug}")"
    curl -fsSL --retry 3 --retry-delay 2 -o "${OUT_DIR}/assets/${asset}" \
      "${base}/${asset}" \
      || die "failed to download ${asset} anonymously"
  done
done

echo "OK anonymous public release download -> ${OUT_DIR}"
