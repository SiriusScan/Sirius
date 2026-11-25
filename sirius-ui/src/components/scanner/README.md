# Scanner Components

The Scanner page (`src/pages/scanner.tsx`) runs and watches scans only.
Scan profiles, the script and template library, repositories and agent
scanning defaults live in Settings › Scanning (`src/components/settings/scanning/`,
`/settings?tab=scanning`); the scan form links there with "Manage profiles".

## Component Hierarchy

```
pages/scanner.tsx
├── ScanControls            target chips + profile picker + Start (hidden while a scan runs)
│   ├── target-patterns/ChipTargetInput
│   └── ProfileSelector
└── shared/
    ├── ScanRunCard         running/finished scan: targets, profile, progress, phases
    │   └── ScanStopControl the one Stop (with force-stop and reset escalation)
    ├── ScanHostsFound      hosts this scan found, "Saved to inventory", Open host
    ├── ScanFindings        this scan's findings (VulnTable preset="scan")
    ├── ScanSection         section frame used by the cards above
    └── scanRunModel.ts     pure helpers for progress, phases and profile (tested)
```

## Shared Components (from `../shared/`)

`PageHeader`, `SeverityStrip`, `HostCell`, `RiskScore`, `VulnTable` and
`EmptyState`; see `../shared/README.md`.
