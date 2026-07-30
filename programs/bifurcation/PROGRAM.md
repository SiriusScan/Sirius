---
goal: "Bifurcate Sirius into a canonical, independently runnable public Community core and a private, commercially licensed Pro extension layer that consumes immutable public releases without private-to-public source export."
status: "waiting"
acceptance_criteria:
  - "Community builds, tests, scans, upgrades, and runs without private credentials or Pro artifacts."
  - "Every public release publishes six digest-addressed images, a validated core manifest, SBOMs, and verifiable signatures."
  - "The three private OpenSecurity-Infosec repositories exist with access controls, protected branches/tags, private GHCR, and leakage prevention."
  - "Versioned public API, event, UI, and engine extension contracts admit a test extension without changing Community behavior."
  - "Capabilities are enforced centrally with offline-verifiable licenses while Community requires no license and existing scan data remains accessible after expiry."
  - "Enterprise Reporting ships as a private, entitlement-gated vertical and its deployment overlay can be added and removed without damaging core data."
  - "Pro releases consume core.lock.yaml digests, pass Community regression and compatibility tests, and promote tested artifacts without rebuilding."
human_gates:
  - "Human approval before pushing branches, opening or merging pull requests, creating or publishing Git tags/releases, or changing GitHub organization settings."
  - "Human approval before creating private repositories, teams, package namespaces, signing identities, KMS keys, credentials, or customer-facing infrastructure."
  - "Counsel approval before first customer distribution of the Pro license or EULA."
  - "Human approval before production deployment, destructive migration, billing change, or external customer communication."
---

# Program: bifurcation

## Operating Contract

Outcome:

- Deliver the six milestones in `documentation/dev-notes/pro-bifurcation-plan.md`
  while preserving the public-first Community commitment and the repository ownership
  rules in ADR-001 through ADR-005.

Non-goals:

- Do not create a private fork of `SiriusScan/Sirius`.
- Do not move an existing Community feature behind a Pro entitlement.
- Do not introduce runtime plugin loading in v1; extension registration is compile-time.
- Do not add multi-user RBAC or workspace behavior outside the planned Pro contracts
  and vertical.
- Do not deploy to production or distribute customer licenses as an unattended action.

Selected stack and source:

- Established repository stack takes precedence: Docker Compose distribution; Go for
  API, engine, shared contracts, migrators, and entitlement verification; Next.js and
  TypeScript for UI; PostgreSQL, RabbitMQ, and Valkey for state and messaging; GitHub
  Actions plus GHCR for build and release.
- Pro uses the same established stack and consumes immutable public artifacts by
  digest. No greenfield scaffold selection is required.

Existing scaffold:

- Public distribution and component repositories under `SiriusScan`.
- Bifurcation plan at `documentation/dev-notes/pro-bifurcation-plan.md`.
- Task tracker at `tasks/pro-bifurcation.json`.
- ADR-001 through ADR-005 and `documentation/product/edition-boundary.yaml`.
- Release-train implementation on `feature/pro-bifurcation`.
- Private repository skeletons are intentionally not created until Phase 2.

Repository-native validation:

- `bash scripts/test-core-manifest.sh`
- `go test ./...` from each changed Go module or package.
- Native Next.js lint, typecheck, test, and build commands from the changed UI package.
- `cd testing && make lint-docs && make lint-index`
- Task-specific container, Compose, release, signature, compatibility, upgrade, and E2E
  checks recorded in `tasks/pro-bifurcation.json`.

Dependencies and order:

1. Phase 0 governance and boundary decisions (complete).
2. Phase 1 public-core hardening (1.1–1.3 complete; 1.4 active; 1.5 follows).
3. Phase 2 private repository and supply-chain foundation.
4. Phase 3 public extension contracts; depends on Phase 1.
5. Phase 4 entitlements; depends on Phases 2 and 3.
6. Phase 5 Enterprise Reporting; depends on Phase 4.
7. Phase 6 compatibility, promotion, cleanup, and reconciliation; depends on Phase 5.

Ownership:

- Each bounded task records exclusive writable paths before execution.
- Public-core work is owned in this repository and relevant public component
  repositories. Private-repository work is isolated to one repository/worktree per
  writer.
- No concurrent writers may edit the same path. Cross-repository contract updates are
  sequenced by published version or immutable commit.

Loop limits and stop conditions:

