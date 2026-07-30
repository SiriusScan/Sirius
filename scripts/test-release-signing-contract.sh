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

EXPECTED_SBOM_COUNT="$(release_expected_sbom_count)"
CANONICAL_IDENTITY_RE="${CANONICAL_COSIGN_CERTIFICATE_IDENTITY_REGEXP}"
CANONICAL_ISSUER="${CANONICAL_COSIGN_OIDC_ISSUER}"

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

echo "==> six release components and two platforms (12 SBOM assets)"
[ "${#RELEASE_COMPONENTS[@]}" -eq 6 ] || fail "expected exactly six RELEASE_COMPONENTS"
[ "${#RELEASE_SBOM_PLATFORMS[@]}" -eq 2 ] || fail "expected exactly two RELEASE_SBOM_PLATFORMS"
[ "${EXPECTED_SBOM_COUNT}" -eq 12 ] || fail "expected SBOM count 12, got ${EXPECTED_SBOM_COUNT}"
for component in sirius-ui sirius-api sirius-engine sirius-postgres sirius-rabbitmq sirius-valkey; do
  printf '%s\n' "${RELEASE_COMPONENTS[@]}" | grep -qx "${component}" \
    || fail "missing component ${component}"
done
pass "six components × two platforms"

echo "==> canonical Cosign identity constants"
[ "${CANONICAL_RELEASE_REPO}" = "SiriusScan/Sirius" ] || fail "canonical repo constant wrong"
[ "${CANONICAL_RELEASE_REF}" = "refs/heads/main" ] || fail "canonical ref constant wrong"
[ "${CANONICAL_ISSUER}" = "https://token.actions.githubusercontent.com" ] || fail "issuer constant wrong"
[ "${CANONICAL_IDENTITY_RE}" = '^https://github\.com/SiriusScan/Sirius/\.github/workflows/publish-release-image-tags\.yml@refs/heads/main$' ] \
  || fail "canonical identity regexp mismatch"
pass "canonical identity constants"

echo "==> workflow trust root + SBOM/signing helpers"
wf="$(cat "${WORKFLOW}")"
printf '%s\n' "${wf}" | grep -Eq 'SiriusScan/Sirius' \
  || fail "workflow must hard-require SiriusScan/Sirius"
printf '%s\n' "${wf}" | grep -Eq 'refs/heads/main' \
  || fail "workflow must hard-require refs/heads/main"
printf '%s\n' "${wf}" | grep -Fq "${CANONICAL_IDENTITY_RE}" \
  || fail "workflow must pin exact canonical Cosign identity regexp"
printf '%s\n' "${wf}" | grep -Eq 'generate-release-sboms\.sh' \
  || fail "workflow must invoke generate-release-sboms.sh"
printf '%s\n' "${wf}" | grep -Eq 'sign-verify-release-images\.sh' \
  || fail "workflow must invoke sign-verify-release-images.sh"
printf '%s\n' "${wf}" | grep -Eq 'assert-release-sbom-assets\.sh' \
  || fail "workflow must invoke assert-release-sbom-assets.sh"
printf '%s\n' "${wf}" | grep -Eq 'install-release-attest-tools\.sh' \
  || fail "workflow must install pinned Syft/Cosign tools"
pass "workflow trust root + helpers"

echo "==> attest job requires exact --mode sign-and-verify"
attest_block="$(awk '
  /^  attest-release-images:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' "${WORKFLOW}")"
[ -n "${attest_block}" ] || fail "missing attest-release-images job"
printf '%s\n' "${attest_block}" | grep -Eq -- '--mode[[:space:]]+sign-and-verify' \
  || fail "attest job must use --mode sign-and-verify"
if printf '%s\n' "${attest_block}" | grep -Eq -- '--mode[[:space:]]+sign([[:space:]]|$)'; then
  fail "--mode sign alone is forbidden; require --mode sign-and-verify"
fi
printf '%s\n' "${attest_block}" | grep -Eq 'id-token:\s*write' \
  || fail "attest-release-images requires id-token: write"
printf '%s\n' "${attest_block}" | grep -Eq 'packages:\s*write' \
  || fail "attest-release-images requires packages: write"
if printf '%s\n' "${attest_block}" | grep -vE '^\s*#' | grep -Eq '(:latest|source_tag:\s*latest|image_tag:\s*latest)'; then
  fail "attest-release-images must not use mutable latest inputs"
fi
pass "attest sign-and-verify + permissions"

echo "==> publish job final Cosign verify before draft=false"
publish_block="$(awk '
  /^  publish-github-release:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' "${WORKFLOW}")"
printf '%s\n' "${publish_block}" | grep -Eq 'needs:.*attest-release-images' \
  || fail "publish-github-release must need attest-release-images"
