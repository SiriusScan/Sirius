---

title: "Scanner Templates Fix - PR 2-8 Playbook"
description: "Detailed per-PR plan for the remaining seven PRs in the scanner-templates-fix sprint. Each section is self-contained: goal, files, change set, tests, verification, risk."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2026-04-22"
author: "Development Team"
tags: ["pr-plan", "scanner", "templates", "agent-templates", "valkey"]
categories: ["development", "planning"]
difficulty: "intermediate"
prerequisites: ["scanner-templates-fix-plan"]
related_docs:

- "scanner-templates-fix-plan.md"
- "README.tasks.md"
dependencies: []
llm_context: "high"
search_keywords:
[
"scanner templates",
"agent templates",
"auth bypass",
"engine.commands",
"shared schema",
"go-api templates package",
"contract tests",
]

---

# Scanner Templates Fix - PR 2-8 Playbook

PR 1 ships separately (`SiriusScan/app-scanner#2`). The remaining seven PRs each have a focused, self-contained plan below. Execute one PR at a time; do not pre-stage commits.

---

## PR 2 - Agent Template View/Edit Auth Fix

### Goal

Stop bypassing the API-key middleware when the UI loads a single agent template's full content. Bug 2 in `[scanner-templates-fix-plan.md](scanner-templates-fix-plan.md)`.

### Root cause

`[AgentTemplatesTab.tsx](../../sirius-ui/src/components/scanner/agent/AgentTemplatesTab.tsx)` lines 38-72 issue raw `fetch()` calls to `${NEXT_PUBLIC_SIRIUS_API_URL}/api/agent-templates/<id>`, skipping the `apiFetch` helper that injects `X-API-Key`. `sirius-api`'s global `APIKeyMiddleware` rejects the request with 401, the catch block alerts "Failed to load template", and the View/Edit dialogs render empty fields.

### Files

- `[sirius-ui/src/components/scanner/agent/AgentTemplatesTab.tsx](../../sirius-ui/src/components/scanner/agent/AgentTemplatesTab.tsx)`

### Change set

1. Remove the two `fetch(...)` blocks in `handleView` and `handleEdit`.
2. Replace each with an authenticated tRPC call:
  ```ts
   const fullTemplate = await utils.agentTemplates.getTemplate.fetch({ id: template.id });
  ```
   (`getTemplate` already exists in `[agent-templates.ts](../../sirius-ui/src/server/api/routers/agent-templates.ts)` line 57 and routes through `apiFetch` -> `X-API-Key` automatic.)
3. Drop the now-unused `process.env.NEXT_PUBLIC_SIRIUS_API_URL` reference from this file.
4. Surface error detail (`error instanceof Error ? error.message : ...`) in the alert so future regressions are easier to diagnose without DevTools.

### Tests

- Add component test under `sirius-ui/src/components/scanner/agent/__tests__/` (or extend existing) that mocks `utils.agentTemplates.getTemplate.fetch` and asserts both flows call it with the template id.
- Manual: open Advanced -> Agent -> any template -> Description and Content render. No `401` in browser console.

### Verification

1. Build UI image (or use `sirius-ui` dev container).
2. Open a built-in template (e.g. `apache-cve-2021-41773`): Description tab populated, Content tab shows YAML.
3. Click Edit: form pre-populates with parsed YAML fields.
4. Browser DevTools Network tab: only tRPC calls to `/api/trpc/agentTemplates.getTemplate*` appear; no direct `/api/agent-templates/*` requests.

### Risk

Low. `getTemplate` returns the same shape as the bypassed REST endpoint (the tRPC route literally proxies to it via `apiFetch`).

### Out of scope

The latent "Save always creates" bug is PR 4.

---

## PR 3 - Custom Template Upload Writes Envelope + Meta + Triggers Sync

### Goal

Make `UploadAgentTemplate` produce records the agent-side sync server actually understands, and notify agents to pull the new template. Resolves Bug 3a, 3b, and the missing-consumer leg of 3c.

### Root cause (three parts)

