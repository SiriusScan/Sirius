#!/usr/bin/env bash
# Static + fixture contract tests for release SBOM generation and Cosign signing.
# Invoked by scripts/test-core-manifest.sh (no GHCR / no real Syft or Cosign required).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FIXTURE_DIR="${PROJECT_ROOT}/testing/fixtures/core-manifest"
INVENTORY_FIXTURE="${FIXTURE_DIR}/core-build-inventory.fixture.json"
WORKFLOW="${PROJECT_ROOT}/.github/workflows/publish-release-image-tags.yml"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

# shellcheck source=scripts/release-components.sh
source "${SCRIPT_DIR}/release-components.sh"

pass() { echo "PASS: $*"; }
fail() { echo "FAIL: $*" >&2; exit 1; }

cd "${PROJECT_ROOT}"

echo "==> release signing/SBOM shell syntax"
for script in \
  scripts/release-components.sh \
  scripts/install-release-attest-tools.sh \
  scripts/generate-release-sboms.sh \
  scripts/sign-verify-release-images.sh \
  scripts/assert-release-sbom-assets.sh \
  scripts/test-release-signing-contract.sh
do
  bash -n "${script}"
done
pass "signing helper syntax"

echo "==> six release components contract"
[ "${#RELEASE_COMPONENTS[@]}" -eq 6 ] || fail "expected exactly six RELEASE_COMPONENTS"
for component in sirius-ui sirius-api sirius-engine sirius-postgres sirius-rabbitmq sirius-valkey; do
  printf '%s\n' "${RELEASE_COMPONENTS[@]}" | grep -qx "${component}" \
    || fail "missing component ${component}"
done
pass "six components listed"

echo "==> workflow covers six components with digest-pinned inventory inputs"
wf="$(cat "${WORKFLOW}")"
for component in "${RELEASE_COMPONENTS[@]}"; do
  printf '%s\n' "${wf}" | grep -q "${component}" || fail "workflow missing ${component}"
done
printf '%s\n' "${wf}" | grep -Eq 'generate-release-sboms\.sh' \
  || fail "workflow must invoke generate-release-sboms.sh"
printf '%s\n' "${wf}" | grep -Eq 'sign-verify-release-images\.sh' \
  || fail "workflow must invoke sign-verify-release-images.sh"
printf '%s\n' "${wf}" | grep -Eq 'assert-release-sbom-assets\.sh' \
  || fail "workflow must invoke assert-release-sbom-assets.sh"
printf '%s\n' "${wf}" | grep -Eq 'install-release-attest-tools\.sh' \
  || fail "workflow must install pinned Syft/Cosign tools"
pass "workflow invokes SBOM + signing helpers"

echo "==> workflow uses exact @sha256 inventory refs (no mutable latest for attest)"
attest_block="$(awk '
  /^  attest-release-images:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' "${WORKFLOW}")"
[ -n "${attest_block}" ] || fail "missing attest-release-images job"
printf '%s\n' "${attest_block}" | grep -Eq 'sign-and-verify| --mode sign' \
  || fail "attest job must sign images"
printf '%s\n' "${attest_block}" | grep -Eq 'sign-verify-release-images\.sh' \
  || fail "attest job must call sign-verify-release-images.sh"
printf '%s\n' "${attest_block}" | grep -Eq 'generate-release-sboms\.sh' \
  || fail "attest job must generate SBOMs"
# Forbid mutable latest as an attest input (allow comments only if not used as image input).
if printf '%s\n' "${attest_block}" | grep -vE '^\s*#' | grep -Eq '(:latest|source_tag:\s*latest|image_tag:\s*latest)'; then
  fail "attest-release-images must not use mutable latest inputs"
fi
pass "attest job is digest-oriented"

echo "==> required OIDC / package permissions for keyless Cosign"
printf '%s\n' "${attest_block}" | grep -Eq 'id-token:\s*write' \
  || fail "attest-release-images requires id-token: write for keyless Cosign"
printf '%s\n' "${attest_block}" | grep -Eq 'packages:\s*write' \
  || fail "attest-release-images requires packages: write to publish signatures"
pass "attest permissions"

echo "==> fail-closed publish ordering (SBOM+sign before draft=false)"
publish_block="$(awk '
  /^  publish-github-release:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' "${WORKFLOW}")"
printf '%s\n' "${publish_block}" | grep -Eq 'needs:.*attest-release-images' \
  || fail "publish-github-release must need attest-release-images"
# Ensure SBOM assert appears before publishing (draft=false).
assert_line="$(printf '%s\n' "${publish_block}" | grep -n 'assert-release-sbom-assets\.sh' | head -1 | cut -d: -f1)"
publish_line="$(printf '%s\n' "${publish_block}" | grep -n 'draft=false' | head -1 | cut -d: -f1)"
[ -n "${assert_line}" ] || fail "publish job must re-validate SBOM assets"
[ -n "${publish_line}" ] || fail "publish job must set draft=false"
[ "${assert_line}" -lt "${publish_line}" ] || fail "SBOM asset validation must precede draft=false"
# Upload of cdx assets before publish.
printf '%s\n' "${publish_block}" | grep -Eq 'sbom-.*\.cdx\.json|assert-release-sbom-assets' \
  || fail "publish job must handle six SBOM assets"
pass "fail-closed publish ordering"

