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

ORG_DISPLAY="OpenSecurity""-Infosec"
ORG_LOWER="opensecurity""-infosec"
PRIVATE_REGISTRY="ghcr.io/${ORG_LOWER}/"
PRIVATE_MODULE="github.com/${ORG_DISPLAY}/sirius-pro"
PRO_CANARY="SIRIUS_PRO_""PRIVATE_RUNTIME_CANARY_V1"
FAKE_PAT="ghp_""$(printf 'a%.0s' {1..36})"
FAKE_PEM_HEADER="-----BEGIN ""RSA PRIVATE KEY-----"
FAKE_PEM_FOOTER="-----END ""RSA PRIVATE KEY-----"
FAKE_PEM_BODY="$(printf 'A%.0s' {1..80})"

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
  scripts/community-independence/scan_image_layers.py \
  scripts/community-independence/nested_content.py \
  scripts/community-independence/resolve_platform_digests.py
pass "python compile"

echo "==> workflow YAML parses"
python3 - <<'PY'
import pathlib, sys
text = pathlib.Path(".github/workflows/community-independence.yml").read_text()
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
while IFS= read -r use_line; do
  printf '%s\n' "${use_line}" | grep -Eq '@[0-9a-f]{40}' \
    || fail "action not full-SHA pinned: ${use_line}"
done < <(grep -E 'uses:[[:space:]]*' "${WORKFLOW}" | grep -vE '^[[:space:]]*#' || true)
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
printf '%s\n' "${wf}" | grep -Eq 'GH_TOKEN:[[:space:]]*""' \
  || fail "workflow must visibly empty GH_TOKEN during scans"
printf '%s\n' "${wf}" | grep -Eq 'GITHUB_TOKEN:[[:space:]]*""' \
  || fail "workflow must visibly empty GITHUB_TOKEN during scans"
pass "workflow permissions + anonymous contract"

echo "==> workflow trigger split"
printf '%s\n' "${wf}" | grep -Eq '^  source-contract:' || fail "missing source-contract job"
printf '%s\n' "${wf}" | grep -Eq '^  public-release-scan:' || fail "missing public-release-scan job"
full_job="$(awk '
  /^  public-release-scan:/ {grab=1; next}
  grab && /^  [a-zA-Z0-9_-]+:/ {exit}
  grab {print}
' "${WORKFLOW}")"
printf '%s\n' "${full_job}" | grep -Eq "github.event_name == 'schedule'|github.ref == 'refs/heads/main'|workflow_dispatch" \
  || fail "public-release-scan must gate on main/schedule/workflow_dispatch"
if printf '%s\n' "${full_job}" | grep -vE '^[[:space:]]*#' | grep -Eq 'IMAGE_TAG:[[:space:]]*latest|tag:[[:space:]]*latest'; then
  fail "public-release-scan must not use mutable latest"
fi
printf '%s\n' "${full_job}" | grep -Eq 'v1\.1\.0' || fail "public-release-scan must target v1.1.0"
pass "workflow trigger split"

echo "==> path normalization does not charset-lstrip"
python3 - <<'PY'
import sys
sys.path.insert(0, "scripts/community-independence")
import scan_text
assert scan_text.norm_rel("./.github/workflows/x.yml") == ".github/workflows/x.yml"
assert scan_text.norm_rel(".github/workflows/x.yml") == ".github/workflows/x.yml"
assert scan_text.norm_rel("github/workflows/x.yml") == "github/workflows/x.yml"
assert scan_text.norm_rel("/abs/path") == "abs/path"
print("OK norm_rel")
PY
pass "path normalization"

echo "==> allowlist path-scoped; .yaml workflows never allowlisted"
mkdir -p "${TMP_DIR}/documentation/dev-notes" "${TMP_DIR}/.github/workflows"
printf 'Boundary note: %s and %s\n' "${ORG_DISPLAY}" "${PRIVATE_REGISTRY}" \
  > "${TMP_DIR}/documentation/dev-notes/pro-bifurcation-plan.md"
printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md" > "${TMP_DIR}/allow.txt"
python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md") \
  || fail "allowlisted governance boundary vocabulary should pass"
printf 'image: %sfoo\n' "${PRIVATE_REGISTRY}" > "${TMP_DIR}/.github/workflows/evil.yaml"
printf '%s\n' ".github/workflows/evil.yaml" >> "${TMP_DIR}/allow.txt"
if python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' ".github/workflows/evil.yaml") 2>/dev/null; then
  fail ".yaml workflow must never be allowlisted"
