---
title: "Scanner Storage Contract"
description: "Single source of truth for the Valkey schema shared by app-scanner, sirius-api, app-agent, and sirius-ui for NSE scripts and agent templates."
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["architecture", "storage", "scanner"]
tags: ["valkey", "templates", "nse", "schema", "contract", "go-api"]
related_docs:
  - "README.go-api-sdk.md"
  - "ARCHITECTURE.nse-repository-management.md"
  - "../apps/agent/README.agent-template-api.md"
  - "../apps/agent/README.agent-template-ui.md"
search_keywords: ["scanner storage", "template:custom", "template:meta", "nse:script", "templates package", "TemplateRecord", "NseScriptRecord", "canonical script id"]
---

# Scanner Storage Contract

## Overview

The Sirius scanner stack persists two record families in Valkey:

- **Agent templates** - YAML vulnerability detection templates produced by the
  UI and the agent's GitHub sync, consumed by the agent runtime.
- **NSE scripts** - Nmap scripting engine entries produced by `app-scanner`'s
  GitHub sync, consumed by the UI for browsing/editing and by the scanner at
  scan time.

Every producer and consumer goes through the **`github.com/SiriusScan/go-api/sirius/store/templates`**
package. That package owns the key namespaces, JSON envelopes, and
canonicalization rules. If you are about to write code that reads or writes any
of the keys below, you must call into the helpers in that package - never
hand-roll the encoding.

> Drift policy: any change to a record shape, key namespace, or canonicalization
> rule requires a `go-api` version bump, an updated entry in this document, and
> an updated assertion in `Sirius/testing/integration/scanner-storage/contract_test.go`,
> all in the same change set.

## Producers, consumers, queues

```
                       ┌──────────────────────────────────────┐
                       │              Valkey                  │
                       │                                      │
   sirius-ui  ──tRPC──▶│ template:custom:<id>                 │◀── app-agent (read)
                       │ template:meta:<id>                   │     (template runner)
                       │ template:standard:<id>               │
   sirius-api ────────▶│ template:manifest                    │
   (uploads)           │ template:repo-manifest               │
                       │                                      │
   app-scanner ───────▶│ nse:script:<canonical-id>            │◀── sirius-ui (browse/edit)
   (NSE sync)          │ nse:meta:<canonical-id>              │     via sirius-api
                       │ nse:manifest                         │
                       │ nse:repo-manifest                    │
                       └──────────────────────────────────────┘

                       ┌──────────────────────────────────────┐
                       │             RabbitMQ                 │
                       │                                      │
   sirius-api ────────▶│ agent.template.sync.jobs             │── app-agent (consumer)
   (notify_agents)     │ engine.commands (legacy)             │── app-agent (defense in depth)
                       └──────────────────────────────────────┘
```

The agent never polls the template manifest opportunistically; it only re-reads
when a sync notification lands on `agent.template.sync.jobs` (or the legacy
`engine.commands` mirror introduced in PR 5).

## Key namespaces

| Key                              | Defined as                                  | Producer(s)            | Consumer(s)         |
| -------------------------------- | ------------------------------------------- | ---------------------- | ------------------- |
| `template:standard:<id>`         | `templates.AgentTemplateKey(id, false)`     | app-agent (sync)       | app-agent, sirius-api |
| `template:custom:<id>`           | `templates.AgentTemplateKey(id, true)`      | sirius-api (uploads)   | app-agent, sirius-api |
| `template:meta:<id>`             | `templates.AgentTemplateMetaKey(id)`        | sirius-api, app-agent  | sirius-api (enumeration) |
| `template:manifest`              | `templates.KeyAgentTemplateManifest`        | app-agent              | app-agent           |
| `template:repo-manifest`         | `templates.KeyAgentTemplateRepoManifest`    | app-agent              | app-agent           |
| `template:version:<id>`          | `templates.KeyAgentTemplateVersionPrefix`   | app-agent              | app-agent           |
| `nse:script:<canonical-id>`      | `templates.NseScriptKey(id)`                | app-scanner            | sirius-api, app-scanner |
| `nse:meta:<canonical-id>`        | `templates.KeyNseScriptMetaPrefix`          | app-scanner            | sirius-api          |
| `nse:manifest`                   | `templates.KeyNseManifest`                  | app-scanner            | sirius-api, app-scanner |
| `nse:repo-manifest`              | `templates.KeyNseRepoManifest`              | app-scanner            | app-scanner         |

`<canonical-id>` is whatever `templates.CanonicalScriptID(id)` returns. The
canonicalizer strips the `.nse` suffix and lowercases nothing else. You should
never construct an NSE key by string concatenation; always go through
`templates.NseScriptKey`.

## Record shapes

### `TemplateRecord`

Source: [`go-api/sirius/store/templates/template_record.go`](mdc:../../../minor-projects/go-api/sirius/store/templates/template_record.go).

Field tags pinned by `TestContract_TemplateWireShape` in the contract suite:

