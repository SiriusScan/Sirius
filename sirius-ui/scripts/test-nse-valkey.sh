#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
name="sirius-nse-ui-test-$$-$(date +%s)"
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
docker run --pull=never -d --rm --name "$name" -p 127.0.0.1::6379 valkey/valkey:8-alpine valkey-server --save '' --appendonly no >/dev/null
port=$(docker port "$name" 6379/tcp | sed 's/.*://')
for i in {1..30}; do
  if docker exec "$name" valkey-cli ping | grep -q PONG; then break; fi
  sleep .1
done
token="nse-disposable-$(date +%s)-$$-$RANDOM"
docker exec "$name" valkey-cli SET sirius:test:nse-workflow:marker "$token" >/dev/null
SIRIUS_TEST_NSE_WORKFLOW_TOKEN="$token" SIRIUS_TEST_NSE_WORKFLOW_ADDR="127.0.0.1:$port" node_modules/.bin/tsx --test src/server/nseMutations.integration.test.ts
