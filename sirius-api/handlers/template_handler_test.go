package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

func TestNormalizeTemplateEnabledScripts(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{
			name:     "canonicalizes path-based script refs",
			input:    []string{"scripts/http-title.nse", " vulners ", "custom/smb-vuln-ms17-010.nse"},
			expected: []string{"http-title", "vulners", "smb-vuln-ms17-010"},
		},
		{
			name:     "deduplicates canonical collisions",
			input:    []string{"scripts/http-title.nse", "http-title", "scripts/http-title.nse"},
			expected: []string{"http-title"},
		},
		{
			name:     "wildcard wins over explicit refs",
			input:    []string{"scripts/http-title.nse", "*", "vulners"},
			expected: []string{"*"},
		},
		{
			name:     "drops empty values",
			input:    []string{"", "   ", "scripts/banner.nse"},
			expected: []string{"banner"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := normalizeTemplateEnabledScripts(tt.input)
			if !reflect.DeepEqual(got, tt.expected) {
				t.Fatalf("normalizeTemplateEnabledScripts(%v) = %v, want %v", tt.input, got, tt.expected)
			}
		})
	}
}

func TestNormalizeTemplateMutatesEnabledScripts(t *testing.T) {
	t.Parallel()

	template := &Template{
		EnabledScripts: []string{"scripts/http-title.nse", "http-title", "vulners"},
	}

	normalizeTemplate(template)

	expected := []string{"http-title", "vulners"}
	if !reflect.DeepEqual(template.EnabledScripts, expected) {
		t.Fatalf("normalizeTemplate() enabled scripts = %v, want %v", template.EnabledScripts, expected)
	}
}

// This fake never connects to Valkey. Keep the index and document values separate
// so key collisions cannot be hidden by a single-value mock.
type scanTemplateStoreFake struct {
	store.KVStore
	values                 map[string]string
	reads, writes, deletes []string
}

func (s *scanTemplateStoreFake) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	s.reads = append(s.reads, key)
	value, ok := s.values[key]
	if !ok {
		return store.ValkeyResponse{}, fmt.Errorf("key %q not found", key)
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: value}}, nil
}

func (s *scanTemplateStoreFake) SetValue(_ context.Context, key, value string) error {
	s.writes = append(s.writes, key)
	s.values[key] = value
	return nil
}

func (s *scanTemplateStoreFake) DeleteValue(_ context.Context, key string) error {
	s.deletes = append(s.deletes, key)
	delete(s.values, key)
	return nil
}

func (s *scanTemplateStoreFake) Close() error { return nil }

func scanTemplateFixture(id string) *Template {
	return &Template{
		ID:             id,
		Name:           "Test scan template",
		Type:           "custom",
		EnabledScripts: []string{"http-title"},
		ScanOptions:    TemplateOptions{ScanTypes: []string{"discovery"}},
	}
}

func TestScanTemplateReservedIDHelpers(t *testing.T) {
	t.Run("validation", func(t *testing.T) {
		if err := validateTemplate(scanTemplateFixture("list")); err == nil {
			t.Fatal("reserved index ID passed template validation")
		}
	})
	for _, operation := range []string{"read", "write", "add index", "remove index"} {
		t.Run(operation, func(t *testing.T) {
			const index = `{"templates":["quick","custom-scan"]}`
			s := &scanTemplateStoreFake{values: map[string]string{templateListKey: index}}
			var err error
			switch operation {
			case "read":
				_, err = getTemplateByID(context.Background(), s, "list")
			case "write":
				err = storeTemplate(context.Background(), s, scanTemplateFixture("list"))
			case "add index":
				err = addToTemplateList(context.Background(), s, "list")
			case "remove index":
				err = removeFromTemplateList(context.Background(), s, "list")
			}
			if err == nil {
				t.Error("reserved index ID must be rejected")
			}
			if s.values[templateListKey] != index {
				t.Errorf("template operation overwrote the index: %s", s.values[templateListKey])
			}
			if len(s.reads)+len(s.writes)+len(s.deletes) != 0 {
				t.Errorf("reserved ID touched the store: reads=%v writes=%v deletes=%v", s.reads, s.writes, s.deletes)
			}
		})
	}
}

