#!/usr/bin/env bash
# Contract + canary tests for Community independence / private-leakage checks.
# Generates prohibited strings at runtime; does not commit real-looking secrets
# and never reads a private repository (public CI must stay credential-free).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CI_DIR="${PROJECT_ROOT}/scripts/community-independence"
ALLOWLIST="${CI_DIR}/policy/governance-allowlist.txt"
WORKFLOW="${PROJECT_ROOT}/.github/workflows/community-independence.yml"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

# shellcheck source=scripts/release-components.sh
source "${SCRIPT_DIR}/release-components.sh"

pass() { echo "PASS: $*"; }
fail() { echo "FAIL: $*" >&2; exit 1; }

# Assemble private markers at runtime (do not store real private-repo content).
ORG_DISPLAY="OpenSecurity""-Infosec"
ORG_LOWER="opensecurity""-infosec"
PRIVATE_REGISTRY="ghcr.io/${ORG_LOWER}/"
PRIVATE_MODULE="github.com/${ORG_DISPLAY}/sirius-pro"
PRO_CANARY="SIRIUS_PRO_""PRIVATE_RUNTIME_CANARY_V1"
FAKE_PAT="ghp_""$(printf 'a%.0s' {1..36})"

cd "${PROJECT_ROOT}"

echo "==> shell syntax"
for script in \
  scripts/test-community-independence.sh \
  scripts/community-independence/scan.sh \
  scripts/community-independence/scan_sboms.sh \
  scripts/community-independence/scan_images.sh \
  scripts/community-independence/assert_public_compose.sh \
  scripts/community-independence/download_public_release.sh
do
  bash -n "${script}"
done
pass "shell syntax"

echo "==> python compile"
python3 -m py_compile \
  scripts/community-independence/scan_text.py \
  scripts/community-independence/scan_archive.py \
  scripts/community-independence/scan_image_layers.py
pass "python compile"

echo "==> workflow YAML parses"
python3 - <<'PY'
import pathlib, sys
text = pathlib.Path(".github/workflows/community-independence.yml").read_text()
# Minimal structural checks without PyYAML.
assert "\nname:" in text or text.startswith("name:"), "missing workflow name"
assert "\non:\n" in text or "\non:" in text or text.startswith("on:"), "missing on:"
assert "\njobs:\n" in text or "\njobs:" in text, "missing jobs"
if "\t" in text:
    sys.exit("workflow contains tabs")
print("OK yaml structure")
PY
pass "workflow YAML structure"

echo "==> workflow least permissions + anonymous/no-secret contract"
wf="$(cat "${WORKFLOW}")"
printf '%s\n' "${wf}" | grep -Eq '^permissions:' || fail "top-level permissions required"
# contents: read only; forbid packages/id-token/write escalation.
perm_block="$(awk '
  /^permissions:/ {grab=1; print; next}
  grab && /^[^[:space:]]/ {exit}
  grab {print}
' "${WORKFLOW}")"
printf '%s\n' "${perm_block}" | grep -Eq 'contents:[[:space:]]*read' \
  || fail "permissions must include contents: read"
if printf '%s\n' "${wf}" | grep -Eiq 'packages:[[:space:]]*(read|write)|id-token:[[:space:]]*write|contents:[[:space:]]*write'; then
  fail "workflow must not request packages/id-token/write permissions"
fi
printf '%s\n' "${wf}" | grep -Fq 'persist-credentials: false' \
  || fail "checkout must set persist-credentials: false"
# Full SHA pins for uses:
while IFS= read -r use_line; do
  printf '%s\n' "${use_line}" | grep -Eq '@[0-9a-f]{40}' \
    || fail "action not full-SHA pinned: ${use_line}"
