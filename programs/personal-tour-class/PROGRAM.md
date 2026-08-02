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

- [ ] Schema: per-owner host identity `(owner_subject_id, ip)` + migrate
- [ ] `UpsertHost` / `AddHostWithSource` accept owner; scanner passes job owner
- [ ] List/get host APIs support `owner_subject_id` filter (empty = admin/global)

## Stage 3: Student inventory on real APIs

Owned paths:

- `sirius-ui/src/server/api/routers/{host,vulnerability,statistics}.ts`
- `sirius-ui/src/server/api/shared/ownedScanInventory.ts`
- `sirius-ui/src/components/{Sidebar,Layout}.tsx` (already mostly done)

Tasks:

- [ ] Student host/vuln/env procedures call owned Postgres filters (not thin Valkey-only stubs)
- [ ] In-flight: Valkey fallback; completed: Postgres owned rows
- [ ] Keep NSE catalog reads; keep Terminal denied

## Stage 4: Validate on range

Owned paths:

- `deployments/` on range guest (operator)
- `programs/personal-tour-class/PROGRAM.md`

Tasks:

- [ ] Rebuild/pin engine+api+ui; migrate; deploy
- [ ] Alice/Bob concurrent same-IP E2E checklist
- [ ] Record acceptance decision

---

## Current handoff

```yaml
goal_id: personal-tour-class
task_id: personal-tour-class.s2.t001
stage: "2 Owned host persistence"
cycle: 0
attempt: 1
assigned_role: grok
owned_paths:
  - /Users/oz/Projects/Sirius-Project/minor-projects/go-api/sirius/postgres/
  - /Users/oz/Projects/Sirius-Project/minor-projects/go-api/sirius/host/
  - /Users/oz/Projects/Sirius-Project/Sirius/sirius-api/handlers/host_handler.go
  - /Users/oz/Projects/Sirius-Project/minor-projects/app-scanner/internal/scan/
acceptance_criteria:
  - "Host model supports owner_subject_id; unique (owner_subject_id, ip) for non-empty owners"
  - "AddHostWithSource / UpsertHost scopes by owner when provided"
  - "Scanner submits owner_subject_id from JobContext on /host/with-source"
  - "List/get host APIs accept owner_subject_id filter"
validation_commands:
  - "cd minor-projects/go-api && go test ./sirius/host/..."
next_action: "Implement owned host schema + upsert + scanner/API wiring"
```