fi
# Normalized path that would be corrupted by lstrip('./') must still never-allowlist.
mkdir -p "${TMP_DIR}/dotgithub"
# Simulate scanning a path that starts with .github after safe norm.
printf 'image: %sfoo\n' "${PRIVATE_REGISTRY}" > "${TMP_DIR}/.github/workflows/evil.yml"
if python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' "./.github/workflows/evil.yml") 2>/dev/null; then
  fail "./.github/workflows/*.yml must never be allowlisted"
fi
pass "path-scoped allowlist + yaml bypass canary"

echo "==> secrets/canary never allowlisted in governance paths"
printf 'token=%s\ncanary=%s\n%s\n%s\n%s\n' \
  "${FAKE_PAT}" "${PRO_CANARY}" "${FAKE_PEM_HEADER}" "${FAKE_PEM_BODY}" "${FAKE_PEM_FOOTER}" \
  > "${TMP_DIR}/documentation/dev-notes/pro-bifurcation-plan.md"
if python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md") 2>/dev/null; then
  fail "secret markers must fail even in allowlisted governance paths"
fi
# Boundary-only content still passes
printf 'Boundary: %s\n' "${ORG_DISPLAY}" \
  > "${TMP_DIR}/documentation/dev-notes/pro-bifurcation-plan.md"
python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md") \
  || fail "boundary-only governance content should pass"
pass "secret markers never allowlisted"

echo "==> PEM detection requires encoded key material"
printf 'const marker = %q\n' "${FAKE_PEM_HEADER}" > "${TMP_DIR}/crypto-api.js"
python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' "crypto-api.js") \
  || fail "a PEM header string without key material must not be treated as a key"
printf '%s\n%s\n%s\n' "${FAKE_PEM_HEADER}" "${FAKE_PEM_BODY}" "${FAKE_PEM_FOOTER}" \
  > "${TMP_DIR}/actual-private-key.pem"
if python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}" --allowlist "${TMP_DIR}/allow.txt" \
  --paths-file <(printf '%s\n' "actual-private-key.pem") 2>/dev/null; then
  fail "a complete PEM private-key block must be rejected"
fi
pass "PEM key-material detection"

echo "==> canary: private registry/module/pro canary rejected"
canary_root="${TMP_DIR}/canary-src"
mkdir -p "${canary_root}/sirius-engine"
printf 'FROM scratch\nENV X=%s\n' "${PRIVATE_REGISTRY}sirius-pro:latest" \
  > "${canary_root}/sirius-engine/Dockerfile"
printf 'module %s\n' "${PRIVATE_MODULE}" > "${canary_root}/go.mod"
printf 'marker %s\n' "${PRO_CANARY}" > "${canary_root}/main.go"
printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md" > "${TMP_DIR}/canary.allow"
if python3 "${CI_DIR}/scan_text.py" --root "${canary_root}" --allowlist "${TMP_DIR}/canary.allow" \
  --paths-file <(printf '%s\n' "sirius-engine/Dockerfile" "go.mod" "main.go") 2>/dev/null; then
  fail "expected canary private markers to fail"
fi
pass "private registry/module/canary rejected"

echo "==> canary: release-archive GitHub top-dir + private marker"
arch="${TMP_DIR}/release-canary.tar.gz"
python3 - <<PY
import io, tarfile, gzip
from pathlib import Path
marker = "${PRIVATE_REGISTRY}".encode() + b"leak"
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode="w") as tf:
    data = b"ref: " + marker + b"\n"
    info = tarfile.TarInfo("Sirius-1.1.0/sirius-engine/Dockerfile")
    info.size = len(data)
    tf.addfile(info, io.BytesIO(data))
Path("${arch}").write_bytes(gzip.compress(buf.getvalue()))
PY
out="$(python3 "${CI_DIR}/scan_archive.py" --archive "${arch}" --allowlist "${ALLOWLIST}" 2>&1 || true)"
printf '%s\n' "${out}" | grep -Eq 'COMMUNITY INDEPENDENCE ARCHIVE SCAN FAILED' \
  || fail "expected release-archive canary to fail"
printf '%s\n' "${out}" | grep -Fq 'sirius-engine/Dockerfile' \
  || fail "archive finding must attribute normalized repo-relative path"
printf '%s\n' "${out}" | grep -Eq 'Sirius-1\.1\.0/sirius-engine' \
  && fail "finding must not keep GitHub top directory prefix"
pass "release-archive top-dir canary"

echo "==> canary: zip declared/actual size mismatch still fail-closed"
python3 - <<PY
import io, sys, zipfile
sys.path.insert(0, "scripts/community-independence")
from nested_content import ArchiveSafetyError, _read_zip_member
buf = io.BytesIO()
with zipfile.ZipFile(buf, "w") as zf:
    zf.writestr("x.txt", b"hello")
