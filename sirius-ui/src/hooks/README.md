# Scanner Hooks

Custom React hooks for scanner functionality.

## Hook Relationships

- **useScanResults** — Polls ValKey for live scan data (hosts, vulnerabilities, progress)
- **useScanOrchestration** — Composes useStartScan + useStopScan with profile logic
- **useScanDataMapping** — Maps raw scan results into table-ready data structures
- **useStartScan** — Initiates a scan via tRPC
- **useStopScan** — Cancels a running scan via tRPC
- **useSourceFiltering** — Filters data by discovery source

## Data Flow

```
useScanResults → useScanDataMapping → { hostList, vulnerabilityList }
                  useScanOrchestration → { handleScan, handleStopScan }
```
