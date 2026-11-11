#!/usr/bin/env bash
# Exercise the real smoke script with stubbed external programs. No stack,
# network, registry credentials, or repository files are touched.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf -- "$test_dir"' EXIT
mkdir -p "$test_dir/project/scripts" "$test_dir/bin"
cp "$root/scripts/validate-public-compose-path.sh" "$test_dir/project/scripts/"
printf '#!/usr/bin/env bash\nexit 0\n' > "$test_dir/project/scripts/verify-ghcr-public-access.sh"
printf '#!/usr/bin/env bash\nexit 0\n' > "$test_dir/project/scripts/verify-runtime-auth-contract.sh"
cat > "$test_dir/bin/docker" <<'STUB'
#!/usr/bin/env bash
exit 0
STUB
cat > "$test_dir/bin/openssl" <<'STUB'
#!/usr/bin/env bash
if [ "$1" = s_client ]; then
  printf 'handshake\n' >> "$TEST_LOG"
  exit "${TEST_HANDSHAKE_RESULT:-0}"
fi
while [ "$#" -gt 0 ]; do
  case "$1" in
    -keyout|-out) touch "$2"; shift 2 ;;
    *) shift ;;
  esac
done
STUB
# Execute the inner TLS probe exactly once so failure cases finish immediately.
cat > "$test_dir/bin/timeout" <<'STUB'
#!/usr/bin/env bash
shift
[ "$1" = bash ] && [ "$2" = -c ] || exit 2
openssl s_client
STUB
chmod +x "$test_dir/bin/"* "$test_dir/project/scripts/"*
export PATH="$test_dir/bin:$PATH" TEST_LOG="$test_dir/log" TMPDIR="$test_dir"
run_smoke() {
  (cd "$test_dir/project" && bash scripts/validate-public-compose-path.sh "$1" >/dev/null 2>&1)
}
: > "$TEST_LOG"
TEST_HANDSHAKE_RESULT=1 run_smoke v1.1.0
if [ -s "$TEST_LOG" ]; then echo "historical release unexpectedly required TLS" >&2; exit 1; fi
for tag in v1.2.0 v1.1.1 latest; do
  : > "$TEST_LOG"
  TEST_HANDSHAKE_RESULT=0 run_smoke "$tag"
  [ "$(wc -l < "$TEST_LOG")" -eq 1 ] || { echo "$tag did not verify TLS" >&2; exit 1; }
  : > "$TEST_LOG"
  if TEST_HANDSHAKE_RESULT=1 run_smoke "$tag"; then echo "$tag accepted a failed TLS handshake" >&2; exit 1; fi
  [ "$(wc -l < "$TEST_LOG")" -eq 1 ] || { echo "$tag did not attempt TLS" >&2; exit 1; }
done
printf 'public Compose TLS smoke policy tests passed\n'
