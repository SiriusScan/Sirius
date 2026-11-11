#!/usr/bin/env bash
# Requires installed valkey/valkey:8-alpine, UI dependencies, and scanner Go dependencies.
# Uses only a fresh disposable loopback store and local temporary fixture repositories.
set -euo pipefail
cd "$(dirname "$0")/.."
ui="$PWD"
workspace="$(cd ../.. && pwd)"
name="sirius-nse-workflow-$$-$(date +%s)"
tmp=$(mktemp -d)
trap 'docker rm -f "$name" >/dev/null 2>&1 || true; rm -rf "$tmp"' EXIT
docker run --pull=never -d --rm --name "$name" -p 127.0.0.1::6379 valkey/valkey:8-alpine valkey-server --save '' --appendonly no >/dev/null
port=$(docker port "$name" 6379/tcp | sed 's/.*://')
for i in {1..30}; do
  if docker exec "$name" valkey-cli ping | grep -q PONG; then break; fi
  sleep .1
done
export SIRIUS_TEST_NSE_WORKFLOW_ADDR="127.0.0.1:$port"
export SIRIUS_TEST_NSE_WORKFLOW_TOKEN="nse-disposable-$(date +%s)-$$-$RANDOM"
docker exec "$name" valkey-cli SET sirius:test:nse-workflow:marker "$SIRIUS_TEST_NSE_WORKFLOW_TOKEN" >/dev/null
scanner() {
  (cd "$workspace/minor-projects/app-scanner" &&
   SIRIUS_TEST_NSE_WORKFLOW_PHASE="$1" GOCACHE="$workspace/.cache/go-build" GOMODCACHE="$workspace/.cache/go-mod" GOTOOLCHAIN=local GOPROXY=off GOSUMDB=off go test -race -count=1 -run '^TestNSECatalogWorkflow$' -v ./internal/nse)
}
ui_phase() {
  SIRIUS_TEST_NSE_WORKFLOW_PHASE="$1" "$ui/node_modules/.bin/tsx" --test "$ui/src/server/nseMutations.integration.test.ts"
}
rest_phase() {
  cp "$workspace/Sirius/sirius-api/go.mod" "$tmp/api.mod"
  cp "$workspace/Sirius/sirius-api/go.sum" "$tmp/api.sum"
  (cd "$workspace/Sirius/sirius-api" &&
   GOWORK=off go mod edit -modfile="$tmp/api.mod" -replace="github.com/SiriusScan/go-api=$workspace/minor-projects/go-api" &&
   GOWORK=off GOCACHE="$workspace/.cache/go-build" GOMODCACHE="$workspace/.cache/go-mod" GOTOOLCHAIN=local GOPROXY=off GOSUMDB=off go test -race -mod=mod -modfile="$tmp/api.mod" handlers/script_handler.go handlers/script_handler_workflow_integration_test.go -run '^TestScriptRESTDisposableWorkflow$' -count=1 -v)
}
scanner seed
ui_phase mutate
rest_phase
ui_phase rest-verify
scanner sync
ui_phase verify
scanner collision
scanner sync
ui_phase verify
echo 'PASS scanner -> UI mutations -> REST HTTP -> UI readers -> repeated scanner sync, collision rejection, UI verification'
