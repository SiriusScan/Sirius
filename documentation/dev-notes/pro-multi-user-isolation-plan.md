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
  - "Parent verification of cited paths 2026-08-01"
---

# Pro vertical: local multi-user + owner isolation

**Status:** proposed (awaiting product confirmation of human decisions below)  
**Replaces as first vertical:** Enterprise Reporting (`reporting.enterprise`)  
**Capability id:** `identity.multi_user_local`

## Verdict

Ship **admin-provisioned local users + API-authoritative owner-scoped visibility** as the first Pro vertical. Community owns identity/ownership *primitives*; Pro owns user-management UX and the private composition that proves the split.

Do **not** block on CloudEvents, full UI registry, or Ed25519 license issuance. Do **not** implement isolation in the UI alone — it would be insecure.

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

**In scope**

- Admin creates/deactivates/resets local users (temporary password + forced change).
- Each non-admin user sees only data they created (owner-scoped).
- Same IP may exist once per owner.
- API + async paths enforce isolation; UI is informative only.
- Thin capability gate `identity.multi_user_local` for the management surface (static range provider OK).

**Out of scope (this vertical)**

- SSO / OIDC / SAML / SCIM / self-registration / invites  
- Full RBAC matrix, teams, orgs, workspaces, sharing  
- HA / multi-UI-replica session store redesign beyond session_version  
- Enterprise Reporting  
- Full CloudEvents platform / full Sidebar registry migration  
- Customer-facing signed license issuer (defer to ADR-003 later)

## Architecture (shortest path)

```text
Browser → NextAuth (subject_id in JWT)
       → tRPC (session + active/session_version)
       → signed short-lived actor assertion (HMAC) + infra API key
       → Go API principal middleware
       → owner-required repositories / aggregates
       → scan jobs carry owner → engine ingestion stamps owner
```

| Layer | Community | Pro (`sirius-pro`) |
|---|---|---|
| Identity table `auth_users` + stable `subject_id` | Yes | — |
| Owner columns + scoped repos/handlers | Yes | Packaging / E2E proof |
| Actor assertion contract | Yes | Strict actor-required mode on Pro |
| Users admin UX / create-user flows | Minimal hook only | Private overlay page + routers |
| Capability `identity.multi_user_local` | Identifier + evaluator seam | Static grant in private image |
| Licensing issuer | — | Deferred |

Do **not** trust a plain `X-User-ID` header. Do **not** reuse host-local OS `users` table or `ClientID` for this.

### Isolation defaults (proposed)

- **Owner-scoped:** hosts (+ derived findings), scans/status/control, snapshots, API keys, terminal history, user-created templates.
- **Shared read-only:** CVE catalog, built-in NSE/system templates.
- **Admin/system-only initially:** agents, repositories, system logs/events, raw queue/admin ops.
- **Admin data bypass:** none — admin manages users, not everyone’s scan data.
- **Legacy backfill owner:** `local:admin`.

### Capability vs security

Losing `identity.multi_user_local` may disable *creating* users; it must **not** merge data, unlock cross-user reads, or lock users out of their own existing data.

## Implementation order (small PRs)

1. **Docs/program realignment** — first vertical = multi-user isolation; narrow the old “no multi-user RBAC” non-goal; add `identity.multi_user_local`; defer Reporting.
2. **Auth hardening (Community)** — stop caller-supplied `userId` targeting; shorten sessions; stop seed password overwrite on every boot; active/session_version checks.
3. **Durable identity (Community)** — move used identity model to Postgres `auth_users`; stable subjects; SQLite import/preflight.
4. **Ownership schema (go-api + pin)** — `owner_subject_id`, backfill, composite indexes, owner-required host repos/aggregates.
5. **Actor + API enforcement (Community)** — HMAC actor, principal middleware, owner-bound keys, IDOR tests.
6. **Async/Valkey (Community)** — owner on scan payloads; namespaced `currentScan`/snapshots; no CloudEvents required.
7. **Minimal UI extension hook (Community)** — enough for one private page/nav entry (not full registry).
8. **Private composition (`sirius-pro`)** — real overlay into ephemeral pinned Community checkout (platform build today is stamp-only).
9. **Pro product** — Users UX, admin ops, static capability provider, strict actor config.
10. **Range E2E** — two-user isolation suite on digest-pinned Pro images.

Do not enable additional users against locked Community `v1.1.0` — it has no owner-aware API.

## Acceptance criteria (testable)

1. Admin creates Alice and Bob; both log in; disabled users cannot.
2. Both scan the same IP → distinct owned host records.
3. Each sees only own hosts/findings/counts/snapshots/scan state/API keys.
4. Cross-owner detail probes return `404` (no existence leak).
5. Alice cannot mutate Bob’s profile via legacy id/subject.
6. Forged/missing actor assertion rejected on user-facing Go routes.
7. Alice’s dynamic API key cannot read Bob’s data.
8. Alice cannot cancel/reset Bob’s scan; async results retain owner.
9. Pre-migration data visible only to `local:admin`; row counts preserved; no null owners.
10. Capability-off blocks user management; existing users retain owner-scoped access.
11. Community still runs license-free with one admin; leakage/independence checks green.
12. Removing private overlay leaves owner-aware Community + data intact.

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

Plus a two-browser-context E2E covering create users → dual scan → list/detail/aggregate/key/cancel isolation → forged actor → deactivate → capability-off → overlay remove.

## Human decisions (defaults — confirm before coding)

1. Owned surface = scan-derived data + snapshots + API keys; global ops admin-only initially.  
2. Legacy owner = `local:admin`.  
3. Admin has **no** cross-user data bypass.  
4. Admin-provisioned only (no self-registration).  
5. Same target ⇒ duplicate host rows per owner (allowed).  
6. Session ≈ 8h + DB session_version invalidation (not 100y).  
7. Static capability provider for range; signed issuer later.  
8. Import SQLite users if present; abort on ambiguous multi-admin.

## Program doc updates required (when approved)

- `programs/bifurcation/PROGRAM.md` — replace Reporting acceptance; rewrite multi-user non-goal; Stage 5 → local multi-user.
- `programs/complete-split-deploy-to-range/PROGRAM.md` — same first-vertical swap.
- `documentation/dev-notes/pro-bifurcation-plan.md` Phase 5.
- `documentation/product/edition-boundary.yaml` — add `identity.multi_user_local`; keep `reporting.enterprise` deferred.
- `tasks/pro-bifurcation.json` — retarget Phase 5; defer 3.3–3.6 / 4.x as hard blockers (keep as parallel hardening).

## Artifact pointers

- Luna explore: `/tmp/sirius-pro-auth-plan/artifacts-luna/20260802T013957Z-codex-review-63791/`
- Sol design: `/tmp/sirius-pro-auth-plan/artifacts-sol/20260802T014001Z-codex-review-64159/`
