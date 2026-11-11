package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
	"net/http/httptest"
	"reflect"
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

const completeAgentTemplateYAML = `# Preserve author-independent template content.
id: test-cve-2026-0001
x-extension:
  enabled: true
  values: [1, 2]
info:
  name: Test CVE 2026-0001
  author: original-author
  severity: high
  vulnerability_id: CVE-2026-0001
  risk_score: 9.1
  cvss_score: 8.1
  cvss_vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
  cve: [CVE-2026-0001]
  cwe: [CWE-79]
  references: [https://example.invalid/advisory]
  remediation: Upgrade the affected package.
  x-info: {future: supported}
detection:
  logic: any
  x-detection: {threshold: 2}
  steps:
    - type: command_version
      platforms: [linux, darwin]
      config:
        command: [example, --version]
        regex: vulnerable
        x-future: {nested: [one, two]}
    - type: file_content
      config:
        path: /example/fixture
        regex: vulnerable
`

type agentTemplateStoreFake struct {
	store.KVStore
	values map[string]string
	writes int
}

func (s *agentTemplateStoreFake) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: s.values[key]}}, nil
}
func (s *agentTemplateStoreFake) SetValue(_ context.Context, key, value string) error {
	s.values[key] = value
	s.writes++
	return nil
}
func (s *agentTemplateStoreFake) DeleteValue(_ context.Context, key string) error {
	delete(s.values, key)
	return nil
}
func (s *agentTemplateStoreFake) Close() error { return nil }

func exerciseAgentTemplate(t *testing.T, method, path string, handler fiber.Handler, body interface{}) (int, map[string]interface{}) {
	t.Helper()
	app := fiber.New()
	app.Add(method, "/api/agent-templates/:id?", handler)
	encoded, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(method, path, strings.NewReader(string(encoded)))
	req.Header.Set("Content-Type", "application/json")
	response, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	var result map[string]interface{}
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	return response.StatusCode, result
}

func TestAgentTemplateSavePreservesYAML(t *testing.T) {
	for _, update := range []bool{false, true} {
		for _, author := range []string{"", "replacement-author"} {
			t.Run(fmt.Sprintf("update=%v/author=%q", update, author), func(t *testing.T) {
				storeFake := &agentTemplateStoreFake{values: map[string]string{}}
				created := time.Date(2025, 1, 2, 3, 4, 5, 0, time.UTC)
				if update {
					record := &templates.TemplateRecord{ID: "test-cve-2026-0001", Created: created, IsCustom: false}
					metadata, err := templates.EncodeMeta(record)
					if err != nil {
						t.Fatal(err)
					}
					storeFake.values[templates.AgentTemplateMetaKey(record.ID)] = string(metadata)
				}
				notifications := 0
				h := agentTemplateHandler{
					newStore: func() (store.KVStore, error) { return storeFake, nil },
					notify: func(id, source string) error {
						if id != "test-cve-2026-0001" || source != "sirius-api" {
							t.Errorf("unexpected notification: %s %s", id, source)
						}
						notifications++
						return nil
					},
				}
				method, path, handler := "POST", "/api/agent-templates", h.UploadAgentTemplate
				if update {
					method, path, handler = "PUT", path+"/test-cve-2026-0001", h.UpdateAgentTemplate
				}
				status, response := exerciseAgentTemplate(t, method, path, handler, map[string]string{"content": completeAgentTemplateYAML, "author": author})
				if status != 200 {
					t.Fatalf("response = %d %v", status, response)
				}
				record, err := templates.ReadTemplate(context.Background(), storeFake, "test-cve-2026-0001")
				if err != nil || record == nil {
					t.Fatalf("missing persisted envelope: %v", err)
				}
				var expected, actual map[string]interface{}
				if err := yaml.Unmarshal([]byte(completeAgentTemplateYAML), &expected); err != nil {
					t.Fatal(err)
				}
				if author != "" {
					expected["info"].(map[string]interface{})["author"] = author
				}
				if err := yaml.Unmarshal(record.Content, &actual); err != nil {
					t.Fatal(err)
				}
				if !reflect.DeepEqual(actual, expected) {
					t.Fatalf("persisted YAML changed beyond author:\ngot: %#v\nwant: %#v", actual, expected)
				}
				if author == "" && string(record.Content) != completeAgentTemplateYAML {
					t.Fatal("no author override must preserve exact bytes")
				}
				if !strings.Contains(string(record.Content), "# Preserve author-independent template content.") {
					t.Fatal("lost YAML comment")
				}
				if record.Author != expected["info"].(map[string]interface{})["author"] {
					t.Fatalf("metadata author = %q", record.Author)
				}
				if record.Checksum != templates.SHA256Hex(record.Content) || response["checksum"] != record.Checksum || record.Size != int64(len(record.Content)) {
					t.Fatal("stored checksum or size does not match preserved content")
				}
				if update && (!record.Created.Equal(created) || record.IsCustom) {
					t.Fatal("update changed built-in identity or creation time")
				}
				if storeFake.writes != 2 || notifications != 1 {
					t.Fatalf("writes=%d notifications=%d", storeFake.writes, notifications)
				}
			})
		}
	}
}

