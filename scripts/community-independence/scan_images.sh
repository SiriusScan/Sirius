#!/usr/bin/env bash
# Anonymously pull the six core-manifest digest refs and scan without running containers.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_SCRIPTS="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=scripts/release-components.sh
source "${REPO_SCRIPTS}/release-components.sh"

ALLOWLIST="${SCRIPT_DIR}/policy/governance-allowlist.txt"
MANIFEST=""
WORKDIR=""

die() { echo "ERROR: $*" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --manifest) MANIFEST="${2:-}"; shift 2 ;;
    --allowlist) ALLOWLIST="${2:-}"; shift 2 ;;
    --workdir) WORKDIR="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,3p' "$0"
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${MANIFEST}" ] || die "--manifest is required"
[ -f "${MANIFEST}" ] || die "manifest not found: ${MANIFEST}"
command -v jq >/dev/null 2>&1 || die "jq is required"
command -v docker >/dev/null 2>&1 || die "docker is required"

if [ -z "${WORKDIR}" ]; then
  WORKDIR="$(mktemp -d)"
  trap 'rm -rf "${WORKDIR}"' EXIT
fi
mkdir -p "${WORKDIR}"

# Visibly credential-free registry access.
EMPTY_DOCKER_CONFIG="${WORKDIR}/empty-docker-config"
mkdir -p "${EMPTY_DOCKER_CONFIG}"
export DOCKER_CONFIG="${EMPTY_DOCKER_CONFIG}"
unset DOCKER_AUTH_CONFIG || true
export GH_TOKEN=""
export GITHUB_TOKEN=""

echo "DOCKER_CONFIG=${DOCKER_CONFIG} (empty)"
echo "GH_TOKEN is empty: $([ -z "${GH_TOKEN}" ] && echo yes || echo no)"

refs_json="$(jq -c '
  .images as $imgs
  | [
      "sirius-ui","sirius-api","sirius-engine","sirius-postgres","sirius-rabbitmq","sirius-valkey"
    ] as $want
  | if ($imgs | keys | length) != 6 then error("manifest must contain exactly six images") else . end
  | $want
  | map({
      name: .,
      ref: ($imgs[.].ref // empty),
      digest: ($imgs[.].digest // empty)
    })
' "${MANIFEST}")"

count="$(printf '%s' "${refs_json}" | jq 'length')"
[ "${count}" -eq 6 ] || die "expected six image entries, got ${count}"

while IFS= read -r row; do
  name="$(printf '%s' "${row}" | jq -r '.name')"
  ref="$(printf '%s' "${row}" | jq -r '.ref')"
  digest="$(printf '%s' "${row}" | jq -r '.digest')"
  printf '%s' "${ref}" | grep -Eq "^ghcr\.io/siriusscan/${name}@sha256:[a-f0-9]{64}$" \
    || die "unexpected image ref for ${name}: ${ref}"
  printf '%s' "${digest}" | grep -Eq '^sha256:[a-f0-9]{64}$' \
    || die "unexpected digest for ${name}: ${digest}"
  printf '%s' "${ref}" | grep -Fq "@${digest}" \
    || die "ref/digest mismatch for ${name}"

  echo "==> anonymously pulling ${ref}"
  docker pull "${ref}"

  echo "==> inspecting image config (no run) ${name}"
  cfg="$(docker image inspect "${ref}" --format '{{json .}}')"
  printf '%s' "${cfg}" | python3 "${SCRIPT_DIR}/scan_text.py" \
    --root "${WORKDIR}" \
    --allowlist "${ALLOWLIST}" \
    --stdin-path "image/${name}/inspect.json" \
    || die "private marker in image inspect for ${name}"

  save_tar="${WORKDIR}/${name}.docker-save.tar"
  echo "==> docker save ${name} (filesystem scan, no run)"
  docker save -o "${save_tar}" "${ref}"
  python3 "${SCRIPT_DIR}/scan_image_layers.py" \
    --save-tar "${save_tar}" \
    --allowlist "${ALLOWLIST}" \
    --image-label "${name}" \
    || die "layer scan failed for ${name}"
done < <(printf '%s' "${refs_json}" | jq -c '.[]')

echo "OK community independence image scan (6 digest refs)"
