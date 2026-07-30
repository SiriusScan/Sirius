#!/usr/bin/env bash
# Shared Community release component list (six public images).
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

release_sbom_asset_name() {
  local component="$1"
  local tag="$2"
  printf 'sbom-%s-%s.cdx.json' "${component}" "${tag}"
}
