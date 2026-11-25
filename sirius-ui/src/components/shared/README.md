# Shared component kit

Seven components every redesigned page is built from (UX Redesign v1,
mockup R00). They keep Sirius's dark violet look and take severity colours
only from `~/utils/severityTheme.ts`. Import each from its own file.

| Component | Props | Notes |
| --- | --- | --- |
| `SeverityStrip` | `counts: SeverityCounts`, `variant?: "tiles" \| "compact" \| "bar"`, `selected?: Severity[]`, `onSelect?(s)`, `getHref?(s)` | One per page. Clicking a level calls `onSelect` (or follows `getHref`); zero-count levels are muted and not clickable. `bar` is the thin stacked bar inside `HostCell`. |
| `RiskScore` | `score: number` (0–10 from the API), `size?: "sm" \| "md" \| "lg"`, `caption?`, `hideLabel?` | Names the band of the score it is given (`riskBand`, ADR-3); never computes a score. `sm` is inline "8.1 High". |
| `PageHeader` | `icon`, `title`, `breadcrumb?: {label, href?}[]`, `meta?`, `actions?`, `tabs?`, `sticky?` | Sticky header for document-frame pages. Put `<PageTabs>` in `tabs`; use `HeaderChip` for meta. Keeps the account corner clear via `--sirius-header-reserve`, published by `Header`. |
| `PageTabs` | `tabs: {id, label, count?}[]`, `defaultTab`, `param?` (default `"tab"`) | Underline tabs; the active tab lives in the URL (`useUrlTab`). Read it with `usePageTab(ids, defaultTab, param)`. |
| `VulnTable` | `preset: "scan" \| "inventory" \| "host"`, `rows: VulnRow[]`, `severityFilter?`, `loading?`, `toolbar?`, `footer?`, `emptyState?` | Sorted by CVSS (highest first), searchable (CVE, summary, port), paginated 10/25/50, so at most 50 rows render. Row click opens `/vulnerability?id=<id>`. |
| `HostCell` | `host: {ip, hostname?, os?, counts, riskScore}` | Hostname (or IP), IP, OS, severity bar and `RiskScore`; links to `/host/<ip>`. |
| `EmptyState` | `variant: "no-data" \| "needs-agent" \| "not-found" \| "error"`, `title`, `reason`, `primary?`, `secondary?`, `size?`, `framed?` | Icon, one-line reason, one primary next step. |
| `ScanIndicator` | none (`variant?: "pill" \| "badge"`) | Reads `useActiveScan()`. Header pill "Scanning 1 target · 48%" linking to `/scanner`; nothing when idle, on `/scanner`, or without the Scanner capability. Mounted by `Header`: a pill beside the avatar on pages whose `PageHeader` keeps room for it (`headerRoom.ts`), a badge on the avatar elsewhere (hand-built headers, workspace frame). |

Helpers: `severity.ts` (`Severity`, `SeverityCounts`, `SEVERITIES`,
`toSeverityCounts`, `countBySeverity`, URL helpers), `SeverityTag`,
`useSeverityParam` (severity filter in `?severity=`), `vulnTableModel.ts`
(sort, filter, paginate), `scanSummary.ts`, `headerRoom.ts`, `layers.ts`
(`Z_INDEX`), `OverlayPortal`, `~/utils/riskBand.ts`,
`~/utils/formatDateTime.ts`, `~/hooks/useActiveScan.ts`.

## House rules

**Layering.** One z-index scale: `z-header` 30, `z-dropdown` 40,
`z-overlay` 50, `z-toast` 60 (`theme.extend.zIndex`; `Z_INDEX` in
`layers.ts` for inline use). Tailwind loads `tailwind.config.js` before
`tailwind.config.ts`, so the scale belongs in both; `layers.test.ts` checks
them. Page content sits at `z-20` in both Layout
frames, under the header. Dialogs and sheets use `z-overlay`. Portaled menus
(dropdown menu, select, popover, context menu) also use `z-overlay`: they
portal to `<body>` after any open dialog, so at the dialog's layer they still
open above it. `z-dropdown` is for popups rendered in place (tooltip,
page-local menus). A hand-built drawer inside a page can't rise above the
header from the page's `z-20` context: use the lib/ui `Dialog`, or wrap it in
`OverlayPortal` with `z-overlay`.

**Dates.** One formatter, `formatDateTime(iso, "short" | "long")`:
"Nov 21, 12:04 PM" (the year is added when it isn't this year) and
"Nov 21, 2026, 12:04:05 PM". Empty or invalid values show "—". No raw ISO
strings in the UI.

**Counts.** A page never derives a count it can read from
`useSummaryStats()` (ADR-2). The Scanner labels its own numbers "this scan".

## Tests

```bash
npx tsx src/components/shared/severity.test.ts
npx tsx src/components/shared/vulnTableModel.test.ts
npx tsx src/components/shared/scanSummary.test.ts
npx tsx src/components/shared/layers.test.ts
npx tsx src/utils/riskBand.test.ts
npx tsx src/utils/formatDateTime.test.ts
```
