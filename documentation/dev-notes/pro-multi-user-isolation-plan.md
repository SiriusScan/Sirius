---
title: "Pro vertical: local multi-user + owner isolation"
description: "Class-ready multi-user scan workspaces with concurrent owned scans, cancel, and student API-key/agent isolation."
llm_context: high
categories: ["product", "architecture", "security"]
tags: ["sirius-pro", "multi-user", "owner-isolation", "auth", "class"]
related_docs:
  - "pro-bifurcation-plan.md"
  - "../architecture/ADR.001-public-core-private-extension.md"
  - "../architecture/ADR.003-entitlement-model.md"
  - "../architecture/README.auth-surface-matrix.md"
  - "../product/edition-boundary.yaml"
status: accepted
sources:
  - "agent-base codex review gpt-5.6-luna/max (explore) — accepted"
  - "agent-base codex review gpt-5.6-sol/high (design) — accepted"
  - "agent-base codex review gpt-5.6-sol/high (class-hack / serialized) — superseded"
  - "agent-base codex review gpt-5.6-sol/high (class concurrent) — accepted"
  - "Parent verification + product feedback 2026-08-02"
  - "Human decisions locked 2026-08-02 (recommended defaults)"
  - "Product override 2026-08-02: student inventory UI via latest owned scan"
---

# Pro vertical: local multi-user + owner isolation

**Status:** accepted (class concurrent path; human decisions locked)  
**Replaces as first vertical:** Enterprise Reporting (`reporting.enterprise`)  
**Capability id:** `identity.multi_user_local`

## Class objective (short-term north star)

Each of ~19 students logs in as a provisioned non-admin, sees a **blank slate**, runs **their own scan concurrently with classmates** (including same IPs), can **cancel their live job**, and sees results only in **their** workspace — including Environment / Vulnerabilities / Host views backed by that workspace. Student-created API keys and agents enrolled with those keys are **owner-scoped**.

- **Required:** scan ownership, concurrent execution, cancel of own live job, latest workspace only, student API-key + agent isolation, student inventory UI from latest owned scan.
- **Not required for class:** Postgres host/`owner_subject_id` ownership (students must still not query shared Postgres inventory).
- Temporary Valkey workspace mode is acceptable; host `owner_subject_id` remains a later upgrade.

## Verdict

### Class cut (ship first) — Option 3-lite

**Concurrent per-job scanner contexts** inside one `app-scanner` process + per-job Valkey state.  
**Rejected:** serialized single-engine scratchpad broker (product requires simultaneous scans).  
**Rejected:** UI-only `currentScan` rename (global manager/updater still clobber).  
**Deferred:** full host `owner_subject_id`.

```text
session subject
  → scanner.startOwnedScan (server ID + owner)
  → scan:latest / scan:owner / scan:state / scan:status
  → Rabbit scan-v2 { id, owner_subject_id, targets, options }
  → app-scanner jobs[scanID] + bounded shared worker pool (~24)
  → student UI polls getLatestOwnedScan only
```

### Product decisions already accepted

| Topic | Decision |
|---|---|
| Concurrent scans | **Required** (~19 students, light targets, 10G backbone) |
| Cancel live job | **Required** (full Scanner capability for students) |
| Latest workspace only | OK (no history list) |
| Single UI replica | OK |
| Host ownership (Postgres) | Deferred; students never query shared inventory |
| Student inventory UI | **In class cut** via latest owned scan workspace only |
| Student API keys | Allowed; **locked to owning student** |
| Agents | Visible/dispatchable only to key/agent owner |

## Current state (evidence)

| Fact | Evidence |
|---|---|
| Login NextAuth Credentials; JWT ~100y | `sirius-ui/src/server/auth.ts` |
| Single seeded `admin` | `sirius-ui/prisma/seed.ts` |
| tRPC = any session | `sirius-ui/src/server/api/trpc.ts` |
| Profile IDOR via caller `userId` | `sirius-ui/src/server/api/routers/user.ts` |
| UI→Go shared API key only | `sirius-ui/src/server/api/shared/apiClient.ts` |
| Global `currentScan` UI write/poll | `useStartScan.ts`, `useScanResults.ts` |
| Scanner global ID/options/cancel + hardcoded `currentScan` | `app-scanner` `manager.go`, `updater.go` |
| Rabbit auto-ack + concurrent goroutines | go-api `sirius/queue/queue.go` |
| API keys: `created_by` label, list/revoke global | `apikey_handler.go`, `store/apikey.go` |
| Agents listed from global `connected_agents` | `sirius-ui/.../agent.ts` |
| Auth DB SQLite under `/app/prisma/dev.db` | `start-prod.sh` |

