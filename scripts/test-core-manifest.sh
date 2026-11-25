#!/usr/bin/env bash
# Local tests for core-manifest / inventory generation and strict validation.
# No GHCR required (uses fixtures + mock imagetools inspect).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FIXTURE_DIR="${PROJECT_ROOT}/testing/fixtures/core-manifest"
MOCK_INSPECT="${FIXTURE_DIR}/mock-imagetools-inspect.sh"
INVENTORY_FIXTURE="${FIXTURE_DIR}/core-build-inventory.fixture.json"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

pass() { echo "PASS: $*"; }
fail() { echo "FAIL: $*" >&2; exit 1; }

cd "${PROJECT_ROOT}"

echo "==> bash -n syntax checks"
bash -n scripts/generate-core-manifest.sh
bash -n scripts/validate-core-manifest.sh
bash -n scripts/snapshot-core-build-inventory.sh
bash -n scripts/ghcr-ensure-write-once-tag.sh
bash -n scripts/gh-release-draft-state.sh
bash -n scripts/ci-dispatch-allowlist.sh
bash -n scripts/resolve-core-build-inventory.sh
bash -n scripts/release-components.sh
bash -n scripts/install-release-attest-tools.sh
bash -n scripts/generate-release-sboms.sh
bash -n scripts/sign-verify-release-images.sh
bash -n scripts/assert-release-sbom-assets.sh
bash -n scripts/test-release-signing-contract.sh
bash -n scripts/test-community-independence.sh
bash -n scripts/community-independence/scan.sh
bash -n scripts/test-core-manifest.sh
bash -n "${MOCK_INSPECT}"
pass "shell syntax"

echo "==> ci.yml merge jobs declare detect-changes dependency"
for job in merge-ui merge-api merge-engine; do
  # Extract the job block's needs line and require detect-changes.
  block="$(awk -v j="${job}:" '
    $0 ~ "^  " j {grab=1; next}
    grab && $0 ~ /^  [a-zA-Z0-9_]+:/ {exit}
    grab {print}
  ' .github/workflows/ci.yml)"
  printf '%s\n' "${block}" | grep -Eq 'needs:.*detect-changes' \
    || fail "${job} must directly need detect-changes"
done
pass "merge jobs need detect-changes"

echo "==> release inventory requires commit-built images"
inventory_block="$(awk '
  /^  core-build-inventory:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' .github/workflows/ci.yml)"
grep -q "result == 'skipped'" <<<"${inventory_block}" \
  && fail "core-build-inventory must not accept skipped build or merge jobs"
for dependency in build-ui build-api build-engine build-infra merge-ui merge-api merge-engine merge-infra test; do
  grep -q "needs.${dependency}.result == 'success'" <<<"${inventory_block}" \
    || fail "core-build-inventory must require ${dependency} success"
done
pass "release inventory requires commit-built images"

echo "==> informational dispatches have independent CI concurrency groups"
actual_group="$(awk '/^concurrency:/ { group=1; next } group && /^  cancel-in-progress:/ { exit } group { print }' .github/workflows/ci.yml)"
expected_group="$(cat <<'EOF'
  group: >-
    ${{ github.workflow }}-${{ github.ref }}${{
      github.event_name == 'repository_dispatch' && (
        contains(
          fromJSON('["SiriusScan/go-api","go-api","SiriusScan/app-scanner","app-scanner"]'),
          github.event.client_payload.submodule
        ) || (
          github.event.client_payload.engine_promotion == 'source-pin-v1' &&
          contains(fromJSON('["SiriusScan/app-terminal","app-terminal"]'), github.event.client_payload.submodule)
        )
      ) && format('-notification-{0}', github.run_id) || ''
    }}
EOF
)"
[ "${actual_group}" = "${expected_group}" ] \
  || fail "CI must isolate informational dispatches without changing the per-ref build group"
pass "informational dispatch concurrency groups"

echo "==> dispatch allowlist rejects unknown / non-sha payloads"
if SUBMODULE=evil/repo COMMIT_SHA="${FAKE_COMMIT:-0123456789abcdef0123456789abcdef01234567}" \
  bash scripts/ci-dispatch-allowlist.sh 2>/dev/null; then
  fail "expected disallowed submodule to fail"
fi
if SUBMODULE=evil/go-api COMMIT_SHA="${FAKE_COMMIT:-0123456789abcdef0123456789abcdef01234567}" \
  bash scripts/ci-dispatch-allowlist.sh 2>/dev/null; then
  fail "expected non-SiriusScan owner to fail"