done < <(grep -E 'uses:[[:space:]]*' "${WORKFLOW}" | grep -v $'^\s*#' || true)
# No private checkout / registry login / org secrets / PAT (live YAML only).
live_wf="$(printf '%s\n' "${wf}" | grep -vE '^[[:space:]]*#')"
if printf '%s\n' "${live_wf}" | grep -Eiq 'opensecurity-infosec|OpenSecurity-Infosec'; then
  fail "workflow must not reference private org/registry"
fi
if printf '%s\n' "${live_wf}" | grep -Eq 'secrets\.'; then
  fail "workflow must not reference secrets.*"
fi
if printf '%s\n' "${live_wf}" | grep -Eiq 'docker/login-action|persist-credentials:[[:space:]]*true'; then
  fail "workflow must not login to registries or persist checkout credentials"
fi
if printf '%s\n' "${live_wf}" | grep -Eiq 'GHCR_TOKEN|PERSONAL_ACCESS|private_token'; then
  fail "workflow must not reference private tokens"
fi
# Credentials visibly emptied in scan/smoke steps.
printf '%s\n' "${wf}" | grep -Eq 'GH_TOKEN:[[:space:]]*""' \
  || fail "workflow must visibly empty GH_TOKEN during scans"
printf '%s\n' "${wf}" | grep -Eq 'GITHUB_TOKEN:[[:space:]]*""' \
  || fail "workflow must visibly empty GITHUB_TOKEN during scans"
pass "workflow permissions + anonymous contract"

echo "==> workflow trigger split (PR/push contract vs full public release)"
# Job names and if: conditions must exist as live YAML, not merely comments.
printf '%s\n' "${wf}" | grep -Eq '^  source-contract:' \
  || fail "missing source-contract job"
printf '%s\n' "${wf}" | grep -Eq '^  public-release-scan:' \
  || fail "missing public-release-scan job"
src_job="$(awk '
  /^  source-contract:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' "${WORKFLOW}")"
full_job="$(awk '
  /^  public-release-scan:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' "${WORKFLOW}")"
printf '%s\n' "${src_job}" | grep -Eq 'test-community-independence\.sh' \
  || fail "source-contract must run contract tests"
printf '%s\n' "${src_job}" | grep -Eq 'community-independence/scan\.sh|--mode[[:space:]]+source|scan_text\.py' \
  || fail "source-contract must run source leakage scan"
printf '%s\n' "${full_job}" | grep -Eq 'public-release|download_public_release|scan\.sh' \
  || fail "public-release-scan must run public release scan path"
# Full job restricted to main/schedule/workflow_dispatch.
on_block="$(awk '
  /^on:/ {grab=1; print; next}
  grab && /^[a-zA-Z]/ {exit}
  grab {print}
' "${WORKFLOW}")"
printf '%s\n' "${on_block}" | grep -Eq 'pull_request:' || fail "workflow must listen for pull_request"
printf '%s\n' "${on_block}" | grep -Eq 'schedule:' || fail "workflow must schedule full scans"
printf '%s\n' "${on_block}" | grep -Eq 'workflow_dispatch:' || fail "workflow must allow workflow_dispatch"
printf '%s\n' "${full_job}" | grep -Eq "github.event_name == 'schedule'|github.ref == 'refs/heads/main'|workflow_dispatch" \
  || fail "public-release-scan must gate on main/schedule/workflow_dispatch"
# Must not duplicate mutable latest path as the release subject.
if printf '%s\n' "${full_job}" | grep -vE '^[[:space:]]*#' | grep -Eq 'IMAGE_TAG:[[:space:]]*latest|:latest|tag:[[:space:]]*latest'; then
  fail "public-release-scan must not use mutable latest"
fi
printf '%s\n' "${full_job}" | grep -Eq 'v1\.1\.0' \
  || fail "public-release-scan must target public v1.1.0"
pass "workflow trigger split"