echo "==> pinning policy for Syft/Cosign installers (checksums, no floating latest tool tags)"
install_script="$(cat scripts/install-release-attest-tools.sh)"
printf '%s\n' "${install_script}" | grep -Eq 'SYFT_SHA256=' || fail "Syft SHA256 pin missing"
printf '%s\n' "${install_script}" | grep -Eq 'COSIGN_SHA256=' || fail "Cosign SHA256 pin missing"
printf '%s\n' "${install_script}" | grep -Eq 'SYFT_VERSION=' || fail "Syft version pin missing"
printf '%s\n' "${install_script}" | grep -Eq 'COSIGN_VERSION=' || fail "Cosign version pin missing"
printf '%s\n' "${install_script}" | grep -Eq 'verify_sha256|sha256sum' || fail "checksum verification missing"
pass "tool pins + checksums"

echo "==> fixture: generate SBOMs from inventory digests via mock syft"
MOCK_SYFT="${TMP_DIR}/mock-syft.sh"
cat > "${MOCK_SYFT}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ref=""
out=""
while [ $# -gt 0 ]; do
  case "$1" in
    -o)
      out="${2#cyclonedx-json=}"
      shift 2
      ;;
    *)
      ref="$1"
      shift
      ;;
  esac
done
printf '%s' "${ref}" | grep -Eq '@sha256:[a-f0-9]{64}$' || { echo "mock syft requires @sha256 ref" >&2; exit 1; }
printf '%s' "${ref}" | grep -Eq ':latest@' && { echo "mock syft forbids latest" >&2; exit 1; }
[ -n "${out}" ] || { echo "missing -o cyclonedx-json=" >&2; exit 1; }
cat > "${out}" <<JSON
{"bomFormat":"CycloneDX","specVersion":"1.5","metadata":{"component":{"name":"mock","version":"0"}}}
JSON
EOF
chmod +x "${MOCK_SYFT}"

SBOM_DIR="${TMP_DIR}/sboms"
SYFT_CMD="bash ${MOCK_SYFT}" bash scripts/generate-release-sboms.sh \
  --inventory "${INVENTORY_FIXTURE}" \
  --tag v1.1.0 \
  --outdir "${SBOM_DIR}"
for component in "${RELEASE_COMPONENTS[@]}"; do
  asset="$(release_sbom_asset_name "${component}" "v1.1.0")"
  [ -f "${SBOM_DIR}/${asset}" ] || fail "missing generated ${asset}"
done
bash scripts/assert-release-sbom-assets.sh --tag v1.1.0 --dir "${SBOM_DIR}"
pass "fixture SBOM generation + assert"

echo "==> fixture: sign-verify uses exact @sha256 refs"
MOCK_COSIGN="${TMP_DIR}/mock-cosign.sh"
cat > "${MOCK_COSIGN}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
mode="$1"
shift
case "${mode}" in
  sign)
    [ "$1" = "--yes" ] || { echo "expected --yes" >&2; exit 1; }
    ref="$2"
    printf '%s' "${ref}" | grep -Eq '@sha256:[a-f0-9]{64}$' || exit 1
    printf '%s' "${ref}" | grep -Eq ':latest@' && exit 1
    echo "SIGNED ${ref}"
    ;;
  verify)
    ref=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --certificate-identity-regexp|--certificate-oidc-issuer)
          shift 2
          ;;
        *)
          ref="$1"
          shift
          ;;
      esac
    done
    printf '%s' "${ref}" | grep -Eq '@sha256:[a-f0-9]{64}$' || exit 1
    echo "VERIFIED ${ref}"
    ;;
  version)
    echo "mock-cosign"
    ;;
  *)
    echo "unexpected cosign mode ${mode}" >&2
    exit 1
    ;;
esac
EOF
chmod +x "${MOCK_COSIGN}"

COSIGN_CMD="bash ${MOCK_COSIGN}" \
  COSIGN_CERTIFICATE_IDENTITY_REGEXP='^https://github\.com/SiriusScan/Sirius/\.github/workflows/publish-release-image-tags\.yml@refs/heads/.+$' \
  bash scripts/sign-verify-release-images.sh \
    --inventory "${INVENTORY_FIXTURE}" \
    --mode sign-and-verify
pass "fixture cosign sign-and-verify digest refs"

echo "==> reject mutable latest inventory ref for SBOM generation"
BAD_INV="${TMP_DIR}/bad-inventory.json"
jq '.images["sirius-ui"].ref = "ghcr.io/siriusscan/sirius-ui:latest"' \
  "${INVENTORY_FIXTURE}" > "${BAD_INV}"
if SYFT_CMD="bash ${MOCK_SYFT}" bash scripts/generate-release-sboms.sh \
  --inventory "${BAD_INV}" --tag v1.1.0 --outdir "${TMP_DIR}/bad-sboms" 2>/dev/null; then
  fail "expected mutable latest inventory ref to be rejected"
fi
pass "reject mutable latest SBOM input"

echo "==> OIDC issuer + identity policy present in workflow"
printf '%s\n' "${attest_block}" | grep -Eq 'token\.actions\.githubusercontent\.com' \
  || fail "attest job must set GitHub Actions OIDC issuer"
printf '%s\n' "${attest_block}" | grep -Eq 'COSIGN_CERTIFICATE_IDENTITY_REGEXP|publish-release-image-tags\.yml' \
  || fail "attest job must pin Cosign certificate identity to this workflow"
pass "OIDC signing identity policy"

echo "All release signing/SBOM contract tests passed."
