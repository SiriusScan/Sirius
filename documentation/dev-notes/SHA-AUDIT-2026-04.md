---

## title: "Engine Submodule SHA Audit — April 2026"
description: "Pre-overhaul audit of every component pin baked into sirius-engine, with proposed canonical SHAs and per-repo work to land first."
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["development", "architecture", "operations"]
tags: ["docker", "submodules", "pinning", "release-engineering"]
related_docs:
  - "README.engine-component-pinning.md"
  - "../dev/architecture/README.docker-architecture.md"
  - "../dev/README.development.md"

# Engine Submodule SHA Audit — April 2026

This document records the state of every external component baked into the
`sirius-engine` image at the time the engine pin reconciliation work was
planned, the proposed new pins, and any per-repo work that must land before
each pin can be moved.

> **Status:** Decision document for the *Engine Pin Reconciliation, sed Removal,
> Dev-Mode Overhaul* effort. Do not edit historical fields once a pin moves;
> add follow-up rows instead.

## Authoritative pin surfaces


| Surface              | File                                                                     | Role                                                                |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Image build defaults | `sirius-engine/Dockerfile`                                               | Authoritative SHAs for local and release builds                     |
| CI fallback args     | `.github/workflows/ci.yml` (`build-engine`, `build-api`)                 | Used when the workflow doesn't pass `env.*_COMMIT_SHA`              |
| Repository dispatch  | `.github/workflows/ci.yml` (`workflow_dispatch` + `repository_dispatch`) | Lets minor-projects bump `env.*_COMMIT_SHA` after their own release |


All three surfaces must agree. The `check-pin-consistency.yml` guardrail
(Phase 5 of the overhaul) enforces this going forward.

## Component matrix

For each component below:

- **Current pin** is what the Dockerfile bakes into the image today.
- **Local HEAD** is the SHA of the local clone at audit time.
- **CI fallback** is the literal in `.github/workflows/ci.yml`.
- **Proposed pin** is the SHA we will move to in Phase 3, *after* any
prerequisite work in Phases 1–2 lands.

### `app-agent` (`SiriusScan/app-agent`)


| Field                        | Value                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Current Dockerfile pin       | `50b405a`                                                                                                                             |
| CI fallback (`build-engine`) | `50b405a`                                                                                                                             |
| Local HEAD (`origin/main`)   | `d2e1a78`                                                                                                                             |
| Distance pin → HEAD          | 12 commits                                                                                                                            |
| Uncommitted at audit         | 19 modified, 10 untracked (file_search fix + in-flight `family/sirius` work)                                                          |
| Proposed pin                 | New SHA produced by Phase 1a commit (`fix(template): use modules.IsKnownDetectionType for validation`), expected on `main` after push |


**Why it must move:** the running engine is failing template validation for
the new `file_search` detection type because the pinned SHA predates both
the `file_search` module and the `internal/modules/detection_types.go`
single-source-of-truth introduced for this overhaul.

**Prerequisite work (Phase 1a):**

- Stage and commit *only* the file_search drift fix:
  - `internal/modules/detection_types.go` (new)
  - `internal/modules/detection_types_registry_test.go` (new)
  - `internal/template/valkey/storage.go` (refactor to call
  `modules.IsKnownDetectionType`)
- Push to `origin/main`. The new SHA becomes `APP_AGENT_COMMIT_SHA`.
- The remaining ~26 uncommitted files (`internal/family/sirius/`*,
`cmd/sirius-connector`, `cmd/sirius-scan-template`,
`cmd/sirius-scan-inventory`, `internal/agent/sync_adapter.go`, the
command/registry refactor, etc.) are unrelated in-flight work and stay
uncommitted; they will be landed separately and pinned in a later cycle.

### `app-scanner` (`SiriusScan/app-scanner`)


| Field                        | Value                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Current Dockerfile pin       | `5213ec4`                                                                             |
| CI fallback (`build-engine`) | `4a47f73` (older, drift)                                                              |
| Local HEAD (`origin/main`)   | `5213ec4`                                                                             |
| Distance pin → HEAD          | 0 commits                                                                             |
| Uncommitted at audit         | 0                                                                                     |
| Proposed pin                 | New SHA produced by Phase 2 commit (sed → real source), expected on `main` after push |


