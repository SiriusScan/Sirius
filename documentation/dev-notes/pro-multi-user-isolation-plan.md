---
title: "Pro vertical: local multi-user + owner isolation"
description: "Shortest-path plan to ship per-user data isolation as the first Sirius Pro feature."
llm_context: high
categories: ["product", "architecture", "security"]
tags: ["sirius-pro", "multi-user", "owner-isolation", "auth"]
related_docs:
  - "pro-bifurcation-plan.md"
  - "../architecture/ADR.001-public-core-private-extension.md"
  - "../architecture/ADR.003-entitlement-model.md"
  - "../architecture/README.auth-surface-matrix.md"
  - "../product/edition-boundary.yaml"
status: proposed
sources:
  - "agent-base codex review gpt-5.6-luna/max (explore) — accepted"
  - "agent-base codex review gpt-5.6-sol/high (design) — accepted"
  - "agent-base codex review gpt-5.6-sol/high (class-hack brainstorm) — accepted"
  - "Parent verification of cited paths 2026-08-01 / 2026-08-02"
---

# Pro vertical: local multi-user + owner isolation

**Status:** proposed (class-cut path refined; awaiting product confirmation)  
**Replaces as first vertical:** Enterprise Reporting (`reporting.enterprise`)  
**Capability id:** `identity.multi_user_local`

## Class objective (short-term north star)

Each student logs in as a provisioned non-admin, sees a **blank slate**, runs **their own scan**, and gets results in **their** workspace without pollution from classmates scanning the same IPs.

- **Required now:** ownership scoping on **scans** (and the student-visible workspace derived from them).
- **Not required for class:** ownership scoping on **hosts** / shared Postgres inventory.
- Temporary hacks / cache modes are acceptable if they hit the class objective.

## Verdict

### Class cut (ship first)

**Owned Valkey scan workspace + single-engine scratchpad broker** (Sol class-hack option 2):

```text
student session → scan:job:{id} + currentScan:{subject}
                → one active job copied to legacy currentScan / RabbitMQ
                → reconciler mirrors into owner workspace only on ID match
                → student Scanner UI reads only currentScan:{subject}
```

- Non-admins are **Scanner-only**; shared Postgres host/vuln inventory stays admin/system (may still get polluted internally — students must not query it).
- UI-only key renaming is **rejected**: app-scanner hardcodes global `currentScan` and holds global manager state; concurrent Rabbit consumers can clobber each other.
- Filter-by-`scan_id` over shared hosts is **rejected for class**: history/`scan_id` seam is incomplete; live scanner state stays global.
- Full `owner_subject_id` on hosts remains the **long-term** upgrade, not the class blocker.

### Long-term (after class)

Per-job scanner context → durable `scan_runs` → host `owner_subject_id` + actor assertion into Go (prior full plan).

## Current state (evidence)

| Fact | Evidence |
|---|---|
| Login is NextAuth Credentials + bcrypt; JWT sessions ~100y | `sirius-ui/src/server/auth.ts` |
| Bootstrap seeds/overwrites single `admin` | `sirius-ui/prisma/seed.ts` |
| tRPC only checks “some session exists” | `sirius-ui/src/server/api/trpc.ts` |
| Profile/password accept caller-supplied `userId` (IDOR once multi-user) | `sirius-ui/src/server/api/routers/user.ts` |
| UI→Go uses shared `X-API-Key` only — no user identity | `sirius-ui/src/server/api/shared/apiClient.ts` |
| Auth DB is SQLite under `/app/prisma/dev.db` (not durable Compose volume) | `sirius-ui/start-prod.sh`, `prisma/schema.prisma` |
| Host/vuln/scan data in Postgres/Valkey has no NextAuth owner | go-api `models.Host` (`ClientID` exists but is unrelated Prime Radiant field) |
| Scan state is global `currentScan` | `scanner.ts` / store |
| Docs already call out single-admin | `README.auth-surface-matrix.md` |

## Product scope

### Class cut — in scope

- Admin creates/deactivates/resets local student users.
- Non-admin: blank Scanner workspace; start/status/personal-reset of **owned** scans only.
- Per-subject Valkey workspace + owned job records; one active engine job (queue the rest).
- Students denied shared inventory / agents / terminal / raw store+queue.
- Capability `identity.multi_user_local` for user-management UX (static range grant OK).

### Class cut — out of scope

- Host/finding ownership in Postgres; true parallel engine execution; agent scans  
- Student cancel of the live engine job; long scan history lists  
- SSO / self-reg / teams / full RBAC / HA / signed license issuer / CloudEvents / full UI registry  

### Long-term (after class)

- Concurrent scan execution; host `owner_subject_id`; actor assertion into Go inventory APIs

## Architecture

### Class cut (recommended)

