package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"
)

const maxScribeEvidenceBytes = 8 << 20

type scribeEvidenceOptions struct {
	inventoryPath string
	indexPath     string
	receiptPath   string
	receiptDigest string
	scopeID       string
	scopeDigest   string
}

func (o scribeEvidenceOptions) configured() bool {
	return o.inventoryPath != "" || o.indexPath != "" || o.receiptPath != "" ||
		o.receiptDigest != "" || o.scopeID != "" || o.scopeDigest != ""
}

type enginePlatform struct {
	Platform string `json:"platform"`
	Digest   string `json:"image_digest"`
}

type scribeEvidenceStatus struct {
	Status           string           `json:"status"`
	ReleaseQualified bool             `json:"release_qualified"`
	SourceCommit     string           `json:"source_commit"`
	EngineIndex      string           `json:"engine_index_digest"`
	Platforms        []enginePlatform `json:"platforms"`
	ReceiptDigest    string           `json:"receipt_digest,omitempty"`
	Scope            string           `json:"scope,omitempty"`
	ScopeDigest      string           `json:"scope_sha256,omitempty"`
	Pending          []string         `json:"pending,omitempty"`
}

// These projections read the existing Scribe lineage receipt schema 1.
type scribeReceipt struct {
	SchemaVersion    int               `json:"schema_version"`
	Policy           string            `json:"policy"`
	ReleaseQualified bool              `json:"release_qualified"`
	Release          scribeRelease     `json:"release"`
	ResultsSHA256    string            `json:"results_sha256"`
	Scopes           json.RawMessage   `json:"scopes"`
	Unconfigured     []json.RawMessage `json:"unconfigured_records"`
}

type scribeProducer struct {
	ID     string `json:"id"`
	SHA256 string `json:"sha256"`
}

type scribeRelease struct {
	ScribeVersion         string         `json:"scribe_version"`
	ScribeCommit          string         `json:"scribe_commit"`
	ScribeProducer        scribeProducer `json:"scribe_producer"`
	ReferenceVersion      string         `json:"reference_version"`
	ReferenceRevision     string         `json:"reference_revision"`
	ReferenceProducer     scribeProducer `json:"reference_producer"`
	SiriusCommit          string         `json:"sirius_commit"`
	ScannerCommit         string         `json:"scanner_commit"`
	CatalogRevision       string         `json:"catalog_revision"`
	CatalogSHA256         string         `json:"catalog_sha256"`
	FixtureManifestSHA256 string         `json:"fixture_manifest_sha256"`
}

type scribeScope struct {
	ID                string            `json:"id"`
	Digest            string            `json:"scope_sha256"`
	ReferenceKind     string            `json:"reference_kind"`
	ReferenceProducer scribeProducer    `json:"reference_producer"`
	Required          int               `json:"required"`
	Affirmative       int               `json:"affirmative"`
	Negative          int               `json:"negative"`
	Unknown           int               `json:"unknown"`
	Invalid           int               `json:"invalid"`
	VerifiedLegacy    int               `json:"verified_legacy"`
	Qualified         bool              `json:"qualified"`
	Findings          []json.RawMessage `json:"findings"`
	Cases             []scribeCase      `json:"cases"`
}

type scribeCase struct {
	ID           string             `json:"id"`
	InputSHA256  string             `json:"input_sha256"`
	ReviewSHA256 string             `json:"review_sha256"`
	Candidate    *scribeObservation `json:"candidate"`
	Reference    *scribeObservation `json:"reference"`
	State        string             `json:"state"`
	Verdict      string             `json:"verdict"`
	Findings     []json.RawMessage  `json:"findings"`
}

type scribeObservation struct {
	Producer     scribeProducer `json:"producer"`
	ResultSHA256 string         `json:"result_sha256"`
	Disposition  string         `json:"disposition"`
	Complete     bool           `json:"complete"`
	Verdict      string         `json:"verdict"`
}

func scribeArtifactDigest(data []byte) string {
	return fmt.Sprintf("sha256:%x", sha256.Sum256(data))
}

func validScribeDigest(digest string) bool {
	return reDigest.MatchString("sha256:" + digest)
}

