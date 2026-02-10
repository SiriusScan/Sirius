# Scanner Components

Components for the scanner page (`/scanner`).

## Component Hierarchy

- **ScanNavigator** — Tab navigation (Scan Monitor, Profiles, Advanced)
- **ScanControls** — Target input, profile selector, start/stop buttons
- **ScanStatus** — Live scan progress bar with sub-scan status icons
- **ScanHostColumns** — Column definitions for the scan hosts table
- **ProfileSelector / ProfileManager** — Profile CRUD and selection
- **AdvancedView** — Advanced scan settings (managed by another team)
- **target/** — Target input components (ChipTargetInput, etc.)

## Shared Components (from `../shared/`)

- **SourceBadge** — Scan source pill badge (nmap, agent, etc.)
- **SeverityBadge** — Severity/risk level pill badge
- **SourceIcon** — Scan source icon with tooltip
