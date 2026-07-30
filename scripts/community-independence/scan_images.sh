#!/usr/bin/env bash
# Anonymously pull six core-manifest index digests, resolve linux/amd64+arm64
# children, pull each child with --platform, and scan configs/layers without running
# containers. Labels evidence as <component>/<platform-slug>.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_SCRIPTS="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=scripts/release-components.sh
source "${REPO_SCRIPTS}/release-components.sh"

ALLOWLIST="${SCRIPT_DIR}/policy/governance-allowlist.txt"
MANIFEST=""
WORKDIR=""
PULL_LOG=""

die() { echo "ERROR: $*" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --manifest) MANIFEST="${2:-}"; shift 2 ;;
    --allowlist) ALLOWLIST="${2:-}"; shift 2 ;;
    --workdir) WORKDIR="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,5p' "$0"
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${MANIFEST}" ] || die "--manifest is required"
[ -f "${MANIFEST}" ] || die "manifest not found: ${MANIFEST}"
command -v jq >/dev/null 2>&1 || die "jq is required"

if [ -z "${WORKDIR}" ]; then
  WORKDIR="$(mktemp -d)"
  trap 'rm -rf "${WORKDIR}"' EXIT
fi
mkdir -p "${WORKDIR}"
PULL_LOG="${WORKDIR}/pulls.log"
: > "${PULL_LOG}"

EMPTY_DOCKER_CONFIG="${WORKDIR}/empty-docker-config"
mkdir -p "${EMPTY_DOCKER_CONFIG}"
export DOCKER_CONFIG="${EMPTY_DOCKER_CONFIG}"
unset DOCKER_AUTH_CONFIG || true
export GH_TOKEN=""
export GITHUB_TOKEN=""

echo "DOCKER_CONFIG=${DOCKER_CONFIG} (empty)"
echo "GH_TOKEN is empty: $([ -z "${GH_TOKEN}" ] && echo yes || echo no)"

inspect_raw() {
  local ref="$1"
  if [ -n "${COMMUNITY_INDEPENDENCE_INSPECT_CMD:-}" ]; then
    "${COMMUNITY_INDEPENDENCE_INSPECT_CMD}" "${ref}"
  else
    command -v docker >/dev/null 2>&1 || die "docker is required"
    docker buildx imagetools inspect --raw "${ref}"
  fi
}

pull_platform() {
  local platform="$1"
  local ref="$2"
  echo "${platform} ${ref}" >> "${PULL_LOG}"
  if [ -n "${COMMUNITY_INDEPENDENCE_PULL_CMD:-}" ]; then
    "${COMMUNITY_INDEPENDENCE_PULL_CMD}" "${platform}" "${ref}"
  else
    command -v docker >/dev/null 2>&1 || die "docker is required"
    docker pull --platform "${platform}" "${ref}"
  fi
}

save_image() {
  local ref="$1"
  local out="$2"
  if [ -n "${COMMUNITY_INDEPENDENCE_SAVE_CMD:-}" ]; then
    "${COMMUNITY_INDEPENDENCE_SAVE_CMD}" "${ref}" "${out}"
  else
    docker save -o "${out}" "${ref}"
  fi
}

inspect_config() {
  local ref="$1"
  if [ -n "${COMMUNITY_INDEPENDENCE_CONFIG_CMD:-}" ]; then
    "${COMMUNITY_INDEPENDENCE_CONFIG_CMD}" "${ref}"
  else
    docker image inspect "${ref}" --format '{{json .}}'
  fi
}

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

scanned=0
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

  echo "==> resolve platform children for ${ref}"
  index_file="${WORKDIR}/${name}.index.json"
  inspect_raw "${ref}" > "${index_file}"
  platforms_json="$(python3 "${SCRIPT_DIR}/resolve_platform_digests.py" --index-file "${index_file}")" \
    || die "failed to resolve linux/amd64 and linux/arm64 for ${name}"

  repo="ghcr.io/siriusscan/${name}"
  for platform in linux/amd64 linux/arm64; do
    slug="$(printf '%s' "${platform}" | tr '/' '-')"
    child_digest="$(printf '%s' "${platforms_json}" | jq -r --arg p "${platform}" '.[$p]')"
    child_ref="${repo}@${child_digest}"
    label="${name}/${slug}"

    echo "==> anonymously pulling ${child_ref} --platform ${platform}"
    pull_platform "${platform}" "${child_ref}"

    echo "==> inspecting image config (no run) ${label}"
    cfg="$(inspect_config "${child_ref}")"
    printf '%s' "${cfg}" | python3 "${SCRIPT_DIR}/scan_text.py" \
      --root "${WORKDIR}" \
      --allowlist "${ALLOWLIST}" \
      --stdin-path "image/${label}/inspect.json" \
      || die "private marker in image inspect for ${label}"

    save_tar="${WORKDIR}/${name}-${slug}.docker-save.tar"
    echo "==> docker save ${label} (filesystem scan, no run)"
    save_image "${child_ref}" "${save_tar}"
    python3 "${SCRIPT_DIR}/scan_image_layers.py" \
      --save-tar "${save_tar}" \
      --allowlist "${ALLOWLIST}" \
      --image-label "${label}" \
      || die "layer scan failed for ${label}"
    scanned=$((scanned + 1))
  done
done < <(printf '%s' "${refs_json}" | jq -c '.[]')

[ "${scanned}" -eq 12 ] || die "expected 12 platform image scans, got ${scanned}"
pull_count="$(wc -l < "${PULL_LOG}" | tr -d ' ')"
[ "${pull_count}" -eq 12 ] || die "expected 12 child pulls, logged ${pull_count}"

echo "OK community independence image scan (6 indexes -> 12 platform digest refs)"