func readScribeEvidence(path string) ([]byte, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	info, err := file.Stat()
	if err != nil {
		return nil, err
	}
	if !info.Mode().IsRegular() || info.Size() > maxScribeEvidenceBytes {
		return nil, fmt.Errorf("%s must be a regular file at most 8 MiB", path)
	}
	data, err := io.ReadAll(io.LimitReader(file, maxScribeEvidenceBytes+1))
	if err != nil {
		return nil, err
	}
	if len(data) > maxScribeEvidenceBytes {
		return nil, fmt.Errorf("%s exceeds 8 MiB", path)
	}
	return data, nil
}

func reviewScribeEvidence(manifestData []byte, opt options, evidence scribeEvidenceOptions) (scribeEvidenceStatus, error) {
	var status scribeEvidenceStatus
	if opt.verifyDigests {
		return status, fmt.Errorf("scribe-evidence mode is offline and does not accept --verify-digests")
	}
	if evidence.inventoryPath == "" || evidence.indexPath == "" {
		return status, fmt.Errorf("scribe-evidence requires --inventory and --engine-index")
	}
	if err := validateManifest(manifestData, opt); err != nil {
		return status, err
	}
	inventoryData, err := readScribeEvidence(evidence.inventoryPath)
	if err != nil {
		return status, err
	}
	if err := rejectDuplicateKeys(inventoryData); err != nil {
		return status, fmt.Errorf("Core build inventory: %w", err)
	}
	if err := validateInventory(inventoryData, opt.expectCommit); err != nil {
		return status, err
	}
	var manifest CoreManifest
	if err := json.Unmarshal(manifestData, &manifest); err != nil {
		return status, err
	}
	var inventory CoreBuildInventory
	if err := json.Unmarshal(inventoryData, &inventory); err != nil {
		return status, err
	}
	if inventory.Source.Repository != manifest.Metadata.Source.Repository || inventory.Source.Commit != manifest.Metadata.Source.Commit {
		return status, fmt.Errorf("Core manifest and inventory source identities differ")
	}
	for _, component := range requiredComponents {
		if manifest.Images[component].Digest != inventory.Images[component].Digest ||
			manifest.Images[component].Ref != inventory.Images[component].Ref {
			return status, fmt.Errorf("Core manifest and inventory %s image identities differ", component)
		}
	}
	indexData, err := readScribeEvidence(evidence.indexPath)
	if err != nil {
		return status, err
	}
	engineDigest := inventory.Images["sirius-engine"].Digest
	platforms, err := enginePlatforms(indexData, engineDigest)
	if err != nil {
		return status, err
	}
	status = scribeEvidenceStatus{
		Status: "legacy_baseline", SourceCommit: inventory.Source.Commit,
		EngineIndex: engineDigest, Platforms: platforms, Pending: []string{"scribe_receipt_missing"},
	}
	if evidence.receiptPath == "" {
		if evidence.receiptDigest != "" || evidence.scopeID != "" || evidence.scopeDigest != "" {
			return scribeEvidenceStatus{}, fmt.Errorf("receipt and scope pins require --scribe-receipt")
		}
		return status, nil
	}
	if !reDigest.MatchString(evidence.receiptDigest) || !validScribeDigest(evidence.scopeDigest) || evidence.scopeID == "" {
		return scribeEvidenceStatus{}, fmt.Errorf("candidate evidence requires pinned --scribe-receipt-sha256, --scribe-scope and --scribe-scope-sha256")
	}
	receiptData, err := readScribeEvidence(evidence.receiptPath)
	if err != nil {
		return scribeEvidenceStatus{}, err
	}
	if err := matchScribeReceipt(receiptData, manifest, evidence); err != nil {
		return scribeEvidenceStatus{}, err
	}
	status.Status = "scope_matches_core_pins"
	status.ReceiptDigest = evidence.receiptDigest
	status.Scope, status.ScopeDigest = evidence.scopeID, evidence.scopeDigest
	status.Pending = []string{"platform_scanner_binary_binding", "packaged_scribe_module_resolution", "effective_catalog_digest_verification"}
	return status, nil
}