raw = buf.getvalue()
with zipfile.ZipFile(io.BytesIO(raw)) as zf:
    info = zf.getinfo("x.txt")
    info.file_size = 999  # lie
    try:
        _read_zip_member(zf, info)
    except ArchiveSafetyError as exc:
        assert "mismatch" in str(exc).lower() or "too large" in str(exc).lower()
        print("OK mismatch rejection")
    else:
        raise SystemExit("expected mismatch rejection")
PY
pass "zip mismatch canary"

echo "==> canary: NUL binary + nested gzip/tar/zip markers"
python3 - <<PY
import gzip, io, tarfile, zipfile
from pathlib import Path
root = Path("${TMP_DIR}/nested")
root.mkdir(parents=True, exist_ok=True)
marker = ("${PRIVATE_REGISTRY}" + "nested").encode()
# NUL binary with marker
(root / "nul.bin").write_bytes(b"\x00\x01" + marker + b"\x00")
# nested gzip
(root / "nested.gz").write_bytes(gzip.compress(b"x=" + marker + b"\n"))
# nested tar
tbuf = io.BytesIO()
with tarfile.open(fileobj=tbuf, mode="w") as tf:
    data = b"y=" + marker + b"\n"
    info = tarfile.TarInfo("inside.txt")
    info.size = len(data)
    tf.addfile(info, io.BytesIO(data))
(root / "nested.tar").write_bytes(tbuf.getvalue())
# nested zip
zbuf = io.BytesIO()
with zipfile.ZipFile(zbuf, "w") as zf:
    zf.writestr("inside.txt", b"z=" + marker + b"\n")
(root / "nested.zip").write_bytes(zbuf.getvalue())
PY
printf '%s\n' "documentation/dev-notes/pro-bifurcation-plan.md" > "${TMP_DIR}/nested.allow"
for rel in nul.bin nested.gz nested.tar nested.zip; do
  if python3 "${CI_DIR}/scan_text.py" --root "${TMP_DIR}/nested" --allowlist "${TMP_DIR}/nested.allow" \
    --paths-file <(printf '%s\n' "${rel}") 2>/dev/null; then
    fail "expected nested/binary canary to fail for ${rel}"
  fi
done
pass "NUL/nested archive canaries"

echo "==> canary: streaming large members / gzip tar / malformed magic / budgets"
python3 - <<PY
import gzip, io, os, sys, tarfile, tempfile, zipfile
from pathlib import Path

sys.path.insert(0, "scripts/community-independence")
import scan_text
import scan_archive
import scan_image_layers
from nested_content import (
    CHUNK_SIZE,
    ArchiveSafetyError,
    _Budget,
    scan_nested_bytes,
    scan_stream_chunks,
)

allow = Path("scripts/community-independence/policy/governance-allowlist.txt")
allowlist = scan_text.load_allowlist(allow)
rules = scan_text.compile_rules()
marker = ("ghcr.io/" + "opensecurity" + "-infosec/").encode() + b"stream"
tmp = Path("${TMP_DIR}") / "stream"
tmp.mkdir(parents=True, exist_ok=True)

# 1) Clean >32MiB tar member passes via production scan_archive path.
big = b"C" * (33 * 1024 * 1024)
tpath = tmp / "clean-large.tar"
with tarfile.open(tpath, "w") as tf:
    info = tarfile.TarInfo("blob.bin")
    info.size = len(big)
    tf.addfile(info, io.BytesIO(big))
findings = scan_archive.scan_archive(tpath, allow)
assert findings == [], findings
print("OK clean >32MiB tar member")

