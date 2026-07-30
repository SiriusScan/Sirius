---
goal_id: bifurcation
task_id: bifurcation.s2.t005
run_id: parent-bifurcation-s2-t005-cycle6-20260730
execution_kind: parent
cycle: 6
attempt: 1
evaluator_role: parent
evaluated_at: "2026-07-30T20:25:00Z"
evidence_paths: "PR 133; main run 30574501048; publish run 30578119633; release v1.1.0; verification run 30578823485"
criteria:
  - id: exact-release-source
    status: pass
    evidence:
      - "Annotated tag v1.1.0 resolves to b61b47b468cfc5c837a5bde50eeafe52df4fe10d."
      - "Main run 30574501048 succeeded with a non-expired core-build-inventory artifact."
  - id: six-image-manifest
    status: pass
    evidence:
      - "Publish run 30578119633 succeeded."
      - "Local live-digest validation matched all six GHCR tags to core-manifest.yaml."
  - id: sbom-and-signatures
    status: pass
    evidence:
      - "The release contains 12 non-empty platform-scoped CycloneDX assets."
      - "The publish workflow keyless-signed and verified all six OCI index digests, then re-verified them before draft=false."
  - id: public-verification
    status: pass
    evidence:
      - "Follow-up run 30578823485 succeeded for anonymous GHCR and core-manifest checks."
verdict: accepted
artifact_verdict: accepted
loop_decision: human_gate
residual_risk:
  - "Private Pro repositories, package namespaces, teams, signing policy, and leakage-prevention controls do not yet exist."
  - "Stage 3 requires explicit human approval before creating private infrastructure."
---

# Evaluation

Sirius Community `v1.1.0` is published from the verified main commit with immutable
image digests, a validated core manifest, complete amd64/arm64 SBOM assets, and
canonical GitHub OIDC signatures. Stage 2 is accepted and the program stops before
private infrastructure creation.
