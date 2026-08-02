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

# Program: personal-cloud-class

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

- `programs/personal-cloud-class/PROGRAM.md`
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
- `sirius-ui/src/components/{Sidebar,Layout}.tsx` (already mostly done)

Tasks:

- [x] Student host/vuln/env procedures call owned Postgres filters (`?owner_subject_id=`)
- [x] In-flight: Valkey fallback; completed: Postgres owned rows
- [x] Keep NSE catalog reads; keep Terminal denied
- [x] GO_API pin `cb14626` and APP_SCANNER pin `4bc92c4` in engine Dockerfile + go.mod.prod

## Stage 4: Validate on range

Owned paths:

- `deployments/` on range guest (operator)
- `programs/personal-cloud-class/PROGRAM.md`

Tasks:

- [ ] Rebuild/pin engine+api+ui; migrate `008_host_owner_subject`; deploy
- [ ] Alice/Bob concurrent same-IP E2E checklist
- [ ] Record acceptance decision

---

## Current handoff

```yaml
goal_id: personal-cloud-class
task_id: personal-cloud-class.s4.t001
stage: "4 Validate on range"
cycle: 0
attempt: 1
assigned_role: grok
owned_paths:
  - programs/personal-cloud-class/PROGRAM.md
  - deployments/ (range operator)
acceptance_criteria:
  - "Range runs migrate 008 then rebuilt images with GO_API cb14626 + APP_SCANNER 4bc92c4"
  - "Alice/Bob concurrent same-IP scans produce isolated Environment/Host/Vuln from owned Postgres"
validation_commands:
  - "rg -n 'cb14626|4bc92c4' sirius-engine/Dockerfile sirius-api/go.mod.prod"
  - "cd sirius-ui && npx tsc --noEmit"
next_action: "Range deploy + migrate 008; run Alice/Bob acceptance checklist"
```
