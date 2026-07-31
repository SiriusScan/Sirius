---
goal: "Complete the Sirius Community/Pro product split, publish a runnable Pro distribution that consumes immutable Community releases, and deploy and verify that Pro distribution in the approved range environment."
status: "active"
acceptance_criteria:
  - "The existing bifurcation program completes its public contracts, entitlement platform, first Pro vertical, compatibility automation, and release closeout without weakening the completed Community release or private-foundation controls."
  - "A tagged Community core release remains independently runnable without private credentials, packages, repositories, licenses, or Pro artifacts and passes leakage, upgrade, and regression checks."
  - "A private tagged Pro release consumes Community only through a verified core.lock.yaml of immutable digests and publishes private digest-addressed images with SBOMs, provenance, and verifiable keyless signatures."
  - "Enterprise Reporting proves the extension seams end to end: licensed Pro API, worker, UI, migrations, PDF/CSV output, scheduling, and audit events function; direct calls fail closed without reporting.enterprise."
  - "The Pro Compose overlay deploys to the approved SIRIUS range host (VMID 220 / 10.0.10.20), passes health and instructor-path E2E checks, and can be removed while Community and core data remain healthy."
  - "License valid, expired, grace, renewed, Community-to-Pro, Pro upgrade, and Pro-to-Community-only lifecycle tests pass with existing scan data retained and readable."
  - "The public repository and artifacts contain no private source, module paths, registry references, credentials, or Pro runtime code after final release and deployment."
human_gates:
  - "Human approval before every push, pull request, merge, public or private tag/release, package publication, or promotion."
  - "Human approval before creating or rotating signing identities, KMS keys, license keys, credentials, secrets, package namespaces, or external infrastructure."
  - "Human approval before changing the range VM, deploying or removing its Pro overlay, applying migrations, restoring data, or performing any destructive operation."
  - "Counsel approval before customer distribution of the Pro license, EULA, license material, or commercial release."
  - "Human acceptance after the final range demonstration and rollback/data-integrity evidence."
---

# Program: complete-split-deploy-to-range

## Operating Contract

Outcome:

- Finish the existing `bifurcation` program rather than creating a competing product
  architecture, then package, deploy, and prove the resulting Pro distribution on the
  approved SIRIUS range host.

Non-goals:

- Do not deploy to production, communicate with customers, or distribute commercial
  licenses.
- Do not clone or fork Community into a private repository, export private commits to
  public, or make public CI depend on private access.
- Do not move existing Community features behind entitlements.
- Do not add runtime plugins, multi-user RBAC, workspaces, SSO, HA, billing, or another
  Pro vertical beyond Enterprise Reporting.
- Do not change the approved GitHub Free governance waiver implicitly; retain it until
  an explicit organization-plan/base-permission decision replaces it.

Selected stack and source:

- Existing Sirius stack and ADRs control: Go/Fiber and `go-api` public contracts,
  Next.js/TypeScript UI, PostgreSQL, RabbitMQ, Valkey, Docker Compose, GitHub Actions,
  public/private GHCR, Syft, and keyless Cosign.
- `documentation/dev-notes/pro-bifurcation-plan.md`,
  `tasks/pro-bifurcation.json`, ADR-001 through ADR-005, and
  `programs/bifurcation/PROGRAM.md` remain the implementation source of truth.
- Existing scaffolds are retained: `SiriusScan/Sirius` Community,
  `OpenSecurity-Infosec/{sirius-pro,sirius-entitlements,sirius-release}`, and the
  approved SIRIUS range VM. No new application scaffold is required.

Dependencies and order:

1. Finish and publish the public extension contracts (current bifurcation Phase 3).
2. Implement and validate capabilities and offline-verifiable entitlements (Phase 4).
3. Implement Enterprise Reporting across the private Pro composition (Phase 5).
4. Complete lock, compatibility, promotion, upgrade, and rollback automation (Phase 6).
5. Publish approved Community and Pro release candidates.
6. Back up the range data, deploy the digest-pinned Pro overlay, execute E2E/lifecycle
   tests, prove overlay removal/data integrity, then restore the accepted Pro state.

