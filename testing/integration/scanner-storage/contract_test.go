// Package scanner_storage_contract verifies that every producer and
// consumer of the scanner Valkey schema agrees on the wire format.
//
// The contract lives in github.com/SiriusScan/go-api/sirius/store/templates.
// Each writer (sirius-api, app-scanner, app-agent) and reader (sirius-api,
// app-agent, sirius-ui-via-tRPC) routes through that package after PR 7,
// so exercising the helpers end-to-end against a single in-memory KV is
// sufficient to detect any drift in:
//
//   - canonical key shapes ("template:custom:<id>", "nse:script:<id>", ...)
//   - JSON envelope and meta projections
//   - canonicalization rules for script IDs
package scanner_storage_contract_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/go-api/sirius/store/templates"
)

// fakeKV satisfies the narrow kvReader/kvWriter surface the templates
// package uses; it stands in for valkey for cross-pair contract checks.
type fakeKV struct {
	mu sync.Mutex
	m  map[string]string
}

func newFakeKV() *fakeKV { return &fakeKV{m: map[string]string{}} }

func (f *fakeKV) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	v, ok := f.m[key]
	if !ok {
		return store.ValkeyResponse{}, errors.New("not found")
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: v}}, nil
}

func (f *fakeKV) SetValue(_ context.Context, key, value string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.m[key] = value
	return nil
}

func (f *fakeKV) DeleteValue(_ context.Context, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	delete(f.m, key)
	return nil
}

func sampleTemplate() *templates.TemplateRecord {
	body := []byte("id: contract-template\n")
	now := time.Date(2026, 4, 22, 0, 0, 0, 0, time.UTC)
	return &templates.TemplateRecord{
		ID:               "contract-template",
		Version:          "v1",
		Checksum:         templates.SHA256Hex(body),
		Size:             int64(len(body)),
		Severity:         "high",
		Platforms:        []string{"linux"},
		DetectionType:    "agent",
		Author:           "contract-suite",
		Created:          now,
		Updated:          now,
		VulnerabilityIDs: []string{"CVE-2026-0001"},
		IsCustom:         true,
		Content:          body,
		Metadata:         map[string]string{"source": "contract-test"},
	}
}

// TestContract_TemplateWriterReaderPairs walks every producer/consumer
// pair for agent templates. Each pair must end up reading the exact
// envelope the writer handed to the shared helper.
func TestContract_TemplateWriterReaderPairs(t *testing.T) {
	pairs := []struct {
		writer string
		reader string
	}{
		{"sirius-api", "app-agent"},
		{"app-agent", "sirius-api"},
		{"sirius-api", "sirius-api"},
	}

	for _, p := range pairs {
		t.Run(p.writer+"->"+p.reader, func(t *testing.T) {
			kv := newFakeKV()
			ctx := context.Background()
			rec := sampleTemplate()

			if err := templates.WriteTemplate(ctx, kv, rec); err != nil {
				t.Fatalf("[%s] write: %v", p.writer, err)
			}

			got, err := templates.ReadTemplate(ctx, kv, rec.ID)
			if err != nil {
				t.Fatalf("[%s] read: %v", p.reader, err)
			}
			if got == nil {
				t.Fatalf("[%s] read returned nil for id %q", p.reader, rec.ID)
			}
			if got.ID != rec.ID || got.Severity != rec.Severity || !bytes.Equal(got.Content, rec.Content) {
				t.Fatalf("[%s -> %s] envelope mismatch:\n got: %+v\nwant: %+v", p.writer, p.reader, got, rec)
			}
			if got.Checksum != rec.Checksum {
				t.Fatalf("[%s -> %s] checksum mismatch: got %q want %q", p.writer, p.reader, got.Checksum, rec.Checksum)
			}

			meta, err := templates.ReadTemplateMeta(ctx, kv, rec.ID)
			if err != nil {
				t.Fatalf("[%s] read meta: %v", p.reader, err)
			}
			if meta == nil {
				t.Fatalf("[%s] missing meta record", p.reader)
			}
			if len(meta.Content) != 0 {
				t.Fatalf("[%s] meta record must omit Content (got %d bytes)", p.reader, len(meta.Content))
			}
			if meta.Checksum != rec.Checksum {
				t.Fatalf("[%s] meta checksum mismatch: got %q want %q", p.reader, meta.Checksum, rec.Checksum)
			}
			if meta.IsCustom != rec.IsCustom {
				t.Fatalf("[%s] meta IsCustom drift: got %v want %v", p.reader, meta.IsCustom, rec.IsCustom)
			}
		})
	}
}

// TestContract_TemplateKeyShape locks the on-disk key namespaces.
func TestContract_TemplateKeyShape(t *testing.T) {
	cases := []struct {
		id       string
		isCustom bool
		want     string
	}{
		{"foo", false, "template:standard:foo"},
		{"foo", true, "template:custom:foo"},
		{"my-yaml-rule", true, "template:custom:my-yaml-rule"},
	}
	for _, c := range cases {
		if got := templates.AgentTemplateKey(c.id, c.isCustom); got != c.want {
			t.Fatalf("AgentTemplateKey(%q, %v) = %q, want %q", c.id, c.isCustom, got, c.want)
		}
	}
	if got := templates.AgentTemplateMetaKey("foo"); got != "template:meta:foo" {
		t.Fatalf("meta key = %q", got)
	}
}