echo "==> allowlist is path-scoped and excludes runtime/build/workflow"
grep -Eq '^programs/bifurcation/' "${ALLOWLIST}" || fail "allowlist missing programs/"
grep -Eq '^tasks/pro-bifurcation\.json$' "${ALLOWLIST}" || fail "allowlist missing tasks file"
if grep -Eq '^\.github/workflows/|^scripts/|^docker-compose|^Dockerfile|^sirius-' "${ALLOWLIST}"; then
  fail "allowlist must never include runtime/build/workflow paths"
fi
# Behavioral: allowlisted governance path may mention private org; workflow path must not.
gov="${TMP_DIR}/gov-doc.md"
mkdir -p "${TMP_DIR}/documentation/dev-notes" "${TMP_DIR}/.github/workflows"
printf 'Boundary note: %s and %s\n' "${ORG_DISPLAY}" "${PRIVATE_REGISTRY}" \
  > "${TMP_DIR}/documentation/dev-notes/pro-bifurcation-plan.md"
# Use a temporary allowlist that matches fixture layout.
printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md" > "${TMP_DIR}/allow.txt"
if ! python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md"); then
  fail "allowlisted governance path should pass"
fi
printf 'image: %sfoo\n' "${PRIVATE_REGISTRY}" > "${TMP_DIR}/.github/workflows/evil.yml"
# Even if mistakenly allowlisted, workflows are never allowlisted.
printf '%s\n' ".github/workflows/evil.yml" >> "${TMP_DIR}/allow.txt"
if python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' ".github/workflows/evil.yml") 2>/dev/null; then
  fail "workflow path must never be allowlisted"
fi
pass "path-scoped allowlist behavior"

echo "==> canary: private registry/module/pro canary rejected"
canary_root="${TMP_DIR}/canary-src"
mkdir -p "${canary_root}/sirius-engine"
printf 'FROM scratch\nENV X=%s\n' "${PRIVATE_REGISTRY}sirius-pro:latest" \
  > "${canary_root}/sirius-engine/Dockerfile"
printf 'module %s\n' "${PRIVATE_MODULE}" > "${canary_root}/go.mod"
printf 'marker %s\n' "${PRO_CANARY}" > "${canary_root}/main.go"
printf '%s\n' "sirius-engine/Dockerfile" "go.mod" "main.go" > "${TMP_DIR}/canary.paths"
printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md" > "${TMP_DIR}/canary.allow"
if python3 "${CI_DIR}/scan_text.py" --root "${canary_root}" --allowlist "${TMP_DIR}/canary.allow" \
  --paths-file "${TMP_DIR}/canary.paths" 2>/dev/null; then
  fail "expected canary private markers to fail"
fi
pass "private registry/module/canary rejected"

echo "==> canary: credential body rejected"
printf 'token=%s\n' "${FAKE_PAT}" > "${canary_root}/leak.env"
if python3 "${CI_DIR}/scan_text.py" --root "${canary_root}" --allowlist "${TMP_DIR}/canary.allow" \
  --paths-file <(printf '%s\n' "leak.env") 2>/dev/null; then
  fail "expected fake PAT to fail"
fi
pass "credential canary rejected"

echo "==> canary: traversal archive rejected"
trav="${TMP_DIR}/trav.tar"
python3 - <<PY
import tarfile
from pathlib import Path
p = Path("${trav}")
with tarfile.open(p, "w") as tf:
    info = tarfile.TarInfo("../../evil.txt")
    data = b"nope"
    info.size = len(data)
    import io
    tf.addfile(info, io.BytesIO(data))
PY
if python3 "${CI_DIR}/scan_archive.py" --archive "${trav}" --allowlist "${ALLOWLIST}" 2>/dev/null; then
  fail "expected traversal archive to fail"
fi
pass "traversal archive rejected"

echo "==> canary: malformed/missing SBOMs rejected"
sbom_dir="${TMP_DIR}/sboms"
mkdir -p "${sbom_dir}"
if bash "${CI_DIR}/scan_sboms.sh" --tag v1.1.0 --dir "${sbom_dir}" 2>/dev/null; then
  fail "expected missing SBOMs to fail"