# 2) Marker spanning chunk boundary fails (production scan_stream_chunks).
# Place marker so it crosses the first CHUNK_SIZE boundary.
left = CHUNK_SIZE - (len(marker) // 2)
payload = (b"A" * left) + marker + (b"B" * 4096)
budget = _Budget()
findings = scan_stream_chunks(io.BytesIO(payload), "span.bin", rules, allowlist, budget)
assert any("private_registry" in f for f in findings), findings
print("OK chunk-boundary marker")

# 3) Gzip-compressed tar with >32MiB clean member passes via scan_image_layers.
inner_tar = io.BytesIO()
with tarfile.open(fileobj=inner_tar, mode="w") as tf:
    info = tarfile.TarInfo("opt/big.bin")
    info.size = len(big)
    tf.addfile(info, io.BytesIO(big))
gz_layer = gzip.compress(inner_tar.getvalue())
save_path = tmp / "gzip-large.docker-save.tar"
with tarfile.open(save_path, "w") as tf:
    for name, data in [
        ("manifest.json", b"[]"),
        ("config.json", b"{}"),
        ("layer.tar.gz", gz_layer),
    ]:
        info = tarfile.TarInfo(name)
        info.size = len(data)
        tf.addfile(info, io.BytesIO(data))
findings = scan_image_layers.scan_docker_save(save_path, allow, "sirius-ui/linux-amd64")
assert findings == [], findings
print("OK gzip tar >32MiB via scan_image_layers")

# 4) Malformed gzip magic in source (strict=False): raw-only, no traceback.
bad = b"\x1f\x8b" + b"this-is-not-valid-gzip-payload"
findings = scan_nested_bytes(bad, "weird.bin", rules, allowlist, strict=False)
assert findings == [], findings
# With a marker in the malformed payload, still report via raw scan.
bad_mark = b"\x1f\x8b" + b"xx" + marker + b"yy"
findings = scan_nested_bytes(bad_mark, "weird2.bin", rules, allowlist, strict=False)
assert findings, "expected raw marker findings without nest parse"
print("OK malformed magic source fallback")

# 5) Malformed explicit image/archive fails closed (strict).
try:
    scan_nested_bytes(bad, "layer.tar.gz", rules, allowlist, strict=True)
except ArchiveSafetyError:
    print("OK malformed explicit nest fail-closed")
else:
    raise SystemExit("expected strict malformed gzip to fail")

corrupt_save = tmp / "corrupt.docker-save.tar"
with tarfile.open(corrupt_save, "w") as tf:
    data = b"\x1f\x8b" + b"broken"
    info = tarfile.TarInfo("layer.tar.gz")
    info.size = len(data)
    tf.addfile(info, io.BytesIO(data))
try:
    scan_image_layers.scan_docker_save(corrupt_save, allow, "sirius-api/linux-amd64")
except ArchiveSafetyError:
    print("OK malformed image layer fail-closed")
else:
    raise SystemExit("expected corrupt image layer to fail")

# 6) Budget exceed fails cleanly.
tiny = _Budget(limit=1024)
try:
    scan_nested_bytes(b"Z" * 4096, "huge.bin", rules, allowlist, budget=tiny, strict=True)
except ArchiveSafetyError as exc:
    assert "budget" in str(exc).lower(), exc
    print("OK budget exceed")
else:
    raise SystemExit("expected budget exceed")

# 7) Budget is not triple-counted on a clean large gzip→tar layer.
# Member is 5MiB; compressed layer is also ~5MiB (level-0). Single-representation
# accounting charges ~5MiB (+ tiny configs). A 6MiB budget must pass; triple-count
# of compressed+raw+member would exceed ~15MiB and fail.
member = os.urandom(5 * 1024 * 1024)
inner_tar = io.BytesIO()
with tarfile.open(fileobj=inner_tar, mode="w") as tf:
    info = tarfile.TarInfo("opt/blob.bin")
    info.size = len(member)
    tf.addfile(info, io.BytesIO(member))
gz_buf = io.BytesIO()
with gzip.GzipFile(fileobj=gz_buf, mode="wb", compresslevel=0) as gzf:
    gzf.write(inner_tar.getvalue())
gz_layer = gz_buf.getvalue()
assert len(gz_layer) > 4 * 1024 * 1024, len(gz_layer)
save_budget = tmp / "budget-layer.docker-save.tar"
with tarfile.open(save_budget, "w") as tf:
    for name, data in [
        ("manifest.json", b"[]"),
        ("config.json", b"{}"),
        ("layer.tar.gz", gz_layer),
    ]:
        info = tarfile.TarInfo(name)
        info.size = len(data)
        tf.addfile(info, io.BytesIO(data))
tight = _Budget(limit=6 * 1024 * 1024)
findings = scan_image_layers.scan_docker_save(
    save_budget, allow, "sirius-engine/linux-amd64", budget=tight
)
assert findings == [], findings
assert tight.total <= 6 * 1024 * 1024, tight.total
# Must have charged the member once (~5MiB), not 3x (~15MiB).
assert tight.total < 6 * 1024 * 1024, tight.total
assert tight.total >= 5 * 1024 * 1024, tight.total
print(f"OK budget single-count large layer (charged={tight.total})")

# 8) >32MiB nested gzip/tar/zip members still recurse; markers are detected.
pad = b"P" * (33 * 1024 * 1024)

# 8a) nested tar member
inner = io.BytesIO()
with tarfile.open(fileobj=inner, mode="w") as tf:
    secret = marker + b"\n"
    info = tarfile.TarInfo("secret.txt")
    info.size = len(secret)
    tf.addfile(info, io.BytesIO(secret))
    info = tarfile.TarInfo("pad.bin")
    info.size = len(pad)
    tf.addfile(info, io.BytesIO(pad))
nested_tar = inner.getvalue()
assert len(nested_tar) > 32 * 1024 * 1024
t_outer = tmp / "nested-large-tar.tar"
with tarfile.open(t_outer, "w") as tf:
    info = tarfile.TarInfo("bundle.tar")
    info.size = len(nested_tar)
    tf.addfile(info, io.BytesIO(nested_tar))
findings = scan_archive.scan_archive(t_outer, allow)
assert any("private_registry" in f for f in findings), findings
print("OK >32MiB nested tar marker")

# 8b) nested gzip member (compresslevel=0 keeps member >32MiB)
gz_buf = io.BytesIO()
with gzip.GzipFile(fileobj=gz_buf, mode="wb", compresslevel=0) as gzf:
    gzf.write(pad)
    gzf.write(marker)
gz_member = gz_buf.getvalue()
assert len(gz_member) > 32 * 1024 * 1024
t_gz = tmp / "nested-large-gzip.tar"
with tarfile.open(t_gz, "w") as tf:
    info = tarfile.TarInfo("blob.gz")
    info.size = len(gz_member)
    tf.addfile(info, io.BytesIO(gz_member))
findings = scan_archive.scan_archive(t_gz, allow)
assert any("private_registry" in f for f in findings), findings
print("OK >32MiB nested gzip marker")

# 8c) nested zip member (ZIP_STORED keeps member >32MiB)
zbuf = io.BytesIO()
with zipfile.ZipFile(zbuf, "w", compression=zipfile.ZIP_STORED) as zf:
    zf.writestr("secret.txt", marker + b"\n")
    zf.writestr("pad.bin", pad)
zip_member = zbuf.getvalue()
assert len(zip_member) > 32 * 1024 * 1024
t_zip = tmp / "nested-large-zip.tar"
with tarfile.open(t_zip, "w") as tf:
    info = tarfile.TarInfo("bundle.zip")
    info.size = len(zip_member)
    tf.addfile(info, io.BytesIO(zip_member))
findings = scan_archive.scan_archive(t_zip, allow)
assert any("private_registry" in f for f in findings), findings
print("OK >32MiB nested zip marker")
PY
pass "streaming/malformed/budget canaries"

echo "==> canary: SBOM wrong-component and duplicate digest"
sbom_dir="${TMP_DIR}/sboms"
mkdir -p "${sbom_dir}"
# Build 12 valid-looking SBOMs then mutate.
amd_digest() { printf 'sha256:%064d' "$1"; }
i=1
for component in "${RELEASE_COMPONENTS[@]}"; do
  for slug in linux-amd64 linux-arm64; do
    asset="$(release_sbom_asset_name "${component}" "v1.1.0" "${slug}")"
    dig="$(amd_digest "${i}")"
    i=$((i + 1))
    jq -n --arg name "ghcr.io/siriusscan/${component}" --arg ver "${dig}" \
      '{bomFormat:"CycloneDX",specVersion:"1.7",metadata:{component:{name:$name,version:$ver}}}' \
      > "${sbom_dir}/${asset}"
  done
done
# Baseline should pass structural checks.
bash "${CI_DIR}/scan_sboms.sh" --tag v1.1.0 --dir "${sbom_dir}" >/dev/null
# Wrong component name
bad="${sbom_dir}/$(release_sbom_asset_name sirius-ui v1.1.0 linux-amd64)"
jq '.metadata.component.name="ghcr.io/siriusscan/sirius-api"' "${bad}" > "${bad}.tmp" && mv "${bad}.tmp" "${bad}"
if bash "${CI_DIR}/scan_sboms.sh" --tag v1.1.0 --dir "${sbom_dir}" 2>/dev/null; then
  fail "expected wrong-component SBOM to fail"
fi
# Restore and duplicate digests across platforms for ui
jq -n --arg name "ghcr.io/siriusscan/sirius-ui" --arg ver "$(amd_digest 1)" \
  '{bomFormat:"CycloneDX",specVersion:"1.7",metadata:{component:{name:$name,version:$ver}}}' \
  > "${sbom_dir}/$(release_sbom_asset_name sirius-ui v1.1.0 linux-amd64)"
jq -n --arg name "ghcr.io/siriusscan/sirius-ui" --arg ver "$(amd_digest 1)" \
  '{bomFormat:"CycloneDX",specVersion:"1.7",metadata:{component:{name:$name,version:$ver}}}' \
  > "${sbom_dir}/$(release_sbom_asset_name sirius-ui v1.1.0 linux-arm64)"
# Repair other components to keep counts valid
i=3
for component in sirius-api sirius-engine sirius-postgres sirius-rabbitmq sirius-valkey; do
  for slug in linux-amd64 linux-arm64; do
    asset="$(release_sbom_asset_name "${component}" "v1.1.0" "${slug}")"
    dig="$(amd_digest "${i}")"
    i=$((i + 1))
    jq -n --arg name "ghcr.io/siriusscan/${component}" --arg ver "${dig}" \
      '{bomFormat:"CycloneDX",specVersion:"1.7",metadata:{component:{name:$name,version:$ver}}}' \
      > "${sbom_dir}/${asset}"
  done
done
if bash "${CI_DIR}/scan_sboms.sh" --tag v1.1.0 --dir "${sbom_dir}" 2>/dev/null; then
  fail "expected duplicate platform digest SBOM to fail"
fi
pass "SBOM wrong-component + duplicate digest canaries"

echo "==> canary: docker-save fixtures via scan_image_layers.py"
python3 - <<PY
import gzip, io, json, tarfile, sys
from pathlib import Path
sys.path.insert(0, "scripts/community-independence")
import scan_image_layers
from nested_content import ArchiveSafetyError

tmp = Path("${TMP_DIR}") / "docker-save"
tmp.mkdir(parents=True, exist_ok=True)
allow = Path("scripts/community-independence/policy/governance-allowlist.txt")
marker = ("ghcr.io/" + "opensecurity" + "-infosec/").encode() + b"img"

def write_save(path: Path, members):
    with tarfile.open(path, "w") as tf:
        for name, data in members:
            info = tarfile.TarInfo(name)
            info.size = len(data)
            tf.addfile(info, io.BytesIO(data))

# clean fixture
clean = tmp / "clean.tar"
cfg = json.dumps({"config": {"Env": ["PATH=/usr/bin"]}}).encode()
layer_buf = io.BytesIO()
with tarfile.open(fileobj=layer_buf, mode="w") as lf:
    data = b"ok\n"
    info = tarfile.TarInfo("etc/issue")
    info.size = len(data)
    lf.addfile(info, io.BytesIO(data))
write_save(clean, [("manifest.json", b"[]"), ("config.json", cfg), ("layer.tar", layer_buf.getvalue())])
findings = scan_image_layers.scan_docker_save(clean, allow, "sirius-ui/linux-amd64")
assert findings == [], findings

# poisoned config
poison_cfg = tmp / "poison-config.tar"
write_save(poison_cfg, [("config.json", b'{"Env":["X=' + marker + b'"]}')])
findings = scan_image_layers.scan_docker_save(poison_cfg, allow, "sirius-ui/linux-amd64")
assert findings, "expected poisoned config findings"

# poisoned normal layer file
poison_layer = tmp / "poison-layer.tar"
lbuf = io.BytesIO()
with tarfile.open(fileobj=lbuf, mode="w") as lf:
    data = b"leak=" + marker + b"\n"
    info = tarfile.TarInfo("app/run.sh")
    info.size = len(data)
    lf.addfile(info, io.BytesIO(data))
write_save(poison_layer, [("layer.tar", lbuf.getvalue())])
findings = scan_image_layers.scan_docker_save(poison_layer, allow, "sirius-api/linux-arm64")
assert findings, "expected poisoned layer findings"

# nested compressed marker inside layer
nested = tmp / "nested-layer.tar"
inner = gzip.compress(b"z=" + marker + b"\n")
lbuf = io.BytesIO()
with tarfile.open(fileobj=lbuf, mode="w") as lf:
    info = tarfile.TarInfo("opt/payload.gz")
    info.size = len(inner)
    lf.addfile(info, io.BytesIO(inner))
write_save(nested, [("layer.tar", lbuf.getvalue())])
findings = scan_image_layers.scan_docker_save(nested, allow, "sirius-engine/linux-amd64")
assert findings, "expected nested compressed layer findings"

# Image-layer symlink/hardlink members are ignored (never followed), including
# absolute in-container targets (BusyBox) and relative hardlinks.
busybox = tmp / "busybox-links.tar"
lbuf = io.BytesIO()
with tarfile.open(fileobj=lbuf, mode="w") as lf:
    data = b"busybox\n"
    info = tarfile.TarInfo("bin/busybox")
    info.size = len(data)
    lf.addfile(info, io.BytesIO(data))
    info = tarfile.TarInfo("bin/arch")
    info.type = tarfile.SYMTYPE
    info.linkname = "/bin/busybox"
    lf.addfile(info)
    info = tarfile.TarInfo("bin/arch.hard")
    info.type = tarfile.LNKTYPE
    info.linkname = "bin/busybox"
    lf.addfile(info)
    # Former "dangerous" relative symlink target — ignored in image layers.
    info = tarfile.TarInfo("link")
    info.type = tarfile.SYMTYPE
    info.linkname = "../escape"
    lf.addfile(info)
write_save(busybox, [("layer.tar", lbuf.getvalue())])
findings = scan_image_layers.scan_docker_save(busybox, allow, "sirius-postgres/linux-amd64")
assert findings == [], findings

# Regular member absolute / traversal paths still fail-closed in image layers.
for bad_name, label in [("/etc/shadow", "absolute"), ("../escape.txt", "traversal")]:
    danger = tmp / f"danger-{label}.tar"
    lbuf = io.BytesIO()
    with tarfile.open(fileobj=lbuf, mode="w") as lf:
        data = b"x\n"
        info = tarfile.TarInfo(bad_name)
        info.size = len(data)
        lf.addfile(info, io.BytesIO(data))
    write_save(danger, [("layer.tar", lbuf.getvalue())])
    try:
        scan_image_layers.scan_docker_save(danger, allow, "sirius-postgres/linux-amd64")
    except ArchiveSafetyError as exc:
        assert "illegal" in str(exc).lower() or "absolute" in str(exc).lower() or "path" in str(exc).lower(), exc
    else:
        raise SystemExit(f"expected {label} regular member path rejection")

# Outer docker-save archive remains fail-closed on links.
outer_link = tmp / "outer-link.tar"
with tarfile.open(outer_link, "w") as tf:
    info = tarfile.TarInfo("evil")
    info.type = tarfile.SYMTYPE
    info.linkname = "/etc/passwd"
    tf.addfile(info)
try:
    scan_image_layers.scan_docker_save(outer_link, allow, "sirius-ui/linux-amd64")
except ArchiveSafetyError as exc:
    assert "link" in str(exc).lower() and "docker-save" in str(exc).lower(), exc
else:
    raise SystemExit("expected outer docker-save link rejection")

# Explicit public source release archives still reject symlink/hardlink members.
import scan_archive
src_sym = tmp / "src-symlink.tar"
with tarfile.open(src_sym, "w") as tf:
    info = tarfile.TarInfo("bin/arch")
    info.type = tarfile.SYMTYPE
    info.linkname = "/bin/busybox"
    tf.addfile(info)
try:
    scan_archive.scan_archive(src_sym, allow)
except ArchiveSafetyError as exc:
    assert "link" in str(exc).lower(), exc
else:
    raise SystemExit("expected source-release symlink rejection")

src_hard = tmp / "src-hardlink.tar"
with tarfile.open(src_hard, "w") as tf:
    data = b"payload\n"
    info = tarfile.TarInfo("bin/busybox")
    info.size = len(data)
    tf.addfile(info, io.BytesIO(data))
    info = tarfile.TarInfo("bin/arch.hard")
    info.type = tarfile.LNKTYPE
    info.linkname = "bin/busybox"
    tf.addfile(info)
try:
    scan_archive.scan_archive(src_hard, allow)
except ArchiveSafetyError as exc:
    assert "link" in str(exc).lower(), exc
else:
    raise SystemExit("expected source-release hardlink rejection")

print("OK docker-save fixture canaries")
PY
pass "docker-save fixture canaries"

echo "==> mocked multi-arch index resolution + 12 child pulls/scans"
mock_inspect="${TMP_DIR}/mock-inspect.sh"
mock_pull="${TMP_DIR}/mock-pull.sh"
mock_save="${TMP_DIR}/mock-save.sh"
mock_cfg="${TMP_DIR}/mock-config.sh"
cat > "${mock_inspect}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ref="$1"
component="$(printf '%s' "${ref}" | sed -E 's#.*/([^@]+)@.*#\1#')"
case "${component}" in
  sirius-ui) a=11; b=12 ;;
  sirius-api) a=21; b=22 ;;
  sirius-engine) a=31; b=32 ;;
  sirius-postgres) a=41; b=42 ;;
  sirius-rabbitmq) a=51; b=52 ;;
  sirius-valkey) a=61; b=62 ;;
  *) echo "unknown ${component}" >&2; exit 1 ;;