printf '%s\n' "${publish_block}" | grep -Eq 'packages:\s*read' \
  || fail "publish job requires packages: read for Cosign verify"
if printf '%s\n' "${publish_block}" | grep -Eq 'id-token:'; then
  fail "publish job must not request id-token"
fi
printf '%s\n' "${publish_block}" | grep -Eq -- '--mode[[:space:]]+verify' \
  || fail "publish job must re-verify with --mode verify"
verify_line="$(printf '%s\n' "${publish_block}" | grep -n -- '--mode verify' | head -1 | cut -d: -f1)"
publish_line="$(printf '%s\n' "${publish_block}" | grep -n 'draft=false' | head -1 | cut -d: -f1)"
assert_line="$(printf '%s\n' "${publish_block}" | grep -n 'assert-release-sbom-assets\.sh' | tail -1 | cut -d: -f1)"
[ -n "${verify_line}" ] && [ -n "${publish_line}" ] && [ -n "${assert_line}" ] \
  || fail "publish ordering markers missing"
[ "${assert_line}" -lt "${verify_line}" ] || fail "SBOM assert must precede final Cosign verify"
[ "${verify_line}" -lt "${publish_line}" ] || fail "final Cosign verify must precede draft=false"
printf '%s\n' "${publish_block}" | grep -Eq 'exactly twelve|SBOM files before upload, got|linux-\*\.cdx\.json' \
  || fail "publish job must expect twelve platform SBOM assets"
pass "fail-closed publish ordering"

echo "==> pinning policy for Syft/Cosign installers"
install_script="$(cat scripts/install-release-attest-tools.sh)"
printf '%s\n' "${install_script}" | grep -Eq 'SYFT_SHA256=' || fail "Syft SHA256 pin missing"
printf '%s\n' "${install_script}" | grep -Eq 'COSIGN_SHA256=' || fail "Cosign SHA256 pin missing"
printf '%s\n' "${install_script}" | grep -Eq -- '--tools' || fail "install script must support --tools selection"
pass "tool pins + checksums"

echo "==> fixture: platform SBOM generation from mock index inspect + mock syft"
MOCK_INSPECT="${TMP_DIR}/mock-inspect-raw.sh"
cat > "${MOCK_INSPECT}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ref="${1:-}"
printf '%s' "${ref}" | grep -Eq '@sha256:[a-f0-9]{64}$' || { echo "inspect requires @sha256" >&2; exit 1; }
component="$(printf '%s' "${ref}" | sed -E 's#.*/([^@]+)@.*#\1#')"
# Deterministic fake platform digests derived from component name length parity.
case "${component}" in
  sirius-ui)       amd=sha256:1111111111111111111111111111111111111111111111111111111111111111; arm=sha256:2111111111111111111111111111111111111111111111111111111111111111 ;;
  sirius-api)      amd=sha256:1222222222222222222222222222222222222222222222222222222222222222; arm=sha256:2222222222222222222222222222222222222222222222222222222222222222 ;;
  sirius-engine)   amd=sha256:1333333333333333333333333333333333333333333333333333333333333333; arm=sha256:2333333333333333333333333333333333333333333333333333333333333333 ;;
  sirius-postgres) amd=sha256:1444444444444444444444444444444444444444444444444444444444444444; arm=sha256:2444444444444444444444444444444444444444444444444444444444444444 ;;
  sirius-rabbitmq) amd=sha256:1555555555555555555555555555555555555555555555555555555555555555; arm=sha256:2555555555555555555555555555555555555555555555555555555555555555 ;;
  sirius-valkey)   amd=sha256:1666666666666666666666666666666666666666666666666666666666666666; arm=sha256:2666666666666666666666666666666666666666666666666666666666666666 ;;
  *) echo "unknown component ${component}" >&2; exit 1 ;;
esac
cat <<JSON
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.index.v1+json",
  "manifests": [
    {"mediaType":"application/vnd.oci.image.manifest.v1+json","digest":"${amd}","size":1,"platform":{"architecture":"amd64","os":"linux"}},
    {"mediaType":"application/vnd.oci.image.manifest.v1+json","digest":"${arm}","size":1,"platform":{"architecture":"arm64","os":"linux"}},
    {"mediaType":"application/vnd.oci.image.manifest.v1+json","digest":"sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","size":1,"platform":{"architecture":"unknown","os":"unknown"}}
  ]
}
JSON
EOF
chmod +x "${MOCK_INSPECT}"

MOCK_SYFT="${TMP_DIR}/mock-syft.sh"
SYFT_LOG="${TMP_DIR}/syft-refs.log"
: > "${SYFT_LOG}"
cat > "${MOCK_SYFT}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
ref=""
out=""
while [ \$# -gt 0 ]; do
  case "\$1" in
    -o)
      out="\${2#cyclonedx-json=}"
      shift 2
      ;;
    *)
      ref="\$1"
      shift
      ;;
  esac
