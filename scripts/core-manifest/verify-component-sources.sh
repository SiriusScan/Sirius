#!/usr/bin/env bash
# Verify published dependency and agent contract metadata against exact source.
set -euo pipefail
manifest=${1:?manifest path required}
release_src=${2:?release source path required}

die() { echo "ERROR: $*" >&2; exit 1; }
read_version() { awk '$1 == "github.com/SiriusScan/go-api" { print $2 }'; }
source_sha=$(jq -r '.metadata.source.commit' "$manifest")
[ "$(git -C "$release_src" rev-parse HEAD)" = "$source_sha" ] || die "release checkout mismatch"
api_version=$(read_version < "$release_src/sirius-api/go.mod.prod")
[ "$api_version" = "$(jq -r '.component_dependencies["sirius-api"].go_api_version' "$manifest")" ] || die "API go.mod version mismatch"

for component in app-scanner app-agent; do
  commit=$(jq -r --arg n "$component" '.component_dependencies[$n].source_commit' "$manifest")
  expected=$(jq -r --arg n "$component" '.component_dependencies[$n].go_api_version' "$manifest")
  actual=$(gh api -H 'Accept: application/vnd.github.raw+json' "repos/SiriusScan/${component}/contents/go.mod?ref=${commit}" | read_version)
  [ "$actual" = "$expected" ] || die "$component go.mod version mismatch"
done
for component in sirius-api app-scanner app-agent; do
  version=$(jq -r --arg n "$component" '.component_dependencies[$n].go_api_version' "$manifest")
  expected=$(jq -r --arg n "$component" '.component_dependencies[$n].go_api_commit' "$manifest")
  actual=$(gh api "repos/SiriusScan/go-api/commits/${version}" --jq .sha)
  [ "$actual" = "$expected" ] || die "$component SDK release commit mismatch"
done
agent=$(jq -r '.component_pins.APP_AGENT_COMMIT_SHA' "$manifest")
agent_versions=$(gh api -H 'Accept: application/vnd.github.raw+json' "repos/SiriusScan/app-agent/contents/enrollment/version.go?ref=${agent}")
for entry in 'ProtocolVersion agent_protocol' 'AdmissionContractVersion agent_admission'; do
  read -r constant key <<< "$entry"
  value=$(printf '%s\n' "$agent_versions" | awk -v c="$constant" '$1 == "const" && $2 == c && $3 == "=" { gsub(/"/, "", $4); print $4 }')
  [ -n "$value" ] && [ "$value" = "$(jq -r --arg k "$key" '.contracts[$k]' "$manifest")" ] || die "agent $constant mismatch"
done
for key in ui_extension server_extension; do
  [ "$(jq -r --arg k "$key" '.contracts[$k]' "$manifest")" = "$(jq -r --arg k "$key" '.[$k]' "$release_src/sirius-ui/src/contracts/versions.json")" ] || die "$key mismatch"
done
printf 'Verified component SDK and contract metadata against pinned sources\n'