- Maximum 40 execution cycles for the full program and 120 minutes per bounded cycle.
- Maximum two attempts per task before reframing; a third attempt requires an explicit
  escalation decision.
- Stop successfully when all acceptance criteria are evidenced and task statuses are
  done or explicitly deferred with rationale.
- Stop for a human gate, a security or data-integrity risk, a material conflict with an
  ADR/edition boundary, exhausted retry budget, or a required external dependency that
  cannot be verified.

Retry policy:

- Retry once for transient CI, registry, network, or deterministic test-harness
  failures after recording evidence.
- Do not repeat the same implementation after a reproducible code, architecture, or
  contract failure; reframe the task and acceptance test first.
- Escalate ambiguous debugging or production-facing independent review only when the
  routing policy permits it. Stop and request a human decision for scope, legal,
  credentials, destructive actions, or irreversible external changes.

## Stage 1: Frame

Owned paths:

- `programs/bifurcation/PROGRAM.md`

Tasks:

- [x] Confirm the goal and acceptance criteria
- [x] Record dependencies, risks, and human gates

## Stage 2: Core Release Train

Owned paths:

- `.github/workflows/ci.yml`
- `.github/workflows/publish-release-image-tags.yml`
- `.github/workflows/verify-ghcr-release-tag.yml`
- `scripts/core-manifest/`
- `scripts/*core*manifest*.sh`
- `scripts/*build-inventory*.sh`
- `scripts/ghcr-ensure-write-once-tag.sh`
- `scripts/gh-release-draft-state.sh`
- `scripts/ci-dispatch-allowlist.sh`
- `tasks/pro-bifurcation.json`

Tasks:

- [x] Validate and review the task 1.4 release-train implementation
- [x] Cross the human gate to push, review, and merge the feature branch
- [x] Confirm main CI produced the exact-SHA core build inventory
- [x] Cross the human gate to tag and publish `v1.1.0`
- [x] Verify all six images and `core-manifest.yaml`; mark task 1.4 done
- [x] Implement and verify task 1.5 SBOM generation and Cosign signing
- [x] Update this file with stage outcomes

Current task:

- `task_id`: `bifurcation.s2.t005`
- `stage`: `2 Core Release Train`
- `cycle`: `6`
- `attempt`: `1`
- `assigned_role`: `parent`
- `criteria`:
  - `v1.1.0` resolves to the exact main commit with a successful core-build inventory.
  - All six public image tags resolve to the manifest digests in `core-manifest.yaml`.
  - Twelve platform-scoped CycloneDX SBOM assets are published.
  - The release workflow keyless-signs and verifies all six image indexes before
    publication, and the follow-up public verification workflow succeeds.
- `validation`:
  - `gh run view 30578119633`
  - `gh release view v1.1.0`
  - `gh run view 30578823485`
  - Local release-asset and live-digest validation
- `verdict`: `accepted`
- `loop_decision`: `human_gate`
- `next_action`: Obtain explicit approval before creating the three private
  `OpenSecurity-Infosec` repositories, teams, package namespaces, or credentials for
  Stage 3.

Cycle 1 evidence:

- `bash scripts/test-core-manifest.sh`: passed all syntax, generation, strict
  validation, digest-drift, determinism, fixture, and Go tests.
- `git diff main...HEAD --check`: passed.
- Unrelated `scripts/bootstrap-windows.ps1` remains untracked and excluded.
- Decision: task `bifurcation.s2.t001` accepted; stopped at the recorded external
  push/pull-request human gate.

Cycle 2 evidence:

- Human approval received to push the branch and open the pull request.
- Pull request: `https://github.com/SiriusScan/Sirius/pull/132`.
- Latest `origin/main` initially conflicted only on the required go-api pin. Merged
  current main and consistently retained `v0.0.19` in CI, engine, and build tests.
- Re-ran `bash scripts/test-core-manifest.sh`, pre-commit documentation/index/Compose
  checks, and `git diff --check`: passed.
- Pull request is mergeable and clean; no required checks were reported immediately
  after the update.
- Decision: continue task `bifurcation.s2.t002` by monitoring checks; merging and
  publishing remain separate human gates.

Cycle 3 evidence:

- Human approval received to handle and merge pull request 132.
- All build, pin, manifest, Compose, and documentation checks passed; Integration Test
  exposed a real fresh-install defect in go-api migration 005:
  `vulnerabilities(vid)` referenced a nonexistent column (the persisted column is
  `v_id`).