| Layer | Community | Pro (`sirius-pro`) |
|---|---|---|
| Identity: durable users, `subject_id`, role/active, shorter sessions | Yes | — |
| Admin user CRUD primitives | Yes | Polished Users UX overlay |
| `adminProcedure` + student Scanner-only policy | Yes | Class nav/redirect packaging |
| Owned scan broker (`scan:job:*`, `currentScan:{subject}`, active lease) | Yes | Class E2E + docs |
| Legacy `currentScan` as **engine scratchpad only** | Yes | — |
| Capability `identity.multi_user_local` | Identifier seam | Static grant in private image |

Fail-closed: missing/corrupt job metadata → empty workspace, **never** fall back to global `currentScan` for a student.

### Why not “just rename the Valkey key”?

- Scanner updater hardcodes `currentScan` (`app-scanner` updater).
- Scanner manager holds global scan ID / cancel state.
- Queue can run concurrent consumers that clobber that global state.
- Generic `store` / `queue` tRPC lets any logged-in user poke allowed keys / publish scan messages — must be admin-only for students.

### Long-term architecture (deferred)

Prior plan: HMAC actor assertion → Go principal → `owner_subject_id` on hosts → owner-required repos. Still valid; not the class path.

## Implementation order (class cut)

1. **Docs/program realignment** — first vertical = class multi-user scan workspaces; defer host ownership + Reporting.
2. **Identity + durability (Community)** — subjects, role/active, durable auth DB, session-bound profile/password, admin user CRUD, stop seed password clobber.
3. **Class surface lock-down (Community)** — deny inventory/agents/terminal/raw store/queue to non-admins; Scanner-only nav/redirect.
4. **Owned scan broker (Community)** — job/workspace/queue/active lease; `startOwnedScan` / status / personal reset; one job per student; one active engine job.
5. **Scratchpad reconcile + class UI** — dispatch active job; ID-matched mirror into owner workspace; replace `useStartScan` / `useScanResults` for students; no shared-DB enrichment.
6. **Pro packaging + two-user E2E** — Users UX, capability grant, Alice/Bob same-IP proof on range.

Host ownership / actor-into-Go remain a later phase after class.

## Acceptance criteria (class cut)

1. Admin creates Alice and Bob; both log in as non-admin.
2. Each lands on Scanner with an empty workspace (no other student’s hosts/findings/progress).
3. Alice and Bob can each submit a scan of the same IP; each sees only their own progress/results.
4. Alice’s start/finish/reset never changes Bob’s screen (and vice versa).
5. Refresh / re-login restores that student’s latest owned workspace; a fresh account stays blank.
6. Direct tRPC probes from a student to host list / vulns / global `currentScan` / raw queue fail closed.
7. Instructor/admin can still use inventory and recovery controls.
8. Community single-admin path still works; independence/leakage checks green.

## Validation commands

```bash
# Community UI
cd sirius-ui && npm ci && npx prisma validate && npx tsc --noEmit && npm run build

# Community API / go-api
cd sirius-api && go test -race ./...
cd /path/to/go-api && go test -race ./sirius/...

# Distribution
bash scripts/test-community-independence.sh
bash scripts/test-core-manifest.sh

# Pro
cd private/sirius-pro && make test && make validate-platform
```

Plus a two-browser-context E2E: create Alice/Bob → both submit same-IP scan → each sees only own workspace → queue promotion → student probes to inventory/`currentScan`/queue fail → refresh restores owned workspace.

## Human decisions (class cut — confirm before coding)

1. **Serialize engine execution** for the class (queue students; one active scan)? Main go/no-go for class size vs scan duration.  
2. Network-only scans; no student cancel of the live engine job (queued withdraw + clear personal workspace OK)?  
3. Latest owned workspace + TTL enough (no student scan history list)?  
4. Class deploy stays single UI replica (broker in UI/tRPC + Valkey), or need a separate broker process?  
5. Admin-provisioned accounts only; students never see shared inventory pages?  
6. Proceed with program realignment around this class cut (host ownership deferred)?

## Program doc updates required (when approved)

- `programs/bifurcation/PROGRAM.md` — replace Reporting acceptance; rewrite multi-user non-goal; Stage 5 → local multi-user.
- `programs/complete-split-deploy-to-range/PROGRAM.md` — same first-vertical swap.
- `documentation/dev-notes/pro-bifurcation-plan.md` Phase 5.
- `documentation/product/edition-boundary.yaml` — add `identity.multi_user_local`; keep `reporting.enterprise` deferred.
- `tasks/pro-bifurcation.json` — retarget Phase 5; defer 3.3–3.6 / 4.x as hard blockers (keep as parallel hardening).

## Artifact pointers

- Luna explore: `/tmp/sirius-pro-auth-plan/artifacts-luna/20260802T013957Z-codex-review-63791/`
- Sol design: `/tmp/sirius-pro-auth-plan/artifacts-sol/20260802T014001Z-codex-review-64159/`
- Sol class-hack: `/tmp/sirius-pro-auth-plan/artifacts-sol-class/20260802T033744Z-codex-review-20987/`
