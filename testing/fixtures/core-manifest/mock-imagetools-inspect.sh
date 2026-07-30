#!/usr/bin/env bash
# Mock for `docker buildx imagetools inspect <ref> --format '{{json .}}'`.
# Maps ghcr.io/siriusscan/<component>:<tag> to a checked-in fixture digest.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_REF="${1:-}"

if [ -z "${IMAGE_REF}" ]; then
  echo "usage: $0 <image-ref>" >&2
  exit 2
fi

component="$(printf '%s' "${IMAGE_REF}" | sed -E 's|^ghcr\.io/siriusscan/([^:@]+).*|\1|')"
digest_file="${SCRIPT_DIR}/digests/${component}.digest"

if [ ! -f "${digest_file}" ]; then
  echo "ERROR: no fixture digest for component '${component}' (ref=${IMAGE_REF})" >&2
  exit 1
fi

digest="$(tr -d '[:space:]' < "${digest_file}")"
if ! printf '%s' "${digest}" | grep -Eq '^sha256:[a-f0-9]{64}$'; then
  echo "ERROR: invalid fixture digest in ${digest_file}" >&2
  exit 1
fi

# Minimal JSON shape matching docker buildx imagetools inspect --format '{{json .}}'
jq -n --arg digest "${digest}" '{manifest: {digest: $digest, mediaType: "application/vnd.oci.image.index.v1+json"}}'