fi
# Create 12 empty-looking invalid files
for component in "${RELEASE_COMPONENTS[@]}"; do
  for platform_entry in "${RELEASE_SBOM_PLATFORMS[@]}"; do
    slug="${platform_entry##*:}"
    asset="$(release_sbom_asset_name "${component}" "v1.1.0" "${slug}")"
    printf '{}\n' > "${sbom_dir}/${asset}"
  done
done
if bash "${CI_DIR}/scan_sboms.sh" --tag v1.1.0 --dir "${sbom_dir}" 2>/dev/null; then
  fail "expected malformed SBOMs to fail"
fi
pass "malformed/missing SBOMs rejected"

echo "==> canary: seeded private-repo-shaped fixture rejected"
seed="${TMP_DIR}/seed-private-shape"
mkdir -p "${seed}/internal"
printf 'require %s\nclone https://github.com/%s/sirius-release.git\n' \
  "${PRIVATE_MODULE}" "${ORG_DISPLAY}" > "${seed}/internal/import.go"
printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md" > "${TMP_DIR}/seed.allow"
if python3 "${CI_DIR}/scan_text.py" --root "${seed}" --allowlist "${TMP_DIR}/seed.allow" \
  --paths-file <(printf '%s\n' "internal/import.go") 2>/dev/null; then
  fail "expected private-repo-shaped fixture to fail"
fi
pass "private-repo-shaped fixture rejected"

echo "==> canary: why public CI must never read a real private repo"
cat <<'EOF'
NOTE: Public Community CI proves independence by scanning only public sources,
public release assets, and anonymously pullable GHCR digests. Reading a real
private repository (or using a private PAT) would undermine the independence
guarantee and risk leaking private contents into public logs/artifacts. Canaries
are therefore synthetic fixtures generated at test runtime.
EOF
pass "documented private-repo canary policy"

echo "==> contract: six images + twelve SBOMs + exact digest refs helpers"
[ "${#RELEASE_COMPONENTS[@]}" -eq 6 ] || fail "expected six release components"
[ "$(release_expected_sbom_count)" -eq 12 ] || fail "expected twelve SBOM assets"
# scan_images.sh must require digest refs from manifest (live check via script content + jq path).
grep -Eq 'ghcr\\.io/siriusscan/|ghcr\.io/siriusscan/' "${CI_DIR}/scan_images.sh" \
  || fail "image scanner must require public ghcr.io/siriusscan refs"
grep -Eq '@sha256:' "${CI_DIR}/scan_images.sh" || fail "image scanner must require digest refs"
grep -Fq 'exactly six' "${CI_DIR}/scan_images.sh" || grep -Fq 'exactly 6' "${CI_DIR}/scan_images.sh" \
  || grep -Fq 'length) != 6' "${CI_DIR}/scan_images.sh" \
  || fail "image scanner must enforce six images"
pass "six images / twelve SBOMs / digest ref contracts"

echo "==> current tracked public source passes leakage scan"
bash "${CI_DIR}/scan.sh" --mode source --root "${PROJECT_ROOT}" --tag v1.1.0
pass "tracked source clean"

echo "==> fixture archive with only public content passes"
pub_arch="${TMP_DIR}/public.tar.gz"
mkdir -p "${TMP_DIR}/pubtree/README"
printf 'Sirius Community\n' > "${TMP_DIR}/pubtree/README/hello.md"
tar -C "${TMP_DIR}/pubtree" -czf "${pub_arch}" .
python3 "${CI_DIR}/scan_archive.py" --archive "${pub_arch}" --allowlist "${ALLOWLIST}"
pass "clean archive"

echo
echo "All community-independence local contract tests passed."
echo "Public CI must never clone or authenticate to a private repository to"
echo "perform canary checks; synthetic runtime fixtures are sufficient and safer."
