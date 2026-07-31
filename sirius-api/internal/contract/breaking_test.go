package contract

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

func TestProtectedBaselineBootstrapOnIntroPR(t *testing.T) {
	root := RepoRoot()
	candidate := filepath.Join(ModuleRoot(), DefaultOpenAPIPath)
	res, err := CheckProtectedBreaking(root, candidate, "")
	if err != nil {
		t.Fatalf("bootstrap/protected check failed: %v", err)
	}
	t.Cleanup(res.Cleanup)
	if res.Mode != "bootstrap" && res.Mode != "protected" {
		t.Fatalf("unexpected mode %q: %s", res.Mode, res.Message)
	}
	t.Log(res.Message)
}

func TestCandidateControlledBaselineCannotBypassProtected(t *testing.T) {
	repo, baseSHA, cleanup := initProtectedBaselineRepo(t)
	defer cleanup()

	candidateDir := t.TempDir()
	baseRaw, err := os.ReadFile(filepath.Join(repo, ProtectedOpenAPIRelPath))
	if err != nil {
		t.Fatal(err)
	}
	var doc map[string]any
	if err := yaml.Unmarshal(baseRaw, &doc); err != nil {
		t.Fatal(err)
	}
	// Classic bypass attempt: remove a response from candidate AND advance a
	// local baseline file to match the candidate.
	paths := doc["paths"].(map[string]any)
	demo := paths["/api/v1/demo"].(map[string]any)
	get := demo["get"].(map[string]any)
	responses := get["responses"].(map[string]any)
	delete(responses, "401")

	candRaw, err := yaml.Marshal(doc)
	if err != nil {
		t.Fatal(err)
	}
	candidatePath := filepath.Join(candidateDir, "openapi.v1.yaml")
	localBaseline := filepath.Join(candidateDir, "openapi.v1.baseline.yaml")
	if err := os.WriteFile(candidatePath, candRaw, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(localBaseline, candRaw, 0o644); err != nil {
		t.Fatal(err)
	}

	t.Setenv(EnvBaseRef, baseSHA)
	t.Setenv(EnvAllowBreaking, "")

	// Local baseline matches candidate (would pass a candidate-controlled check).
	if err := CompareOpenAPIBreaking(localBaseline, candidatePath); err != nil {
		t.Fatalf("local baseline was advanced with candidate; expected local compare to pass: %v", err)
	}

	res, err := CheckProtectedBreaking(repo, candidatePath, baseSHA)
	if res != nil {
		t.Cleanup(res.Cleanup)
	}
	if err == nil {
		t.Fatal("expected protected baseline to reject candidate despite advanced local baseline")
	}
	if !strings.Contains(err.Error(), "oasdiff breaking") && !strings.Contains(err.Error(), "SIRIUS_OPENAPI_ALLOW_BREAKING") {
		t.Fatalf("unexpected error: %v", err)
	}

	t.Setenv(EnvAllowBreaking, "1")
	res2, err := CheckProtectedBreaking(repo, candidatePath, baseSHA)
	if res2 != nil {
		t.Cleanup(res2.Cleanup)
	}
	if err != nil {
		t.Fatalf("allow_breaking gate should permit intentional break: %v", err)
	}
	if res2.Mode != "allow_breaking" {
		t.Fatalf("mode=%q", res2.Mode)
	}
}

func TestOasdiffNegativeBreakingClasses(t *testing.T) {
	basePath := filepath.Join(ModuleRoot(), "contracts/fixtures/breaking_base_mini.yaml")
	baseRaw, err := os.ReadFile(basePath)
	if err != nil {
		t.Fatal(err)
	}

	cases := []struct {
		name   string
		mutate func(doc map[string]any)
	}{
		{
			name: "request_body_optional_to_required",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "post")
				rb := op["requestBody"].(map[string]any)
				rb["required"] = true
			},
		},
		{
			name: "removed_parameter",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				op["parameters"] = []any{
					map[string]any{
						"name":     "filter",
						"in":       "query",
						"required": false,
						"schema": map[string]any{
							"type": "string",
							"enum": []any{"a", "b", "c"},
						},
					},
				}
			},
		},
		{
			name: "request_enum_narrowing",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				params := op["parameters"].([]any)
				p0 := params[0].(map[string]any)
				schema := p0["schema"].(map[string]any)
				schema["enum"] = []any{"a", "b"}
			},
		},
		{
			name: "security_removed",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				delete(op, "security")
			},
		},
		{
			name: "security_or_to_and",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				// AND: single requirement object with both schemes.
				op["security"] = []any{
					map[string]any{
						"ApiKeyAuth": []any{},
						"BearerAuth": []any{},
					},
				}
			},
		},
		{
			name: "response_requiredness_added",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				schema := op["responses"].(map[string]any)["200"].(map[string]any)["content"].(map[string]any)["application/json"].(map[string]any)["schema"].(map[string]any)
				schema["required"] = []any{"status", "values"}
			},
		},
		{
			name: "array_items_type_changed",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				schema := op["responses"].(map[string]any)["200"].(map[string]any)["content"].(map[string]any)["application/json"].(map[string]any)["schema"].(map[string]any)
				props := schema["properties"].(map[string]any)
				props["values"] = map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "integer",
					},
				}
			},
		},
		{
			name: "nested_response_schema_changed",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "post")
				responses := op["responses"].(map[string]any)
				ok := responses["200"].(map[string]any)
				content := ok["content"].(map[string]any)
				appJSON := content["application/json"].(map[string]any)
				schema := appJSON["schema"].(map[string]any)
				props := schema["properties"].(map[string]any)
				props["items"] = map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "string",
					},
				}
			},
		},
		{
			name: "response_body_removed",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				responses := op["responses"].(map[string]any)
				ok := responses["200"].(map[string]any)
				delete(ok, "content")
			},
		},
		{
			name: "response_code_removed",
			mutate: func(doc map[string]any) {
				op := pathOp(doc, "/api/v1/demo", "get")
				responses := op["responses"].(map[string]any)
				delete(responses, "401")
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var doc map[string]any
			if err := yaml.Unmarshal(baseRaw, &doc); err != nil {
				t.Fatal(err)
			}
			tc.mutate(doc)
			out, err := yaml.Marshal(doc)
			if err != nil {
				t.Fatal(err)
			}
			candPath := filepath.Join(t.TempDir(), "candidate.yaml")
			if err := os.WriteFile(candPath, out, 0o644); err != nil {
				t.Fatal(err)
			}
			err = CompareOpenAPIBreaking(basePath, candPath)
			if err == nil {
				t.Fatalf("expected oasdiff ERR for %s", tc.name)
			}
			if !strings.Contains(err.Error(), "oasdiff breaking") {
				t.Fatalf("unexpected error for %s: %v", tc.name, err)
			}
			t.Logf("%s: %v", tc.name, err)
		})
	}
}