- Fixed and tested go-api at commit
  `c7c42d4444c8637140ab0e29743184fface5b12f`; Sirius now pins that immutable commit
  and the API module uses its generated pseudo-version.
- Local migration-package, API handler/internal, core-manifest, JSON, and diff checks
  passed. Full local API integration tests require configured PostgreSQL/Valkey and
  failed only because the local PostgreSQL credentials were unavailable.
- Decision: push the scoped fix, rerun PR CI, then merge only if all required checks
  pass.

Cycle 4 evidence:

- Pull request 132 merged as
  `2ed5a1f41298f54a16163aaa531a53da8200fa0c`; all review threads were resolved.
- Main Actions run 30557457126 succeeded on attempt 2 after retrying a transient Docker
  Hub connection reset.
- `Core Build Inventory` and `Public Stack Contract` succeeded, and the non-expired
  `core-build-inventory` artifact is present.
- Remote tag `refs/tags/v1.1.0` is absent; no release or customer-facing action was
  taken.
- Evaluation:
  `programs/bifurcation/evaluations/bifurcation.s2.t003.md`.
- Decision: task `bifurcation.s2.t003` accepted; program is waiting at the explicit
  `v1.1.0` tag-and-publish human gate.

Cycle 5 evidence:

- User selected SBOM generation and image signing before publishing `v1.1.0`, resolving
  the task-order conflict in favor of the program acceptance criteria.
- Commits `a8460de25` and `9e336ef39` add checksummed Syft/Cosign tooling, 12
  platform-scoped CycloneDX assets, exact-digest keyless signing, canonical
  `SiriusScan/Sirius@main` verification, and a final pre-publish signature check.
- `bash scripts/test-core-manifest.sh`, workflow YAML parsing, pinned upstream tool
  checksum verification, and `git diff --check` passed.
- The first independent review found an over-broad signing identity and incomplete
  multi-architecture SBOM coverage. Both were corrected; the second review reported no
  findings.
- Evaluation:
  `programs/bifurcation/evaluations/bifurcation.s2.t004.md`.
- Decision: task `bifurcation.s2.t004` accepted locally; program waits before pushing
  the branch or opening a pull request.

Cycle 6 evidence:

- Pull request 133 merged as
  `b61b47b468cfc5c837a5bde50eeafe52df4fe10d`; main CI run 30574501048 succeeded and
  produced a non-expired exact-commit `core-build-inventory`.
- Human approval was received to create annotated tag `v1.1.0` at that commit and run
  the public release workflow.
- Publish run 30578119633 succeeded through inventory resolution, write-once retagging,
  public compose smoke, 12 platform SBOMs, canonical OIDC signing, draft asset
  re-validation, final Cosign verification, and publication.
- Release `v1.1.0` contains `core-manifest.yaml` and all 12 expected CycloneDX assets.
  Local validation matched all six live GHCR digests to the manifest.
- Follow-up verification run 30578823485 succeeded for anonymous GHCR and release
  manifest checks.
- Tasks 1.4 and 1.5 and the Phase 1 parent are marked done.
- Evaluation:
  `programs/bifurcation/evaluations/bifurcation.s2.t005.md`.
- Decision: Stage 2 is complete; the program waits at the private-infrastructure human
  gate before Stage 3.

## Current loop state

```yaml
current_task_id: bifurcation.s2.t005
cycle: 6
attempt: 1
status: waiting
verdict: accepted
loop_decision: human_gate
next_action: Obtain approval before creating private repositories or infrastructure.
```

## Stage 3: Private Supply Chain

Tasks:

- [ ] Complete Phase 2 and record private repository governance evidence

## Stage 4: Public Contracts

Tasks:

- [ ] Complete Phase 3 and publish a tagged compatible core contract release

## Stage 5: Entitlements and First Vertical

Tasks:

- [ ] Complete Phase 4 capability and license platform
- [ ] Complete Phase 5 Enterprise Reporting vertical

## Stage 6: Compatibility, Release, and Closeout

Tasks:

- [ ] Complete Phase 6 release and compatibility automation
- [ ] Run final Community independence, leakage, upgrade, and overlay lifecycle checks
- [ ] Reconcile the plan and task tracker; record residual risks and acceptance
