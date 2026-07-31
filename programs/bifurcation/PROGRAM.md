---
goal: "Bifurcate Sirius into a canonical, independently runnable public Community core and a private, commercially licensed Pro extension layer that consumes immutable public releases without private-to-public source export."
status: "active"
acceptance_criteria:
  - "Community builds, tests, scans, upgrades, and runs without private credentials or Pro artifacts."
  - "Every public release publishes six digest-addressed images, a validated core manifest, SBOMs, and verifiable signatures."
  - "The three private OpenSecurity-Infosec repositories exist with access teams, private GHCR, and leakage prevention; the approved GitHub Free governance waiver remains documented until private branch/tag protection, secret scanning, and least-privilege base access become available."
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
2. Phase 1 public-core hardening (complete in Community `v1.1.0`).
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

Final task:

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
current_task_id: bifurcation.s4.t010
cycle: 11
attempt: 1
status: active
verdict: pending_ci
artifact_verdict: accepted_local
loop_decision: continue
next_action: Push feature/openapi-contract and confirm live CI before marking task 3.2 done.
```

## Stage 3: Private Supply Chain

Owned paths:

- `/Users/oz/Projects/Sirius-Project/private/sirius-pro`
- `/Users/oz/Projects/Sirius-Project/private/sirius-entitlements`
- `/Users/oz/Projects/Sirius-Project/private/sirius-release`
- `.github/workflows/community-independence.yml`
- `scripts/community-independence/`
- `scripts/test-community-independence.sh`
- `programs/bifurcation/PROGRAM.md`
- `programs/bifurcation/evaluations/`
- `tasks/pro-bifurcation.json`

Tasks:

- [x] Create leakage-safe skeletons for the three private repositories
- [x] Create the private repositories and push only their independent skeleton histories
- [x] Establish access teams and document the approved GitHub Free access waiver
- [x] Record the approved private branch/tag protection and secret-scanning waiver
- [x] Verify anonymous denial and record governance evidence
- [x] Prove private GHCR publishing, SBOM, keyless signing, and Community verification
- [x] Prove standing Community independence across source, release assets, 12 platform images, and Compose
- [x] Complete Phase 2 and record private repository governance evidence

Task 2.1 result:

- `task_id`: `bifurcation.s3.t006`
- `stage`: `3 Private Supply Chain`
- `cycle`: `7`
- `attempt`: `1`
- `assigned_role`: `grok`
- `criteria`:
  - Three independently initialized private skeleton repositories exist under
    `OpenSecurity-Infosec` without copied Community source or history.
  - Each repository declares its ownership boundary, CODEOWNERS, security policy,
    required layout, and leakage-safe CI guardrails.
  - Repository access, branch/tag protections, and available security controls are
    configured and evidenced without changing organization-wide defaults.
  - Anonymous repository access is denied.
- `validation`:
  - `gh repo view OpenSecurity-Infosec/<repo> --json visibility,defaultBranchRef`
  - Repository-native tests and workflow syntax checks in each skeleton
  - GitHub API inspection of teams, grants, rules, and security settings
  - Anonymous HTTPS probes with credentials removed
- `verdict`: `accepted`
- `loop_decision`: `human_gate`
- `next_action`: Obtain explicit approval before task 2.2 creates the private GHCR
  package namespace and a GitHub OIDC signing identity.

Cycle 7 evidence:

- Created independent private repositories:
  `OpenSecurity-Infosec/sirius-pro`,
  `OpenSecurity-Infosec/sirius-entitlements`, and
  `OpenSecurity-Infosec/sirius-release`. No Community source or Git history was cloned.
- Created six closed Sirius teams and assigned repository-scoped grants. The current
  authenticated organization admin is a maintainer of each team.
- Each repository has a proprietary boundary notice, CODEOWNERS, required skeleton
  layout, immutable Community `v1.1.0` pins where applicable, and a read-only boundary
  workflow using a full-SHA action pin.
- Independent review found fail-open scanner gaps. Commits `16d483e`, `ff1e4e2`, and
  `a429d4a` corrected secret, mutable-ref, workflow-permission, export, customer-license,
  malformed-digest, and self-test coverage. All three pushed guardrail runs succeeded.
- All repositories are private; unauthenticated GitHub API probes return 404.
  Vulnerability alerts are enabled.
- GitHub rejected private branch protection and repository rulesets with
  `403 Upgrade to GitHub Pro or make this repository public`. Secret scanning returned
  `422 Secret scanning is not available for this repository`.
- Organization plan is `free`, with nine members and
  `default_repository_permission=write`. Repository team grants cannot reduce that
  organization-wide base permission, so least privilege is not yet achieved.
- Evaluation:
  `programs/bifurcation/evaluations/bifurcation.s3.t006.md`.
- User explicitly accepted a documented GitHub Free governance waiver: CODEOWNERS and
  guardrail CI remain advisory, private branch/tag protection and secret scanning are
  unavailable, and all nine organization members retain inherited write access.
- Decision: task `bifurcation.s3.t006` is accepted under that explicit waiver. The
  program stops before task 2.2 creates a package namespace or signing identity.

Task 2.2 result:

- `task_id`: `bifurcation.s3.t007`
- `stage`: `3 Private Supply Chain`
- `cycle`: `8`
- `attempt`: `1`
- `assigned_role`: `grok`
- `criteria`:
  - A private GHCR bootstrap image is built once, addressed by digest, and cannot be
    pulled anonymously.
  - The image has a generated CycloneDX SBOM and a GitHub OIDC keyless Cosign signature
    that verifies against the canonical private workflow identity.
  - CI verifies all six Community `v1.1.0` image signatures and digests from
    `core.lock.yaml` before building.
  - The repository ships a reusable, least-permission, full-SHA-pinned Pro image
    pipeline template without long-lived credentials or signing keys.
- `validation`:
  - Repository-native boundary and supply-chain contract tests
  - Successful private GitHub Actions publish run
  - `cosign verify` and SBOM validation against the published digest
  - Authenticated package API inspection and anonymous pull denial
- `verdict`: `accepted`
- `loop_decision`: `continue`
- `next_task_id`: `bifurcation.s3.t008`
- `next_action`: Implement task 2.3 standing Community-independence and leakage tests.

Cycle 8 evidence:

- Commit `5cb9fb3` introduced the private GHCR bootstrap pipeline. Independent review
  found a PR-triggered shell injection through `eval`, unsafe publish/PR workflow
  coupling, and template identity/test gaps.
- Commits `3f00b50` and `c7bbdc6` removed shell evaluation in favor of a typed
  fail-closed parser, split read-only PR/push validation from dispatch-only package
  publication, made signing identities explicit, disabled publish cancellation, and
  strengthened injection and Cosign argument tests. Re-review reported no findings.
- Local `make test`, shell/Python syntax, YAML/JSON parsing, and diff checks passed.
  Push runs 30585689687 and 30585689675 passed guardrail and supply-chain validation.
- Approved publish run 30585723325 verified the Community `v1.1.0` manifest, all six
  locked image digests, and all six canonical public Cosign signatures before build.
- The run published
  `ghcr.io/opensecurity-infosec/sirius-pro-bootstrap@sha256:4ec53af35646f7a93a2fca42aa1a7e0ef94d7343e50414a7034053540a9274e3`
  from source commit `c7bbdc65b6d7354839e998f99ca0b56ba1d140a4`.
- Syft produced a valid CycloneDX artifact; Cosign keyless-signed, attached the SBOM
  attestation, and verified both under the exact
  `OpenSecurity-Infosec/sirius-release@main` workflow identity.
- The package tag is the immutable full source SHA; unauthenticated GHCR manifest access
  returns HTTP 401. The local OAuth token lacks `read:packages`, so authenticated package
  metadata inspection returned 403; workflow publication and anonymous denial provide
  the available evidence.
- Evaluation:
  `programs/bifurcation/evaluations/bifurcation.s3.t007.md`.
- Decision: task 2.2 is accepted; continue to task 2.3. The GitHub Free governance
  waiver and public Rekor disclosure of private image digests remain recorded risks.

Task 2.3 result:

- `task_id`: `bifurcation.s3.t008`
- `stage`: `3 Private Supply Chain`
- `cycle`: `9`
- `attempt`: `1`
- `assigned_role`: `grok`
- `criteria`:
  - Public CI runs Community-independence validation with no private credentials,
    private package access, or private repository checkout.
  - A standing scanner checks public runtime source/configuration, all six released
    images, and all twelve release SBOMs for private module paths, private registry
    references, credentials, and high-confidence Pro-only runtime markers.
  - Governance documentation may describe the public/private boundary, but allowlists
    are path-scoped and cannot exempt runtime code, build files, workflows, or images.
  - A seeded private canary is rejected in a dry-run fixture while the current public
    `v1.1.0` artifacts pass.
- `validation`:
  - `bash scripts/test-community-independence.sh` and `bash scripts/test-core-manifest.sh` passed
  - Live anonymous `v1.1.0` source archive + 12 SBOM scan + core-manifest validation passed
  - Mocked contract proves 6→12 platform child pull/scan wiring; live 12-platform image
    scan + compose smoke deferred to CI (local Docker daemon unavailable)
- `verdict`: `accepted`
- `artifact_verdict`: `accepted`
- `loop_decision`: `continue`
- `task_status`: `done`
- `next_task_id`: `bifurcation.s4.t009`
- `next_action`: Implement task 3.1, the API Module interface and Community registration
  seam.

Cycle 9 evidence:

- Added `.github/workflows/community-independence.yml` with full-SHA pins,
  `contents: read` only, `persist-credentials: false`, emptied tokens during scans,
  separate `source-contract` (PR/push) and `public-release-scan`
  (main/schedule/workflow_dispatch) jobs targeting immutable `v1.1.0` (no mutable
  latest path).
- Review fixes: safe path normalization; `.yml`/`.yaml` never-allowlist; boundary-only
  allowlist (secrets/canary never suppressed); nested gzip/zip/tar + NUL binary scan;
  zip stream size/mismatch rejection; exact SBOM name/version + distinct child digests;
  multi-arch image scan (buildx resolve + `--platform` child pulls); docker-save and
  mocked 12-pull behavioral canaries.
- Governance allowlist is prefix-scoped to docs/tasks/program records; runtime,
  Docker/Compose, build scripts, and workflows are never allowlisted.
- Canaries are synthetic runtime fixtures; public CI must never read a real private
  repo to plant or verify leakage markers.
- Docs: `documentation/dev/deployment/README.community-independence.md` (+ index /
  workflows index updates).
- Pull requests 136, 137, 138, and 140 merged the scanner and corrected live-image
  false positives without weakening source-archive or application-path checks.
- Main Community Independence run 30604223699 passed credential-free source/config
  validation, anonymous immutable `v1.1.0` source + 12-SBOM + 12-platform image scans,
  and public Compose smoke.
- Evaluation: `programs/bifurcation/evaluations/bifurcation.s3.t008.md`.
- Decision: task 2.3 and Phase 2 are accepted. Continue to Stage 4 public contracts.

## Stage 4: Public Contracts

Tasks:

- [ ] Complete Phase 3 and publish a tagged compatible core contract release

Current task:

- `task_id`: `bifurcation.s4.t009`
- `stage`: `4 Public Contracts`
- `cycle`: `10`
- `attempt`: `1`
- `assigned_role`: `grok`
- `criteria`:
  - `go-api` exposes a versioned Module contract for routes, jobs, event handlers,
    required capabilities, and health without runtime plugin loading.
  - Community module registration moves out of `main.go` into a compile-time
    registration seam while preserving the existing public route table.
  - A test module can add a route without editing core registration code.
  - Community starts with no non-core modules and no behavior regression.
- `validation`:
  - `go test` for affected `go-api` packages
  - Golden route-inventory comparison before and after the registration refactor
  - Test-module registration and capability-hook tests
- `next_action`: Inspect the current `go-api` RouteSetter and API startup wiring, then
  implement the smallest compatible Module seam.

Cycle 10 evidence:

- Pushed reviewed go-api commits `4f48af4` and `ebd42f4`; the latter corrected
  hand-maintained route fixtures, partial registration, nil/typed-nil handling,
  mutable inventory, and registry lifecycle defects found by independent review.
- Sirius pins immutable commit
  `ebd42f4239ec2d0c99e3e7c463a5fc181f57737f` and production startup mounts a
  build-selected `!pro` Community composition instead of wiring route setters in
  `main.go`.
- The real Community API route inventory is captured in registration order with
  duplicates, and a synthetic extension adds a route without editing Community
  composition.
- A second independent review found file-mode dev startup, non-blocking CI coverage,
  and eager route-registration I/O. Corrections build/run the package, add a blocking
  contract step, lazily initialize runtime services, and close the test response.
- `go test -race ./sirius/module`, focused Sirius API tests, the API runner Docker
  build, `bash scripts/test-core-manifest.sh`, shell syntax, and diff checks pass.
- Decision: local artifact accepted after corrections; task 3.1 remains `in_progress`
  until pushed Sirius CI passes. Stop at the public branch/PR human gate.

Task 3.1 completion:

- Pull request 141 merged as
  `f24a67bd6781d7f4806bb2ac264b6f8a726db9c0`; its pin-audit review finding was
  corrected and resolved.
- Main CI run 30640910687 passed all builds, integration, inventory, and public stack
  jobs. Community Independence run 30640910672 passed source/config validation,
  anonymous 12-platform release scanning, and Compose smoke. Pin run 30640910719
  passed.
- Evaluation: `programs/bifurcation/evaluations/bifurcation.s4.t009.md`.
- Decision: task 3.1 accepted and marked done; continue to task 3.2.

Current task:

- `task_id`: `bifurcation.s4.t010`
- `stage`: `4 Public Contracts`
- `cycle`: `11`
- `attempt`: `1`
- `assigned_role`: `grok`
- `criteria`:
  - Every current API route is classified as public, internal, or deprecated.
  - A versioned OpenAPI contract covers `/api/v1` and validates against the live route
    inventory in blocking CI.
  - `/api/pro/v1` and `/api/internal/v1` namespaces are reserved without adding Pro
    behavior to Community.
  - Breaking contract changes fail a fixture test; Community runtime behavior remains
    unchanged.
- `validation`:
  - OpenAPI syntax and semantic validation
  - Live Fiber route inventory to OpenAPI coverage comparison
  - Negative breaking-change fixture
  - Focused API tests, API image build, and Community-independence checks
- `next_action`: Push `feature/openapi-contract` through the human gate and confirm
  live CI before marking task 3.2 done.

Cycle 11 local evidence:

- Added `sirius-api/contracts/route_classification.yaml` covering all 74 golden routes
  in registration order (`public` / `internal` / `deprecated`).
- Published `sirius-api/contracts/openapi.v1.yaml` (OpenAPI 3.0.3, contract version
  1.0.0) for the live `/api/v1` surface with auth, `X-Request-ID`, current error
  shapes, canonical future error shape, and reserved-namespace policy.
- Added `sirius-api/internal/contract` kin-openapi validators plus negative fixture
  `contracts/fixtures/breaking_openapi.missing_operation.yaml`.
- Blocking CI step in `.github/workflows/ci.yml` now runs live coverage + contract
  package tests. Docs/index:
  `documentation/dev/architecture/README.api-openapi-contract.md`.
- Local validation passed focused route/contract tests, `go test ./internal/contract`,
  and `git diff --check`. Task 3.2 remains `in_progress` until live CI.

## Stage 5: Entitlements and First Vertical

Tasks:

- [ ] Complete Phase 4 capability and license platform
- [ ] Complete Phase 5 Enterprise Reporting vertical

## Stage 6: Compatibility, Release, and Closeout

Tasks:

- [ ] Complete Phase 6 release and compatibility automation
- [ ] Run final Community independence, leakage, upgrade, and overlay lifecycle checks
- [ ] Reconcile the plan and task tracker; record residual risks and acceptance