**Why it must move:** the Dockerfile applies nine inline `sed` patches to
`internal/scan/manager.go` during the build (lines 181–189). These need to
be encoded as real source so the build is reproducible from `git` alone.

**Drift to fix in CI:** the `build-engine` job still falls back to
`APP_SCANNER_COMMIT_SHA=4a47f73`, an *older* SHA than the Dockerfile pin.
Phase 3b aligns the CI fallback with the Dockerfile.

**Prerequisite work (Phase 2):**

- Encode all nine sed effects directly in `internal/scan/manager.go`:
  - Insert the `if updateErr := sm.scanUpdater.Update(...) { ... }` block
  after the existing `LogScanError` call at line 386 in the
  `template_not_found` branch.
  - Replace the first `if ctx.Err() != nil {` with `if false && ctx.Err() != nil {`
  (this is the existing semantic; a follow-up should remove the dead branch
  entirely once we understand why it was disabled).
  - Replace the `return fmt.Errorf("failed to submit host data with source attribution: %w", err)` with a `slog.Warn` continuation.
- Verify with `go build ./...` and the existing scanner tests.
- Push to `origin/main`. The new SHA becomes `APP_SCANNER_COMMIT_SHA`.

### `app-terminal` (`SiriusScan/app-terminal`)


| Field                        | Value                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Current Dockerfile pin       | `main` (floating!)                                                                                 |
| CI fallback (`build-engine`) | `main` (floating!)                                                                                 |
| Local HEAD (`origin/main`)   | `9ddd654`                                                                                          |
| Distance pin → HEAD          | n/a (floating)                                                                                     |
| Uncommitted at audit         | 3 (cosmetic refactors in `cmd/main.go`, `internal/queue/queue.go`, `internal/terminal/manager.go`) |
| Proposed pin                 | `9ddd654`                                                                                          |


**Why it must move:** floating `main` pins make builds non-reproducible.
Pinning to the current HEAD lets us bump deliberately.

**Prerequisite work (Phase 1b):** none for the pin itself. The 3 uncommitted
files are local style edits and stay out of this cycle.

### `sirius-nse` (`SiriusScan/sirius-nse`)


| Field                        | Value                                        |
| ---------------------------- | -------------------------------------------- |
| Current Dockerfile pin       | `main` (floating!)                           |
| CI fallback (`build-engine`) | `main` (floating!)                           |
| Local HEAD (`origin/main`)   | `a58e8c5`                                    |
| Distance pin → HEAD          | n/a (floating)                               |
| Uncommitted at audit         | 1 (untracked `scripts/script.db` cache file) |
| Proposed pin                 | `a58e8c5`                                    |


**Why it must move:** floating `main`. NSE manifest content directly affects
scanner behavior; non-deterministic builds are unacceptable.

### `pingpp` (`SiriusScan/pingpp`)


| Field                        | Value                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Current Dockerfile pin       | `master` (floating!)                                                                         |
| CI fallback (`build-engine`) | **missing entirely** (CI does not pass a value, so the Dockerfile default is the only floor) |
| Local HEAD (`origin/master`) | `9508a16`                                                                                    |
| Distance pin → HEAD          | n/a (floating)                                                                               |
| Uncommitted at audit         | 0                                                                                            |
| Proposed pin                 | `9508a16`                                                                                    |


**Why it must move:** floating `master` plus a missing CI arg means a
`pingpp` change can land in the engine image with no signal at the
Sirius repo. Phase 3a/3b adds the explicit pin and the CI arg.

### `go-api` (`SiriusScan/go-api`)


| Field                        | Value                                   |
| ---------------------------- | --------------------------------------- |
| Current Dockerfile pin       | `v0.0.17` (tag)                         |
| CI fallback (`build-engine`) | `v0.0.14` (older tag)                   |
| CI fallback (`build-api`)    | `v0.0.15` (different older tag)         |
| Local HEAD (`origin/main`)   | `3cf1719` (= `v0.0.17`)                 |
| Distance pin → HEAD          | 0 commits                               |
| Uncommitted at audit         | 1 (`README.md` doc edits)               |
| Proposed pin                 | `v0.0.17` (no change — only realign CI) |


**Why it must move:** the CI fallbacks are outdated *and* disagree between
the engine and api jobs. Phase 3b realigns both to `v0.0.17`. Tag pins are
preferred for `go-api` because it is also consumed as a library by other
Sirius services.

