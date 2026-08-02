---
goal: "Each class student gets a personal tour of Sirius: full product surfaces (Scanner, Environment, Hosts, Vulnerabilities, Settings/API keys/agents) with isolation so classmates never see each other's data; blank slate until they generate results; concurrent same-IP scans OK."
status: "active"
stack: "existing Sirius monorepo (Next.js UI, Go API, app-scanner, Postgres, Valkey)"
stack_source: "established repository"
acceptance_criteria:
  - "Alice and Bob login as students; each sees blank Environment/Vuln until they scan"
  - "Both start concurrent scans of the same IP; both complete; each Environment/Host/Vuln shows only their findings (ports/OS/vulns), never the classmate's"
  - "Alice cancel does not affect Bob's live job or inventory"
  - "Student sidebar: Scanner, Vulnerabilities, Environment; Host detail works with ports from their scan"
  - "Settings: password change + owned API keys + owned agents"
  - "Students cannot query shared unscoped Postgres inventory or Terminal/system-monitor"
  - "Admin retains Users admin + full shared/global inventory view"
human_gates:
  - "Range deploy after ownership cut (operator)"
  - "Do not force-push main; feature branch + PR"
sources:
  - "agent-base route recommend technical_planning → grok_default (Cursor API pool saturated)"
  - "agent-base throttle refresh → open (seat Josh, weekly 6%)"
  - "Product override 2026-08-02: personal tour north star (not Valkey stub end-state)"
---

# Program: personal-tour-class

## Outcome

Class pedagogy: every student gets a **personal tour of the tool** — the real Sirius surfaces with **their** data, not a shared inventory and not an empty stub.

## Architecture decision (parent + agent-base consult)

**Reject as end-state:** Valkey-only UI adapters that leave Host ports/OS/software empty.

**Reject for same-IP class:** single `hosts.owner_subject_id` column upserted by IP alone (Alice and Bob scanning `10.0.0.5` would clobber one row).

**Accept — Option B (owned host identity):**

Scan persistence already posts `POST /host/with-source` (`app-scanner` → `sirius-api` → `go-api` `UpsertHost` by IP). For class:

1. Host uniqueness becomes **`(owner_subject_id, ip)`** (or equivalent owned host row / junction that yields per-owner inventory).
2. Scanner passes `owner_subject_id` on host upsert from the job context.
3. Student tRPC inventory paths query Go/Postgres **filtered by session subject** (reuse real Host/Environment shapes: ports, vulns, sources).
4. Valkey remains the **live scan workspace** (progress/cancel/latest); Postgres becomes the **durable personal inventory** after findings land.
5. Admin queries remain unscoped (or see all owners).

Valkey adapters (`ownedScanInventory.ts`) stay as fallback for in-flight scans before persistence completes, then Postgres owned rows win.

## Non-goals (still deferred)

- Scan history lists, SSO, self-reg, teams, full RBAC, HA/multi-UI
- Enterprise Reporting
- General-purpose student HTTP API keys beyond `agent:enroll`
- Perfect NVD enrichment parity on every finding page chrome

## Risks

- Schema migration on range Postgres (attached volume) must be additive and safe
- Admin demos that relied on global IP merge behavior change — document
- Engine image rebuild required (scanner + go-api + api + ui)

## Loop limits

- Cycle budget: 12; wall-clock soft stop: class deadline
- Retry: 2 attempts per task_id then reframe/escalate
- Stop when Alice/Bob acceptance checklist passes on range

## Retry policy

- Retryable: flaky deploy, migration lock, CI flake
- Reframe: if `(owner, ip)` uniqueness conflicts with existing HID model
- Escalate: Grok → Terra-high → Sol-high on concrete failure (`capability`/`escalation`)

---

## Stage 1: Frame

Owned paths:

- `programs/personal-tour-class/PROGRAM.md`
- `documentation/dev-notes/pro-multi-user-isolation-plan.md`

Tasks:

- [x] Confirm goal and acceptance criteria (personal tour north star)
- [x] Record architecture decision (owned host identity for same-IP)
- [x] Realign `pro-multi-user-isolation-plan.md` (pull Postgres ownership into class cut)

## Stage 2: Owned host persistence

Owned paths:

- `minor-projects/go-api/sirius/postgres/**` (or migrations in Sirius)
- `minor-projects/go-api/sirius/host/**`
- `sirius-api/handlers/host_handler.go`
- `minor-projects/app-scanner/internal/scan/**`

Tasks:

- [x] Schema: per-owner host identity `(owner_subject_id, ip)` + migrate (`008_host_owner_subject`, go-api `cb14626`)
- [x] `UpsertHost` / `AddHostWithSource` accept owner; scanner passes job owner (`4bc92c4`)
- [x] List/get host APIs support `owner_subject_id` filter (Sirius `fa1c23bab`)

## Stage 3: Student inventory on real APIs

Owned paths:

- `sirius-ui/src/server/api/routers/{host,vulnerability,statistics}.ts`
- `sirius-ui/src/server/api/shared/ownedScanInventory.ts`
- `sirius-engine/Dockerfile` + `sirius-api/go.mod.prod` (pin go-api `cb14626`, app-scanner `4bc92c4`)

Tasks:

- [x] Student host/vuln/env procedures call owned Postgres filters (`?owner_subject_id=`) — `9f9930aa0`
- [x] In-flight: Valkey fallback when Postgres owned list empty; completed: Postgres owned rows
- [x] Pin engine/API to Stage 2 SHAs (`cb14626` / `4bc92c4`)
- [x] Keep NSE catalog reads; keep Terminal denied

## Stage 4: Validate on range

Owned paths:

- `deployments/` on range guest (operator)
- `programs/personal-tour-class/PROGRAM.md`

Tasks:

- [x] Rebuild/pin engine+api+ui; run migrate `008_host_owner_subject`; deploy (range 2026-08-02)
- [ ] Alice/Bob concurrent same-IP E2E checklist (operator / next cycle)
- [ ] Record acceptance decision

### Range deploy receipt (2026-08-02)

| Component | Ref |
|---|---|
| UI | `sirius-ui@sha256:e7b3d997…` (community `9f9930aa0`) |
| API | `sirius-api@sha256:2919440c…` (migrate binary go-api `cb14626`) |
| Engine | `sirius-engine:multiuser-range` (pins go-api `cb14626`, scanner `4bc92c4`) |
| DB | `008_host_owner_subject` applied; `idx_hosts_owner_ip` present |

---

## Current handoff

```yaml
goal_id: personal-tour-class
task_id: personal-tour-class.s4.t002
stage: "4 Validate on range"
cycle: 0
attempt: 1
assigned_role: parent
owned_paths:
  - programs/personal-tour-class/PROGRAM.md
acceptance_criteria:
  - "Alice and Bob concurrent same-IP scans produce two owned host rows"
  - "Each student Environment/Host shows only their ports/vulns"
  - "Alice cancel does not affect Bob"
validation_commands:
  - "docker exec sirius-postgres psql -U postgres -d sirius -c \"SELECT owner_subject_id, ip, hostname FROM hosts WHERE owner_subject_id <> '';\""
next_action: "Run Alice/Bob same-IP personal-tour E2E on http://192.168.123.22:3000"
```