## Product scope

### Class cut — in scope

- Admin create/deactivate/reset student users; durable identity + `subject_id` + role/active.
- Non-admin Scanner experience: blank workspace, start/status/**cancel**/force-stop/reset of **owned** latest scan.
- Concurrent network (+ agent) scans across students; same IP allowed; overlapping execution.
- Per-job Valkey state; one **active job per student** while all students may run concurrently.
- Student API keys with immutable `OwnerSubjectID`; default scope `agent:enroll` (not general `/host` access).
- Agent enrollment requires student key; agent token pinned to owner; list/dispatch/results owner-scoped.
- Student Environment / Vulnerabilities / Host UI: adapters read **latest owned scan** (`scanner.getLatestOwnedScan` / Valkey) only — never shared Postgres.
- Shared NSE/script **catalog reads** allowed for authed users; initialize/create/update/delete remain staff-only.
- Deny students: shared Postgres inventory queries, Terminal, dashboard/system-monitor, raw `store` mutations / `queue`, global `currentScan`, other owners’ keys/agents/scans.
- Capability `identity.multi_user_local` for user-management UX (static range grant OK).

### Class cut — out of scope / deferred

- Host/finding ownership in Postgres (`owner_subject_id`); durable shared inventory isolation  
- Scan history lists; SSO/self-reg/teams/full RBAC/HA/multi-UI  
- General-purpose student API keys for shared HTTP APIs  
- Durable Rabbit / multi-scanner HA  
- Signed license issuer; CloudEvents; full UI registry; Reporting  

## Architecture

### Valkey model (class)

| Key | Purpose |
|---|---|
| `scan:latest:<subject-digest>` | Caller’s latest scan ID |
| `scan:owner:<scan-id>` | Immutable owner subject |
| `scan:state:<scan-id>` | `ScanResult` payload |
| `scan:status:<scan-id>` | `dispatching/running/cancelling/...` (separate from result doc) |
| `scan:agents:<scan-id>` | Agents attached to this scan |
| `agents:connected:<subject-digest>` | Owner-scoped connected agents |
| `apikey:<hash>` | Existing meta + `OwnerSubjectID` + `Scopes` |
| `agent_token:<agent-id>` | Existing meta + owner + enrolling key ID |

### app-scanner changes

- Replace global `currentScanID` / options / cancel with `jobs map[scanID]*JobContext`.
- Keyed updater writes `scan:state:<id>` only; never global `currentScan` for class jobs.
- Bounded shared worker pool (recommend 24 workers; ~32 expanded-target cap per job).
- Exact-ID cancel only; force-stop must not proceed on mismatched IDs.
- Tool factory / options must be job-local (no shared mutable options across jobs).

### UI / tRPC

Dedicated procedures (session-derived owner; never trust client owner):

- `scanner.startOwnedScan` / `getLatestOwnedScan` / `cancelOwnedScan` / `forceStopOwnedScan` / `resetOwnedWorkspace`
- `apikeys` create/list/revoke filtered by owner (students)
- `agent.listOwnedAgents` / owned dispatch + status
- Student inventory adapters (`ownedScanInventory`): `host.getEnvironmentSummary`, `vulnerability.getAllVulnerabilities` / `getVulnerability` / `getAffectedHosts`, `host.getHostWithSources` — role-branch to owned scan for students; Postgres/Go path for staff
- Soft empty stubs for student software/history chrome (no shared inventory probes)

Raw `store` mutations / `queue` → **staff-only**. NSE/script catalog **reads** are `protectedProcedure`. Students do not enrich UI from shared Postgres hosts.

### Cancel

1. Owner-checked `cancelOwnedScan` → set `scan:status=cancelling` → publish exact-ID control.
2. Scanner cancels only `jobs[scanID]` context (network + agent fan-out for that scan).
3. Alice cancel never touches Bob’s same-IP job.
4. Terminal writers reject further result merges after cancel.

### API keys + agents

- Student create: `OwnerSubjectID` from session; scope default `agent:enroll`.
- List/revoke: owner filter; admins get separate all-keys ops.
- Enrollment: first agent connect presents student key; pin owner on `AgentTokenMeta`.
- Visibility: replace global `connected_agents` student path with `agents:connected:<subject>`.
- Dispatch/results: agent owner must equal scan owner; mismatch fails closed.
- Key revoke: block new enroll immediately; existing agents fail on next reconnect (live kill = admin for class).