func TestAgentTemplateAuthorLegacyAndAliases(t *testing.T) {
	for _, content := range []string{
		"id: legacy\nname: Legacy\nseverity: low\ndetection: {logic: any}\n",
		"defaults: &details {name: Test, severity: high, author: original}\nid: aliased\ninfo: *details\ndetection: {logic: any}\n",
		"defaults: &details {name: Test, severity: high, author: original}\nid: merged\ninfo: {<<: *details}\ndetection: {logic: any}\n",
		"id: anchored-author\ninfo: {name: Test, severity: high, author: &author original}\nother-author: *author\ndetection: {logic: any}\n",
		"id: anchored-info\ninfo: &details {name: Test, severity: high, author: original}\ndefaults: *details\ndetection: {logic: any}\n",
		"base: &base {info: {name: Test, severity: high, author: original}}\n<<: *base\nid: merged-root\ndetection: {logic: any}\n",
	} {
		raw, err := templateContentWithAuthor(content, "replacement")
		if err != nil {
			t.Fatal(err)
		}
		var value map[string]interface{}
		if err := yaml.Unmarshal(raw, &value); err != nil {
			t.Fatal(err)
		}
		if value["info"].(map[string]interface{})["author"] != "replacement" {
			t.Fatalf("missing replacement author: %s", raw)
		}
		if value["detection"].(map[string]interface{})["logic"] != "any" {
			t.Fatalf("lost detection logic: %s", raw)
		}
		if defaults, ok := value["defaults"].(map[string]interface{}); ok && defaults["author"] != "original" {
			t.Fatal("changed source of alias")
		}
		if other, ok := value["other-author"]; ok && other != "original" {
			t.Fatal("changed an alias of the original author")
		}
		if value["id"] != "legacy" && value["info"].(map[string]interface{})["name"] != "Test" {
			t.Fatal("lost inherited info fields")
		}
	}
}

func TestAgentTemplateTestTargetsConnectedAgent(t *testing.T) {
	for _, tc := range []struct {
		name   string
		body   map[string]interface{}
		status int
		sends  int
	}{
		{"selected agent", map[string]interface{}{"agentId": " agent-one "}, 200, 1},
		{"missing agent", map[string]interface{}{}, 400, 0},
		{"wrong casing", map[string]interface{}{"agent_id": "agent-one"}, 400, 0},
		{"all is not an agent", map[string]interface{}{"agentId": "all"}, 400, 0},
		{"disconnected agent", map[string]interface{}{"agentId": "offline"}, 400, 0},
		{"wrong type", map[string]interface{}{"agentId": 123}, 400, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			s := &agentTemplateStoreFake{values: map[string]string{"connected_agents": `["agent-one","agent-two"]`}}
			sends := 0
			h := agentTemplateHandler{newStore: func() (store.KVStore, error) { return s, nil }, send: func(queue, body string) error {
				sends++
				if queue != "agent_commands" {
					t.Errorf("wrong queue: %s", queue)
				}
				var command map[string]interface{}
				if err := json.Unmarshal([]byte(body), &command); err != nil {
					t.Fatal(err)
				}
				if command["agentId"] != "agent-one" || command["template_id"] != "test-cve-2026-0001" || command["command"] != "internal:template-scan --template-id=test-cve-2026-0001" {
					t.Errorf("wrong dispatch: %v", command)
				}
				if command["noReply"] != true || command["responseQueue"] != nil || command["correlationId"] != nil {
					t.Errorf("queued template test must not leave an unconsumed ACK: %v", command)
				}
				target, ok := command["target"].(map[string]interface{})
				if !ok || target["type"] != "agent" || target["id"] != "agent-one" {
					t.Errorf("invalid agent-server target: %v", command["target"])
				}
				return nil
			}}
			status, response := exerciseAgentTemplate(t, "POST", "/api/agent-templates/test-cve-2026-0001", h.TestAgentTemplate, tc.body)
			if status != tc.status || sends != tc.sends {
				t.Fatalf("status=%d response=%v sends=%d", status, response, sends)
			}
			if s.writes != 0 {
				t.Fatal("test must not modify templates")
			}
		})
	}
}

func TestAgentTemplateTestRejectsFlagInjection(t *testing.T) {
	h := agentTemplateHandler{newStore: func() (store.KVStore, error) {
		t.Fatal("invalid template ID reached store")
		return nil, nil
	}}
	for _, path := range []string{"/api/agent-templates", "/api/agent-templates/id%20--all", "/api/agent-templates/id%09--directory"} {
		app := fiber.New(fiber.Config{UnescapePath: true})
		app.Post("/api/agent-templates/:id?", h.TestAgentTemplate)
		req := httptest.NewRequest("POST", path, strings.NewReader(`{"agentId":"agent-one"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		resp.Body.Close()
		if resp.StatusCode != 400 {
			t.Fatalf("path %q status=%d", path, resp.StatusCode)
		}
	}
}