## Summary table


| Component      | Current pin | Proposed pin | Floating?    | New commit needed first?              |
| -------------- | ----------- | ------------ | ------------ | ------------------------------------- |
| `app-agent`    | `50b405a`   | `7a22039`    | No           | **Yes (Phase 1a + procyon excision)** |
| `app-scanner`  | `5213ec4`   | `cd3943c`    | No           | **Yes (Phase 2 + Phase 4 .air.toml)** |
| `app-terminal` | `main`      | `5745e43`    | **Yes → No** | **Yes (.air.toml + slog refactor)**   |
| `sirius-nse`   | `main`      | `a58e8c5`    | **Yes → No** | No                                    |
| `pingpp`       | `master`    | `9508a16`    | **Yes → No** | No                                    |
| `go-api`       | `v0.0.17`   | `v0.0.17`    | No           | No (CI realign only)                  |


### April 2026 follow-up: procyon excision

After the initial overhaul shipped, the in-flight `family/sirius` work in
`app-agent` was retooled to drop the procyon plugin layer entirely
(`hashicorp/go-plugin` + `hashicorp/go-hclog` + the `replace github.com/SiriusScan/procyon => ../../procyon` directive that blocked CI).
The pure-Go runtime under `internal/family/sirius/` (connector runner,
contract, runtime, bootstrap) is preserved and is what `cmd/agent` and
`cmd/server` now spin up. New `app-agent` SHA: `7a22039` — see commit
"refactor(agent): consolidate sirius runtime; drop procyon plugin layer".

`app-terminal` advanced from `9ddd654` to `5745e43` to publish the
`.air.toml` hot-reload config + the slog logging refactor that the engine
dev-mode workflow already assumed.

**Published:** 2026-04-22. The combined engine GHCR push landed in Sirius
commit `37235a4` (CI run `24793795066`). The multi-arch
`ghcr.io/siriusscan/sirius-engine:latest` manifest now resolves to digest
`sha256:682a81f8…dfdc99` and embeds `app-agent@7a22039` plus
`app-terminal@5745e43`. The pre-existing `Public Stack Contract` job
failure (`open .env: permission denied`) is unrelated to engine pinning
and tracked separately; it has failed on the last four `main` pushes
without affecting the engine/UI/API/infra image publish steps.

With procyon out of `app-agent/go.mod`, the upstream CI blocker that
forced the `replace` directive workaround is gone. Future `app-agent`
SHA bumps no longer require the local `procyon/` working tree to exist.

> The `app-scanner` pin landed at `cd3943c` rather than the earlier
> `ca1ef2f` (Phase 2 sed→source rewrite) because Phase 4's
> dev-mode overhaul required a follow-up commit to its `.air.toml`
> (CGO + send_interrupt + include_dir documentation). Both commits
> are part of the same overhaul and ship together.

## Risk register

- `**app-scanner` sed → source rewrite (Phase 2)** is the highest-risk
change. The current `sed` block is fragile and the source it patches has
drifted since the patches were authored; we may discover the patches no
longer apply cleanly. Mitigation: hold the old `sed` block in a draft
branch until the rewritten source has run a real scan.
- `**app-agent` partial commit (Phase 1a)** intentionally leaves the
in-flight `family/sirius` worktree untouched. We must double-check `git diff --staged` before committing to avoid accidentally pulling in the
refactored `internal/server/server.go`, `internal/agent/agent.go`, etc.
- **CI fallback realignment (Phase 3b)** changes the floor for builds that
*don't* override `env.*_COMMIT_SHA`. Any in-flight workflow run that
relied on the old floats will need a re-run, but this is desirable.

## Open questions deferred to a later cycle

- Should the in-flight `internal/family/sirius/`* work in `app-agent`
become its own minor-version release (`v1.2.0`)? Tracked in the
`app-agent` repo, not in this overhaul.
- Should we move all engine submodules to tagged releases (matching
`go-api`'s pattern)? Probably yes; this overhaul does not enforce it
but the new `check-pin-consistency.yml` guardrail (Phase 5) makes it
easier to adopt later by failing on floating `main`/`master` refs.
- The two unreviewed sed patches (`if ctx.Err() != nil` short-circuit and
the `failed to submit host data with source attribution` warning) need
follow-up to understand the original motivation. Today we are only
preserving the existing semantic, not endorsing it.