### Long-term upgrade path

Per-job scanner (this cut) → durable `scan_runs` → host `owner_subject_id` + actor assertion into Go inventory.

## Implementation slices

1. **Identity + policy** — subjects, role/active, durable auth, admin CRUD, session-bound profile/password, student nav allowlist (Scanner + owned-scan inventory)/`adminProcedure`.
2. **Owned API keys** — `OwnerSubjectID` + scopes; owner create/list/revoke; deny student keys on shared inventory HTTP APIs.
3. **Agent enrollment/visibility** — key-gated enroll, owner-pinned tokens, scoped connected lists, owned dispatch checks.
4. **Concurrent scanner core** — `JobContext` registry, keyed updater, job-local options, bounded pool, completion accounting.
5. **Owned scan gateway + UI** — server IDs, Valkey model, replace `useStartScan`/`useScanResults`, lock down store/queue.
6. **Owned cancel** — exact network + agent cancel, force/reset isolation, terminal-write guards.
7. **Proof + Pro packaging** — 19-user/same-IP concurrency, Alice-cancel/Bob-continues, key/agent cross-owner probes, Users UX + capability grant, docs.

## Acceptance criteria (class)

1. Admin creates ~19 students; each fresh login shows blank Scanner workspace.
2. Alice and Bob start same-IP scans with **overlapping execution** (not merely queued).
3. 19-user smoke accepts concurrent jobs under class worker config.
4. Each student sees only their latest scan progress/results.
5. Alice cancel stops only Alice; Bob continues to completion.
6. Cross-owner `scan_id` on status/cancel/reset → `NOT_FOUND`/`FORBIDDEN`.
7. Refresh restores latest owned workspace; new account blank; no history UI.
8. Students cannot access global `currentScan`, raw store mutations/queue, Terminal, or shared Postgres inventory.
9. Student Environment / Vulnerabilities / Host pages show only latest owned-scan data (blank if no scan); cross-owner host/vuln IDs → empty/`FORBIDDEN`.
10. Students create/list/revoke only their API keys (`created_by` is not authz).
11. Agent on Alice’s key visible/usable only to Alice (and admin); Bob cannot use it.
12. Agent results merge only into same-owner scans.
13. Community single-admin + shared Postgres still work; independence/leakage green.

## Validation

```bash
cd sirius-ui && npm ci && npx prisma validate && npx tsc --noEmit && npm run build
cd sirius-api && go test -race ./...
# app-scanner + go-api packages touched by JobContext / apikey / agent token
cd private/sirius-pro && make test && make validate-platform
```

E2E: provision Alice/Bob → concurrent same-IP → cancel Alice → Bob completes → key/agent cross-owner probes → refresh workspace → student Environment/Vuln/Host shows only own scan → shared Postgres inventory probe fails.

## Human decisions (locked 2026-08-02)

Recommended defaults are **locked**; PROGRAM / edition-boundary / task realignment proceeds from this plan.

1. **Student key scope:** `agent:enroll` only until resources have owners.  
2. **Per-student live-job limit:** one active job per student; all students concurrent.  
3. **Capacity defaults:** 24 workers, ~32 expanded targets/job; tune after 19-user test.  
4. **Key revoke:** block enroll + reconnect immediately; live kill remains admin for class.  
5. **PROGRAM realignment:** first Pro vertical = this class cut (not Enterprise Reporting).

## Program doc updates

- `programs/bifurcation/PROGRAM.md` / `complete-split-deploy-to-range/PROGRAM.md` — first vertical = class multi-user concurrent scan workspaces; narrow old RBAC non-goal.
- `documentation/dev-notes/pro-bifurcation-plan.md` Phase 5.
- `documentation/product/edition-boundary.yaml` — `identity.multi_user_local`; Reporting deferred.
- `tasks/pro-bifurcation.json` — retarget Phase 5; do not hard-block on full 3.3–4.x.

## Artifact pointers

- Luna explore: `/tmp/sirius-pro-auth-plan/artifacts-luna/20260802T013957Z-codex-review-63791/`
- Sol design: `/tmp/sirius-pro-auth-plan/artifacts-sol/20260802T014001Z-codex-review-64159/`
- Sol serialized (superseded): `/tmp/sirius-pro-auth-plan/artifacts-sol-class/20260802T033744Z-codex-review-20987/`
- Sol concurrent (current): `/tmp/sirius-pro-auth-plan/artifacts-sol-concurrent/20260802T034955Z-codex-review-27427/`
