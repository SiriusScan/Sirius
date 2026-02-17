---
title: "Auth Surface Matrix"
description: "Authoritative authentication and operation policy matrix for all Sirius API surfaces."
template: "TEMPLATE.reference"
llm_context: "high"
categories: ["architecture", "security", "operations"]
tags: ["auth", "apikey", "trpc", "valkey", "rabbitmq", "agent"]
related_docs:
  - "README.architecture.md"
  - "README.development.md"
  - "README.container-testing.md"
  - "README.tasks.md"
---

# Auth Surface Matrix

This checklist is the canonical auth policy map for current Sirius architecture.

## Current Auth Model

- UI user auth: NextAuth session -> `protectedProcedure` in tRPC.
- Service auth: `X-API-Key` -> Go API middleware validation.
- Agent auth: gRPC token model for agent channel identity.
- Current platform model: single UI admin (no multi-user tenant isolation yet).

## Policy Checklist

- [x] All sensitive tRPC procedures require `protectedProcedure`.
- [x] Go API middleware enforces API key for non-health routes.
- [x] UI -> Go API calls use shared authenticated client (`apiClient` / `apiFetch`).
- [x] Direct tRPC backends (Valkey/RabbitMQ) remain session-gated.
- [ ] Agent identity to HTTP/API actions is fully cryptographically bound.
- [ ] Production key lifecycle is fully deterministic for bootstrap/recovery/rotation.

## tRPC Procedure Matrix (By Router)

Each row captures backend target and operation class.

| Router | Procedures | Backend Target | Operation Class | Required Auth |
|---|---|---|---|---|
| `apikeys` | `createKey`, `listKeys`, `revokeKey` | Go API `/api/v1/keys*` | Read/Write/Delete | Session + API key |
| `host` | `createHost`, `getHostList`, `updateHost`, `getHost`, `getHostStatistics`, `getEnvironmentSummary`, `getAllHosts`, `getSourceCoverage`, `getHostWithSources`, `getHostSoftwareInventory`, `getHostSoftwareStats`, `getHostSystemFingerprint`, `getEnhancedHostData`, `getEnvironmentSoftwareStats`, `getHostTemplateResults`, `getEnvironmentSoftwareInventory`, `getHostHistory`, `getVulnerabilityHistory` | Go API `/host*` | Read/Write | Session + API key |
| `vulnerability` | `addVulnerabilityToHost`, `getVulnerability`, `getAffectedHosts`, `getSoftwareDescription`, `getAllVulnerabilities` | Go API + external wiki lookup | Read/Write | Session (+ API key for Go API calls) |
| `scanner` | `getLatestScan`, `startScan`, `getScanStatus`, `cancelScan`, `forceStopScan`, `resetScanState` | mixed (local + Go API `/api/v1/scans*`) | Read/Write | Session (+ API key for Go API calls) |
| `templates` | `getTemplates`, `getTemplate`, `createTemplate`, `updateTemplate`, `deleteTemplate` | Go API `/templates*` via `apiFetch` | Read/Write/Delete | Session + API key |
| `scripts` | `getScripts`, `getScript`, `createScript`, `updateScript`, `deleteScript` | Go API `/scripts*` via `apiFetch` | Read/Write/Delete | Session + API key |
| `agentTemplates` | `getTemplates`, `getTemplate`, `uploadTemplate`, `validateTemplate`, `updateTemplate`, `deleteTemplate`, `testTemplate`, `deployTemplate`, `getAnalytics`, `getTemplateResults` | Go API `/api/agent-templates*` | Read/Write/Delete/Exec | Session + API key |
| `repositories` | `list`, `add`, `update`, `delete`, `sync`, `getSyncStatus` | Go API `/api/agent-templates/repositories*` | Read/Write/Delete | Session + API key |
| `events` | `getEvents`, `getEventStats`, `getRecentEvents`, `getEventsBySeverity` | Go API `/api/v1/events*` | Read | Session + API key |
| `statistics` | `createSnapshot`, `getVulnerabilityTrends`, `listSnapshots`, `getMostVulnerableHosts` | Go API `/api/v1/statistics*` | Read/Write | Session + API key |
| `store` | `initializeNseScripts`, `getValue`, `setValue`, `getNseScripts`, `getNseScript`, `updateNseScript`, `createNseScript`, `deleteNseScript`, `getNseRepositories`, `addNseRepository`, `removeNseRepository`, `initializeNseRepositories` | Direct Valkey | Read/Write/Delete | Session |
| `queue` | `sendMsg` | Direct RabbitMQ | Write/Exec | Session |
| `agent` | `listAgentsWithHosts`, `getAgentDetails`, `getTemplates`, `discoverTemplates`, `getTemplatesFromValKey`, `discoverTemplatesFromValKey`, `getTemplateContent`, `getScriptsFromValKey`, `discoverScriptsFromValKey`, `getScriptContent` | RabbitMQ + Go API + Valkey | Read/Exec | Session |
| `agentScan` | `dispatchAgentScan`, `getAgentScanStatus` | RabbitMQ + Valkey | Write/Read | Session |
| `terminal` | `executeCommand`, `getHistory`, `addHistoryEntry`, `deleteHistoryEntry`, `clearHistory` | RabbitMQ + Valkey | Exec/Read/Write/Delete | Session |
| `user` | `updateProfile`, `changePassword`, `getProfile` | Prisma DB | Read/Write | Session |
| `example` | `hello`, `getAll`, `getSecretMessage` | local/prisma demo | mixed | mixed (demo only) |

