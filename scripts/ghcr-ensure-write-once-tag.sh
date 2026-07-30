#!/usr/bin/env bash
# Ensure a GHCR tag is write-once relative to an expected digest.
#
# Usage:
#   bash scripts/ghcr-ensure-write-once-tag.sh <image-ref-without-tag> <tag> <sha256:digest>
#
# Behavior:
#   - target missing (manifest unknown/not found) -> create from @digest
#   - target exists with equal digest -> skip (idempotent)
#   - target exists with different digest -> fail
#   - auth/network/other inspect failures -> fail
set -euo pipefail

die() { echo "ERROR: $*" >&2; exit 1; }

BASE_REF="${1:-}"
TAG="${2:-}"
WANT_DIGEST="${3:-}"

[ -n "${BASE_REF}" ] || die "base image ref required"
[ -n "${TAG}" ] || die "tag required"
[ -n "${WANT_DIGEST}" ] || die "digest required"
printf '%s' "${WANT_DIGEST}" | grep -Eq '^sha256:[a-f0-9]{64}$' || die "invalid digest: ${WANT_DIGEST}"

TARGET_REF="${BASE_REF}:${TAG}"
DIGEST_REF="${BASE_REF}@${WANT_DIGEST}"

inspect_digest() {
  local ref="$1"
  local out err rc digest errfile
  errfile="$(mktemp)"
  set +e
  out="$(docker buildx imagetools inspect "${ref}" --format '{{json .}}' 2>"${errfile}")"
  rc=$?
  err="$(cat "${errfile}" 2>/dev/null || true)"
  rm -f "${errfile}"
  set -e
  if [ "${rc}" -eq 0 ]; then
    digest="$(printf '%s' "${out}" | jq -r '.manifest.digest // empty')"
    printf '%s' "${digest}" | grep -Eq '^sha256:[a-f0-9]{64}$' || die "invalid digest from inspect of ${ref}: ${digest:-<empty>}"
    printf '%s' "${digest}"
    return 0
  fi
  if printf '%s' "${err}" | grep -qiE 'manifest unknown|no such manifest|not found'; then
    return 2
  fi
  die "inspect failed for ${ref}: ${err}"
}

set +e
LIVE="$(inspect_digest "${TARGET_REF}")"
RC=$?
set -e

if [ "${RC}" -eq 0 ]; then
  if [ "${LIVE}" = "${WANT_DIGEST}" ]; then
    echo "SKIP write-once ${TARGET_REF} already at ${WANT_DIGEST}"
    exit 0
  fi
  die "write-once violation for ${TARGET_REF}: existing=${LIVE} wanted=${WANT_DIGEST}"
fi

if [ "${RC}" -ne 2 ]; then
  die "unexpected inspect status ${RC} for ${TARGET_REF}"
fi

echo "CREATE write-once ${TARGET_REF} from ${DIGEST_REF}"
docker buildx imagetools create -t "${TARGET_REF}" "${DIGEST_REF}"
LIVE="$(inspect_digest "${TARGET_REF}")"
[ "${LIVE}" = "${WANT_DIGEST}" ] || die "post-create parity failed for ${TARGET_REF}: ${LIVE} != ${WANT_DIGEST}"
echo "OK ${TARGET_REF} -> ${WANT_DIGEST}"