func TestScanTemplateReservedIDRoutes(t *testing.T) {
	for _, initialIndex := range []string{"", `{"templates":["quick","custom-scan"]}`} {
		for _, method := range []string{"GET", "POST", "PUT", "DELETE"} {
			t.Run(method+"/index="+initialIndex, func(t *testing.T) {
				s := &scanTemplateStoreFake{values: make(map[string]string)}
				if initialIndex != "" {
					s.values[templateListKey] = initialIndex
				}
				connections := 0
				h := scanTemplateHandler{newStore: func() (store.KVStore, error) {
					connections++
					return s, nil
				}}
				app := fiber.New()
				app.Get("/templates/:id", h.GetTemplate)
				app.Post("/templates", h.CreateTemplate)
				app.Put("/templates/:id", h.UpdateTemplate)
				app.Delete("/templates/:id", h.DeleteTemplate)
				path := "/templates/list"
				if method == "POST" {
					path = "/templates"
				}
				req := httptest.NewRequest(method, path, strings.NewReader(`{"id":"list","name":"Test","enabled_scripts":["http-title"],"scan_options":{"scan_types":["discovery"]}}`))
				req.Header.Set("Content-Type", "application/json")
				resp, err := app.Test(req)
				if err != nil {
					t.Fatal(err)
				}
				defer resp.Body.Close()
				if resp.StatusCode != fiber.StatusBadRequest {
					t.Errorf("status = %d, want 400", resp.StatusCode)
				}
				if connections != 0 || len(s.reads)+len(s.writes)+len(s.deletes) != 0 {
					t.Errorf("reserved ID reached storage: connections=%d reads=%v writes=%v deletes=%v", connections, s.reads, s.writes, s.deletes)
				}
				if got, exists := s.values[templateListKey]; got != initialIndex || exists != (initialIndex != "") {
					t.Errorf("index was changed: value=%q exists=%v", got, exists)
				}
			})
		}
	}
}

func TestScanTemplateIDValidation(t *testing.T) {
	for _, id := range []string{"", "list", "bad/id", " list", "list ", strings.Repeat("a", 129)} {
		if err := validateScanTemplateID(id); err == nil {
			t.Errorf("ID %q should be rejected", id)
		}
	}
	// Valkey keys are case-sensitive. Do not reject valid legacy IDs merely
	// because they contain the reserved name or punctuation.
	for _, id := range []string{"quick", "full-scan", "agent-only", "List", "list:child", "list.item", "legacy_id-v1.2:custom", strings.Repeat("a", 128)} {
		t.Run(id, func(t *testing.T) {
			if err := validateScanTemplateID(id); err != nil {
				t.Fatalf("legacy ID %q rejected: %v", id, err)
			}
			const index = `{"templates":["quick"]}`
			s := &scanTemplateStoreFake{values: map[string]string{templateListKey: index}}
			if err := storeTemplate(context.Background(), s, scanTemplateFixture(id)); err != nil {
				t.Fatal(err)
			}
			if len(s.writes) != 1 || s.writes[0] != "scan:template:"+id {
				t.Fatalf("legacy key changed: writes=%v", s.writes)
			}
			got, err := getTemplateByID(context.Background(), s, id)
			if err != nil || got.ID != id {
				t.Fatalf("legacy template round trip = %v, %v", got, err)
			}
			if s.values[templateListKey] != index {
				t.Fatal("template write changed the index")
			}
		})
	}
}

func scanTemplateTestApp(s *scanTemplateStoreFake) *fiber.App {
	h := scanTemplateHandler{newStore: func() (store.KVStore, error) { return s, nil }}
	app := fiber.New()
	app.Get("/templates", h.GetTemplates)
	app.Get("/templates/:id", h.GetTemplate)
	app.Post("/templates", h.CreateTemplate)
	app.Put("/templates/:id", h.UpdateTemplate)
	app.Delete("/templates/:id", h.DeleteTemplate)
	return app
}

func scanTemplateRequest(t *testing.T, app *fiber.App, method, path, body string, status int) []byte {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != status {
		t.Fatalf("%s %s = %d %s, want %d", method, path, resp.StatusCode, data, status)
	}
	return data
}