## Go API Endpoint Matrix (By Route Group)

All routes are under API key middleware except explicit health bypass.

| Group | Paths | Operation Class | Required Auth |
|---|---|---|---|
| health | `/health` | Read | Public (intentional) |
| system | `/api/v1/system/health`, `/api/v1/system/logs`, `/api/v1/system/resources` | Read | API key |
| admin | `/api/v1/admin/command` | Exec | API key |
| logs | `/api/v1/logs`, `/api/v1/logs/stats`, `/api/v1/logs/clear`, `/api/v1/logs/:logId` | Read/Write/Delete | API key |
| host | `/host/*`, `/vulnerability/:id/sources` | Read/Write/Delete | API key |
| vulnerability | `/vulnerability/:id`, `/vulnerability/`, `/vulnerability/delete` | Read/Write/Delete | API key |
| template | `/templates/*` | Read/Write/Delete | API key |
| agent template | `/api/agent-templates/*` | Read/Write/Delete/Exec | API key |
| repository | `/api/agent-templates/repositories/*` | Read/Write/Delete | API key |
| events | `/api/v1/events/*` | Read | API key |
| statistics | `/api/v1/statistics/*` | Read/Write | API key |
| scan control | `/api/v1/scans/*` | Read/Write | API key |
| api key mgmt | `/api/v1/keys/*` | Read/Write/Delete | API key |
| app passthrough | `/app/:appName` | Write/Exec | API key |

## Agent and NHI Boundary Matrix

| Boundary | Identity Mechanism | Current State | Required Control |
|---|---|---|---|
| Agent -> Engine (gRPC) | Agent token in stream messages | implemented | keep enforced |
| Engine/Agent -> Go API (HTTP) | Service API key | partially inconsistent across clients | normalize header injection everywhere |
| UI admin -> Agent dispatch | Session-gated tRPC + queue payloads | implemented but trust of client-supplied agent IDs needs hardening | validate agent existence/state on dispatch |
| Agent metadata ingestion | host source metadata | accepted from clients | validate schema and origin coupling |

## IDOR Opportunity Review (Current Stage)

Given single-admin model, current focus is authn + object selector hardening:

- selectors to validate consistently: `id`, `ip`, `vulnId`, `scanId`, `templateId`, `agentId`.
- malformed selectors should fail fast with `400`.
- non-existent resources should return `404`.
- unauthorized/unauthenticated should return `401` (and `403` when explicit deny model is later introduced).

## Verification Hooks

- Security harness must cover:
  - Go API authn enforcement for all route families.
  - tRPC session enforcement for all non-demo routers.
  - direct Valkey/RabbitMQ procedure access controls.
  - agent misuse cases (invalid/stale/mismatched agent IDs).

