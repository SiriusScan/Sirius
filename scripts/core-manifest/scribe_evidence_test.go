package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const engineIndexFixture = `{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.index.v1+json",
  "manifests": [
    {
      "mediaType": "application/vnd.oci.image.manifest.v1+json",
      "digest": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "platform": {"architecture": "arm64", "os": "linux"}
    },
    {
      "mediaType": "application/vnd.oci.image.manifest.v1+json",
      "digest": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "platform": {"architecture": "amd64", "os": "linux"}
    },
    {
      "mediaType": "application/vnd.oci.image.manifest.v1+json",
      "digest": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      "platform": {"architecture": "unknown", "os": "unknown"}
    }
  ]
}`

func scribeTestJSON(t *testing.T, value any) []byte {
	t.Helper()
	data, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	return data
}

func scribeTestWrite(t *testing.T, path string, data []byte) string {
	t.Helper()
	if err := os.WriteFile(path, data, 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

func scribeCoreFixtures(t *testing.T) (CoreManifest, options, scribeEvidenceOptions) {
	t.Helper()
	root := filepath.Join("..", "..", "testing", "fixtures", "core-manifest")
	read := func(name string, dest any) {
		t.Helper()
		data, err := os.ReadFile(filepath.Join(root, name))
		if err != nil {
			t.Fatal(err)
		}
		if err := json.Unmarshal(data, dest); err != nil {
			t.Fatal(err)
		}
	}
	var manifest CoreManifest
	var inventory CoreBuildInventory
	read("core-manifest.fixture.yaml", &manifest)
	read("core-build-inventory.fixture.json", &inventory)

	index := []byte(engineIndexFixture)
	digest := scribeArtifactDigest(index)
	engine := manifest.Images["sirius-engine"]
	engine.Digest, engine.Ref = digest, "ghcr.io/siriusscan/sirius-engine@"+digest
	manifest.Images["sirius-engine"] = engine
	inventory.Images["sirius-engine"] = InventoryImage{Digest: engine.Digest, Ref: engine.Ref}
	dir := t.TempDir()
	return manifest, options{expectCommit: inventory.Source.Commit, skipDockerfilePins: true, schemaMapPath: "schema_map.json"}, scribeEvidenceOptions{
		inventoryPath: scribeTestWrite(t, filepath.Join(dir, "inventory.json"), scribeTestJSON(t, inventory)),
		indexPath:     scribeTestWrite(t, filepath.Join(dir, "index.json"), index),
	}
}

func hypotheticalScribeReceipt(t *testing.T, manifest CoreManifest) (scribeReceipt, scribeScope) {
	t.Helper()
	candidate := scribeProducer{ID: "sirius-scanner", SHA256: strings.Repeat("1", 64)}
	reference := scribeProducer{ID: "reference-artifact", SHA256: strings.Repeat("2", 64)}
	r := scribeReceipt{
		SchemaVersion: 1, Policy: "scribe-json-v1", ReleaseQualified: true,
		Release: scribeRelease{
			ScribeVersion: "v1.0.0", ScribeCommit: strings.Repeat("a", 40), ScribeProducer: candidate,
			ReferenceVersion: "7.95", ReferenceRevision: strings.Repeat("b", 40), ReferenceProducer: reference,
			SiriusCommit: manifest.Metadata.Source.Commit, ScannerCommit: manifest.ComponentPins["APP_SCANNER_COMMIT_SHA"],
			CatalogRevision: manifest.ComponentPins["SIRIUS_NSE_COMMIT_SHA"], CatalogSHA256: strings.Repeat("3", 64),
			FixtureManifestSHA256: strings.Repeat("4", 64),
		},
		Unconfigured: []scribeUnconfigured{},
	}
	s := scribeScope{
		ID: "reviewed-workflow", ReferenceKind: "legacy", ReferenceProducer: reference, Qualified: true,
		Required: 1, Negative: 1, VerifiedLegacy: 1, Findings: []json.RawMessage{},
		Cases: []scribeCase{{
			ID: "marker-absent", InputSHA256: strings.Repeat("5", 64), ReviewSHA256: strings.Repeat("6", 64),
			State: "match", Verdict: "not_vulnerable", Findings: []json.RawMessage{},
			Candidate: &scribeObservation{Producer: candidate, ResultSHA256: strings.Repeat("7", 64),
				Disposition: "completed", Complete: true, Verdict: "not_vulnerable"},
			Reference: &scribeObservation{Producer: reference, ResultSHA256: strings.Repeat("8", 64),
				Disposition: "completed", Complete: true, Verdict: "not_vulnerable"},
		}},
	}
	var err error
	s.Digest, err = scribeScopeDigest(s, r)
	if err != nil {
		t.Fatal(err)
	}
	return r, s
}

func scribeTestReceipt(t *testing.T, config *scribeEvidenceOptions, r scribeReceipt, scopes ...scribeScope) {
	t.Helper()
	r.Scopes = scribeTestJSON(t, scopes)
	r.ResultsSHA256 = strings.TrimPrefix(scribeArtifactDigest(r.Scopes), "sha256:")
	receipt := scribeTestJSON(t, r)
	config.scopeID, config.scopeDigest = scopes[0].ID, scopes[0].Digest
	config.receiptDigest = scribeArtifactDigest(receipt)
	config.receiptPath = scribeTestWrite(t, filepath.Join(t.TempDir(), "receipt.json"), receipt)
}

func TestOfflineScribeCoreBaseline(t *testing.T) {
	manifest, opt, config := scribeCoreFixtures(t)
	status, err := reviewScribeEvidence(scribeTestJSON(t, manifest), opt, config)
	if err != nil {
		t.Fatal(err)
	}
	if status.Status != "legacy_baseline" || status.ReleaseQualified || status.ReceiptDigest != "" ||
		len(status.Platforms) != 2 || status.Platforms[0].Platform != "linux/amd64" ||
		status.Platforms[1].Platform != "linux/arm64" || status.Platforms[0].Digest == status.Platforms[1].Digest {
		t.Fatalf("unexpected baseline status: %+v", status)
	}
}

func TestOfflineScribeCandidateScopes(t *testing.T) {
	manifest, opt, config := scribeCoreFixtures(t)
	r, s := hypotheticalScribeReceipt(t, manifest)
	scribeTestReceipt(t, &config, r, s)
	status, err := reviewScribeEvidence(scribeTestJSON(t, manifest), opt, config)
	if err != nil {
		t.Fatal(err)
	}
	if status.Status != "scope_matches_core_pins" || status.ReleaseQualified || status.Scope != s.ID ||
		status.ScopeDigest != s.Digest || status.ReceiptDigest != config.receiptDigest || len(status.Pending) != 3 ||
		status.ScribeQualified == nil || !*status.ScribeQualified {
		t.Fatalf("unexpected status for matching scope with pending platform evidence: %+v", status)
	}
}

func TestOfflineScribeKeepsScopeIndependent(t *testing.T) {
	manifest, opt, config := scribeCoreFixtures(t)
	receipt, reviewed := hypotheticalScribeReceipt(t, manifest)
	receipt.ReleaseQualified = false
	unmeasured := scribeScope{
		ID: "unmeasured-workflow", ReferenceKind: "legacy", ReferenceProducer: receipt.Release.ReferenceProducer,
		Required: 1, Unknown: 1,
		Cases: []scribeCase{{ID: "not-reviewed", InputSHA256: strings.Repeat("9", 64), State: "unknown"}},
	}
	var err error
	unmeasured.Digest, err = scribeScopeDigest(unmeasured, receipt)
	if err != nil {
		t.Fatal(err)
	}
	scribeTestReceipt(t, &config, receipt, reviewed, unmeasured)
	payload := scribeTestJSON(t, manifest)
	status, err := reviewScribeEvidence(payload, opt, config)
	if err != nil || status.Status != "scope_matches_core_pins" || status.Scope != reviewed.ID ||
		status.ReleaseQualified || status.ScribeQualified == nil || *status.ScribeQualified {
		t.Fatalf("unmeasured workflow affected independent scope: %+v; %v", status, err)
	}
	config.scopeID, config.scopeDigest = unmeasured.ID, unmeasured.Digest
	if _, err := reviewScribeEvidence(payload, opt, config); err == nil || !strings.Contains(err.Error(), "incomplete or unqualified") {
		t.Fatalf("unmeasured workflow did not fail its own scope check: %v", err)
	}
}

func TestScribeSchemaOneScopeDigest(t *testing.T) {
	// The synthetic affirmative receipt is pinned in Scribe's schema 1 fixtures.
	receipt := scribeReceipt{SchemaVersion: 1, Policy: "scribe-json-v1", Release: scribeRelease{
		ScribeVersion: "v0.0.0-fixture", ScribeCommit: strings.Repeat("1", 40),
		ScribeProducer: scribeProducer{ID: "fixture-candidate", SHA256: "d35968087e46a4f0f095f0730812f735f36544fa69ac3070cea6cbf3cf53a1a6"},
	}}
	scope := scribeScope{
		ID: "synthetic-affirmative", ReferenceKind: "synthetic",
		ReferenceProducer: scribeProducer{ID: "fixture-reference-author", SHA256: "1336f1a2361daf971b3fd4591b92e751398a38518bcb44c5b432104e8f379f27"},
		Cases: []scribeCase{{ID: "marker-present", InputSHA256: "46424d29a147f8f4237b11b245b0477bd34a922fcc2f5ea79acf7cc562101acc"}},
	}
	const want = "fd726098e4e143fd3d08fdc0505bdd7dd45506f2953cfc003c7b729eff6c9548"
	if got, err := scribeScopeDigest(scope, receipt); err != nil || got != want {
		t.Fatalf("scope digest = %q, %v; want %q", got, err, want)
	}
}

func TestOfflineScribeRejectsMismatchedEvidence(t *testing.T) {
	for _, tc := range []struct {
		name string
		want string
		edit func(*scribeReceipt, *scribeScope)
	}{
		{"contradictory whole-release state", "whole-release qualification contradicts", func(r *scribeReceipt, _ *scribeScope) {
			r.ReleaseQualified = false
		}},
		{"stale scanner", "differs from the Core manifest", func(r *scribeReceipt, _ *scribeScope) {
			r.Release.ScannerCommit = strings.Repeat("d", 40)
		}},
		{"stale catalog", "differs from the Core manifest", func(r *scribeReceipt, _ *scribeScope) {
			r.Release.CatalogRevision = strings.Repeat("d", 40)
		}},
		{"altered case input", "does not cover the supplied release and case set", func(_ *scribeReceipt, s *scribeScope) {
			s.Cases[0].InputSHA256 = strings.Repeat("d", 64)
		}},
		{"partial negative", "lacks matching completed", func(_ *scribeReceipt, s *scribeScope) {
			s.Cases[0].Candidate.Complete = false
		}},
		{"unknown negative", "lacks matching completed", func(_ *scribeReceipt, s *scribeScope) {
			s.Cases[0].Candidate.Verdict = "unknown"
		}},
		{"ambiguous case", "duplicate Scribe case ID", func(_ *scribeReceipt, s *scribeScope) {
			s.Cases = append(s.Cases, s.Cases[0])
			s.Required, s.VerifiedLegacy = 2, 2
		}},
		{"schema drift", "unsupported Scribe receipt", func(r *scribeReceipt, _ *scribeScope) { r.SchemaVersion++ }},
	} {
		t.Run(tc.name, func(t *testing.T) {
			manifest, opt, config := scribeCoreFixtures(t)
			r, s := hypotheticalScribeReceipt(t, manifest)
			tc.edit(&r, &s)
			scribeTestReceipt(t, &config, r, s)
			status, err := reviewScribeEvidence(scribeTestJSON(t, manifest), opt, config)
			if err == nil || !strings.Contains(err.Error(), tc.want) || status.ReleaseQualified {
				t.Fatalf("changed evidence returned %+v, %v; wanted %q", status, err, tc.want)
			}
		})
	}
}

func TestOfflineScribeRejectsWrongReceiptOrPlatform(t *testing.T) {
	manifest, opt, config := scribeCoreFixtures(t)
	r, s := hypotheticalScribeReceipt(t, manifest)
	scribeTestReceipt(t, &config, r, s)
	bad := config
	bad.receiptDigest = "sha256:" + strings.Repeat("0", 64)
	if _, err := reviewScribeEvidence(scribeTestJSON(t, manifest), opt, bad); err == nil || !strings.Contains(err.Error(), "receipt digest") {
		t.Fatalf("unexpected error for mismatched receipt digest: %v", err)
	}
	bad = config
	bad.scopeID = "other-workflow"
	if _, err := reviewScribeEvidence(scribeTestJSON(t, manifest), opt, bad); err == nil || !strings.Contains(err.Error(), "missing or has a different digest") {
		t.Fatalf("unexpected error for wrong scope: %v", err)
	}
	tampered := []byte(strings.Replace(engineIndexFixture, "arm64", "amd64", 1))
	digest := manifest.Images["sirius-engine"].Digest
	if _, err := enginePlatforms(tampered, digest); err == nil || !strings.Contains(err.Error(), "inventory digest") {
		t.Fatalf("unexpected error for changed index bytes: %v", err)
	}
	if _, err := enginePlatforms(tampered, scribeArtifactDigest(tampered)); err == nil || !strings.Contains(err.Error(), "duplicate linux/amd64") {
		t.Fatalf("unexpected error for ambiguous platform: %v", err)
	}
}