func TestScanTemplateLegacyCRUD(t *testing.T) {
	const legacyID = "legacy:scan.v1"
	const legacy = `{"id":"legacy:scan.v1","name":"Existing custom scan","type":"custom","enabled_scripts":["scripts/http-title.nse"],"scan_options":{"scan_types":["discovery"]},"created_at":"2026-01-02T03:04:05Z"}`
	const system = `{"id":"quick","name":"Quick scan","type":"system","enabled_scripts":["http-title"],"scan_options":{"scan_types":["discovery"]}}`
	const index = `{"templates":["quick","legacy:scan.v1"]}`
	s := &scanTemplateStoreFake{values: map[string]string{
		templateListKey:             index,
		"scan:template:" + legacyID: legacy,
		"scan:template:quick":       system,
	}}
	app := scanTemplateTestApp(s)
	data := scanTemplateRequest(t, app, "GET", "/templates/"+legacyID, "", 200)
	var got Template
	if err := json.Unmarshal(data, &got); err != nil || got.ID != legacyID || !reflect.DeepEqual(got.EnabledScripts, []string{"http-title"}) {
		t.Fatalf("legacy read = %+v, %v", got, err)
	}
	// The URL remains authoritative even when the update body supplies a
	// reserved ID. This must only update the intended legacy document.
	data = scanTemplateRequest(t, app, "PUT", "/templates/"+legacyID, `{"id":"list","name":"Updated","enabled_scripts":["http-title"],"scan_options":{"scan_types":["discovery"]}}`, 200)
	if err := json.Unmarshal(data, &got); err != nil || got.ID != legacyID || got.Name != "Updated" || got.CreatedAt.Format("2006-01-02T15:04:05Z") != "2026-01-02T03:04:05Z" {
		t.Fatalf("legacy update = %+v, %v", got, err)
	}
	if s.values[templateListKey] != index {
		t.Fatal("legacy update changed the index")
	}
	const create = `{"id":"list:child","name":"New scan","enabled_scripts":["http-title"],"scan_options":{"scan_types":["discovery"]}}`
	scanTemplateRequest(t, app, "POST", "/templates", create, 201)
	scanTemplateRequest(t, app, "POST", "/templates", create, 409)
	scanTemplateRequest(t, app, "GET", "/templates/list:child", "", 200)
	scanTemplateRequest(t, app, "DELETE", "/templates/"+legacyID, "", 204)
	scanTemplateRequest(t, app, "GET", "/templates/"+legacyID, "", 404)
	scanTemplateRequest(t, app, "DELETE", "/templates/quick", "", 403)
	scanTemplateRequest(t, app, "PUT", "/templates/quick", create, 403)
	if _, exists := s.values["scan:template:"+legacyID]; exists {
		t.Fatal("deleted template still exists")
	}
	if s.values["scan:template:quick"] != system {
		t.Fatal("system template was changed")
	}
	if !reflect.DeepEqual(s.deletes, []string{"scan:template:" + legacyID}) {
		t.Fatalf("unexpected deleted keys: %v", s.deletes)
	}
	var ids TemplateList
	if err := json.Unmarshal([]byte(s.values[templateListKey]), &ids); err != nil || !reflect.DeepEqual(ids.Templates, []string{"quick", "list:child"}) {
		t.Fatalf("index after CRUD = %+v, %v", ids, err)
	}
}

func TestScanTemplateListSkipsReservedID(t *testing.T) {
	const index = `{"templates":["list","quick"]}`
	s := &scanTemplateStoreFake{values: map[string]string{
		templateListKey:       index,
		"scan:template:quick": `{"id":"quick","name":"Quick scan","type":"system","enabled_scripts":["http-title"],"scan_options":{"scan_types":["discovery"]}}`,
	}}
	data := scanTemplateRequest(t, scanTemplateTestApp(s), "GET", "/templates", "", 200)
	var result []Template
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatal(err)
	}
	var ids []string
	for _, item := range result {
		ids = append(ids, item.ID)
	}
	if !reflect.DeepEqual(ids, []string{"quick", "full-scan", "agent-only"}) {
		t.Fatalf("templates = %v, want legacy template and core defaults", ids)
	}
	if !reflect.DeepEqual(s.reads, []string{templateListKey, "scan:template:quick"}) {
		t.Fatalf("index must not be read as a template: %v", s.reads)
	}
	if s.values[templateListKey] != index || len(s.writes)+len(s.deletes) != 0 {
		t.Fatal("listing templates changed stored data")
	}
}
