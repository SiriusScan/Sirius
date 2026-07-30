#!/usr/bin/env bash
# Resolve an unexpired core-build-inventory artifact for an exact commit from
# successful default-branch push runs of ci.yml.
#
# Usage:
#   bash scripts/resolve-core-build-inventory.sh \
#     --commit <full-sha> \
#     --outdir inventory \
#     [--repo owner/name] \
#     [--default-branch main]
set -euo pipefail

die() { echo "ERROR: $*" >&2; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"; }

SOURCE_COMMIT=""
OUTDIR=""
REPO="${REPO:-${GITHUB_REPOSITORY:-}}"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --commit) SOURCE_COMMIT="${2:-}"; shift 2 ;;
    --outdir) OUTDIR="${2:-}"; shift 2 ;;
    --repo) REPO="${2:-}"; shift 2 ;;
    --default-branch) DEFAULT_BRANCH="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[ -n "${SOURCE_COMMIT}" ] || die "--commit is required"
[ -n "${OUTDIR}" ] || die "--outdir is required"
[ -n "${REPO}" ] || die "--repo or GITHUB_REPOSITORY is required"
printf '%s' "${SOURCE_COMMIT}" | grep -Eq '^[a-f0-9]{40}$' || die "commit must be full 40-hex SHA"
printf '%s' "${DEFAULT_BRANCH}" | grep -Eq '^[A-Za-z0-9._/-]+$' || die "invalid default branch name"
require_cmd gh
require_cmd jq

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

mkdir -p "${OUTDIR}"
WORK="$(mktemp -d)"
trap 'rm -rf "${WORK}"' EXIT

# Enumerate completed push runs for this exact SHA on the default branch.
# Use GET query filters; never interpolate untrusted values into jq programs.
API_PATH="repos/${REPO}/actions/workflows/ci.yml/runs?head_sha=${SOURCE_COMMIT}&event=push&status=completed&per_page=100"
RUN_IDS_FILE="${WORK}/run-ids.txt"
# DEFAULT_BRANCH is allowlisted above; safe to embed in --jq for paginated merge.
gh api --paginate "${API_PATH}" \
  --jq ".workflow_runs[] | select(.conclusion == \"success\" and .head_branch == \"${DEFAULT_BRANCH}\") | .id" \
  > "${RUN_IDS_FILE}"

if [ ! -s "${RUN_IDS_FILE}" ]; then
  die "no successful default-branch push ci.yml runs for commit ${SOURCE_COMMIT}"
fi

VALID_DIR="${WORK}/valid"
mkdir -p "${VALID_DIR}"
VALID_COUNT=0
FIRST=""

while IFS= read -r run_id; do
  [ -n "${run_id}" ] || continue
  printf '%s' "${run_id}" | grep -Eq '^[0-9]+$' || die "invalid run id: ${run_id}"
  cand_dir="${WORK}/run-${run_id}"
  mkdir -p "${cand_dir}"
  if ! gh run download "${run_id}" --repo "${REPO}" --name "core-build-inventory" --dir "${cand_dir}" 2>/dev/null; then
    echo "skip run ${run_id}: core-build-inventory artifact missing or expired"
    continue
  fi
  inv="${cand_dir}/core-build-inventory.json"
  if [ ! -f "${inv}" ]; then
    echo "skip run ${run_id}: inventory file absent after download"
    continue
  fi
  if ! bash "${PROJECT_ROOT}/scripts/validate-core-manifest.sh" \
      --mode inventory \
      --expect-commit "${SOURCE_COMMIT}" \
      "${inv}" >/dev/null; then
    echo "skip run ${run_id}: inventory failed validation for commit ${SOURCE_COMMIT}"
    continue
  fi
  VALID_COUNT=$((VALID_COUNT + 1))
  cp "${inv}" "${VALID_DIR}/${VALID_COUNT}.json"
  if [ -z "${FIRST}" ]; then
    FIRST="${VALID_DIR}/${VALID_COUNT}.json"
  fi
  echo "accepted inventory candidate from run ${run_id}"
done < "${RUN_IDS_FILE}"

if [ "${VALID_COUNT}" -eq 0 ] || [ -z "${FIRST}" ]; then
  die "no unexpired valid core-build-inventory artifact for commit ${SOURCE_COMMIT}"
fi

norm() { jq -S 'del(.generated_at)' "$1"; }

FIRST_NORM="$(norm "${FIRST}")"
i=1
while [ "${i}" -le "${VALID_COUNT}" ]; do
  inv="${VALID_DIR}/${i}.json"
  cur="$(norm "${inv}")"
  if [ "${cur}" != "${FIRST_NORM}" ]; then
    echo "ERROR: conflicting core-build-inventory candidates for ${SOURCE_COMMIT}" >&2
    diff -u <(printf '%s\n' "${FIRST_NORM}") <(printf '%s\n' "${cur}") >&2 || true
    die "inventory conflict across successful CI runs"
  fi
  i=$((i + 1))
done

# Deterministic choice among equivalents: first accepted (API order).
cp "${FIRST}" "${OUTDIR}/core-build-inventory.json"
echo "Selected inventory -> ${OUTDIR}/core-build-inventory.json"
bash "${PROJECT_ROOT}/scripts/validate-core-manifest.sh" \
  --mode inventory \
  --expect-commit "${SOURCE_COMMIT}" \
  "${OUTDIR}/core-build-inventory.json"