done
printf '%s' "\${ref}" | grep -Eq '@sha256:[a-f0-9]{64}\$' || { echo "mock syft requires @sha256 ref" >&2; exit 1; }
printf '%s' "\${ref}" | grep -Eq ':latest@' && { echo "mock syft forbids latest" >&2; exit 1; }
# Must be platform digest refs, not the inventory index digests from the fixture.
case "\${ref}" in
  *aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*|\
  *bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb*|\
  *cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc*|\
  *dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd*|\
  *eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee*|\
  *ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff*)
    echo "mock syft refused inventory index digest; expected platform child digest" >&2
    exit 1
    ;;
esac
[ -n "\${out}" ] || { echo "missing -o cyclonedx-json=" >&2; exit 1; }
echo "\${ref}" >> "${SYFT_LOG}"
cat > "\${out}" <<JSON
{"bomFormat":"CycloneDX","specVersion":"1.5","metadata":{"component":{"name":"mock","version":"0"}}}
JSON
EOF
chmod +x "${MOCK_SYFT}"

SBOM_DIR="${TMP_DIR}/sboms"
RELEASE_IMAGE_INSPECT_RAW_CMD="bash ${MOCK_INSPECT}" \
  SYFT_CMD="bash ${MOCK_SYFT}" \
  bash scripts/generate-release-sboms.sh \
    --inventory "${INVENTORY_FIXTURE}" \
    --tag v1.1.0 \
    --outdir "${SBOM_DIR}"

for component in "${RELEASE_COMPONENTS[@]}"; do
  for platform_entry in "${RELEASE_SBOM_PLATFORMS[@]}"; do
    slug="${platform_entry##*:}"
    asset="$(release_sbom_asset_name "${component}" "v1.1.0" "${slug}")"
    [ -f "${SBOM_DIR}/${asset}" ] || fail "missing generated ${asset}"
  done
done
bash scripts/assert-release-sbom-assets.sh --tag v1.1.0 --dir "${SBOM_DIR}"
syft_count="$(wc -l < "${SYFT_LOG}" | tr -d ' ')"
[ "${syft_count}" -eq 12 ] || fail "expected 12 platform syft scans, got ${syft_count}"
# Every scanned ref must be immutable digest form.
while IFS= read -r scanned; do
  printf '%s' "${scanned}" | grep -Eq '^ghcr\.io/siriusscan/[^@]+@sha256:[a-f0-9]{64}$' \
    || fail "non-immutable syft input: ${scanned}"
done < "${SYFT_LOG}"
pass "fixture platform SBOM generation + assert"

echo "==> fixture: cosign verify receives exact identity + issuer flags"
MOCK_COSIGN="${TMP_DIR}/mock-cosign.sh"
COSIGN_LOG="${TMP_DIR}/cosign.log"
: > "${COSIGN_LOG}"
cat > "${MOCK_COSIGN}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
mode="\$1"
shift
case "\${mode}" in
  sign)
    [ "\$1" = "--yes" ] || { echo "expected --yes" >&2; exit 1; }
    ref="\$2"
    printf '%s' "\${ref}" | grep -Eq '@sha256:[a-f0-9]{64}\$' || exit 1
    echo "SIGNED \${ref}" | tee -a "${COSIGN_LOG}"
    ;;
  verify)
    identity=""
    issuer=""
    ref=""
    while [ \$# -gt 0 ]; do
      case "\$1" in
        --certificate-identity-regexp)
          identity="\$2"
          shift 2
          ;;
        --certificate-oidc-issuer)
          issuer="\$2"
          shift 2
          ;;
        *)
          ref="\$1"
          shift
          ;;
      esac
    done
    [ -n "\${identity}" ] || { echo "missing --certificate-identity-regexp" >&2; exit 1; }
    [ -n "\${issuer}" ] || { echo "missing --certificate-oidc-issuer" >&2; exit 1; }
    [ "\${identity}" = '${CANONICAL_IDENTITY_RE}' ] || {
      echo "unexpected identity regexp: \${identity}" >&2
      exit 1
    }
    [ "\${issuer}" = '${CANONICAL_ISSUER}' ] || {
      echo "unexpected issuer: \${issuer}" >&2
      exit 1
    }
    printf '%s' "\${ref}" | grep -Eq '@sha256:[a-f0-9]{64}\$' || exit 1
    echo "VERIFIED \${ref}" | tee -a "${COSIGN_LOG}"
    ;;
  version)
    echo "mock-cosign"
    ;;
  *)
    echo "unexpected cosign mode \${mode}" >&2
    exit 1
    ;;
esac
EOF
chmod +x "${MOCK_COSIGN}"

