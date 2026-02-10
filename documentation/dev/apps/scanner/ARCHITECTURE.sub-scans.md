---
title: "Sub-Scans Architecture - Modular Scan Methods"
description: "Independent scan methods (network, agent) running in parallel, their data structure, lifecycle, progress aggregation, and cancellation."
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-02-07"
author: "Sirius Team"
tags: ["scanner", "sub-scan", "architecture", "progress", "cancellation"]
categories: ["architecture", "scanner"]
difficulty: "intermediate"
prerequisites: ["README.scanner.md"]
related_docs:
  - "documentation/dev/apps/scanner/README.scanner.md"
  - "documentation/dev/apps/scanner/ARCHITECTURE.scanner-data-flow.md"
  - "documentation/dev/apps/scanner/ARCHITECTURE.host-deduplication.md"
dependencies: []
llm_context: "high"
search_keywords:
  - "sub-scan"
  - "sub_scans"
  - "scan progress"
  - "network agent parallel"
  - "scan cancellation"
  - "SubScan"
---

# Sub-Scans Architecture

The Sirius scanner uses a **sub-scan architecture**: each scan method (e.g. network, agent) is an independent **sub-scan** with its own status and progress. Sub-scans run in parallel and are tracked in a single `ScanResult` via a registry map.

## What Are Sub-Scans?

**Sub-scans** are independent scan methods that contribute to one logical “scan”:

- **network** – Traditional network scanning (e.g. Nmap, RustScan, Naabu) triggered via RabbitMQ and executed by app-scanner.
- **agent** – Agent-based scanning: templates run on remote hosts via app-agent over gRPC.

A scan can have zero, one, or both enabled. Each sub-scan has its own:

- Lifecycle state (e.g. dispatching → running → completed/failed/cancelled)
- Progress (e.g. completed/total hosts or agents)
- Optional metadata (e.g. agent list, per-agent status for agent sub-scan)

The overall scan state is the union of all sub-scan states and their results (hosts/vulnerabilities are merged at the scan level).

---

## Sub-Scan Data Structure

### Go (go-api / shared types)

```go
// SubScanProgress tracks completion progress for a sub-scan.
type SubScanProgress struct {
    Completed int    `json:"completed"`
    Total     int    `json:"total"`
    Label     string `json:"label,omitempty"` // e.g. "hosts", "agents"
}

// SubScan represents a modular scanner contribution to a scan.
// Metadata is json.RawMessage so other scanners preserve it on read-modify-write.
type SubScan struct {
    Type     string          `json:"type"`     // "network", "agent"
    Enabled  bool            `json:"enabled"`
    Status   string          `json:"status"`   // see Lifecycle states
    Progress SubScanProgress `json:"progress"`
    Metadata json.RawMessage `json:"metadata,omitempty"`
}

// ScanResult holds the top-level scan and a registry of sub-scans.
type ScanResult struct {
    ID              string
    Status          string
    Targets         []string
    Hosts           []HostEntry
    HostsCompleted  int
    Vulnerabilities []VulnerabilitySummary
    StartTime       string
    EndTime         string
    SubScans        map[string]SubScan `json:"sub_scans,omitempty"`
}
```

### TypeScript (sirius-ui)

```ts
interface SubScanProgress {
  completed: number;
  total: number;
  label?: string;
}

interface SubScan {
  type: string;
  enabled: boolean;
  status: "pending" | "dispatching" | "running" | "completed" | "failed";
  progress: SubScanProgress;
  metadata?: Record<string, unknown>;
}

// ScanResult.sub_scans: Record<string, SubScan>
```

Agent-specific metadata in `SubScan.metadata` can include `mode`, `dispatched_agents`, `agent_statuses` (per-agent status, hosts/vulns found, etc.).

---

## Sub-Scan Registry Pattern

Sub-scans are stored in a **map keyed by scanner identifier**:

- `map[string]SubScan` in Go (`sub_scans` in JSON)
- `Record<string, SubScan>` in TypeScript

Common keys:

- `"network"` – Network scan (app-scanner).
- `"agent"` – Agent scan (app-agent).

Only enabled methods are present. When starting a scan, the UI (or API) builds this map (e.g. `subScans["network"]`, `subScans["agent"]`) and writes the initial `ScanResult` to ValKey. Consumers (app-scanner, go-api/agent path) update only their own key when merging back into `currentScan`, preserving other keys and `metadata` they don’t understand.

---

## Lifecycle States

Each sub-scan moves through a small set of states:

| State         | Meaning |
|---------------|--------|
| `pending`     | Not yet started (optional; may go straight to dispatching). |
| `dispatching` | Work is being dispatched (e.g. message to RabbitMQ, or gRPC dispatch to agents). |
| `running`     | Actively running (targets being scanned, agents executing templates). |
| `completed`   | Finished successfully. |
| `failed`      | Finished with error. |
| `cancelled`   | Stopped by user or system. |

The **overall scan** `status` is typically derived from sub-scans (e.g. “running” if any sub-scan is dispatching or running, “completed” when all are completed/failed/cancelled).

---

## Progress Aggregation

- **Per sub-scan:** `progress.completed`, `progress.total`, and optional `progress.label` (e.g. "hosts", "agents"). Each scanner updates its own sub-scan’s progress when writing to ValKey.
- **Overall scan:** The UI (or API) can compute an aggregate, for example:
  - Total progress = sum of `completed` across sub-scans, divided by sum of `total` (or 0 if no total).
  - Or: “running” if any sub-scan has `status === "running"` or `"dispatching"`, and overall completion when all sub-scans are in a terminal state.

The UI displays per–sub-scan progress (e.g. in `ScanStatus`) and can show an overall progress bar or status from these fields.

---

## Cancellation Handling

When the user cancels a scan:

1. UI/API calls the cancel endpoint (e.g. `POST /api/v1/scans/cancel` with optional `scan_id`).
2. go-api (or the component that owns the scan) sets the overall scan and/or sub-scans to a terminal state (e.g. `cancelled`) and writes the updated `ScanResult` back to ValKey.
3. **Network:** Cancellation can be implemented by app-scanner checking a shared “cancelled” flag (e.g. from ValKey or a separate key) or by receiving a cancel message, then stopping workers and updating its sub-scan status to `cancelled` in `currentScan`.
4. **Agent:** go-api (or agent coordinator) can signal agents to stop and then set `sub_scans.agent.status` to `cancelled` when updating ValKey.

So: **cancelling the scan** means ensuring all sub-scans are stopped and their status (and optionally the overall scan status) is set to `cancelled` in the same `currentScan` document.

---

## Summary

- **Sub-scans** = independent scan methods (network, agent) with their own status and progress.
- **Data structure:** `SubScan { type, enabled, status, progress, metadata }` in a `map[string]SubScan` (`sub_scans`).
- **Lifecycle:** dispatching → running → completed | failed | cancelled.
- **Progress:** per–sub-scan `completed`/`total`; overall progress can be aggregated from all sub-scans.
- **Cancellation:** cancel request stops all sub-scans and updates their status (and overall scan) in ValKey `currentScan`.
- **Registry:** Use a single `sub_scans` map; each scanner only updates its own key and preserves others’ `metadata`.

---

**Related Documentation**

- [ARCHITECTURE.scanner-data-flow.md](./ARCHITECTURE.scanner-data-flow.md) – How sub-scan results flow into ValKey and to the UI
- [ARCHITECTURE.host-deduplication.md](./ARCHITECTURE.host-deduplication.md) – How hosts from different sub-scans are merged by IP

---

**Last Updated:** 2025-02-07  
**Version:** 1.0.0  
**Maintainer:** Sirius Team