1. **3a Format mismatch**: handler writes raw YAML to `template:custom:<id>`. The agent-side reader expects the standard JSON envelope (`{ id, content_b64, sha256, source, ... }`).
2. **3b Missing meta record**: handler never writes `template:meta:<id>`. The agent's enumeration starts at `template:meta:`*; without a meta entry, the new template is invisible to sync.
3. **3c Wrong queue**: handler publishes to `engine.commands`, but `app-agent`'s only template-related consumer listens on `agent.template.sync.jobs`. (PR 5 adds the missing `engine.commands` listener for defense-in-depth; PR 3 fixes the system via the working queue.)

### Files

- `[sirius-api/handlers/agent_template_handler.go](../../sirius-api/handlers/agent_template_handler.go)` - rewrite `UploadAgentTemplate`
- `[sirius-api/handlers/agent_template_handler.go](../../sirius-api/handlers/agent_template_handler.go)` - add small helper `buildTemplateEnvelope(yaml []byte, source string) (envelopeJSON, metaJSON []byte, err error)` so PR 4 can reuse it

### Change set

1. Compute `sha256` over the raw YAML bytes.
2. Build envelope JSON matching the existing read-side decoder:
  ```go
   envelope := struct {
       ID            string `json:"id"`
       Path          string `json:"path"`
       ContentBase64 string `json:"content_b64"`
       SHA256        string `json:"sha256"`
       Source        string `json:"source"`
       UpdatedAt     int64  `json:"updated_at"`
   }{
       ID:            yamlTemplate.ID,
       Path:          "custom/" + yamlTemplate.ID + ".yaml",
       ContentBase64: base64.StdEncoding.EncodeToString([]byte(request.Content)),
       SHA256:        hex.EncodeToString(sha[:]),
       Source:        "custom",
       UpdatedAt:     time.Now().Unix(),
   }
  ```
3. Store envelope at `template:custom:<id>`.
4. Build meta record (mirror the shape used by `template:meta:*` from the GitHub sync writer in `[app-agent/internal/template/valkey/sync.go](../../../minor-projects/app-agent/internal/template/valkey/sync.go)` - read it before writing the handler so we exactly match field names):
  ```go
   meta := struct {
       ID        string `json:"id"`
       Source    string `json:"source"`
       SHA256    string `json:"sha256"`
       IsCustom  bool   `json:"is_custom"`
       UpdatedAt int64  `json:"updated_at"`
   }{ ... IsCustom: true ... }
  ```
   Store at `template:meta:<id>`.
5. Replace the `engine.commands` publish with `agent.template.sync.jobs`. Payload should match what the existing notify-agents path emits today (read `[app-agent/internal/server/template_sync_queue.go](../../../minor-projects/app-agent/internal/server/template_sync_queue.go)` and the producer in `repository_manager.go::notifyAgents`).
6. Wrap all KV writes + queue publish in best-effort rollback: if meta write fails after envelope write, delete the envelope and 500.

### Tests

- Handler-level Go test using a fake KVStore + fake queue: assert all three writes (`template:custom:<id>`, `template:meta:<id>`) and one queue publish to `agent.template.sync.jobs`.
- End-to-end: upload via UI -> `valkey-cli GET template:meta:<id>` returns JSON with `is_custom: true` -> `valkey-cli GET template:custom:<id>` returns envelope with base64 content matching the YAML -> `agent.template.sync.jobs` consumer logs show the new id.

### Verification

1. Upload a new custom template through the UI.
2. `docker exec sirius-valkey valkey-cli KEYS 'template:meta:*' | grep <new-id>` matches.
3. `docker exec sirius-engine ls <agent-cache>/custom/` shows `<new-id>.yaml`.
4. Run an agent-based scan -> agent log reports `template detected: <new-id>`.

### Risk

Medium. Field-name drift between sirius-api's meta writer and app-agent's meta reader will break enumeration silently. Mitigation: read the existing GitHub-sync writer in `app-agent` first and exactly mirror its shape (PR 6 will replace this with a shared package; PR 3 is the bridge).