fi
if SUBMODULE=go-api COMMIT_SHA=v0.0.19 bash scripts/ci-dispatch-allowlist.sh 2>/dev/null; then
  fail "expected non-40-hex commit to fail"
fi
TMP_OUT="${TMP_DIR}/dispatch.out"
TMP_ENV="${TMP_DIR}/dispatch.env"
TMP_SUMMARY="${TMP_DIR}/dispatch-summary.md"
DISPATCH_SHA=0123456789abcdef0123456789abcdef01234567
for sdk_repo in SiriusScan/go-api go-api; do
  for promotion in "" source-pin-v1; do
    : > "${TMP_OUT}"
    : > "${TMP_ENV}"
    : > "${TMP_SUMMARY}"
    SUBMODULE="${sdk_repo}" COMMIT_SHA="${DISPATCH_SHA}" ENGINE_PROMOTION="${promotion}" \
      EMIT_CHANGES=1 GITHUB_OUTPUT="${TMP_OUT}" GITHUB_STEP_SUMMARY="${TMP_SUMMARY}" \
      bash scripts/ci-dispatch-allowlist.sh
    expected_flags=$(printf '%s\n' "sirius_api_changes=false" "sirius_engine_changes=false")
    [ "$(cat "${TMP_OUT}")" = "${expected_flags}" ] || fail "SDK notification requested a build"
    grep -Fxq "Go API SDK revision ${DISPATCH_SHA} awaits a Core source-pin PR." "${TMP_SUMMARY}" \
      || fail "missing SDK dispatch summary"
    SUBMODULE="${sdk_repo}" COMMIT_SHA="${DISPATCH_SHA}" ENGINE_PROMOTION="${promotion}" \
      APPLY_PIN=1 GITHUB_ENV="${TMP_ENV}" bash scripts/ci-dispatch-allowlist.sh
    [ ! -s "${TMP_ENV}" ] || fail "SDK notification applied a source pin"
  done
done

: > "${TMP_OUT}"
GITHUB_OUTPUT="${TMP_OUT}" GITHUB_ENV="${TMP_ENV}" \
  SUBMODULE=SiriusScan/app-system-monitor COMMIT_SHA="${DISPATCH_SHA}" \
  APPLY_PIN=1 EMIT_CHANGES=1 bash scripts/ci-dispatch-allowlist.sh
grep -Fxq "APP_SYSTEM_MONITOR_COMMIT_SHA=${DISPATCH_SHA}" "${TMP_ENV}" \
  || fail "expected system monitor dispatch to apply its pin"
grep -Fxq "sirius_api_changes=true" "${TMP_OUT}" \
  || fail "expected system monitor dispatch to rebuild api"
grep -Fxq "sirius_engine_changes=true" "${TMP_OUT}" \
  || fail "expected system monitor dispatch to rebuild engine"
: > "${TMP_OUT}"
: > "${TMP_ENV}"
: > "${TMP_SUMMARY}"
GITHUB_OUTPUT="${TMP_OUT}" GITHUB_ENV="${TMP_ENV}" GITHUB_STEP_SUMMARY="${TMP_SUMMARY}" \
  SUBMODULE=SiriusScan/app-scanner \
  COMMIT_SHA=0123456789abcdef0123456789abcdef01234567 \
  ENGINE_PROMOTION=source-pin-v1 APPLY_PIN=1 EMIT_CHANGES=1 \
  bash scripts/ci-dispatch-allowlist.sh
[ ! -s "${TMP_ENV}" ] || fail "pending scanner dispatch applied a source pin"
grep -q '^sirius_engine_changes=false$' "${TMP_OUT}" || fail "pending scanner dispatch requested an engine build"
grep -q 'awaits an engine source-pin PR' "${TMP_SUMMARY}" || fail "missing scanner dispatch summary"
if SUBMODULE=SiriusScan/app-agent COMMIT_SHA="${DISPATCH_SHA}" \
  ENGINE_PROMOTION=source-pin-v1 bash scripts/ci-dispatch-allowlist.sh 2>/dev/null; then
  fail "accepted source-pin-v1 for an unsupported component"
fi
: > "${TMP_OUT}"
: > "${TMP_ENV}"
GITHUB_OUTPUT="${TMP_OUT}" GITHUB_ENV="${TMP_ENV}" \
  SUBMODULE=SiriusScan/app-scanner COMMIT_SHA=0123456789abcdef0123456789abcdef01234567 \
  APPLY_PIN=1 EMIT_CHANGES=1 bash scripts/ci-dispatch-allowlist.sh
