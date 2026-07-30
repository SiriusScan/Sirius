#!/usr/bin/env bash
# Shared Community release component list and Cosign trust constants.
# Sourced by release-contract helpers; safe to `bash -n`.
# shellcheck disable=SC2034

RELEASE_COMPONENTS=(
  sirius-ui
  sirius-api
  sirius-engine
  sirius-postgres
  sirius-rabbitmq
  sirius-valkey
)

# Platform os/arch pairs for multi-arch SBOM coverage (OCI index children).
# Format: "<os>/<arch>:<asset-slug>"
RELEASE_SBOM_PLATFORMS=(
  "linux/amd64:linux-amd64"
  "linux/arm64:linux-arm64"
)

# Canonical trust root (intentionally not fork-dynamic).
CANONICAL_RELEASE_REPO="SiriusScan/Sirius"
CANONICAL_RELEASE_DEFAULT_BRANCH="main"
CANONICAL_RELEASE_REF="refs/heads/main"
CANONICAL_COSIGN_OIDC_ISSUER="https://token.actions.githubusercontent.com"
# Exact Fulcio subject for publish-release-image-tags.yml on main, anchored.
CANONICAL_COSIGN_CERTIFICATE_IDENTITY="https://github.com/SiriusScan/Sirius/.github/workflows/publish-release-image-tags.yml@refs/heads/main"
CANONICAL_COSIGN_CERTIFICATE_IDENTITY_REGEXP='^https://github\.com/SiriusScan/Sirius/\.github/workflows/publish-release-image-tags\.yml@refs/heads/main$'

release_sbom_asset_name() {
  local component="$1"
  local tag="$2"
  local platform_slug="$3"
  printf 'sbom-%s-%s-%s.cdx.json' "${component}" "${tag}" "${platform_slug}"
}

release_expected_sbom_count() {
  printf '%s' "$((${#RELEASE_COMPONENTS[@]} * ${#RELEASE_SBOM_PLATFORMS[@]}))"
}
