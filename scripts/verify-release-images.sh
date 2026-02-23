#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-ghcr.io/siriusscan}"

declare -a SERVICES=("sirius-ui" "sirius-api" "sirius-engine")

echo "Verifying release images for tag: ${IMAGE_TAG}"

for service in "${SERVICES[@]}"; do
  image_ref="${REGISTRY}/${service}:${IMAGE_TAG}"
  container_name="${service}"

  echo
  echo "Pulling ${image_ref}..."
  docker pull "${image_ref}" >/dev/null

  expected_id="$(docker image inspect "${image_ref}" --format '{{.Id}}')"
  running_image_ref="$(docker inspect "${container_name}" --format '{{.Config.Image}}' 2>/dev/null || true)"
  running_id="$(docker inspect "${container_name}" --format '{{.Image}}' 2>/dev/null || true)"

  if [ -z "${running_id}" ]; then
    echo "❌ ${container_name} is not running"
    exit 1
  fi

  echo "${container_name} config image: ${running_image_ref}"
  echo "${container_name} running image id: ${running_id}"
  echo "${container_name} expected image id: ${expected_id}"

  if [ "${running_id}" != "${expected_id}" ]; then
    echo "❌ ${container_name} is not running ${image_ref}"
    exit 1
  fi

  echo "✅ ${container_name} matches ${image_ref}"
done

echo
echo "All release image checks passed."