[ ! -s "${TMP_ENV}" ] || fail "unversioned scanner dispatch applied a source pin"
grep -q '^sirius_engine_changes=false$' "${TMP_OUT}" || fail "unversioned scanner dispatch requested an engine build"

: > "${TMP_OUT}"
: > "${TMP_ENV}"
: > "${TMP_SUMMARY}"
GITHUB_OUTPUT="${TMP_OUT}" GITHUB_ENV="${TMP_ENV}" GITHUB_STEP_SUMMARY="${TMP_SUMMARY}" \
  SUBMODULE=SiriusScan/app-terminal COMMIT_SHA="${DISPATCH_SHA}" \
  ENGINE_PROMOTION=source-pin-v1 APPLY_PIN=1 EMIT_CHANGES=1 \
  bash scripts/ci-dispatch-allowlist.sh
[ ! -s "${TMP_ENV}" ] || fail "pending terminal dispatch applied a source pin"
[ "$(cat "${TMP_OUT}")" = "${expected_flags}" ] || fail "pending terminal dispatch requested a build"
grep -Fxq "Terminal revision ${DISPATCH_SHA} awaits an engine source-pin PR." "${TMP_SUMMARY}" \
  || fail "missing terminal dispatch summary"
: > "${TMP_OUT}"
GITHUB_OUTPUT="${TMP_OUT}" GITHUB_ENV="${TMP_ENV}" \
  SUBMODULE=SiriusScan/app-terminal COMMIT_SHA="${DISPATCH_SHA}" \
  APPLY_PIN=1 EMIT_CHANGES=1 bash scripts/ci-dispatch-allowlist.sh
[ "$(cat "${TMP_ENV}")" = "APP_TERMINAL_COMMIT_SHA=${DISPATCH_SHA}" ] \
  || fail "legacy terminal dispatch did not apply its source pin"
[ "$(cat "${TMP_OUT}")" = "sirius_engine_changes=true" ] \
  || fail "legacy terminal dispatch did not request an engine-only build"

if SUBMODULE=SiriusScan/pingpp COMMIT_SHA=0123456789abcdef0123456789abcdef01234567 \
  bash scripts/ci-dispatch-allowlist.sh 2>/dev/null; then
  fail "pingpp dispatch was accepted as an independent engine pin"
fi
pass "dispatch allowlist"


echo "==> go build validator"
(
  cd scripts/core-manifest
  go build -o /dev/null .
)
pass "go build"

FAKE_COMMIT="0123456789abcdef0123456789abcdef01234567"

echo "==> validate inventory fixture"
bash scripts/validate-core-manifest.sh --mode inventory --expect-commit "${FAKE_COMMIT}" "${INVENTORY_FIXTURE}"
pass "inventory fixture"

echo "==> generate manifest from inventory + Dockerfile pins"
GENERATED="${TMP_DIR}/core-manifest.yaml"
bash scripts/generate-core-manifest.sh \
  --tag v1.1.0 \
  --commit "${FAKE_COMMIT}" \
  --repo SiriusScan/Sirius \
  --inventory "${INVENTORY_FIXTURE}" \
  --output "${GENERATED}"
[ -f "${GENERATED}" ] || fail "manifest not written"
pass "generate from inventory"

echo "==> strict validate generated manifest"
bash scripts/validate-core-manifest.sh --expect-tag v1.1.0 --expect-commit "${FAKE_COMMIT}" "${GENERATED}"
pass "validate structure"

echo "==> verify scanner module and historical pingpp pin provenance"
[ "$(jq -r '.component_dependencies["app-scanner"].pingpp_version' "${GENERATED}")" = "v0.0.0-20261125012228-a6e4289ccaf4" ] \
  || fail "missing canonical pingpp dependency version"
[ "$(jq -r '.component_pins.PINGPP_COMMIT_SHA' "${GENERATED}")" = "a6e4289ccaf46421257f418d3f4a8b30c76d863b" ] \
  || fail "missing canonical pingpp source commit"
LEGACY_DF="${TMP_DIR}/Dockerfile.legacy-pingpp"
sed 's/^ARG APP_SCANNER_COMMIT_SHA=.*/ARG APP_SCANNER_COMMIT_SHA=15e25fbeb2d54c26c4790330b3f5ada9e90b2f4e/' \
  sirius-engine/Dockerfile > "${LEGACY_DF}"
