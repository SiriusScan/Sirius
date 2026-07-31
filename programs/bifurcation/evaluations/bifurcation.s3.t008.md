---
goal_id: bifurcation
task_id: bifurcation.s3.t008
run_id: parent-bifurcation-s3-t008-cycle9-20260730
execution_kind: parent
cycle: 9
attempt: 1
evaluator_role: parent
evaluated_at: "2026-07-30T23:35:00Z"
evidence_paths: "scripts/community-independence/; scripts/test-community-independence.sh; .github/workflows/community-independence.yml; documentation/dev/deployment/README.community-independence.md; local test logs"
criteria:
  - id: credential-free-public-ci
    status: pass
    evidence:
      - "community-independence.yml requests only contents: read; no packages/id-token/write; checkout persist-credentials: false; scan steps empty GH_TOKEN/GITHUB_TOKEN and use empty DOCKER_CONFIG."
      - "Contract tests enforce anonymous/no-secret workflow posture and full-SHA action pins."
  - id: standing-scanner-coverage
    status: pass
    evidence:
      - "Modes cover source, release-archive, sbom (exact name/version + distinct child digests), images (6 indexes → 12 platform children), and compose independence."
      - "Live anonymous v1.1.0 source archive + all 12 SBOMs + core-manifest validation passed locally after review fixes."
  - id: path-scoped-allowlist
    status: pass
    evidence:
      - "Safe path normalization (no charset lstrip); .yml and .yaml workflows never allowlisted."
      - "Allowlist suppresses only boundary vocabulary; secrets/PEM/tokens/Pro canary never allowlisted (behavioral canaries)."
  - id: synthetic-canaries
    status: pass
    evidence:
      - "Runtime canaries cover private markers, governance secret bypass, release-archive top-dir attribution, zip oversize/mismatch, NUL/nested archives, SBOM wrong-component/duplicate digest, docker-save fixtures, and mocked 12 platform pulls."
  - id: twelve-platform-image-live-scan
    status: unknown
    evidence:
      - "Local Docker daemon unavailable; mocked contract proves index resolution and 12 child pull/scan wiring. Live 12-platform image scan + compose smoke remain for GitHub Actions public-release-scan after push."
verdict: corrected
artifact_verdict: accepted
loop_decision: human_gate
correction: "Push the feature branch and require a green public-release-scan covering all 12 platform child digests plus public Compose smoke before final task acceptance."
residual_risk:
  - "Live 12-platform image layer scans and public Compose smoke were not executed locally; CI must confirm after push."
  - "Encrypted or opaque blobs may still hide markers despite nested gzip/zip/tar inspection."
  - "GitHub Free private-org governance waiver from earlier Stage 3 work remains unrelated but active."
---

# Evaluation

The local task 2.3 artifact is accepted and the loop stops at a human gate. Phase 2 is
not complete until pushed CI proves all 12 platform image scans and Compose smoke. Do
not mark task 2.3 done until that evidence exists.