### Out of scope

- Update flow (PR 4)
- engine.commands listener (PR 5)
- Replacing the JSON-or-YAML read heuristic (PR 7)

---

## PR 4 - UpdateAgentTemplate Handler + UI Wiring

### Goal

Editing an existing template actually updates it instead of silently creating a near-duplicate via the upload path. Resolves the latent Bug 4.

### Root cause

- `sirius-api/handlers/agent_template_handler.go::UpdateAgentTemplate` is a stub (returns success without writing).
- `sirius-ui/.../AgentTemplatesTab.tsx::handleSaveTemplate` (lines 104-130) always calls `uploadMutation`, never `updateTemplate`, even when `editingTemplate` is set.

### Files

- `[sirius-api/handlers/agent_template_handler.go](../../sirius-api/handlers/agent_template_handler.go)`
- `[sirius-ui/src/components/scanner/agent/AgentTemplatesTab.tsx](../../sirius-ui/src/components/scanner/agent/AgentTemplatesTab.tsx)`

### Change set

**Backend (`UpdateAgentTemplate`)**:

1. Require URL param `:id`; require body shape identical to upload.
2. Confirm `template:meta:<id>` exists (404 if not).
3. Reject id mismatch between URL param and parsed YAML id (400).
4. Reuse the `buildTemplateEnvelope` helper introduced in PR 3 to write the new envelope + meta with `IsCustom: true` preserved if the original was custom (read existing meta first to detect).
5. Publish to `agent.template.sync.jobs` (same producer shape as PR 3).

**Frontend (`handleSaveTemplate`)**:

1. Add `updateMutation = api.agentTemplates.updateTemplate.useMutation();` next to existing mutations.
2. Branch:
  ```ts
   if (editingTemplate) {
     await updateMutation.mutateAsync({
       id: editingTemplate.id,
       content: yamlContent,
       filename,
       author: template.author,
     });
   } else {
     await uploadMutation.mutateAsync({ ... });
   }
  ```
3. Clear `editingTemplate` on success so subsequent Save Changes don't accidentally re-target an old id.

### Tests

- Backend: handler test for happy path, 404, id mismatch, immutable `is_custom` flag.
- UI: assert `updateMutation.mutateAsync` called when `editingTemplate` is set; `uploadMutation` called otherwise.

### Verification

1. Edit a custom template's description, Save Changes, refresh page -> change persists.
2. `valkey-cli GET template:custom:<id>` shows updated `updated_at` timestamp.
3. Built-in (non-custom) templates: confirm UX (likely should disable Edit button or copy-on-edit; out of scope here, file follow-up if needed).

### Risk

Low-medium. The is-custom preservation must read existing meta before overwriting; missing this turns built-in templates into custom ones.

### Out of scope

- Read-only mode for built-in templates (file as follow-up if it becomes a UX issue).

---

## PR 5 - engine.commands Listener (Defense-in-Depth)

### Goal

Add an `EngineCommandQueueProcessor` in `app-agent` so any producer that publishes `internal:template upload` / `internal:template delete` to `engine.commands` (today: stale code paths and any third-party integrations) routes back into the existing notify-agents pipeline. Strictly redundant after PR 3 makes the working path the default; this PR catches future drift.

### Files

- New: `minor-projects/app-agent/internal/server/engine_commands_consumer.go`
- Wire into `minor-projects/app-agent/internal/server/server.go` startup alongside `template_sync_queue.go`

### Change set

