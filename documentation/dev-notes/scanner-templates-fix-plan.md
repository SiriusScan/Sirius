---
title: "Scanner Templates Fix - Project Plan"
description: "Eight-PR sprint to fix three live scanner-settings bugs and replace the drift-prone Valkey contracts that caused them with a shared schema."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2026-04-22"
author: "Development Team"
tags: ["project-plan", "scanner", "templates", "nse", "valkey", "agent-templates"]
categories: ["development", "planning"]
difficulty: "intermediate"
prerequisites: ["docker", "docker-compose", "go", "typescript", "valkey"]
related_docs:
  - "README.tasks.md"
  - "README.new-project.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "scanner templates",
    "nse scripts",
    "agent templates",
    "valkey contracts",
    "template:custom",
    "nse:script",
    "shared schema",
  ]
---

# Scanner Templates Fix - Project Plan

## Project Overview

**Goal**: Restore working "view, edit, and run" semantics for both NSE scripts and agent-based templates in the Advanced Scanner Settings UI, then eliminate the architectural drift (per-component Valkey contracts) that caused the bugs in the first place.

**Scope**:
- PR 1-PR 5 (Phase A): surgical fixes that unbreak the UI and make custom-template uploads actually run.
- PR 6-PR 8 (Phase B): single source of truth for Valkey records (`go-api/sirius/store/templates`), consumer migration, and contract tests.

**Out of scope (deferred Phase C)**: version-stamp polling for agent sync resilience and a typed envelope replacement for the `engine.commands` plain queue. Revisit if real-world failures appear.

## Bug Inventory (verified)

### Bug 1 - NSE descriptions/code show "No code available"
- Scanner writes keys with `.nse` extension: `nse:script:smb-vuln-cve2009-3103.nse`.
- UI canonicalizes the manifest entry, drops `.nse`, then looks up `nse:script:smb-vuln-cve2009-3103` - miss, falls through to placeholders.

### Bug 2 - Agent template view/edit shows nothing
- `AgentTemplatesTab.handleView` / `handleEdit` use raw `fetch` directly to `sirius-api`, missing the `X-API-Key` header that `apiFetch` injects in tRPC paths. Returns `401`, UI shows empty Description/Content.

### Bug 3 - Newly uploaded custom templates never run
- `UploadAgentTemplate` writes raw YAML to `template:custom:<id>` (standard templates use a JSON envelope with base64 content).
- No `template:meta:<id>` record is written, so the agent sync server (which enumerates from `template:meta:*`) doesn't see the new template.
- Notification is published to `engine.commands`, but no consumer listens on that queue.

## Master PR Sequence

### Phase A - Surgical fixes

| PR | Title | Repos touched |
| --- | --- | --- |
| 1 | NSE script key harmonization | app-scanner, sirius-ui (no-op) |
| 2 | Agent template view/edit auth fix | sirius-ui |
| 3 | Custom template upload writes envelope + meta + sync trigger | sirius-api, app-agent |
| 4 | UpdateAgentTemplate handler + UI wiring | sirius-api, sirius-ui |
| 5 | engine.commands listener (defense-in-depth) | app-agent |

### Phase B - Architectural durability

| PR | Title | Repos touched |
| --- | --- | --- |
| 6 | Shared schema package in `go-api/sirius/store/templates` | go-api |
| 7 | Migrate consumers to shared package; retire dual-format heuristic | sirius-api, app-scanner, app-agent |
| 8 | Contract tests + architecture doc | Sirius (testing/, documentation/) |

## Workflow

- One feature branch per repo: `feature/scanner-templates-fix`.
- Each PR is squashed to main individually.
- Each PR is planned in detail (like PR 1 in `scanner_templates_fix_3be9da41.plan.md`) before execution.
- Sprint tracker: [tasks/scanner-templates-fix.json](../../tasks/scanner-templates-fix.json).

## Verification Strategy

- PR 1: live `valkey-cli` inspection + UI Description/Code populated + Save round-trip + Full Scan green.
- PR 2: View/Edit dialogs render with content, no 401s in browser console.
- PR 3: Upload custom template via UI -> agent's `<cache>/custom/<id>.yaml` exists -> next `internal:template-scan` reports the new template detected.
- PR 4: Edit existing template, Save Changes, refresh -> changes persist.
- PR 5: Manually publish a fake `internal:template upload` to `engine.commands` -> agents receive sync command.
- PR 6: `go test ./...` in go-api passes.
- PR 7: All three Go modules build cleanly with the shared package; the JSON-or-YAML fork is gone.
- PR 8: `make test-integration` runs the contract test for every writer/reader pair; doc renders in the documentation index.

## References

- Master plan + PR 1 detail: `~/.cursor/plans/scanner_templates_fix_3be9da41.plan.md`
- Tracker: `tasks/scanner-templates-fix.json`
