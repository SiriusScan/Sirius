package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
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

func TestComponentDependencyTamperingRejected(t *testing.T) {
	data, err := os.ReadFile(filepath.Join("..", "..", "testing", "fixtures", "core-manifest", "core-manifest.fixture.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	opts := options{schemaMapPath: "schema_map.json", skipDockerfilePins: true}
	for _, change := range []struct {
		name  string
		apply func(*CoreManifest)
	}{
		{"scanner source", func(m *CoreManifest) {
			d := m.ComponentDependencies["app-scanner"]
			d.SourceCommit = strings.Repeat("a", 40)
			m.ComponentDependencies["app-scanner"] = d
		}},
		{"agent SDK version", func(m *CoreManifest) {
			d := m.ComponentDependencies["app-agent"]
			d.GoAPIVersion = "v0.0.26"
			m.ComponentDependencies["app-agent"] = d
		}},
		{"agent SDK commit", func(m *CoreManifest) {
			d := m.ComponentDependencies["app-agent"]
			d.GoAPICommit = strings.Repeat("b", 40)
			m.ComponentDependencies["app-agent"] = d
		}},
		{"missing agent", func(m *CoreManifest) { delete(m.ComponentDependencies, "app-agent") }},
		{"wrong agent contract", func(m *CoreManifest) { m.Contracts["agent_protocol"] = "2.0.0" }},
		{"missing agent contract", func(m *CoreManifest) { delete(m.Contracts, "agent_admission") }},
	} {
		t.Run(change.name, func(t *testing.T) {
			var m CoreManifest
			if err := json.Unmarshal(data, &m); err != nil {
				t.Fatal(err)
			}
			change.apply(&m)
			b, err := json.Marshal(m)
			if err != nil {
				t.Fatal(err)
			}
			if err := validateManifest(b, opts); err == nil {
				t.Fatal("tampering accepted")
			}
		})
	}
}