COSIGN_CMD="bash ${MOCK_COSIGN}" \
  COSIGN_CERTIFICATE_IDENTITY_REGEXP="${CANONICAL_IDENTITY_RE}" \
  COSIGN_CERTIFICATE_OIDC_ISSUER="${CANONICAL_ISSUER}" \
  bash scripts/sign-verify-release-images.sh \
    --inventory "${INVENTORY_FIXTURE}" \
    --mode sign-and-verify
grep -c '^VERIFIED ' "${COSIGN_LOG}" | grep -qx 6 || fail "expected 6 verified refs"
pass "fixture cosign sign-and-verify with exact trust flags"

echo "==> negative: wrong identity/issuer rejected"
if COSIGN_CMD="bash ${MOCK_COSIGN}" \
  COSIGN_CERTIFICATE_IDENTITY_REGEXP='^https://github\.com/evil/fork/\.github/workflows/publish-release-image-tags\.yml@refs/heads/main$' \
  COSIGN_CERTIFICATE_OIDC_ISSUER="${CANONICAL_ISSUER}" \
  bash scripts/sign-verify-release-images.sh \
    --inventory "${INVENTORY_FIXTURE}" \
    --mode verify 2>/dev/null; then
  fail "expected non-canonical identity to be rejected"
fi
if COSIGN_CMD="bash ${MOCK_COSIGN}" \
  COSIGN_CERTIFICATE_IDENTITY_REGEXP="${CANONICAL_IDENTITY_RE}" \
  COSIGN_CERTIFICATE_OIDC_ISSUER='https://evil.example/oidc' \
  bash scripts/sign-verify-release-images.sh \
    --inventory "${INVENTORY_FIXTURE}" \
    --mode verify 2>/dev/null; then
  fail "expected non-canonical issuer to be rejected"
fi
pass "reject non-canonical identity/issuer"

echo "==> negative: verify mock fails if identity or issuer flags omitted"
MOCK_COSIGN_LOOSE="${TMP_DIR}/mock-cosign-loose.sh"
cat > "${MOCK_COSIGN_LOOSE}" <<'EOF'
#!/usr/bin/env bash
# Deliberately accepts verify without flags — used only to prove our script always passes both.
set -euo pipefail
echo "should-not-run-without-flags" >&2
exit 0
EOF
chmod +x "${MOCK_COSIGN_LOOSE}"
# Directly invoke a minimal check that our verify_one path always includes both flags by
# grepping the sign-verify script contract.
grep -Eq -- '--certificate-identity-regexp "\$\{IDENTITY_REGEXP\}"' scripts/sign-verify-release-images.sh \
  || fail "sign-verify must pass --certificate-identity-regexp"
grep -Eq -- '--certificate-oidc-issuer "\$\{OIDC_ISSUER\}"' scripts/sign-verify-release-images.sh \
  || fail "sign-verify must pass --certificate-oidc-issuer"
pass "verify flags always supplied"

echo "==> reject mutable latest inventory ref for SBOM generation"
BAD_INV="${TMP_DIR}/bad-inventory.json"
jq '.images["sirius-ui"].ref = "ghcr.io/siriusscan/sirius-ui:latest"' \
  "${INVENTORY_FIXTURE}" > "${BAD_INV}"
if RELEASE_IMAGE_INSPECT_RAW_CMD="bash ${MOCK_INSPECT}" \
  SYFT_CMD="bash ${MOCK_SYFT}" \
  bash scripts/generate-release-sboms.sh \
    --inventory "${BAD_INV}" --tag v1.1.0 --outdir "${TMP_DIR}/bad-sboms" 2>/dev/null; then
  fail "expected mutable latest inventory ref to be rejected"
fi
pass "reject mutable latest SBOM input"

echo "==> reject index missing a required platform"
MOCK_INSPECT_ONE="${TMP_DIR}/mock-inspect-one.sh"
cat > "${MOCK_INSPECT_ONE}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cat <<'JSON'
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.index.v1+json",
  "manifests": [
    {"mediaType":"application/vnd.oci.image.manifest.v1+json","digest":"sha256:1111111111111111111111111111111111111111111111111111111111111111","size":1,"platform":{"architecture":"amd64","os":"linux"}}
  ]
}
JSON
EOF
chmod +x "${MOCK_INSPECT_ONE}"
if RELEASE_IMAGE_INSPECT_RAW_CMD="bash ${MOCK_INSPECT_ONE}" \
  SYFT_CMD="bash ${MOCK_SYFT}" \
  bash scripts/generate-release-sboms.sh \
    --inventory "${INVENTORY_FIXTURE}" --tag v1.1.0 --outdir "${TMP_DIR}/one-plat" 2>/dev/null; then
  fail "expected single-platform index to be rejected"
fi
pass "reject incomplete platform index"

echo "All release signing/SBOM contract tests passed."