esac
amd="$(printf 'sha256:%064d' "${a}")"
arm="$(printf 'sha256:%064d' "${b}")"
cat <<JSON
{"schemaVersion":2,"mediaType":"application/vnd.oci.image.index.v1+json","manifests":[
 {"mediaType":"application/vnd.oci.image.manifest.v1+json","digest":"${amd}","size":1,"platform":{"architecture":"amd64","os":"linux"}},
 {"mediaType":"application/vnd.oci.image.manifest.v1+json","digest":"${arm}","size":1,"platform":{"architecture":"arm64","os":"linux"}}
]}
JSON
EOF
chmod +x "${mock_inspect}"
cat > "${mock_pull}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%s %s\n' "$1" "$2" >> "${MOCK_PULL_LOG}"
EOF
chmod +x "${mock_pull}"
cat > "${mock_save}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
out="$2"
python3 - "$out" <<'PY'
import io, json, tarfile, sys
from pathlib import Path
out = Path(sys.argv[1])
cfg = json.dumps({"config": {"Env": ["PATH=/bin"]}}).encode()
lbuf = io.BytesIO()
with tarfile.open(fileobj=lbuf, mode="w") as lf:
    data = b"clean\n"
    info = tarfile.TarInfo("etc/ok")
    info.size = len(data)
    lf.addfile(info, io.BytesIO(data))
