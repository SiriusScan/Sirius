#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-siriusscan}"
GHCR_OWNER="${GHCR_OWNER:-SiriusScan}"

if [ "$#" -gt 0 ]; then
  PACKAGES=("$@")
else
  PACKAGES=(
    sirius-ui
    sirius-api
    sirius-engine
    sirius-postgres
    sirius-rabbitmq
    sirius-valkey
  )
fi

TOKEN=""
TOKEN_SOURCE=""

if [ -n "${GH_TOKEN:-}" ]; then
  TOKEN="${GH_TOKEN}"
  TOKEN_SOURCE="GH_TOKEN"
elif [ -n "${GHCR_PUBLICIZE_TOKEN:-}" ]; then
  TOKEN="${GHCR_PUBLICIZE_TOKEN}"
  TOKEN_SOURCE="GHCR_PUBLICIZE_TOKEN"
elif [ -n "${ADMIN_TOKEN:-}" ]; then
  TOKEN="${ADMIN_TOKEN}"
  TOKEN_SOURCE="ADMIN_TOKEN"
elif [ -n "${GHCR_PACKAGE_ADMIN_TOKEN:-}" ]; then
  TOKEN="${GHCR_PACKAGE_ADMIN_TOKEN}"
  TOKEN_SOURCE="GHCR_PACKAGE_ADMIN_TOKEN"
elif [ -n "${PUSH_TOKEN:-}" ]; then
  TOKEN="${PUSH_TOKEN}"
  TOKEN_SOURCE="PUSH_TOKEN"
elif [ -n "${GHCR_PUSH_TOKEN:-}" ]; then
  TOKEN="${GHCR_PUSH_TOKEN}"
  TOKEN_SOURCE="GHCR_PUSH_TOKEN"
fi

if [ -z "${TOKEN}" ]; then
  echo "::error::Set GHCR_PACKAGE_ADMIN_TOKEN (preferred) or GHCR_PUSH_TOKEN with organization Packages administration."
  exit 1
fi

export GH_TOKEN="${TOKEN}"

echo "Using ${TOKEN_SOURCE} to enforce public GHCR visibility for org/${GHCR_OWNER} packages (image namespace: ${IMAGE_NAMESPACE})."
if [[ "${TOKEN_SOURCE}" == "PUSH_TOKEN" || "${TOKEN_SOURCE}" == "GHCR_PUSH_TOKEN" ]]; then
  echo "::warning::Using a push token for package visibility changes. If this fails with 403, use GHCR_PACKAGE_ADMIN_TOKEN instead."
fi

for pkg in "${PACKAGES[@]}"; do
  package_path="/orgs/${GHCR_OWNER}/packages/container/${pkg}"
  echo "Setting ${package_path} -> public"

  if ! output="$(gh api \
    --method PATCH \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${package_path}" \
    -f visibility=public \
    2>&1 >/dev/null)"; then
    echo "${output}" >&2
    echo "::error::Failed to set ${pkg} public. Use GHCR_PACKAGE_ADMIN_TOKEN or a GHCR_PUSH_TOKEN that can administer org container packages."
    exit 1
  fi
done

echo "All Sirius GHCR packages are set to public (anonymous pull OK)."