func TestPublishedMatchesLocalSeedWhenPresent(t *testing.T) {
	// Local seed file is documentation/fixture convenience only — not the CI gate.
	root := ModuleRoot()
	seed := filepath.Join(root, DefaultBaselineOpenAPIPath)
	published := filepath.Join(root, DefaultOpenAPIPath)
	if _, err := os.Stat(seed); err != nil {
		t.Skip("local seed baseline absent")
	}
	if err := CompareOpenAPIBreaking(seed, published); err != nil {
		t.Fatalf("local seed drifted from published (refresh seed after intentional non-breaking edits): %v", err)
	}
}

func pathOp(doc map[string]any, path, method string) map[string]any {
	return doc["paths"].(map[string]any)[path].(map[string]any)[method].(map[string]any)
}

func initProtectedBaselineRepo(t *testing.T) (repoRoot, baseSHA string, cleanup func()) {
	t.Helper()
	repoRoot = t.TempDir()
	run := func(args ...string) string {
		t.Helper()
		cmd := exec.Command("git", args...)
		cmd.Dir = repoRoot
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
		return strings.TrimSpace(string(out))
	}
	run("init")
	run("config", "user.email", "contract-test@example.com")
	run("config", "user.name", "contract-test")

	baseMini, err := os.ReadFile(filepath.Join(ModuleRoot(), "contracts/fixtures/breaking_base_mini.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	dst := filepath.Join(repoRoot, ProtectedOpenAPIRelPath)
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(dst, baseMini, 0o644); err != nil {
		t.Fatal(err)
	}
	run("add", ProtectedOpenAPIRelPath)
	run("commit", "-m", "seed protected openapi")
	baseSHA = run("rev-parse", "HEAD")
	return repoRoot, baseSHA, func() {}
}