with tarfile.open(out, "w") as tf:
    for name, data in [("manifest.json", b"[]"), ("config.json", cfg), ("layer.tar", lbuf.getvalue())]:
        info = tarfile.TarInfo(name)
        info.size = len(data)
        tf.addfile(info, io.BytesIO(data))
PY
EOF
chmod +x "${mock_save}"
cat > "${mock_cfg}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '{"Config":{"Env":["PATH=/bin"]}}'
EOF
chmod +x "${mock_cfg}"

# Missing platform must fail resolver
python3 - <<'PY'
import json, sys
sys.path.insert(0, "scripts/community-independence")
from resolve_platform_digests import resolve_platforms
try:
    resolve_platforms({"manifests":[{"digest":"sha256:"+"a"*64,"platform":{"os":"linux","architecture":"amd64"}}]})
except ValueError as exc:
    assert "arm64" in str(exc)
else:
    raise SystemExit("expected missing arm64 to fail")
print("OK missing platform rejected")
PY

mock_manifest="${TMP_DIR}/core-manifest.yaml"
python3 - <<PY
import json
from pathlib import Path
comps = ["sirius-ui","sirius-api","sirius-engine","sirius-postgres","sirius-rabbitmq","sirius-valkey"]
images = {}
for i, c in enumerate(comps, start=1):
    d = f"sha256:{i:064d}"
    images[c] = {"tag":"v1.1.0","digest":d,"ref":f"ghcr.io/siriusscan/{c}@{d}"}
