package contract

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

func TestPublishedMatchesBaselineWithoutBreakingChanges(t *testing.T) {
	root := ModuleRoot()
	baseline, err := LoadOpenAPI(filepath.Join(root, DefaultBaselineOpenAPIPath))
	if err != nil {
		t.Fatalf("load baseline: %v", err)
	}
	published, err := LoadOpenAPI(filepath.Join(root, DefaultOpenAPIPath))
	if err != nil {
		t.Fatalf("load published: %v", err)
	}
	if err := ValidateNoBreakingChanges(baseline, published); err != nil {
		t.Fatalf("published contract introduced breaking changes vs baseline: %v", err)
	}
}

func TestSemanticBreakingFixtures(t *testing.T) {
	root := ModuleRoot()
	baselinePath := filepath.Join(root, DefaultBaselineOpenAPIPath)
	baseline, err := LoadOpenAPI(baselinePath)
	if err != nil {
		t.Fatalf("load baseline: %v", err)
	}

	cases := []struct {
		name   string
		kind   string
		mutate func(doc map[string]any)
	}{
		{
			name: "removed security",
			kind: "security_changed",
			mutate: func(doc map[string]any) {
				op := scansStatusGet(doc)
				delete(op, "security")
			},
		},
		{
			name: "removed response code",
			kind: "removed_response",
			mutate: func(doc map[string]any) {
				op := scansStatusGet(doc)
				responses := op["responses"].(map[string]any)
				delete(responses, "500")
			},
		},
		{
			name: "response schema type change",
			kind: "response_schema_type_changed",
			mutate: func(doc map[string]any) {
				op := scansStatusGet(doc)
				responses := op["responses"].(map[string]any)
				responses["200"] = map[string]any{
					"description": "broken",
					"content": map[string]any{
						"application/json": map[string]any{
							"schema": map[string]any{"type": "string"},
						},
					},
				}
			},
		},
		{
			name: "new required parameter",
			kind: "new_required_parameter",
			mutate: func(doc map[string]any) {
				op := scansStatusGet(doc)
				params, _ := op["parameters"].([]any)
				params = append(params, map[string]any{
					"name":     "must-have",
					"in":       "query",
					"required": true,
					"schema":   map[string]any{"type": "string"},
				})
				op["parameters"] = params
			},
		},
		{
			name: "new required request field",
			kind: "new_required_request_field",
			mutate: func(doc map[string]any) {
				paths := doc["paths"].(map[string]any)
				cancel := paths["/api/v1/scans/cancel"].(map[string]any)
				post := cancel["post"].(map[string]any)
				post["requestBody"] = map[string]any{
					"required": true,
					"content": map[string]any{
						"application/json": map[string]any{
							"schema": map[string]any{
								"type":     "object",
								"required": []any{"scan_id", "reason"},
								"properties": map[string]any{
									"scan_id": map[string]any{"type": "string"},
									"reason":  map[string]any{"type": "string"},
								},
							},
						},
					},
				}
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			raw, err := os.ReadFile(baselinePath)
			if err != nil {
				t.Fatal(err)
			}
			var mutated map[string]any
			if err := yaml.Unmarshal(raw, &mutated); err != nil {
				t.Fatal(err)
			}
			tc.mutate(mutated)

			out, err := yaml.Marshal(mutated)
			if err != nil {
				t.Fatal(err)
			}
			path := filepath.Join(t.TempDir(), "mutated.yaml")
			if err := os.WriteFile(path, out, 0o644); err != nil {
				t.Fatal(err)
			}
			candidate, err := LoadOpenAPI(path)
			if err != nil {
				t.Fatalf("load mutated openapi: %v", err)
			}
			err = ValidateNoBreakingChanges(baseline, candidate)
			if err == nil {
				t.Fatal("expected semantic breaking change")
			}
			if !strings.Contains(err.Error(), tc.kind) {
				t.Fatalf("expected kind %q in error, got: %v", tc.kind, err)
			}
		})
	}
}

func scansStatusGet(doc map[string]any) map[string]any {
	paths := doc["paths"].(map[string]any)
	status := paths["/api/v1/scans/status"].(map[string]any)
	return status["get"].(map[string]any)
}

func TestShadowDetectorCatchesParamBeforeFixed(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/api/v1/events/:id"},
		{Method: "GET", Path: "/api/v1/events/stats"},
	}
	findings := FindShadowedFixedRoutes(live)
	if len(findings) != 1 {
		t.Fatalf("findings=%v", findings)
	}
	if !strings.Contains(findings[0], "/api/v1/events/stats shadowed by") {
		t.Fatalf("unexpected finding: %s", findings[0])
	}
}
