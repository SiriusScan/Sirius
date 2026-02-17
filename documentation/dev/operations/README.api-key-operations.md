---
title: "API Key Operations Runbook"
description: "Production runbook for service API key rotation, bootstrap recovery, and incident response."
template: "TEMPLATE.guide"
llm_context: "high"
categories: ["operations", "security", "deployment"]
tags: ["apikey", "rotation", "incident-response", "valkey", "runbook"]
related_docs:
  - "README.development.md"
  - "README.docker-container-deployment.md"
  - "README.auth-surface-matrix.md"
---

# API Key Operations Runbook

This runbook defines production-safe operations for Sirius service API keys.

## Scope

Applies to service-to-service credential `SIRIUS_API_KEY` used by:
- `sirius-api`
- `sirius-ui` (server-side tRPC -> API calls)
- `sirius-engine` and agent/scanner API clients

## Baseline Invariants

- `SIRIUS_API_KEY` must be non-empty in production.
- Go API must reject requests without a valid `X-API-Key`.
- Only `/health` is public.
- Key bootstrap must reconcile metadata and bootstrap flag on startup.

## Rotation Procedure (No Downtime)

### 1) Create new key

1. Authenticate as admin in UI.
2. Create a new API key in Settings.
3. Record:
   - key value (shown once)
   - key id/hash
   - label

### 2) Deploy new key to services

1. Update deployment secret store or environment value for `SIRIUS_API_KEY` with the new key.
2. Roll out services in order:
   1. `sirius-api`
   2. `sirius-ui`
   3. `sirius-engine`
3. Validate:
   - API 401 rate does not spike.
   - UI can read/write through tRPC.
   - scanner/agent host submissions continue.

### 3) Revoke old key

1. After rollout and validation period, revoke old key in UI.
2. Confirm old key returns 401.
3. Close rotation ticket.

## Incident: Valkey Data Loss

Symptoms:
- sudden 401s with previously valid key
- API key list empty
- bootstrap state inconsistent

Recovery:
1. Restore Valkey from backup if available.
2. If no backup:
   - ensure production `SIRIUS_API_KEY` is correctly set for all services.
   - restart `sirius-api` first to reconcile key metadata + bootstrap state.
3. Restart `sirius-ui` and `sirius-engine`.
4. Validate end-to-end operations and security harness results.

## Incident: Bootstrap Mismatch (Flag/key metadata drift)

Symptoms:
- bootstrap flag exists but key lookups fail
- key exists but bootstrap flag absent

Recovery:
1. Confirm deployed `SIRIUS_API_KEY` value in runtime environment.
2. Restart `sirius-api` (reconciliation should repair state).
3. Re-check:
   - key validation success for deployed key
   - bootstrap complete marker present
4. If still failing, capture API logs and run security harness `auth-surface` and `api` suites.

## Incident: Unauthorized Agent/Scanner API Writes

Symptoms:
- scanner/agent host submissions return 401

Recovery:
1. Verify `SIRIUS_API_KEY` is present in engine/scanner/agent runtime.
2. Verify clients send `X-API-Key`.
3. Validate key exists in API key list and is not revoked.
4. Roll service restart after secret correction.

## Validation Commands

Run security checks from repository root:

```bash
cd testing/security
go run . --suite api
go run . --suite trpc
go run . --suite auth-surface
```

## Operational Checklist

- [ ] `SIRIUS_API_KEY` secret exists and is non-empty in production.
- [ ] API startup confirms key reconciliation succeeded.
- [ ] UI + engine are using the same active service key.
- [ ] Old keys are revoked only after rollout validation.
- [ ] Recovery procedure for Valkey/key mismatch is documented in incident ticket.

