package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRejectDuplicateKeys(t *testing.T) {
	err := rejectDuplicateKeys([]byte(`{"a":1,"a":2}`))
	if err == nil {
		t.Fatal("expected duplicate key error")
	}
}

func TestRejectTrailingJSON(t *testing.T) {
	for _, data := range []string{
		`{"a":1}{"b":2}`,
		`{"a":1} trailing`,
	} {
		if err := rejectDuplicateKeys([]byte(data)); err == nil {
			t.Fatalf("expected trailing JSON error for %q", data)
		}
	}
}

func TestSchemaMapCoversCurrentDockerfilePin(t *testing.T) {
	root := filepath.Join("..", "..")
	df := filepath.Join(root, "sirius-engine", "Dockerfile")
	pin, err := extractDockerfilePin(df, "GO_API_COMMIT_SHA")
	if err != nil {
		t.Fatalf("dockerfile pin: %v", err)
	}
	m, err := loadSchemaMap(filepath.Join("schema_map.json"))
	if err != nil {
		t.Fatalf("schema map: %v", err)
	}
	if _, ok := m[pin]; !ok {
		t.Fatalf("schema_map.json missing entry for Dockerfile GO_API_COMMIT_SHA=%s", pin)
	}
}

func TestValidateManifestFixture(t *testing.T) {
	root := filepath.Join("..", "..")
	path := filepath.Join(root, "testing", "fixtures", "core-manifest", "core-manifest.fixture.yaml")
	if _, err := os.Stat(path); err != nil {
		t.Skip("golden fixture not present yet")
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	err = validateManifest(data, options{
		expectTag:          "v1.1.0",
		expectCommit:       "0123456789abcdef0123456789abcdef01234567",
		skipDockerfilePins: false,
		dockerfile:         filepath.Join(root, "sirius-engine", "Dockerfile"),
		schemaMapPath:      "schema_map.json",
	})
	if err != nil {
		t.Fatalf("fixture validation failed: %v", err)
	}
}