Repository-native validation:

- Affected Go package tests plus `go test -race` for public contracts and entitlement
  verification.
- Sirius container/build, integration, Community-independence, manifest, SBOM,
  signature, Compose, migration, and upgrade test suites.
- Private repository guardrail, lock verification, contract compatibility, Pro E2E,
  entitlement, SBOM/signature, and anonymous-denial workflows.
- Range health probes, API/UI/reporting E2E, migration ledger inspection, backup/restore
  evidence, and Community-only rollback verification.

Loop limits and terminal conditions:

- Maximum 40 implementation/evaluation cycles and eight elapsed weeks.
- Maximum two retries for the same failure signature; a third occurrence requires
  reframing or a human decision.
- Retry transient network, registry, runner, and package-fetch failures with bounded
  backoff. Do not retry deterministic test, contract, security, migration, or data
  failures without a code/config change.
- Stop `accepted` only when every acceptance criterion has reproducible evidence.
- Stop `blocked` at missing credentials, plan/organization constraints, legal gates,
  unsafe migration/rollback evidence, or unavailable range access.
- Stop `rejected` if completion would require private-to-public source export, weakening
  Community independence, mutable release inputs, or loss of existing scan data.

## Stage 1: Frame and Reconcile

Owned paths:

- `programs/complete-split-deploy-to-range/PROGRAM.md`
- `programs/bifurcation/PROGRAM.md`
- `tasks/pro-bifurcation.json`

Tasks:

- [x] Confirm the goal and acceptance criteria
- [x] Record dependencies, risks, stack, validation, retry policy, and human gates
- [x] Reuse the existing bifurcation plan/task ledger instead of duplicating it

## Stage 2: Complete Public Contracts

Owned paths:

- `/Users/oz/Projects/Sirius-Project/minor-projects/go-api/sirius/module/`
- `sirius-api/main.go`
- `sirius-api/modules_community.go`
- `sirius-api/modules_community_test.go`
- `sirius-api/testdata/community_routes.golden`
- Public contract, event, OpenAPI, UI registry, and engine interface paths recorded by
  `tasks/pro-bifurcation.json`

Tasks:

- [x] Finish API Module contract task 3.1 and publish an immutable go-api pin
- [ ] Complete API inventory/OpenAPI, event, UI, and engine extension contracts
- [ ] Publish and verify the tagged compatible Community contract release

## Stage 3: Entitlements and Enterprise Reporting

Owned paths:

- `/Users/oz/Projects/Sirius-Project/private/sirius-entitlements`
- `/Users/oz/Projects/Sirius-Project/private/sirius-pro`
- Public capability catalog/provider paths explicitly opened by the bifurcation task
  ledger

Tasks:

- [ ] Complete capability and offline-license platform
- [ ] Complete the Enterprise Reporting vertical and fail-closed enforcement
- [ ] Prove Community behavior remains unchanged without extensions

## Stage 4: Release and Compatibility

Owned paths:

- `/Users/oz/Projects/Sirius-Project/private/sirius-release`
- `/Users/oz/Projects/Sirius-Project/private/sirius-pro/core.lock.yaml`
- Public compatibility and release workflow paths explicitly opened by the bifurcation
  task ledger

Tasks:

- [ ] Complete immutable lock, compatibility, promotion, upgrade, and rollback tests
- [ ] Publish approved Community and Pro release candidates with attestations
- [ ] Record final public leakage and private anonymous-denial evidence

## Stage 5: Range Deployment and Acceptance

Owned paths:

- Approved SIRIUS range VM: `VMID 220`, `10.0.10.20`
- Range deployment configuration and evidence paths selected before deployment
- `programs/complete-split-deploy-to-range/evaluations/`

