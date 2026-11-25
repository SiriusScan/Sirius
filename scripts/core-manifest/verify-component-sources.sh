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
  go_mod=$(gh api -H 'Accept: application/vnd.github.raw+json' "repos/SiriusScan/${component}/contents/go.mod?ref=${commit}")
  actual=$(read_version <<<"$go_mod")
  [ "$actual" = "$expected" ] || die "$component go.mod version mismatch"
  if [ "$component" = app-scanner ]; then
    scanner_go_mod="$go_mod"
  fi
done
for component in sirius-api app-scanner app-agent; do
  version=$(jq -r --arg n "$component" '.component_dependencies[$n].go_api_version' "$manifest")
  expected=$(jq -r --arg n "$component" '.component_dependencies[$n].go_api_commit' "$manifest")
  actual=$(gh api "repos/SiriusScan/go-api/commits/${version}" --jq .sha)
  [ "$actual" = "$expected" ] || die "$component SDK release commit mismatch"
done
pingpp_version=$(jq -r '.component_dependencies["app-scanner"].pingpp_version // empty' "$manifest")
if [ -n "$pingpp_version" ]; then
  actual=$(awk '$1 == "github.com/SiriusScan/pingpp" {print $2}' <<<"$scanner_go_mod")
  [ "$actual" = "$pingpp_version" ] || die "scanner pingpp module version mismatch"
  if grep -Eq '^[[:space:]]*(replace[[:space:]]+)?github\.com/SiriusScan/pingpp[[:space:]].*=>' <<<"$scanner_go_mod"; then
    die "scanner pingpp module has a replacement"
  fi
  expected=$(jq -r '.component_pins.PINGPP_COMMIT_SHA' "$manifest")
  if [[ "$pingpp_version" =~ -([0-9]{14})-([a-f0-9]{12})$ ]]; then
    stamp="${BASH_REMATCH[1]}"
    revision="${BASH_REMATCH[2]}"
    [[ "$expected" == "$revision"* ]] || die "pingpp pseudo-version revision mismatch"
    detail=$(gh api "repos/SiriusScan/pingpp/commits/${expected}")
    [ "$(jq -r '.sha' <<<"$detail")" = "$expected" ] || die "pingpp source commit mismatch"
    actual_stamp=$(jq -r '.commit.committer.date | gsub("[-:TZ]"; "")' <<<"$detail")
    [ "$actual_stamp" = "$stamp" ] || die "pingpp pseudo-version timestamp mismatch"
  else
    actual=$(gh api "repos/SiriusScan/pingpp/commits/${pingpp_version}" --jq .sha)
    [ "$actual" = "$expected" ] || die "pingpp module release commit mismatch"
  fi
fi
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
printf 'Verified component dependency and contract metadata against pinned sources\n'
