#!/usr/bin/env bash
# Validate repository_dispatch submodule payloads against an exact allowlist.
#
# Required env:
#   SUBMODULE   - payload submodule identifier (repo path or short name)
#   COMMIT_SHA  - must be a full 40-hex git SHA
#
# Optional env:
#   APPLY_PIN=1      - append the mapped ENV=COMMIT_SHA to GITHUB_ENV
#   EMIT_CHANGES=1   - append sirius_*_changes outputs to GITHUB_OUTPUT
#
# Never dynamically constructs environment variable names.
set -euo pipefail

die() { echo "ERROR: $*" >&2; exit 1; }

SUBMODULE="${SUBMODULE:-}"
COMMIT_SHA="${COMMIT_SHA:-}"
APPLY_PIN="${APPLY_PIN:-0}"
EMIT_CHANGES="${EMIT_CHANGES:-0}"

[ -n "${SUBMODULE}" ] || die "SUBMODULE is required"
[ -n "${COMMIT_SHA}" ] || die "COMMIT_SHA is required"
printf '%s' "${COMMIT_SHA}" | grep -Eq '^[a-f0-9]{40}$' || die "COMMIT_SHA must be a full 40-hex git SHA"

PIN_ENV=""
# Accept only the canonical SiriusScan path or the exact short name.
case "${SUBMODULE}" in
  SiriusScan/go-api|go-api) REPO_SHORT="go-api"; PIN_ENV="GO_API_COMMIT_SHA" ;;
  SiriusScan/app-scanner|app-scanner) REPO_SHORT="app-scanner"; PIN_ENV="APP_SCANNER_COMMIT_SHA" ;;
  SiriusScan/app-terminal|app-terminal) REPO_SHORT="app-terminal"; PIN_ENV="APP_TERMINAL_COMMIT_SHA" ;;
  SiriusScan/sirius-nse|sirius-nse) REPO_SHORT="sirius-nse"; PIN_ENV="SIRIUS_NSE_COMMIT_SHA" ;;
  SiriusScan/app-agent|app-agent) REPO_SHORT="app-agent"; PIN_ENV="APP_AGENT_COMMIT_SHA" ;;
  SiriusScan/pingpp|pingpp) REPO_SHORT="pingpp"; PIN_ENV="PINGPP_COMMIT_SHA" ;;
  SiriusScan/app-system-monitor|app-system-monitor) REPO_SHORT="app-system-monitor"; PIN_ENV="APP_SYSTEM_MONITOR_COMMIT_SHA" ;;
  SiriusScan/app-administrator|app-administrator) REPO_SHORT="app-administrator"; PIN_ENV="APP_ADMINISTRATOR_COMMIT_SHA" ;;
  *)
    die "disallowed submodule '${SUBMODULE}'"
    ;;
esac

echo "Validated dispatch submodule=${REPO_SHORT} pin_env=${PIN_ENV} commit=${COMMIT_SHA}"

if [ "${APPLY_PIN}" = "1" ]; then
  [ -n "${GITHUB_ENV:-}" ] || die "GITHUB_ENV is required when APPLY_PIN=1"
  case "${PIN_ENV}" in
    GO_API_COMMIT_SHA) echo "GO_API_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    APP_SCANNER_COMMIT_SHA) echo "APP_SCANNER_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    APP_TERMINAL_COMMIT_SHA) echo "APP_TERMINAL_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    SIRIUS_NSE_COMMIT_SHA) echo "SIRIUS_NSE_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    APP_AGENT_COMMIT_SHA) echo "APP_AGENT_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    PINGPP_COMMIT_SHA) echo "PINGPP_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    APP_SYSTEM_MONITOR_COMMIT_SHA) echo "APP_SYSTEM_MONITOR_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    APP_ADMINISTRATOR_COMMIT_SHA) echo "APP_ADMINISTRATOR_COMMIT_SHA=${COMMIT_SHA}" >> "${GITHUB_ENV}" ;;
    *) die "internal error: unmapped PIN_ENV ${PIN_ENV}" ;;
  esac
fi

if [ "${EMIT_CHANGES}" = "1" ]; then
  [ -n "${GITHUB_OUTPUT:-}" ] || die "GITHUB_OUTPUT is required when EMIT_CHANGES=1"
  case "${REPO_SHORT}" in
    go-api)
      echo "sirius_api_changes=true" >> "${GITHUB_OUTPUT}"
      echo "sirius_engine_changes=true" >> "${GITHUB_OUTPUT}"
      ;;
    app-scanner|app-terminal|sirius-nse|app-agent|pingpp|app-system-monitor|app-administrator)
      echo "sirius_engine_changes=true" >> "${GITHUB_OUTPUT}"
      ;;
    *)
      die "internal error: no change mapping for ${REPO_SHORT}"
      ;;
  esac
fi