| JSON field          | Go type            | Notes |
| ------------------- | ------------------ | ----- |
| `id`                | string             | canonical id, no extension |
| `version`           | string             | semver string supplied by the producer |
| `checksum`          | string             | hex SHA-256 of `content`; populate via `templates.SHA256Hex` |
| `size`              | int64              | byte length of `content` |
| `severity`          | string             | `info`, `low`, `medium`, `high`, `critical` |
| `platforms`         | []string           | `linux`, `windows`, `darwin`, ... |
| `detection_type`    | string             | `agent` or `network` |
| `author`            | string             | optional |
| `created`           | time.Time (RFC3339)| set on first upload |
| `updated`           | time.Time (RFC3339)| bump on every write |
| `vulnerability_ids` | []string           | CVE / advisory ids the template detects |
| `is_custom`         | bool               | true ⇒ persisted under `template:custom:<id>` |
| `content`           | []byte (base64)    | YAML body; omitted from `template:meta:<id>` |
| `metadata`          | map[string]string  | optional free-form labels |

The meta projection (used at `template:meta:<id>`) is always
`r.Meta()`/`templates.EncodeMeta(r)` - it strips `Content` and leaves every
other field intact, so an enumerator can list custom templates without paying
the YAML body cost.

### `NseScriptRecord`

Source: [`go-api/sirius/store/templates/nse_record.go`](mdc:../../../minor-projects/go-api/sirius/store/templates/nse_record.go).

| JSON field   | Go type            | Notes |
| ------------ | ------------------ | ----- |
| `content`    | string             | full Lua/NSE source |
| `metadata`   | `NseScriptMeta`    | `author`, `tags[]`, `description` |
| `updatedAt`  | int64              | Unix seconds; producer-supplied |

`NseManifestEntry` (`name`, `path`, `protocol`) and `NseManifest`
(`name`, `version`, `description`, `scripts[]`) are also defined alongside
the script record. Manifest map keys are canonicalized on write by
`templates.WriteNseManifest`.

## Helpers you should be calling

```go
import "github.com/SiriusScan/go-api/sirius/store/templates"

// Templates
key  := templates.AgentTemplateKey(id, isCustom) // template:standard|custom:<id>
mkey := templates.AgentTemplateMetaKey(id)       // template:meta:<id>

err := templates.WriteTemplate(ctx, kv, rec)     // envelope + meta, with rollback
rec, err := templates.ReadTemplate(ctx, kv, id)  // tries custom then standard
meta, err := templates.ReadTemplateMeta(ctx, kv, id)

// NSE scripts
key := templates.NseScriptKey(id)                // nse:script:<canonical-id>

err := templates.WriteNseScript(ctx, kv, id, rec)
rec, err := templates.ReadNseScript(ctx, kv, id) // canonicalizes id for you

err := templates.WriteNseManifest(ctx, kv, m)    // canonicalizes map keys
m, err := templates.ReadNseManifest(ctx, kv)

// Canonicalization is exposed on its own for callers (e.g. the UI -> API
// path that must match what the producer wrote).
canonical := templates.CanonicalScriptID("http-shellshock.nse") // "http-shellshock"
```

## Contract test

`Sirius/testing/integration/scanner-storage/contract_test.go` is a self-contained
Go module that exercises every writer/reader pair through the shared package
against an in-memory KV. It runs as part of `make test-integration` and on every
PR via the Sirius CI Integration Test job.

Add a new pair (or a new record type) here whenever you onboard a new producer
or consumer. The suite is intentionally cheap so it can be the canary that
catches schema drift before any service redeploys.

## Operational notes

- **Reading custom vs standard** - prefer `templates.ReadTemplate`; it tries
  the custom namespace first and falls through to standard, which matches the
  precedence the agent uses at runtime.
- **Custom uploads** - sirius-api persists the envelope, then the meta record,
  then publishes a `notify_agents` job to `agent.template.sync.jobs`. The
  shared helper rolls back the envelope on a meta-write failure so the
  enumerator never sees an orphaned custom template.
- **Engine commands listener** - app-agent additionally consumes the legacy
  `engine.commands` queue and accepts `internal:template upload|delete` as a
  defense-in-depth trigger for the same `NotifyAgents` flow. See
  [`app-agent internal/server/engine_commands_consumer.go`](mdc:../../../minor-projects/app-agent/internal/server/engine_commands_consumer.go).
- **Never** persist NSE scripts with a `.nse` suffix in the key. The
  canonicalization rule exists because the UI canonicalizes before lookup; if
  the producer doesn't, the UI silently shows an empty body. PR 1 fixed the
  original drift; the contract test guards against regressions.

## Related work

- PR 1 - canonicalize NSE script keys
  ([`app-scanner internal/nse/sync.go`](mdc:../../../minor-projects/app-scanner/internal/nse/sync.go))
- PR 6 - introduce the shared `templates` package in `go-api v0.0.18`
- PR 7 - migrate sirius-api, app-scanner, app-agent to that package
- PR 8 - this document plus the contract test