func enginePlatforms(data []byte, indexDigest string) ([]enginePlatform, error) {
	if scribeArtifactDigest(data) != indexDigest {
		return nil, fmt.Errorf("engine index bytes do not match the inventory digest")
	}
	if err := rejectDuplicateKeys(data); err != nil {
		return nil, fmt.Errorf("engine index: %w", err)
	}
	var index struct {
		SchemaVersion int    `json:"schemaVersion"`
		MediaType     string `json:"mediaType"`
		Manifests     []struct {
			Digest    string `json:"digest"`
			MediaType string `json:"mediaType"`
			Platform  struct {
				OS           string `json:"os"`
				Architecture string `json:"architecture"`
			} `json:"platform"`
		} `json:"manifests"`
	}
	if err := json.Unmarshal(data, &index); err != nil {
		return nil, err
	}
	if index.SchemaVersion != 2 ||
		(index.MediaType != "application/vnd.oci.image.index.v1+json" &&
			index.MediaType != "application/vnd.docker.distribution.manifest.list.v2+json") {
		return nil, fmt.Errorf("engine digest must identify a supported multi-platform OCI index")
	}
	digests := make(map[string]string, 2)
	for _, descriptor := range index.Manifests {
		arch := descriptor.Platform.Architecture
		if descriptor.Platform.OS != "linux" || (arch != "amd64" && arch != "arm64") {
			continue
		}
		if !reDigest.MatchString(descriptor.Digest) ||
			(descriptor.MediaType != "application/vnd.oci.image.manifest.v1+json" &&
				descriptor.MediaType != "application/vnd.docker.distribution.manifest.v2+json") {
			return nil, fmt.Errorf("invalid linux/%s image descriptor", arch)
		}
		if _, exists := digests[arch]; exists {
			return nil, fmt.Errorf("duplicate linux/%s image descriptor", arch)
		}
		digests[arch] = descriptor.Digest
	}
	if len(digests) != 2 || digests["amd64"] == digests["arm64"] {
		return nil, fmt.Errorf("engine index must bind distinct linux/amd64 and linux/arm64 images")
	}
	return []enginePlatform{{"linux/amd64", digests["amd64"]}, {"linux/arm64", digests["arm64"]}}, nil
}

func matchScribeReceipt(data []byte, manifest CoreManifest, want scribeEvidenceOptions) error {
	if scribeArtifactDigest(data) != want.receiptDigest {
		return fmt.Errorf("Scribe receipt digest does not match the trusted pin")
	}
	if err := rejectDuplicateKeys(data); err != nil {
		return fmt.Errorf("Scribe receipt: %w", err)
	}
	var receipt scribeReceipt
	if err := json.Unmarshal(data, &receipt); err != nil {
		return err
	}
	if receipt.SchemaVersion != 1 || receipt.Policy != "scribe-json-v1" {
		return fmt.Errorf("unsupported Scribe receipt schema or normalization policy")
	}
	if !receipt.ReleaseQualified || len(receipt.Unconfigured) != 0 {
		return fmt.Errorf("Scribe has not qualified the supplied receipt's declared scope")
	}
	release := receipt.Release
	if release.SiriusCommit != manifest.Metadata.Source.Commit ||
		release.ScannerCommit != manifest.ComponentPins["APP_SCANNER_COMMIT_SHA"] ||
		release.CatalogRevision != manifest.ComponentPins["SIRIUS_NSE_COMMIT_SHA"] {
		return fmt.Errorf("Scribe receipt release commit, scanner commit or catalog revision differs from the Core manifest")
	}
	if !reGitSHA.MatchString(release.ScannerCommit) || !reGitSHA.MatchString(release.CatalogRevision) ||
		!reGitSHA.MatchString(release.ScribeCommit) || !reGitSHA.MatchString(release.ReferenceRevision) ||
		strings.TrimSpace(release.ScribeVersion) == "" || strings.TrimSpace(release.ReferenceVersion) == "" ||
		!validScribeDigest(release.CatalogSHA256) || !validScribeDigest(release.FixtureManifestSHA256) ||
		!release.ScribeProducer.valid() || !release.ReferenceProducer.valid() ||
		release.ScribeProducer.ID == release.ReferenceProducer.ID ||
		release.ScribeProducer.SHA256 == release.ReferenceProducer.SHA256 {
		return fmt.Errorf("Scribe receipt release pins or producer identities are incomplete or invalid")
	}

	var compact bytes.Buffer
	if err := json.Compact(&compact, receipt.Scopes); err != nil {
		return fmt.Errorf("invalid Scribe scope array: %w", err)
	}
	if scribeArtifactDigest(compact.Bytes()) != "sha256:"+receipt.ResultsSHA256 {
		return fmt.Errorf("Scribe results digest differs from the scope array")
	}
	var scopes []scribeScope
	if err := json.Unmarshal(receipt.Scopes, &scopes); err != nil {
		return err
	}
	seen := make(map[string]bool, len(scopes))
	var selected *scribeScope
	for i := range scopes {
		scope := &scopes[i]
		if scope.ID == "" || seen[scope.ID] {
			return fmt.Errorf("invalid or duplicate Scribe workflow scope")
		}
		seen[scope.ID] = true
		if scope.ID == want.scopeID {
			selected = scope
		}
	}
	if selected == nil || selected.Digest != want.scopeDigest {
		return fmt.Errorf("required Scribe workflow scope is missing or has a different digest")
	}
	if err := checkScribeScope(*selected, release); err != nil {
		return err
	}
	digest, err := scribeScopeDigest(*selected, receipt)
	if err != nil {
		return err
	}
	if digest != selected.Digest {
		return fmt.Errorf("required Scribe workflow scope digest does not cover the supplied release and case set")
	}
	return nil
}