1. Define a queue consumer struct mirroring `TemplateSyncQueueProcessor`:
  - Subscribes to `engine.commands` durable queue
  - Decodes `{command string, template_id string, timestamp string}` envelopes
  - Switches on `command`:
    - `"internal:template upload"` -> call existing notify-agents helper (extract from `repository_manager.go::notifyAgents` if needed)
    - `"internal:template delete"` -> same path with delete signal
    - default -> log + ack (don't block other producers)
2. Start consumer from `server.go::Start()` next to the existing template-sync consumer.
3. Use the same prefetch / backoff configuration to keep operational behavior consistent.

### Tests

- Go test with a fake AMQP channel (the existing test pattern in `template_sync_queue_test.go` if present): publish a fake upload message, assert notify-agents is invoked once.
- Integration: publish a hand-rolled message via `rabbitmqadmin` -> agents log a sync event.

### Verification

1. With agents connected, manually publish:
  ```bash
   docker exec sirius-rabbitmq rabbitmqadmin publish \
     exchange=amq.default routing_key=engine.commands \
     payload='{"command":"internal:template upload","template_id":"smoke-test","timestamp":"..."}'
  ```
2. Agent log shows `received template sync command for smoke-test`.

### Risk

Low. Strictly additive; failure modes are scoped to the new consumer.

### Out of scope

- Replacing `engine.commands` with a typed exchange/event bus (deferred Phase C).

---

## PR 6 - Shared Schema Package in `go-api/sirius/store/templates`

### Goal

Single Go package owns every Valkey contract for templates and NSE scripts so future drift is impossible.

### Files

- New package: `minor-projects/go-api/sirius/store/templates/`
  - `keys.go` - constants: `KeyAgentTemplateCustom`, `KeyAgentTemplateMeta`, `KeyAgentTemplateBuiltin`, `KeyNseScript`, `KeyNseManifest`, etc.
  - `canonical.go` - `CanonicalScriptID(id string) string` (extracted from app-scanner PR 1)
  - `template_record.go` - `TemplateRecord`, `TemplateMeta` types + `EncodeTemplate`, `DecodeTemplate`, `EncodeMeta`, `DecodeMeta`
  - `nse_record.go` - `NseScriptRecord`, `NseManifestEntry` types + encode/decode helpers
  - `read.go` - thin `ReadTemplate(ctx, kv, id)`, `ReadNseScript(ctx, kv, id)` etc. that compose key construction with decode
  - `write.go` - matching `WriteTemplate`, `WriteNseScript`, `WriteNseManifest` helpers (handles canonicalization + envelope build atomically)
  - `templates_test.go`, `nse_test.go`, `canonical_test.go`

### Change set

1. Mirror PR 1's canonicalization helper exactly (port the unit-test cases too).
2. Define `TemplateRecord` matching the envelope shape introduced in PR 3 (`ID`, `Path`, `ContentBase64`, `SHA256`, `Source`, `UpdatedAt`).
3. Define `TemplateMeta` matching the existing app-agent GitHub-sync writer (read it first to lock the field names).
4. `WriteTemplate` is the only function that allowed-callers use to put both records + (optional) emit a `agent.template.sync.jobs` payload struct (caller publishes; helper just builds the bytes).
5. Tag the package version in go-api (`v0.0.18` or whatever's next) so consumers can pin.

### Tests

- Round-trip `WriteTemplate` -> `ReadTemplate` against an in-memory fake KVStore.
- Canonicalization table tests (port from PR 1).
- Schema-stability test: encoded JSON for a fixed input matches a checked-in golden file (catches accidental field renames).

### Verification

- `go test ./sirius/store/templates/...` green.
- Tagged release of go-api includes the new package.

### Risk

Medium. This is the contract every other component will depend on; getting field names right matters. Mitigation: write encoders by reading current producers byte-for-byte.

### Out of scope

- No consumers migrated yet (PR 7).

---

## PR 7 - Migrate Consumers to the Shared Package

### Goal

Delete every ad-hoc encoder/decoder for template + NSE records. Retire the JSON-or-YAML heuristic added by years of drift.

### Files

- `sirius-api/go.mod` (bump `go-api` to the version that includes `store/templates`)
- `sirius-api/handlers/agent_template_handler.go`:
  - `GetAgentTemplates` / `GetAgentTemplate` -> use `templates.ReadTemplate`. Delete the JSON-or-YAML fork at lines 153-170 and 255-273.
  - `UploadAgentTemplate` / `UpdateAgentTemplate` -> use `templates.WriteTemplate`.
  - `DeleteAgentTemplate` -> use `templates.DeleteTemplate`.
- `minor-projects/app-scanner/go.mod` (bump go-api)
- `minor-projects/app-scanner/internal/nse/sync.go`:
  - Delete the local `canonicalScriptID` (added in PR 1).
  - Replace direct `kvStore.SetValue(...)` with `templates.WriteNseScript` / `WriteNseManifest`.
- `minor-projects/app-agent/go.mod` (bump go-api)
- `minor-projects/app-agent/internal/template/agent/sync_manager.go` and `internal/template/valkey/sync.go`:
  - Replace ad-hoc envelope marshaling with `templates.ReadTemplate` / `WriteTemplate`.
- `minor-projects/app-agent/internal/server/template_sync_queue.go` and (new from PR 5) `engine_commands_consumer.go`:
  - Replace queue payload struct definitions with the shared payload type from `store/templates`.

### Change set

- Code is mostly mechanical: import the package, swap calls, delete dead code.
- Verify no consumer still defines `template:custom:` / `nse:script:` string literals (grep in CI to enforce).

### Tests

- Existing tests in each module continue to pass after the swap.
- Add a "no string literals" lint check (a Go test that scans the consumer packages for forbidden prefixes; reports violations).

### Verification

- Clean build of all three Go modules with the new go-api.
- `grep -rn 'template:custom:' sirius-api/ minor-projects/app-agent/ minor-projects/app-scanner/` returns zero hits outside `go-api/sirius/store/templates`.
- Re-run all PR 1-5 manual verifications: still green.

### Risk

Medium-high. Many touch points across three repos. Mitigation: do consumer migration repo-by-repo with separate commits, run integration tests between each.

### Out of scope

- Adding new fields to envelopes (do that as a separate, focused PR after migration is stable).

---

## PR 8 - Contract Tests + Architecture Doc

### Goal

Make the writer-A / reader-B assumption physically testable in CI, and write the contract down so future agents (human or AI) auto-load it.

### Files

- New: `Sirius/testing/integration/scanner_storage_contract_test.go` (or matching language under `Sirius/testing/`)
- New: `Sirius/documentation/dev/architecture/README.scanner-storage.md`

### Change set

**Contract test**

- Spin up a Valkey container.
- For every (writer, reader) pair, use the public `templates` package helpers:
  - `sirius-api WriteTemplate` -> `app-agent ReadTemplate`
  - `app-scanner WriteNseScript` -> `sirius-api ReadNseScript`
  - `app-agent WriteTemplate` -> `sirius-ui` (via tRPC fixture or direct REST call into a running api)
- Assert byte-equality on key shapes and JSON shapes.

**Architecture doc** (`README.scanner-storage.md` with `llm_context: "high"`)

- Diagram: producers, consumers, queues, key namespaces.
- Field tables for every record type (links to `go-api/sirius/store/templates` source).
- Drift policy: contract changes require a go-api version bump + this doc + the contract test all updated in the same PR.
- Wire into `documentation/README.documentation-index.md`.

### Tests

- New contract test runs in CI under `make test-integration`.
- Doc lint pass (`make lint-docs`, `make lint-index`).

### Verification

- `cd Sirius/testing && make test-integration` green.
- New doc appears in the documentation index and renders cleanly.

### Risk

Low. Test infrastructure is mostly additive; doc changes are pure additions.

### Out of scope (deferred Phase C)

- Version-stamp polling for agent sync resilience.
- Replacing `engine.commands` with a typed exchange.

---

## Execution checklist

Before opening each PR, work through:

- Plan section above re-read end-to-end
- Branch: `feature/scanner-templates-fix` in the affected repo
- Tracker updated: `tasks/scanner-templates-fix.json` task moves to `in_progress`
- Implementation matches "Change set"
- All tests in "Tests" pass locally
- All steps in "Verification" green
- PR description includes operator notes (only PR 1 and PR 7 should need them)
- Tracker updated to `done` on merge

