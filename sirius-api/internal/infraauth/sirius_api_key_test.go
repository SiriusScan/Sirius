package infraauth

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadSiriusAPIKey_FilePreferred(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "key.txt")
	if err := os.WriteFile(p, []byte("  file-key-123  \n"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("SIRIUS_API_KEY_FILE", p)
	t.Setenv("SIRIUS_API_KEY", "env-key-should-not-win")

	got, err := LoadSiriusAPIKey()
	if err != nil {
		t.Fatal(err)
	}
	if got != "file-key-123" {
		t.Fatalf("got %q want file key", got)
	}
}

func TestLoadSiriusAPIKey_EnvFallback(t *testing.T) {
	t.Setenv("SIRIUS_API_KEY_FILE", "")
	t.Setenv("SIRIUS_API_KEY", "  env-fallback  ")

	got, err := LoadSiriusAPIKey()
	if err != nil {
		t.Fatal(err)
	}
	if got != "env-fallback" {
		t.Fatalf("got %q", got)
	}
}

func TestLoadSiriusAPIKey_Missing(t *testing.T) {
	t.Setenv("SIRIUS_API_KEY_FILE", "")
	t.Setenv("SIRIUS_API_KEY", "")

	_, err := LoadSiriusAPIKey()
	if err == nil {
		t.Fatal("expected error")
	}
}