func (p scribeProducer) valid() bool {
	return strings.TrimSpace(p.ID) != "" && validScribeDigest(p.SHA256)
}

func checkScribeScope(scope scribeScope, release scribeRelease) error {
	if !scope.Qualified || scope.ReferenceKind != "legacy" || scope.ReferenceProducer != release.ReferenceProducer ||
		scope.Required == 0 || scope.Required != len(scope.Cases) || scope.VerifiedLegacy != scope.Required ||
		scope.Unknown != 0 || scope.Invalid != 0 || len(scope.Findings) != 0 {
		return fmt.Errorf("required Scribe scope has incomplete or unqualified legacy coverage")
	}
	seen := make(map[string]bool, len(scope.Cases))
	affirmative, negative := 0, 0
	for _, c := range scope.Cases {
		if strings.TrimSpace(c.ID) == "" || seen[c.ID] {
			return fmt.Errorf("invalid or duplicate Scribe case ID")
		}
		seen[c.ID] = true
		if c.State != "match" || len(c.Findings) != 0 || !validScribeDigest(c.InputSHA256) ||
			!validScribeDigest(c.ReviewSHA256) ||
			!c.Candidate.matches(release.ScribeProducer, c.Verdict) ||
			!c.Reference.matches(release.ReferenceProducer, c.Verdict) {
			return fmt.Errorf("Scribe case %q lacks matching completed reviewed evidence", c.ID)
		}
		switch c.Verdict {
		case "vulnerable":
			affirmative++
		case "not_vulnerable":
			negative++
		default:
			return fmt.Errorf("Scribe case %q lacks an explicit verdict", c.ID)
		}
	}
	if scope.Affirmative != affirmative || scope.Negative != negative {
		return fmt.Errorf("required Scribe scope coverage counts do not match its cases")
	}
	return nil
}

func (o *scribeObservation) matches(producer scribeProducer, verdict string) bool {
	return o != nil && o.Producer == producer && validScribeDigest(o.ResultSHA256) &&
		o.Disposition == "completed" && o.Complete && o.Verdict == verdict
}

func scribeScopeDigest(scope scribeScope, receipt scribeReceipt) (string, error) {
	type casePin struct {
		ID          string `json:"id"`
		InputSHA256 string `json:"input_sha256"`
	}
	cases := make([]casePin, 0, len(scope.Cases))
	for _, c := range scope.Cases {
		cases = append(cases, casePin{ID: c.ID, InputSHA256: c.InputSHA256})
	}
	sort.Slice(cases, func(i, j int) bool { return cases[i].ID < cases[j].ID })
	pin := struct {
		SchemaVersion     int            `json:"schema_version"`
		Policy            string         `json:"policy"`
		Release           scribeRelease  `json:"release"`
		ID                string         `json:"id"`
		ReferenceKind     string         `json:"reference_kind"`
		ReferenceProducer scribeProducer `json:"reference_producer"`
		Cases             []casePin      `json:"cases"`
	}{
		SchemaVersion: receipt.SchemaVersion, Policy: receipt.Policy, Release: receipt.Release,
		ID: scope.ID, ReferenceKind: scope.ReferenceKind, ReferenceProducer: scope.ReferenceProducer, Cases: cases,
	}
	data, err := json.Marshal(pin)
	if err != nil {
		return "", err
	}
	return strings.TrimPrefix(scribeArtifactDigest(data), "sha256:"), nil
}