Tasks:

- [ ] Obtain deployment approval and capture backup/rollback evidence
- [ ] Deploy the digest-pinned Pro overlay to the range
- [ ] Run health, instructor-path, reporting, entitlement, upgrade, and data-integrity E2E
- [ ] Remove the overlay and prove Community/data health, then restore accepted Pro state
- [ ] Reconcile both programs/task tracker and obtain final human acceptance

## Current task

- `task_id`: `complete-split-deploy-to-range.s2.t002`
- `stage`: `2 Complete Public Contracts`
- `cycle`: `1`
- `attempt`: `1`
- `assigned_role`: `grok`
- `status`: `active`
- `verdict`: `pending_ci`
- `artifact_verdict`: `accepted_local`
- `loop_decision`: `continue`
- `owned_paths`:
  - `sirius-api/`
  - `.github/workflows/ci.yml`
  - `documentation/dev/architecture/README.api-openapi-contract.md`
  - `documentation/README.documentation-index.md`
- `criteria`:
  - Every live API route is classified as public, internal, or deprecated.
  - A versioned OpenAPI contract covers `/api/v1` and is compared with the live Fiber
    inventory in blocking CI.
  - `/api/pro/v1` and `/api/internal/v1` are reserved without introducing Pro runtime
    behavior into Community.
  - A negative fixture proves breaking contract drift fails validation.
- `validation`:
  - OpenAPI syntax/semantic validation
  - Live route-to-contract coverage comparison
  - Breaking-change fixture
  - Focused API tests and image build
- `next_action`: Obtain push/PR approval and confirm live CI before accepting task
  `complete-split-deploy-to-range.s2.t002` / bifurcation 3.2.

Local task evidence (cycle 1):

- Classification inventory matches the 74-line golden/live Fiber inventory.
- OpenAPI contract published at `sirius-api/contracts/openapi.v1.yaml` with reserved
  namespace policy and documented auth/correlation/error reality.
- Blocking validators and breaking fixture land under `sirius-api/internal/contract`
  and the existing API CI job.
- Review corrections: route shadowing fixes, semantic baseline breaking detection,
  production middleware test stack, exact `/health` auth bypass, OpenAPI
  request/response accuracy, Fiber `utils.UUID` request-ID docs/tests.
- TypeScript client intentionally deferred; no new generated bulk.
- Bifurcation task 3.2 remains `in_progress` pending live CI.

Local task evidence:

- The approved go-api push published reviewed commits `4f48af4` and `ebd42f4`.
- Sirius now pins `ebd42f4239ec2d0c99e3e7c463a5fc181f57737f` consistently across
  API modules, API/engine Dockerfiles, Compose, CI, schema mapping, and fixtures.
- Community composition moved from direct `main.go` wiring to a `!pro` build-selected
  registry; real route order/duplicates and extension registration are tested.
- Independent integration review corrections changed file-mode local/dev commands to
  package builds, made the contract tests blocking in CI, removed route-registration
  I/O through lazy runtime-service initialization, and closed test responses.
- `go test -race ./sirius/module`, focused API tests, runner image build,
  `bash scripts/test-core-manifest.sh`, syntax, and diff checks pass.
- Full local snapshot integration tests still require configured PostgreSQL and Valkey;
  their prior local failures were authentication/environment failures, not Module
  contract failures.

Completion evidence:

- PR 141 merged as `f24a67bd6781d7f4806bb2ac264b6f8a726db9c0` after its pin-audit
  review finding was corrected and resolved.
- Main CI 30640910687, Community Independence 30640910672, and pin consistency
  30640910719 passed.
- Evaluation:
  `programs/complete-split-deploy-to-range/evaluations/complete-split-deploy-to-range.s2.t001.md`.
- Decision: task `complete-split-deploy-to-range.s2.t001` accepted; continue with API
  inventory and OpenAPI as `complete-split-deploy-to-range.s2.t002`.
