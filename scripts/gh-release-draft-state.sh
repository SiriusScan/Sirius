#!/usr/bin/env bash
# Print "draft" or "absent" for a release tag; fail for published releases
# and for every API/auth/network error other than an explicit HTTP 404.
set -euo pipefail

TAG="${1:-}"
REPO="${2:-${GITHUB_REPOSITORY:-}}"

die() { echo "ERROR: $*" >&2; exit 1; }

printf '%s' "${TAG}" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$' \
  || die "tag must match vMAJOR.MINOR.PATCH"
printf '%s' "${REPO}" | grep -Eq '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$' \
  || die "repository must be owner/name"
command -v gh >/dev/null 2>&1 || die "gh is required"
command -v jq >/dev/null 2>&1 || die "jq is required"

ERR_FILE="$(mktemp)"
trap 'rm -f "${ERR_FILE}"' EXIT

set +e
RELEASE_JSON="$(gh api "repos/${REPO}/releases/tags/${TAG}" 2>"${ERR_FILE}")"
RC=$?
set -e

if [ "${RC}" -eq 0 ]; then
  IS_DRAFT="$(printf '%s' "${RELEASE_JSON}" | jq -r '.draft')"
  case "${IS_DRAFT}" in
    true)
      echo "draft"
      exit 0
      ;;
    false)
      die "GitHub Release ${TAG} is already published"
      ;;
    *)
      die "GitHub API returned invalid draft state for ${TAG}: ${IS_DRAFT}"
      ;;
  esac
fi

ERROR_TEXT="$(cat "${ERR_FILE}")"
if printf '%s' "${ERROR_TEXT}" | grep -qE 'HTTP 404|Not Found'; then
  echo "absent"
  exit 0
fi

die "unable to query GitHub Release ${TAG}: ${ERROR_TEXT}"