// TestContract_NseScriptCanonicalization is the regression net for the
// PR 1 / PR 7 bug: app-scanner used to write "nse:script:foo.nse" while
// the UI looked up "nse:script:foo". Both sides MUST go through
// templates.NseScriptKey, which canonicalizes for them.
func TestContract_NseScriptCanonicalization(t *testing.T) {
	ctx := context.Background()
	kv := newFakeKV()

	// Producer: app-scanner imitator writes a `.nse`-suffixed id.
	rec := &templates.NseScriptRecord{
		Content: "description = [[shellshock]]\n",
		Metadata: templates.NseScriptMeta{
			Author:      "contract-suite",
			Tags:        []string{"vuln", "exploit"},
			Description: "Detects CVE-2014-6271",
		},
		UpdatedAt: time.Now().Unix(),
	}
	if err := templates.WriteNseScript(ctx, kv, "http-shellshock.nse", rec); err != nil {
		t.Fatalf("write: %v", err)
	}

	// Consumer: ui-via-api imitator looks up the canonical id.
	got, err := templates.ReadNseScript(ctx, kv, "http-shellshock")
	if err != nil {
		t.Fatalf("read canonical: %v", err)
	}
	if got == nil || got.Content != rec.Content || got.Metadata.Description != rec.Metadata.Description {
		t.Fatalf("canonical read returned %+v", got)
	}

	// Suffix-tolerant lookup must yield the same record.
	gotSuffixed, err := templates.ReadNseScript(ctx, kv, "http-shellshock.nse")
	if err != nil {
		t.Fatalf("read suffixed: %v", err)
	}
	if gotSuffixed == nil || gotSuffixed.Content != rec.Content {
		t.Fatalf("suffixed read returned %+v", gotSuffixed)
	}

	for k := range kv.m {
		if strings.HasSuffix(k, ".nse") {
			t.Fatalf("non-canonical key persisted: %q", k)
		}
	}
}

// TestContract_NseManifestCanonicalization asserts that the manifest
// writer canonicalizes its map keys, so a producer that loads scripts
// from disk with file extensions still produces a manifest the UI can
// index by canonical id.
func TestContract_NseManifestCanonicalization(t *testing.T) {
	ctx := context.Background()
	kv := newFakeKV()

	m := &templates.NseManifest{
		Name:    "sirius-nse",
		Version: "v0.0.1",
		Scripts: map[string]templates.NseManifestEntry{
			"http-shellshock.nse": {Name: "http-shellshock", Path: "http-shellshock.nse", Protocol: "tcp"},
			"smb-vuln.nse":        {Name: "smb-vuln", Path: "smb-vuln.nse", Protocol: "tcp"},
		},
	}
	if err := templates.WriteNseManifest(ctx, kv, m); err != nil {
		t.Fatalf("write manifest: %v", err)
	}
	got, err := templates.ReadNseManifest(ctx, kv)
	if err != nil {
		t.Fatalf("read manifest: %v", err)
	}
	if got == nil {
		t.Fatal("manifest missing")
	}
	for key := range got.Scripts {
		if strings.HasSuffix(key, ".nse") {
			t.Fatalf("manifest key not canonicalized: %q", key)
		}
	}
	if _, ok := got.Scripts["http-shellshock"]; !ok {
		t.Fatalf("expected canonical http-shellshock key, got %v", got.Scripts)
	}
}

// TestContract_TemplateWireShape pins the JSON envelope so a careless
// rename of a TemplateRecord field doesn't silently break consumers
// that read the bytes off the wire. If you intentionally change the
// schema you must bump go-api and update this test in the same change
// set, per the drift policy in
// documentation/dev/architecture/README.scanner-storage.md.
func TestContract_TemplateWireShape(t *testing.T) {
	rec := sampleTemplate()
	data, err := templates.EncodeTemplate(rec)
	if err != nil {
		t.Fatal(err)
	}
	var generic map[string]any
	if err := json.Unmarshal(data, &generic); err != nil {
		t.Fatalf("envelope is not valid JSON: %v", err)
	}
	required := []string{
		"id", "version", "checksum", "size", "severity", "platforms",
		"detection_type", "author", "created", "updated",
		"vulnerability_ids", "is_custom", "content",
	}
	for _, k := range required {
		if _, ok := generic[k]; !ok {
			t.Fatalf("envelope missing required field %q", k)
		}
	}
}

// TestContract_NseScriptWireShape pins the script JSON envelope.
func TestContract_NseScriptWireShape(t *testing.T) {
	rec := &templates.NseScriptRecord{
		Content:   "description = [[x]]\n",
		Metadata:  templates.NseScriptMeta{Author: "a", Tags: []string{"t"}, Description: "d"},
		UpdatedAt: 42,
	}
	data, err := templates.EncodeNseScript(rec)
	if err != nil {
		t.Fatal(err)
	}
	var generic map[string]any
	if err := json.Unmarshal(data, &generic); err != nil {
		t.Fatalf("script envelope is not valid JSON: %v", err)
	}
	for _, k := range []string{"content", "metadata", "updatedAt"} {
		if _, ok := generic[k]; !ok {
			t.Fatalf("script envelope missing required field %q", k)
		}
	}
}
