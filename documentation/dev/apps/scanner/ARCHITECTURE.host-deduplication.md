---
title: "Host Deduplication and Multi-Source Attribution"
description: "Canonical host identity by IP, multi-source attribution (network/agent), scan_sources field, and UI merge/display with SourceIcon and SourceIconRow."
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-02-07"
author: "Sirius Team"
tags: ["scanner", "host", "deduplication", "scan_sources", "SourceIcon", "multi-source"]
categories: ["architecture", "scanner"]
difficulty: "intermediate"
prerequisites: ["README.scanner.md", "ARCHITECTURE.sub-scans.md"]
related_docs:
  - "documentation/dev/apps/scanner/README.scanner.md"
  - "documentation/dev/apps/scanner/ARCHITECTURE.scanner-data-flow.md"
  - "documentation/dev/apps/scanner/ARCHITECTURE.sub-scans.md"
dependencies: []
llm_context: "high"
search_keywords:
  - "host deduplication"
  - "scan_sources"
  - "multi-source"
  - "SourceIcon"
  - "SourceIconRow"
  - "EnvironmentTableData"
  - "canonical host IP"
---

# Host Deduplication and Multi-Source Attribution

Hosts in the Sirius scanner can be discovered by multiple scan methods (network and agent). This document describes how hosts are identified by a canonical key, how multiple sources are attributed, and how the UI merges and displays them.

## Canonical Host Identity: IP Address

The **primary key** for a host is its **IP address**. Regardless of whether a host was found by a network scan, an agent scan, or both, it is represented once per IP in the merged view.

- **Backend:** `HostEntry` (and persisted host records) use `ip` as the canonical identifier; `id` can be a unique row or document id; `hostname`, `aliases`, and `sources` are optional.
- **UI:** Tables and detail views key hosts by `ip` when merging data from different sub-scans or from the environment summary API.

This allows:

- One row per host in the environment/host table
- Correct aggregation of vulnerability counts and source badges per host
- Stable navigation to host detail (e.g. by IP) regardless of which scan discovered it

---

## Multi-Source Attribution

A host can be discovered by:

- **network** – app-scanner (Nmap, RustScan, etc.)
- **agent** – app-agent (template runs on remote host)

Other sources (e.g. cloud, application) can be added later. Each discovery path that reports a host should tag it with its **source identifier** (e.g. `"network"`, `"agent"`).

### HostEntry.sources (backend / ValKey)

In the live `ScanResult` stored in ValKey, each `HostEntry` can carry a list of sources:

```go
type HostEntry struct {
    ID       string   `json:"id"`
    IP       string   `json:"ip"`
    Hostname string   `json:"hostname,omitempty"`
    Aliases  []string `json:"aliases,omitempty"`
    Sources  []string `json:"sources,omitempty"` // e.g. ["network", "agent"]
}
```

When merging results from multiple sub-scans, the component that writes to `currentScan` should:

- Merge hosts by IP (one entry per IP)
- Set `sources` to the union of all sources that reported that IP (e.g. if both network and agent found it, `sources = ["network", "agent"]`)

---

## EnvironmentTableData.scan_sources (UI)

The UI uses **EnvironmentTableData** for the environment/host table. It includes:

- **scan_source** (optional, legacy): Single source string (e.g. `"network"` or `"agent"`).
- **scan_sources** (optional): Array of source strings for multi-source attribution.

```ts
interface EnvironmentTableData {
  hostname: string;
  ip: string;
  os: string;
  vulnerabilityCount: number;
  maxCvss?: number;
  groups: string[];
  tags: string[];
  scan_source?: ScanSource;   // legacy single source
  scan_sources?: string[];    // all discovery sources for this host
}
```

When mapping from API or from live scan results:

- Prefer **scan_sources** (array) when building the table (e.g. from `host.sources` or equivalent).
- Fall back to **scan_source** for older data or single-source responses, and convert to `scan_sources` for consistent display (e.g. `row.scan_sources ?? (row.scan_source ? [row.scan_source] : [])`).

---

## How the UI Merges Hosts from Different Sub-Scans

1. **Live scan results (ValKey):**  
   The `ScanResult.hosts` array may already be merged by the backend (app-scanner and agent path both updating the same `currentScan` and merging by IP with combined `sources`). The UI then maps `HostEntry[]` to `EnvironmentTableData[]` and sets `scan_sources = host.sources || []`.

2. **Environment summary (API):**  
   When the UI fetches the environment host list (e.g. `host.getEnvironmentSummary`), the API returns rows that may include a `sources` (or `scan_sources`) field per host. The UI maps that to `EnvironmentTableData.scan_sources`.

3. **Deduplication by IP:**  
   If the UI ever receives multiple rows for the same IP (e.g. from different endpoints), it should merge them into one row and combine `scan_sources` (union of all source arrays) so that the table shows one row per host with all sources that discovered it.

---

## Source Display: SourceIcon and SourceIconRow

The UI provides two components for showing scan source(s):

### SourceIcon (single source)

- **Purpose:** Renders one scan source (e.g. `"network"` or `"agent"`) as an icon with optional label and tooltip.
- **Usage:** `<SourceIcon source="agent" />`, `<SourceIcon source="network" showLabel />`.
- **Registry:** `SOURCE_ICON_REGISTRY` maps source keys to icon, color, and label (e.g. `agent` → Bot icon, cyan; `network` → Wifi icon, violet).

### SourceIconRow (multiple sources)

- **Purpose:** Renders a row of icons for all sources that discovered a host (or finding).
- **Usage:** `<SourceIconRow sources={["agent", "network"]} />`.
- **Behavior:** Renders one `SourceIcon` per entry in `sources`; tooltip/title can show a combined label (e.g. "Agent + Network").

**Example in host table column:**

- Accessor: `row.scan_sources ?? (row.scan_source ? [row.scan_source] : [])`.
- Cell: `<SourceIconRow sources={sources} />`.

This gives users a clear view of which scan methods discovered each host (network-only, agent-only, or both).

---

## Summary

- **Canonical host identity:** IP address.
- **Multi-source attribution:** Hosts carry `sources` (backend) / `scan_sources` (UI) listing every scan method that discovered them.
- **EnvironmentTableData:** Prefer `scan_sources: string[]`; support legacy `scan_source` by normalizing to an array.
- **UI merge:** One row per IP; `scan_sources` = union of sources for that IP.
- **Display:** Use **SourceIcon** for a single source and **SourceIconRow** for the list of sources on a host (or vulnerability) row.

---

**Related Documentation**

- [ARCHITECTURE.scanner-data-flow.md](./ARCHITECTURE.scanner-data-flow.md) – How host data flows from scanners into ValKey and to the UI
- [ARCHITECTURE.sub-scans.md](./ARCHITECTURE.sub-scans.md) – How network and agent sub-scans contribute hosts

---

**Last Updated:** 2025-02-07  
**Version:** 1.0.0  
**Maintainer:** Sirius Team
