package contract

import (
	"path/filepath"
	"strings"
	"testing"
)

func TestLoadAndValidatePublishedContract(t *testing.T) {
	root := ModuleRoot()
	class, err := LoadClassification(filepath.Join(root, DefaultClassificationPath))
	if err != nil {
		t.Fatalf("load classification: %v", err)
	}
	spec, err := LoadOpenAPI(filepath.Join(root, DefaultOpenAPIPath))
	if err != nil {
		t.Fatalf("load openapi: %v", err)
	}
	live, err := LoadGoldenInventory(filepath.Join(root, DefaultGoldenPath))
	if err != nil {
		t.Fatalf("load golden: %v", err)
	}
	if err := ValidateContract(live, class, spec); err != nil {
		t.Fatalf("published contract should validate: %v", err)
	}
	if got := len(live); got != 74 {
		t.Fatalf("expected 74 golden routes, got %d", got)
	}
	if got := len(class.Routes); got != 74 {
		t.Fatalf("expected 74 classified routes, got %d", got)
	}
}

func TestClassificationRejectsInvalidClass(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "bad.yaml")
	content := "version: \"1.0.0\"\nroutes:\n- method: GET\n  path: /api/v1/test\n  class: mystery\n"
	if err := writeFile(path, content); err != nil {
		t.Fatal(err)
	}
	if _, err := LoadClassification(path); err == nil {
		t.Fatal("expected invalid class to fail")
	}
}

func TestBreakingOpenAPIFixtureIsRejected(t *testing.T) {
	root := ModuleRoot()
	class, err := LoadClassification(filepath.Join(root, DefaultClassificationPath))
	if err != nil {
		t.Fatalf("load classification: %v", err)
	}
	live, err := LoadGoldenInventory(filepath.Join(root, DefaultGoldenPath))
	if err != nil {
		t.Fatalf("load golden: %v", err)
	}
	spec, err := LoadOpenAPI(filepath.Join(root, DefaultBreakingOpenAPIPath))
	if err != nil {
		t.Fatalf("load breaking openapi: %v", err)
	}
	err = ValidateContract(live, class, spec)
	if err == nil {
		t.Fatal("expected breaking OpenAPI fixture to fail validation")
	}
	if !strings.Contains(err.Error(), "live /api/v1 route missing from OpenAPI: GET /api/v1/scans/status") {
		t.Fatalf("unexpected validation error: %v", err)
	}
}

func TestNormalizePath(t *testing.T) {
	got := NormalizePath("/api/v1/events/:id")
	if got != "/api/v1/events/{id}" {
		t.Fatalf("NormalizePath = %q", got)
	}
}

func TestDuplicateClassificationIsRejected(t *testing.T) {
	root := ModuleRoot()
	class, err := LoadClassification(filepath.Join(root, DefaultClassificationPath))
	if err != nil {
		t.Fatalf("load classification: %v", err)
	}
	spec, err := LoadOpenAPI(filepath.Join(root, DefaultOpenAPIPath))
	if err != nil {
		t.Fatalf("load openapi: %v", err)
	}
	live, err := LoadGoldenInventory(filepath.Join(root, DefaultGoldenPath))
	if err != nil {
		t.Fatalf("load golden: %v", err)
	}
	// Inject an extra classification duplicate without a matching live entry.
	class.Routes = append(class.Routes, ClassifiedRoute{
		Method: "GET",
		Path:   "/health",
		Class:  ClassPublic,
		Note:   "duplicate canary",
	})
	err = ValidateContract(live, class, spec)
	if err == nil {
		t.Fatal("expected duplicate/extra classification to fail")
	}
	if !strings.Contains(err.Error(), "extra classification entry") &&
		!strings.Contains(err.Error(), "classification count") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func writeFile(path, content string) error {
	return writeFileMode(path, content)
}
