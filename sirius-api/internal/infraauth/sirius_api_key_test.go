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

	got, err := LoadSiriusAPIKey()
	if err != nil {
		t.Fatal(err)
	}
	if got != "file-key-123" {
		t.Fatalf("got %q want file key", got)
	}
}

func TestLoadSiriusAPIKey_EmptyPathFails(t *testing.T) {
	t.Setenv("SIRIUS_API_KEY_FILE", "")

	_, err := LoadSiriusAPIKey()
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestLoadSiriusAPIKey_MissingFileFails(t *testing.T) {
	t.Setenv("SIRIUS_API_KEY_FILE", filepath.Join(t.TempDir(), "nonexistent-secret"))

	_, err := LoadSiriusAPIKey()
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestLoadSiriusAPIKey_UnreadableFileFails(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "key.txt")
	if err := os.WriteFile(p, []byte("secret-in-file"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.Chmod(p, 0o000); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chmod(p, 0o600) })

	t.Setenv("SIRIUS_API_KEY_FILE", p)

	_, err := LoadSiriusAPIKey()
	if err == nil {
		t.Fatal("expected error when file unreadable")
	}
}

func TestLoadSiriusAPIKey_EmptyFileFails(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "key.txt")
	if err := os.WriteFile(p, []byte("\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("SIRIUS_API_KEY_FILE", p)

	_, err := LoadSiriusAPIKey()
	if err == nil {
		t.Fatal("expected error when file empty")
	}
}
