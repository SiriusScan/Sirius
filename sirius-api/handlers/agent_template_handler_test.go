package handlers

import (
	"encoding/base64"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius/store/templates"
	"gopkg.in/yaml.v3"
)

const fixtureYAML = `id: test-cve-2026-0001
info:
  name: Test CVE 2026-0001
  author: tester
  severity: high
  description: Detects a fictional vulnerability used in unit tests.
  version: 1.0.0
  tags:
    - test
detection:
  steps:
    - type: command
      platforms:
        - linux
        - darwin
      command: "echo vulnerable"
`

func parseFixture(t *testing.T) *AgentTemplateYAML {
	t.Helper()
	var tpl AgentTemplateYAML
	if err := yaml.Unmarshal([]byte(fixtureYAML), &tpl); err != nil {
		t.Fatalf("failed to parse fixture YAML: %v", err)
	}
	return &tpl
}

func TestBuildTemplateRecord_EnvelopeShape(t *testing.T) {
	tpl := parseFixture(t)
	raw := []byte(fixtureYAML)

	rec, checksum, err := buildTemplateRecord(tpl, raw, true, time.Time{})
	if err != nil {
		t.Fatalf("buildTemplateRecord returned error: %v", err)
	}
	if checksum == "" {
		t.Fatal("expected non-empty checksum")
	}

	envBytes, err := templates.EncodeTemplate(rec)
	if err != nil {
		t.Fatalf("EncodeTemplate: %v", err)
	}
	metaBytes, err := templates.EncodeMeta(rec)
	if err != nil {
		t.Fatalf("EncodeMeta: %v", err)
	}

	var envelope templates.TemplateRecord
	if err := json.Unmarshal(envBytes, &envelope); err != nil {
		t.Fatalf("envelope is not valid JSON of TemplateRecord: %v", err)
	}

	if envelope.ID != "test-cve-2026-0001" {
		t.Errorf("envelope ID mismatch: got %q", envelope.ID)
	}
	if envelope.Severity != "high" {
		t.Errorf("envelope Severity mismatch: got %q", envelope.Severity)
	}
	if envelope.DetectionType != "command" {
		t.Errorf("envelope DetectionType mismatch: got %q", envelope.DetectionType)
	}
	if !envelope.IsCustom {
		t.Error("envelope IsCustom should be true for custom uploads")
	}
	if envelope.Checksum != checksum {
		t.Errorf("envelope Checksum %q != returned checksum %q", envelope.Checksum, checksum)
	}
	if envelope.Size != int64(len(raw)) {
		t.Errorf("envelope Size %d != raw len %d", envelope.Size, len(raw))
	}
	if string(envelope.Content) != string(raw) {
		t.Error("envelope Content should round-trip to the original raw YAML bytes")
	}
	if got, want := envelope.Platforms, []string{"linux", "darwin"}; !equalStrings(got, want) {
		t.Errorf("envelope Platforms = %v, want %v", got, want)
	}

	// JSON wire shape: Content must serialize as base64 string under "content".
	var raw1 map[string]any
	if err := json.Unmarshal(envBytes, &raw1); err != nil {
		t.Fatalf("envelope is not generic JSON: %v", err)
	}
	contentStr, ok := raw1["content"].(string)
	if !ok {
		t.Fatalf("envelope.content must be a base64 string on the wire; got %T", raw1["content"])
	}
	decoded, err := base64.StdEncoding.DecodeString(contentStr)
	if err != nil {
		t.Fatalf("envelope.content is not valid base64: %v", err)
	}
	if string(decoded) != fixtureYAML {
		t.Error("base64-decoded content does not match the original raw YAML")
	}

	var meta templates.TemplateRecord
	if err := json.Unmarshal(metaBytes, &meta); err != nil {
		t.Fatalf("meta is not valid JSON: %v", err)
	}
	if len(meta.Content) != 0 {
		t.Error("meta record must omit Content")
	}
	if !meta.IsCustom {
		t.Error("meta IsCustom should be true for custom uploads")
	}
	if meta.ID != envelope.ID || meta.Checksum != envelope.Checksum {
		t.Error("meta record core identity fields must match envelope")
	}
}

func TestBuildTemplateRecord_DetectionTypeFallback(t *testing.T) {
	const noStepsYAML = `id: empty-detect
info:
  name: empty
  author: t
  severity: low
detection: {}
`
	var tpl AgentTemplateYAML
	if err := yaml.Unmarshal([]byte(noStepsYAML), &tpl); err != nil {
		t.Fatal(err)
	}
	rec, _, err := buildTemplateRecord(&tpl, []byte(noStepsYAML), true, time.Time{})
	if err != nil {
		t.Fatal(err)
	}
	envBytes, err := templates.EncodeTemplate(rec)
	if err != nil {
		t.Fatalf("EncodeTemplate: %v", err)
	}
	if !strings.Contains(string(envBytes), `"detection_type":""`) {
		t.Errorf("expected empty detection_type when no steps; got: %s", envBytes)
	}
}

// TestBuildTemplateRecord_PreservesCreated covers the update path: when
// UpdateAgentTemplate reads the existing meta and re-builds the record,
// it passes through the original `created` timestamp and the original
// `is_custom` flag (so editing a built-in does not silently flip it to
// custom). The envelope's `updated` field still moves to "now".
func TestBuildTemplateRecord_PreservesCreated(t *testing.T) {
	tpl := parseFixture(t)
	raw := []byte(fixtureYAML)
	original := time.Date(2025, 1, 2, 3, 4, 5, 0, time.UTC)

	rec, _, err := buildTemplateRecord(tpl, raw, false, original)
	if err != nil {
		t.Fatalf("buildTemplateRecord returned error: %v", err)
	}
	envBytes, err := templates.EncodeTemplate(rec)
	if err != nil {
		t.Fatalf("EncodeTemplate: %v", err)
	}

	var envelope templates.TemplateRecord
	if err := json.Unmarshal(envBytes, &envelope); err != nil {
		t.Fatalf("envelope decode: %v", err)
	}
	if !envelope.Created.Equal(original) {
		t.Errorf("Created should be preserved; got %v want %v", envelope.Created, original)
	}
	if envelope.IsCustom {
		t.Error("IsCustom should remain false when caller passes false (built-in edit)")
	}
	if envelope.Updated.Before(original) || envelope.Updated.Equal(original) {
		t.Errorf("Updated should advance past Created; got Updated=%v Created=%v", envelope.Updated, original)
	}
}

func equalStrings(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