printf '\nARG PINGPP_COMMIT_SHA=9508a16c40a49746feb7cab4b8c1c358246169b0\n' >> "${LEGACY_DF}"
LEGACY_MANIFEST="${TMP_DIR}/legacy-pingpp.yaml"
bash scripts/generate-core-manifest.sh \
  --tag v1.1.0 --commit "${FAKE_COMMIT}" --inventory "${INVENTORY_FIXTURE}" \
  --dockerfile "${LEGACY_DF}" --output "${LEGACY_MANIFEST}"
bash scripts/validate-core-manifest.sh --dockerfile "${LEGACY_DF}" "${LEGACY_MANIFEST}"
jq -e '.component_dependencies["app-scanner"] | has("pingpp_version") | not' "${LEGACY_MANIFEST}" >/dev/null \
  || fail "historical manifest received a canonical module version"
MISMATCH_DF="${TMP_DIR}/Dockerfile.mismatched-pingpp"
cp sirius-engine/Dockerfile "${MISMATCH_DF}"
printf '\nARG PINGPP_COMMIT_SHA=9508a16c40a49746feb7cab4b8c1c358246169b0\n' >> "${MISMATCH_DF}"
if bash scripts/generate-core-manifest.sh \
  --tag v1.1.0 --commit "${FAKE_COMMIT}" --inventory "${INVENTORY_FIXTURE}" \
  --dockerfile "${MISMATCH_DF}" --output "${TMP_DIR}/mismatched-pingpp.yaml" 2>/dev/null; then
  fail "mismatched legacy pin accepted for canonical scanner"
fi
pass "scanner pingpp provenance"

[ "$(jq -r '.contracts.rest_api' "${GENERATED}")" = "1.0.0" ] || fail "REST contract version mismatch"
jq '.contracts.rest_api = "invalid"' "${GENERATED}" > "${TMP_DIR}/bad-contract.yaml"
if bash scripts/validate-core-manifest.sh "${TMP_DIR}/bad-contract.yaml" 2>/dev/null; then
  fail "invalid REST contract version accepted"
fi
[ "$(jq -r '.contracts.resource_scope' "${GENERATED}")" = "1.0" ] || fail "SDK scope contract version mismatch"
[ "$(jq -r '.contracts.agent_protocol' "${GENERATED}")" = "1.0.0" ] || fail "agent protocol contract version mismatch"
jq '.contracts.resource_scope = "9.0"' "${GENERATED}" > "${TMP_DIR}/bad-sdk-contract.yaml"
if bash scripts/validate-core-manifest.sh "${TMP_DIR}/bad-sdk-contract.yaml" 2>/dev/null; then
  fail "SDK contract mapping mismatch accepted"
fi
pass "application contract version validation"

echo "==> verify digests against mock inspect"
export CORE_MANIFEST_INSPECT_CMD="bash ${MOCK_INSPECT}"
bash scripts/validate-core-manifest.sh \
  --expect-tag v1.1.0 \
  --verify-digests \
  "${GENERATED}"
pass "digest verification via mock"

echo "==> reject non-semver / short commit"
if bash scripts/generate-core-manifest.sh \
  --tag latest --commit "${FAKE_COMMIT}" --inventory "${INVENTORY_FIXTURE}" \
  --output "${TMP_DIR}/bad.yaml" 2>/dev/null; then
  fail "expected non-semver tag to be rejected"
fi
if bash scripts/generate-core-manifest.sh \
  --tag v1.1.0 --commit abcdef1 --inventory "${INVENTORY_FIXTURE}" \
  --output "${TMP_DIR}/bad2.yaml" 2>/dev/null; then
  fail "expected short commit to be rejected"
fi
pass "reject bad tag/commit"

echo "==> reject missing Dockerfile pin"
BAD_DOCKERFILE="${TMP_DIR}/Dockerfile.bad"
grep -v 'APP_AGENT_COMMIT_SHA' "${PROJECT_ROOT}/sirius-engine/Dockerfile" > "${BAD_DOCKERFILE}" || true
if bash scripts/generate-core-manifest.sh \
  --tag v1.1.0 --commit "${FAKE_COMMIT}" --inventory "${INVENTORY_FIXTURE}" \
  --dockerfile "${BAD_DOCKERFILE}" --output "${TMP_DIR}/missing-pin.yaml" 2>/dev/null; then
  fail "expected missing pin to be rejected"
fi
pass "reject missing pin"

echo "==> reject unknown GO_API pin without schema_map entry"
UNKNOWN_DF="${TMP_DIR}/Dockerfile.unknown-goapi"
sed 's/^ARG GO_API_COMMIT_SHA=.*/ARG GO_API_COMMIT_SHA=v9.9.9/' \
  "${PROJECT_ROOT}/sirius-engine/Dockerfile" > "${UNKNOWN_DF}"
