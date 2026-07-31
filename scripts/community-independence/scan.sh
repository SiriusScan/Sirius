#!/usr/bin/env bash
# Community independence / private-leakage scanner entrypoint.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ALLOWLIST="${SCRIPT_DIR}/policy/governance-allowlist.txt"
MODE=""
ROOT="${PROJECT_ROOT}"
ARCHIVE=""
SBOM_DIR=""
MANIFEST=""
TAG="v1.1.0"
OUT_DIR=""
RUN_COMPOSE_SMOKE=0

die() { echo "ERROR: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage: scripts/community-independence/scan.sh --mode MODE [options]

Modes:
  source            Scan public runtime/source tree (git-tracked by default)
  release-archive   Safely scan a source release archive
  sbom              Validate/scan 12 CycloneDX SBOM assets
  images            Pull+scan six digest refs from core-manifest (no container run)
  compose           Public compose/config independence checks
  public-release    Anonymous download of tag assets + archive/sbom/images[/compose]

Options:
  --root DIR
  --archive FILE
  --sbom-dir DIR
  --manifest FILE
  --tag vX.Y.Z
  --out-dir DIR
  --allowlist FILE
  --compose-smoke   With public-release/compose, also run validate-public-compose-path.sh
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --mode) MODE="${2:-}"; shift 2 ;;
    --root) ROOT="${2:-}"; shift 2 ;;
    --archive) ARCHIVE="${2:-}"; shift 2 ;;
    --sbom-dir) SBOM_DIR="${2:-}"; shift 2 ;;
    --manifest) MANIFEST="${2:-}"; shift 2 ;;
    --tag) TAG="${2:-}"; shift 2 ;;
    --out-dir) OUT_DIR="${2:-}"; shift 2 ;;
    --allowlist) ALLOWLIST="${2:-}"; shift 2 ;;
    --compose-smoke) RUN_COMPOSE_SMOKE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${MODE}" ] || { usage; die "--mode is required"; }

export GH_TOKEN="${GH_TOKEN:-}"
export GITHUB_TOKEN="${GITHUB_TOKEN:-}"

case "${MODE}" in
  source)
    python3 "${SCRIPT_DIR}/scan_text.py" \
      --root "${ROOT}" \
      --allowlist "${ALLOWLIST}" \
      --git-tracked
    ;;
  release-archive)
    [ -n "${ARCHIVE}" ] || die "--archive is required"
    python3 "${SCRIPT_DIR}/scan_archive.py" \
      --archive "${ARCHIVE}" \
      --allowlist "${ALLOWLIST}"
    ;;
  sbom)
    [ -n "${SBOM_DIR}" ] || die "--sbom-dir is required"
    bash "${SCRIPT_DIR}/scan_sboms.sh" --tag "${TAG}" --dir "${SBOM_DIR}" --allowlist "${ALLOWLIST}"
    ;;
  images)
    [ -n "${MANIFEST}" ] || die "--manifest is required"
    bash "${SCRIPT_DIR}/scan_images.sh" --manifest "${MANIFEST}" --allowlist "${ALLOWLIST}"
    ;;
  compose)
    bash "${SCRIPT_DIR}/assert_public_compose.sh" "${TAG}"
    if [ "${RUN_COMPOSE_SMOKE}" -eq 1 ]; then
      IMAGE_TAG="${TAG}" bash "${PROJECT_ROOT}/scripts/validate-public-compose-path.sh" "${TAG}"
    fi
    ;;
  public-release)
    if [ -z "${OUT_DIR}" ]; then
      OUT_DIR="$(mktemp -d)"
      trap 'rm -rf "${OUT_DIR}"' EXIT
    fi
    bash "${SCRIPT_DIR}/download_public_release.sh" --tag "${TAG}" --out-dir "${OUT_DIR}"
    python3 "${SCRIPT_DIR}/scan_archive.py" \
      --archive "${OUT_DIR}/source.tar.gz" \
      --allowlist "${ALLOWLIST}"
    bash "${SCRIPT_DIR}/scan_sboms.sh" \
      --tag "${TAG}" \
      --dir "${OUT_DIR}/assets" \
      --allowlist "${ALLOWLIST}"
    bash "${PROJECT_ROOT}/scripts/validate-core-manifest.sh" \
      --expect-tag "${TAG}" \
      --skip-dockerfile-pins \
      "${OUT_DIR}/assets/core-manifest.yaml"
    bash "${SCRIPT_DIR}/scan_images.sh" \
      --manifest "${OUT_DIR}/assets/core-manifest.yaml" \
      --allowlist "${ALLOWLIST}" \
      --workdir "${OUT_DIR}/image-work"
    bash "${SCRIPT_DIR}/assert_public_compose.sh" "${TAG}"
    if [ "${RUN_COMPOSE_SMOKE}" -eq 1 ]; then
      IMAGE_TAG="${TAG}" bash "${PROJECT_ROOT}/scripts/validate-public-compose-path.sh" "${TAG}"
    fi
    ;;
  *)
    die "unknown mode: ${MODE}"
    ;;
esac
