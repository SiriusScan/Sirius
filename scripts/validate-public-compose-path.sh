#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

IMAGE_TAG_VALUE="${1:-${IMAGE_TAG:-latest}}"
: "${KEEP_PUBLIC_STACK_RUNNING:=0}"
: "${SIRIUS_IMAGE_PULL_POLICY:=always}"

cleanup() {
  if [ "${KEEP_PUBLIC_STACK_RUNNING}" = "1" ]; then
    return
  fi

  docker compose down --volumes --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

cd "${PROJECT_ROOT}"

echo "Resetting public compose stack state..."
docker compose down --volumes --remove-orphans >/dev/null 2>&1 || true

echo "Generating runtime config with installer..."
docker compose -f docker-compose.installer.yaml run --rm --build sirius-installer --non-interactive --no-print-secrets

export IMAGE_TAG="${IMAGE_TAG_VALUE}"
export SIRIUS_IMAGE_PULL_POLICY

echo "Verifying anonymous GHCR access for IMAGE_TAG=${IMAGE_TAG}..."
bash scripts/verify-ghcr-public-access.sh "${IMAGE_TAG}"

echo "Pulling compose-rendered public images..."
docker compose pull

echo "Starting public compose stack..."
docker compose up -d

echo "Verifying runtime auth contract..."
bash scripts/verify-runtime-auth-contract.sh

echo "Public compose path validated for IMAGE_TAG=${IMAGE_TAG}."