if bash scripts/generate-core-manifest.sh \
  --tag v1.1.0 --commit "${FAKE_COMMIT}" --inventory "${INVENTORY_FIXTURE}" \
  --dockerfile "${UNKNOWN_DF}" --output "${TMP_DIR}/unknown-goapi.yaml" 2>/dev/null; then
  fail "expected unknown GO_API_COMMIT_SHA mapping to fail"
fi
pass "reject unknown GO_API schema mapping"

echo "==> reject duplicate keys / wrong nesting"
DUP="${TMP_DIR}/dup.yaml"
printf '%s\n' '{"apiVersion":"siriusscan.dev/v1","apiVersion":"x"}' > "${DUP}"
if bash scripts/validate-core-manifest.sh "${DUP}" 2>/dev/null; then
  fail "expected duplicate keys to be rejected"
fi
NEST="${TMP_DIR}/nest.yaml"
jq '.metadata.release_tag = {"oops": true}' "${GENERATED}" > "${NEST}"
if bash scripts/validate-core-manifest.sh "${NEST}" 2>/dev/null; then
  fail "expected wrong nesting/types to be rejected"
fi
pass "reject duplicates and wrong nesting"

echo "==> reject digest drift"
DRIFT="${TMP_DIR}/drift.yaml"
jq '.images["sirius-ui"].digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab" |
    .images["sirius-ui"].ref = "ghcr.io/siriusscan/sirius-ui@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"' \
  "${GENERATED}" > "${DRIFT}"
if bash scripts/validate-core-manifest.sh --verify-digests "${DRIFT}" 2>/dev/null; then
  fail "expected digest drift to be rejected"
fi
pass "reject digest drift"

echo "==> snapshot inventory via mock (no docker retag)"
SNAP="${TMP_DIR}/core-build-inventory.json"
CORE_MANIFEST_INSPECT_CMD="bash ${MOCK_INSPECT}" \
  bash scripts/snapshot-core-build-inventory.sh \
    --commit "${FAKE_COMMIT}" \
    --source-tag v1.1.0 \
    --smoke 0 \
    --output "${SNAP}"
bash scripts/validate-core-manifest.sh --mode inventory --expect-commit "${FAKE_COMMIT}" "${SNAP}"
pass "snapshot inventory mock path"

echo "==> deterministic ordering (ignore generated_at)"
SECOND="${TMP_DIR}/core-manifest-2.yaml"
sleep 1
bash scripts/generate-core-manifest.sh \
  --tag v1.1.0 --commit "${FAKE_COMMIT}" --inventory "${INVENTORY_FIXTURE}" \
  --output "${SECOND}"
norm() { jq 'del(.metadata.generated_at)' "$1"; }
if ! diff -u <(norm "${GENERATED}") <(norm "${SECOND}") >/dev/null; then
  diff -u <(norm "${GENERATED}") <(norm "${SECOND}") || true
  fail "manifest not stable aside from generated_at"
fi
pass "deterministic ordering"

echo "==> golden fixture (read-only; never overwrite checked-in file)"
GOLDEN="${FIXTURE_DIR}/core-manifest.fixture.yaml"
[ -f "${GOLDEN}" ] || fail "missing checked-in golden fixture: ${GOLDEN}"
bash scripts/validate-core-manifest.sh --expect-tag v1.1.0 --expect-commit "${FAKE_COMMIT}" "${GOLDEN}"
NORMALIZED="${TMP_DIR}/core-manifest.normalized.yaml"
jq --arg ts "1970-01-01T00:00:00Z" '.metadata.generated_at = $ts' "${GENERATED}" > "${NORMALIZED}"
if ! diff -u "${GOLDEN}" "${NORMALIZED}" >/dev/null; then
  diff -u "${GOLDEN}" "${NORMALIZED}" || true
  fail "generated manifest drifted from checked-in golden fixture"
fi
pass "golden fixture"

echo "==> go test validator (includes schema_map ↔ Dockerfile pin)"
(
  cd scripts/core-manifest
  go test ./...
)
pass "go test"

echo "==> release SBOM + Cosign signing contract"
bash scripts/test-release-signing-contract.sh
pass "release signing contract"

echo "==> community independence / private-leakage contract"
bash scripts/test-community-independence.sh
pass "community independence contract"

echo
echo "All core-manifest local tests passed."

python3 scripts/test-maintenance-release-lane.py
