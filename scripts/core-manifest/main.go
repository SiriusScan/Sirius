// Command core-manifest validates Community release manifests and build inventories.
// Input files must be JSON-compatible YAML 1.2 (typically pretty-printed JSON).
// Validation is fail-closed: duplicate keys, unknown fields, wrong types/nesting,
// and incomplete component sets are rejected.
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

var (
	reSemVer  = regexp.MustCompile(`^v[0-9]+\.[0-9]+\.[0-9]+$`)
	reGitSHA  = regexp.MustCompile(`^[a-f0-9]{40}$`)
	reDigest  = regexp.MustCompile(`^sha256:[a-f0-9]{64}$`)
	reUTCTime = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$`)
)

var requiredComponents = []string{
	"sirius-ui",
	"sirius-api",
	"sirius-engine",
	"sirius-postgres",
	"sirius-rabbitmq",
	"sirius-valkey",
}

var requiredPins = []string{
	"APP_SYSTEM_MONITOR_COMMIT_SHA",
	"APP_ADMINISTRATOR_COMMIT_SHA",
	"GO_API_COMMIT_SHA",
	"APP_SCANNER_COMMIT_SHA",
	"APP_TERMINAL_COMMIT_SHA",
	"SIRIUS_NSE_COMMIT_SHA",
	"APP_AGENT_COMMIT_SHA",
	"PINGPP_COMMIT_SHA",
}

type schemaMapEntry struct {
	LedgerTable     string `json:"ledger_table"`
	LatestMigration string `json:"latest_migration"`
}

type CoreManifest struct {
	APIVersion    string            `json:"apiVersion"`
	Kind          string            `json:"kind"`
	Metadata      ManifestMetadata  `json:"metadata"`
	Schema        ManifestSchema    `json:"schema"`
	ComponentPins map[string]string `json:"component_pins"`
	Images        map[string]Image  `json:"images"`
}

type ManifestMetadata struct {
	ReleaseTag  string     `json:"release_tag"`
	GeneratedAt string     `json:"generated_at"`
	Source      SourceMeta `json:"source"`
}

type SourceMeta struct {
	Repository string `json:"repository"`
	Commit     string `json:"commit"`
	Tag        string `json:"tag"`
}

type ManifestSchema struct {
	LedgerTable     string `json:"ledger_table"`
	LatestMigration string `json:"latest_migration"`
	GoAPIVersion    string `json:"go_api_version"`
}

type Image struct {
	Tag    string `json:"tag"`
	Digest string `json:"digest"`
	Ref    string `json:"ref"`
}

type CoreBuildInventory struct {
	APIVersion  string                    `json:"apiVersion"`
	Kind        string                    `json:"kind"`
	GeneratedAt string                    `json:"generated_at"`
	Source      InventorySource           `json:"source"`
	Images      map[string]InventoryImage `json:"images"`
}

type InventorySource struct {
	Repository  string `json:"repository"`
	Commit      string `json:"commit"`
	SnapshotTag string `json:"snapshot_tag"`
}

type InventoryImage struct {
	Digest string `json:"digest"`
	Ref    string `json:"ref"`
}

func main() {
	expectTag := flag.String("expect-tag", "", "require metadata.release_tag / images.*.tag to equal this SemVer tag")
	expectCommit := flag.String("expect-commit", "", "require source.commit to equal this full SHA")
	skipDockerfilePins := flag.Bool("skip-dockerfile-pins", false, "skip Dockerfile pin parity checks")
	dockerfile := flag.String("dockerfile", "", "path to sirius-engine/Dockerfile for pin parity")
	schemaMapPath := flag.String("schema-map", "", "path to go-api schema_map.json")
	verifyDigests := flag.Bool("verify-digests", false, "verify image digests against registry via CORE_MANIFEST_INSPECT_CMD or docker")
	mode := flag.String("mode", "manifest", "manifest|inventory")
	flag.Parse()

	if flag.NArg() != 1 {
		fmt.Fprintf(os.Stderr, "usage: go run . [flags] <file>\n")
		os.Exit(2)
	}
	path := flag.Arg(0)
	data, err := os.ReadFile(path)
	if err != nil {
		fatalf("read %s: %v", path, err)
	}
	if err := rejectDuplicateKeys(data); err != nil {
		fatalf("%s: %v", path, err)
	}

	switch *mode {
	case "manifest":
		if err := validateManifest(data, options{
			expectTag:          *expectTag,
			expectCommit:       *expectCommit,
			skipDockerfilePins: *skipDockerfilePins,
			dockerfile:         *dockerfile,
			schemaMapPath:      *schemaMapPath,
			verifyDigests:      *verifyDigests,
		}); err != nil {
			fatalf("%s", err)
		}
		fmt.Printf("PASS core-manifest validation: %s\n", path)
	case "inventory":
		if err := validateInventory(data, *expectCommit); err != nil {
			fatalf("%s", err)
		}
		fmt.Printf("PASS core-build-inventory validation: %s\n", path)
	default:
		fatalf("unknown mode %q", *mode)
	}
}

type options struct {
	expectTag          string
	expectCommit       string
	skipDockerfilePins bool
	dockerfile         string
	schemaMapPath      string
	verifyDigests      bool
}

func validateManifest(data []byte, opt options) error {
	var m CoreManifest
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&m); err != nil {
		return fmt.Errorf("strict JSON decode: %w", err)
	}
	var trailing json.RawMessage
	if err := dec.Decode(&trailing); err != io.EOF {
		if err == nil {
			return fmt.Errorf("trailing JSON values are not allowed")
		}
		return fmt.Errorf("invalid trailing JSON: %w", err)
	}

	if m.APIVersion != "siriusscan.dev/v1" {
		return fmt.Errorf("apiVersion must be siriusscan.dev/v1")
	}
	if m.Kind != "CoreManifest" {
		return fmt.Errorf("kind must be CoreManifest")
	}
	if !reSemVer.MatchString(m.Metadata.ReleaseTag) {
		return fmt.Errorf("metadata.release_tag must be vMAJOR.MINOR.PATCH")
	}
	if !reUTCTime.MatchString(m.Metadata.GeneratedAt) {
		return fmt.Errorf("metadata.generated_at must be UTC RFC3339 Zulu")
	}
	if strings.TrimSpace(m.Metadata.Source.Repository) == "" {
		return fmt.Errorf("metadata.source.repository is required")
	}
	if !reGitSHA.MatchString(m.Metadata.Source.Commit) {
		return fmt.Errorf("metadata.source.commit must be a full 40-char git SHA")
	}
	if m.Metadata.Source.Tag != m.Metadata.ReleaseTag {
		return fmt.Errorf("metadata.source.tag must equal metadata.release_tag")
	}
	if opt.expectTag != "" && m.Metadata.ReleaseTag != opt.expectTag {
		return fmt.Errorf("expected release_tag %s, got %s", opt.expectTag, m.Metadata.ReleaseTag)
	}
	if opt.expectCommit != "" && m.Metadata.Source.Commit != opt.expectCommit {
		return fmt.Errorf("expected commit %s, got %s", opt.expectCommit, m.Metadata.Source.Commit)
	}

	if err := exactStringKeys(m.ComponentPins, requiredPins, "component_pins"); err != nil {
		return err
	}
	for _, pin := range requiredPins {
		if strings.TrimSpace(m.ComponentPins[pin]) == "" {
			return fmt.Errorf("component_pins.%s is empty", pin)
		}
	}
	goAPI := m.ComponentPins["GO_API_COMMIT_SHA"]
	if m.Schema.GoAPIVersion != goAPI {
		return fmt.Errorf("schema.go_api_version must equal component_pins.GO_API_COMMIT_SHA")
	}

	schemaMap, err := loadSchemaMap(opt.schemaMapPath)
	if err != nil {
		return err
	}
	entry, ok := schemaMap[goAPI]
	if !ok {
		return fmt.Errorf("GO_API_COMMIT_SHA %q has no entry in schema_map.json", goAPI)
	}
	if m.Schema.LedgerTable != entry.LedgerTable {
		return fmt.Errorf("schema.ledger_table mismatch for %s: got %q want %q", goAPI, m.Schema.LedgerTable, entry.LedgerTable)
	}
	if m.Schema.LatestMigration != entry.LatestMigration {
		return fmt.Errorf("schema.latest_migration mismatch for %s: got %q want %q", goAPI, m.Schema.LatestMigration, entry.LatestMigration)
	}

	if !opt.skipDockerfilePins {
		df := opt.dockerfile
		if df == "" {
			df = defaultDockerfile()
		}
		if st, err := os.Stat(df); err == nil && !st.IsDir() {
			for _, pin := range requiredPins {
				want, err := extractDockerfilePin(df, pin)
				if err != nil {
					return err
				}
				if m.ComponentPins[pin] != want {
					return fmt.Errorf("pin mismatch for %s: manifest=%s dockerfile=%s", pin, m.ComponentPins[pin], want)
				}
			}
		}
	}

	if err := exactStringKeys(imageKeys(m.Images), requiredComponents, "images"); err != nil {
		return err
	}
	for _, component := range requiredComponents {
		img := m.Images[component]
		if img.Tag != m.Metadata.ReleaseTag {
			return fmt.Errorf("images.%s.tag must equal release_tag", component)
		}
		if !reDigest.MatchString(img.Digest) {
			return fmt.Errorf("images.%s.digest invalid", component)
		}
		wantRef := fmt.Sprintf("ghcr.io/siriusscan/%s@%s", component, img.Digest)
		if img.Ref != wantRef {
			return fmt.Errorf("images.%s.ref must be %s", component, wantRef)
		}
	}

	if opt.verifyDigests {
		if err := verifyLiveDigests(m); err != nil {
			return err
		}
	}
	return nil
}

func validateInventory(data []byte, expectCommit string) error {
	var inv CoreBuildInventory
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&inv); err != nil {
		return fmt.Errorf("strict JSON decode: %w", err)
	}
	var trailing json.RawMessage
	if err := dec.Decode(&trailing); err != io.EOF {
		if err == nil {
			return fmt.Errorf("trailing JSON values are not allowed")
		}
		return fmt.Errorf("invalid trailing JSON: %w", err)
	}
	if inv.APIVersion != "siriusscan.dev/v1" {
		return fmt.Errorf("apiVersion must be siriusscan.dev/v1")
	}
	if inv.Kind != "CoreBuildInventory" {
		return fmt.Errorf("kind must be CoreBuildInventory")
	}
	if !reUTCTime.MatchString(inv.GeneratedAt) {
		return fmt.Errorf("generated_at must be UTC RFC3339 Zulu")
	}
	if !reGitSHA.MatchString(inv.Source.Commit) {
		return fmt.Errorf("source.commit must be a full 40-char git SHA")
	}
	if expectCommit != "" && inv.Source.Commit != expectCommit {
		return fmt.Errorf("expected commit %s, got %s", expectCommit, inv.Source.Commit)
	}
	wantSnap := "sha-" + inv.Source.Commit
	if inv.Source.SnapshotTag != wantSnap {
		return fmt.Errorf("source.snapshot_tag must be %s", wantSnap)
	}
	if strings.TrimSpace(inv.Source.Repository) == "" {
		return fmt.Errorf("source.repository is required")
	}
	if err := exactStringKeys(inventoryKeys(inv.Images), requiredComponents, "images"); err != nil {
		return err
	}
	for _, component := range requiredComponents {
		img := inv.Images[component]
		if !reDigest.MatchString(img.Digest) {
			return fmt.Errorf("images.%s.digest invalid", component)
		}
		wantRef := fmt.Sprintf("ghcr.io/siriusscan/%s@%s", component, img.Digest)
		if img.Ref != wantRef {
			return fmt.Errorf("images.%s.ref must be %s", component, wantRef)
		}
	}
	return nil
}

func verifyLiveDigests(m CoreManifest) error {
	inspectCmd := os.Getenv("CORE_MANIFEST_INSPECT_CMD")
	for _, component := range requiredComponents {
		tagRef := fmt.Sprintf("ghcr.io/siriusscan/%s:%s", component, m.Metadata.ReleaseTag)
		digest, err := inspectDigest(inspectCmd, tagRef)
		if err != nil {
			return err
		}
		if digest != m.Images[component].Digest {
			return fmt.Errorf("digest drift for %s: manifest=%s live=%s", component, m.Images[component].Digest, digest)
		}
		fmt.Printf("PASS digest match %s %s\n", component, digest)
	}
	return nil
}

func inspectDigest(inspectCmd, imageRef string) (string, error) {
	var out []byte
	var err error
	if inspectCmd != "" {
		// CORE_MANIFEST_INSPECT_CMD is a shell command prefix (e.g. "bash path/mock.sh").
		out, err = runShell(inspectCmd + " " + shellQuote(imageRef))
	} else {
		out, err = runShell("docker buildx imagetools inspect " + shellQuote(imageRef) + " --format '{{json .}}'")
	}
	if err != nil {
		return "", fmt.Errorf("inspect %s: %w", imageRef, err)
	}
	var payload struct {
		Manifest struct {
			Digest string `json:"digest"`
		} `json:"manifest"`
	}
	if err := json.Unmarshal(out, &payload); err != nil {
		return "", fmt.Errorf("parse inspect JSON for %s: %w", imageRef, err)
	}
	if !reDigest.MatchString(payload.Manifest.Digest) {
		return "", fmt.Errorf("invalid live digest for %s: %q", imageRef, payload.Manifest.Digest)
	}
	return payload.Manifest.Digest, nil
}

func loadSchemaMap(path string) (map[string]schemaMapEntry, error) {
	if path == "" {
		path = filepath.Join(filepath.Dir(mustExecutableDir()), "schema_map.json")
		// When running via `go run`, fall back to source-relative path.
		if _, err := os.Stat(path); err != nil {
			path = filepath.Join("scripts", "core-manifest", "schema_map.json")
		}
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read schema map: %w", err)
	}
	if err := rejectDuplicateKeys(data); err != nil {
		return nil, fmt.Errorf("schema map: %w", err)
	}
	var m map[string]schemaMapEntry
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&m); err != nil {
		return nil, fmt.Errorf("decode schema map: %w", err)
	}
	var trailing json.RawMessage
	if err := dec.Decode(&trailing); err != io.EOF {
		if err == nil {
			return nil, fmt.Errorf("schema map contains trailing JSON values")
		}
		return nil, fmt.Errorf("schema map has invalid trailing JSON: %w", err)
	}
	if len(m) == 0 {
		return nil, fmt.Errorf("schema map is empty")
	}
	return m, nil
}

func extractDockerfilePin(dockerfile, name string) (string, error) {
	data, err := os.ReadFile(dockerfile)
	if err != nil {
		return "", err
	}
	prefix := "ARG " + name + "="
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimRight(line, "\r")
		if strings.HasPrefix(line, prefix) {
			val := strings.TrimSpace(strings.TrimPrefix(line, prefix))
			if val == "" {
				return "", fmt.Errorf("empty Dockerfile pin %s", name)
			}
			return val, nil
		}
	}
	return "", fmt.Errorf("missing Dockerfile pin default: %s", name)
}

func defaultDockerfile() string {
	candidates := []string{
		filepath.Join("sirius-engine", "Dockerfile"),
		filepath.Join("..", "..", "sirius-engine", "Dockerfile"),
	}
	for _, c := range candidates {
		if st, err := os.Stat(c); err == nil && !st.IsDir() {
			return c
		}
	}
	return filepath.Join("sirius-engine", "Dockerfile")
}

func mustExecutableDir() string {
	// Prefer source dir via cwd-relative scripts/core-manifest when present.
	if st, err := os.Stat(filepath.Join("scripts", "core-manifest")); err == nil && st.IsDir() {
		return filepath.Join("scripts", "core-manifest")
	}
	exe, err := os.Executable()
	if err != nil {
		return "."
	}
	return filepath.Dir(exe)
}

func exactStringKeys(got map[string]string, want []string, label string) error {
	if len(got) != len(want) {
		return fmt.Errorf("%s: expected %d keys, got %d", label, len(want), len(got))
	}
	for _, k := range want {
		if _, ok := got[k]; !ok {
			return fmt.Errorf("%s.%s missing", label, k)
		}
	}
	for k := range got {
		found := false
		for _, w := range want {
			if k == w {
				found = true
				break
			}
		}
		if !found {
			return fmt.Errorf("%s contains unknown key %q", label, k)
		}
	}
	return nil
}

func imageKeys(images map[string]Image) map[string]string {
	out := make(map[string]string, len(images))
	for k := range images {
		out[k] = k
	}
	return out
}

func inventoryKeys(images map[string]InventoryImage) map[string]string {
	out := make(map[string]string, len(images))
	for k := range images {
		out[k] = k
	}
	return out
}

func rejectDuplicateKeys(data []byte) error {
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.UseNumber()
	if err := walkRejectDupes(dec, "$"); err != nil {
		return err
	}
	if _, err := dec.Token(); err != io.EOF {
		if err == nil {
			return fmt.Errorf("trailing JSON values are not allowed")
		}
		return fmt.Errorf("invalid trailing JSON: %w", err)
	}
	return nil
}

func walkRejectDupes(dec *json.Decoder, path string) error {
	tok, err := dec.Token()
	if err != nil {
		return err
	}
	switch t := tok.(type) {
	case json.Delim:
		switch t {
		case '{':
			seen := map[string]struct{}{}
			for dec.More() {
				keyTok, err := dec.Token()
				if err != nil {
					return err
				}
				key, ok := keyTok.(string)
				if !ok {
					return fmt.Errorf("%s: object key must be string", path)
				}
				if _, exists := seen[key]; exists {
					return fmt.Errorf("%s: duplicate key %q", path, key)
				}
				seen[key] = struct{}{}
				child := path + "." + key
				if path == "$" {
					child = "$." + key
				}
				if err := walkRejectDupes(dec, child); err != nil {
					return err
				}
			}
			end, err := dec.Token()
			if err != nil {
				return err
			}
			if end != json.Delim('}') {
				return fmt.Errorf("%s: expected end of object", path)
			}
		case '[':
			i := 0
			for dec.More() {
				if err := walkRejectDupes(dec, fmt.Sprintf("%s[%d]", path, i)); err != nil {
					return err
				}
				i++
			}
			end, err := dec.Token()
			if err != nil {
				return err
			}
			if end != json.Delim(']') {
				return fmt.Errorf("%s: expected end of array", path)
			}
		default:
			return fmt.Errorf("%s: unexpected delimiter %v", path, t)
		}
	case string, json.Number, bool, nil:
		return nil
	default:
		return fmt.Errorf("%s: unexpected token %v", path, t)
	}
	return nil
}

func fatalf(format string, args ...any) {
	fmt.Fprintf(os.Stderr, "ERROR: "+format+"\n", args...)
	os.Exit(1)
}

func shellQuote(s string) string {
	return "'" + strings.ReplaceAll(s, "'", `'"'"'`) + "'"
}

func runShell(command string) ([]byte, error) {
	cmd := exec.Command("bash", "-c", command)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("%w: %s", err, strings.TrimSpace(string(out)))
	}
	return bytes.TrimSpace(out), nil
}
