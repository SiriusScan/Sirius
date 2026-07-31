---
goal_id: bifurcation
task_id: bifurcation.s3.t007
run_id: parent-bifurcation-s3-t007-cycle8-20260730
execution_kind: parent
cycle: 8
attempt: 1
evaluator_role: parent
evaluated_at: "2026-07-30T22:06:00Z"
evidence_paths: "OpenSecurity-Infosec/sirius-release commits 5cb9fb3, 3f00b50, c7bbdc6; validation runs 30585689687 and 30585689675; publish run 30585723325; downloaded CycloneDX/provenance/digest artifacts; anonymous GHCR probe"
criteria:
  - id: private-digest-image
    status: pass
    evidence:
      - "Run 30585723325 published ghcr.io/opensecurity-infosec/sirius-pro-bootstrap@sha256:4ec53af35646f7a93a2fca42aa1a7e0ef94d7343e50414a7034053540a9274e3."
      - "The only image tag is sha-c7bbdc65b6d7354839e998f99ca0b56ba1d140a4; anonymous registry manifest access returns HTTP 401."
  - id: sbom-and-private-signature
    status: pass
    evidence:
      - "Downloaded artifact is valid CycloneDX JSON with matching source provenance and exact digest record."
      - "Publish job keyless-signed, attested the SBOM, and verified signature and attestation against the canonical OpenSecurity-Infosec/sirius-release@main workflow identity."
  - id: community-verification
    status: pass
    evidence:
      - "The pre-build job matched core.lock.yaml to the public v1.1.0 core-manifest and verified all six public image signatures against the canonical SiriusScan/Sirius@main release workflow identity."
  - id: reusable-fail-closed-template
    status: pass
    evidence:
      - "The inactive Pro template uses explicit escaped identities, digest-only output, checksum-pinned tools, full-SHA actions, and no long-lived keys."
      - "Independent review found an eval RCE and workflow/template defects; correction commits fixed them and read-only re-review reported no findings."
verdict: accepted
artifact_verdict: accepted
loop_decision: continue
next_task_id: bifurcation.s3.t008
residual_risk:
  - "The approved GitHub Free governance waiver remains active."
  - "Keyless signing publishes private image digests and certificate metadata to public Rekor."
  - "The local OAuth token lacks read:packages, so package API visibility could not be inspected directly; anonymous pull denial was verified."
---

# Evaluation

Task 2.2 is accepted. The private release repository now proves the complete
Community-verify, digest-publish, CycloneDX, keyless-sign, attestation, and verification
path without a long-lived registry or signing credential. The next task adds standing
Community-independence and leakage tests.
