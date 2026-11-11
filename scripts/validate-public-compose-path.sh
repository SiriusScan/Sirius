#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

IMAGE_TAG_VALUE="${1:-${IMAGE_TAG:-latest}}"
: "${KEEP_PUBLIC_STACK_RUNNING:=0}"
: "${SIRIUS_IMAGE_PULL_POLICY:=always}"

TLS_TEST_DIR=""
cleanup() {
  if [ "${KEEP_PUBLIC_STACK_RUNNING}" = "1" ]; then
    return
  fi

  docker compose down --volumes --remove-orphans >/dev/null 2>&1 || true
  if [ -n "${TLS_TEST_DIR}" ]; then rm -rf -- "${TLS_TEST_DIR}"; fi
}

trap cleanup EXIT

cd "${PROJECT_ROOT}"

echo "Resetting public compose stack state..."
docker compose down --volumes --remove-orphans >/dev/null 2>&1 || true

echo "Generating runtime config with installer..."
# Run the installer container as the invoking host user so the resulting
# .env / secrets/ files are readable by subsequent steps (e.g. `docker
# compose config` reading .env). Without this, the installer writes
# .env as root:root mode 0600 and the next compose invocation fails with
# "open .env: permission denied" — silently producing zero image refs.
SIRIUS_INSTALLER_UID="$(id -u)" SIRIUS_INSTALLER_GID="$(id -g)" \
  docker compose -f docker-compose.installer.yaml run --rm --build sirius-installer --non-interactive --no-print-secrets

# Defensive: even with the user override above, guarantee .env is readable
# by the current user. Harmless if already readable.
if [ -f "${PROJECT_ROOT}/.env" ] && [ ! -r "${PROJECT_ROOT}/.env" ]; then
  echo "::warning::.env not readable by $(id -un); attempting chmod via sudo"
  sudo chown "$(id -u):$(id -g)" "${PROJECT_ROOT}/.env" 2>/dev/null || true
fi

# This disposable smoke stack uses an ephemeral certificate; production
# deployments supply their own trusted certificate and private key.
TLS_TEST_DIR="$(mktemp -d "${TMPDIR:-/tmp}/sirius-grpc-tls.XXXXXX")"
openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
  -keyout "${TLS_TEST_DIR}/server.key" -out "${TLS_TEST_DIR}/server.crt" \
  -subj '/CN=sirius-engine' -addext 'subjectAltName=DNS:sirius-engine,DNS:localhost,IP:127.0.0.1' >/dev/null 2>&1
# Local Compose file secrets retain host permissions. Directory is private;
# the non-root container must be able to read the key through its bind mount.
chmod 644 "${TLS_TEST_DIR}/server.key" "${TLS_TEST_DIR}/server.crt"
export GRPC_TLS_CERT_HOST_PATH="${TLS_TEST_DIR}/server.crt"
export GRPC_TLS_KEY_HOST_PATH="${TLS_TEST_DIR}/server.key"
export IMAGE_TAG="${IMAGE_TAG_VALUE}"
export SIRIUS_IMAGE_PULL_POLICY

echo "Verifying anonymous GHCR access for IMAGE_TAG=${IMAGE_TAG}..."
bash scripts/verify-ghcr-public-access.sh "${IMAGE_TAG}"

echo "Pulling compose-rendered public images..."
docker compose pull

echo "Starting public compose stack..."
docker compose up -d

echo "Verifying agent gRPC TLS..."
timeout 120 bash -c 'until openssl s_client -connect 127.0.0.1:50051 -servername sirius-engine -verify_hostname sirius-engine -verify_return_error -CAfile "$GRPC_TLS_CERT_HOST_PATH" </dev/null >/dev/null 2>&1; do sleep 2; done'

echo "Verifying runtime auth contract..."
bash scripts/verify-runtime-auth-contract.sh

echo "Public compose path validated for IMAGE_TAG=${IMAGE_TAG}."