Path("${mock_manifest}").write_text(json.dumps({
  "apiVersion":"siriusscan.dev/v1","kind":"CoreManifest",
  "metadata":{"release_tag":"v1.1.0"},
  "images": images
}))
PY

export MOCK_PULL_LOG="${TMP_DIR}/pulls.log"
: > "${MOCK_PULL_LOG}"
COMMUNITY_INDEPENDENCE_INSPECT_CMD="${mock_inspect}" \
COMMUNITY_INDEPENDENCE_PULL_CMD="${mock_pull}" \
COMMUNITY_INDEPENDENCE_SAVE_CMD="${mock_save}" \
COMMUNITY_INDEPENDENCE_CONFIG_CMD="${mock_cfg}" \
  bash "${CI_DIR}/scan_images.sh" --manifest "${mock_manifest}" --workdir "${TMP_DIR}/imgwork"

pull_n="$(wc -l < "${MOCK_PULL_LOG}" | tr -d ' ')"
[ "${pull_n}" -eq 12 ] || fail "expected 12 mocked child pulls, got ${pull_n}"
grep -Eq 'linux/amd64 ghcr.io/siriusscan/sirius-ui@sha256:' "${MOCK_PULL_LOG}" || fail "missing ui amd64 pull"
grep -Eq 'linux/arm64 ghcr.io/siriusscan/sirius-valkey@sha256:' "${MOCK_PULL_LOG}" || fail "missing valkey arm64 pull"
pass "mocked 12 platform pulls/scans"

echo "==> canary: why public CI must never read a real private repo"
cat <<'EOF'
NOTE: Public Community CI proves independence by scanning only public sources,
public release assets, and anonymously pullable GHCR digests. Reading a real
private repository (or using a private PAT) would undermine the independence
guarantee and risk leaking private contents into public logs/artifacts. Canaries
are therefore synthetic fixtures generated at test runtime.
EOF
pass "documented private-repo canary policy"

echo "==> contract: six images / twelve SBOMs / platform children"
[ "${#RELEASE_COMPONENTS[@]}" -eq 6 ] || fail "expected six release components"
[ "$(release_expected_sbom_count)" -eq 12 ] || fail "expected twelve SBOM assets"
grep -Eq 'resolve_platform_digests|linux/amd64|linux/arm64' "${CI_DIR}/scan_images.sh" \
  || fail "image scanner must resolve platform children"
grep -Eq -- '--platform' "${CI_DIR}/scan_images.sh" || fail "image scanner must pull with --platform"
grep -Eq 'scanned=.*12|expected 12' "${CI_DIR}/scan_images.sh" || fail "image scanner must require 12 scans"
pass "six images / twelve platform scans contract"

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
