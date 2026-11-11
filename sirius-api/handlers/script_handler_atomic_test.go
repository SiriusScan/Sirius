package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

type scriptCASFake struct {
	store.KVStore
	values  map[string]string
	before  func(*scriptCASFake)
	calls   int
	fail    error
	readErr error
}

func (f *scriptCASFake) Close() error { return nil }
func (f *scriptCASFake) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	if f.readErr != nil {
		return store.ValkeyResponse{}, f.readErr
	}
	value, ok := f.values[key]
	if !ok {
		return store.ValkeyResponse{}, store.ErrKeyNotFound
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: value}}, nil
}
func (f *scriptCASFake) CompareAndSwapValues(_ context.Context, expected, updates map[string]*string) (bool, error) {
	f.calls++
	if f.before != nil {
		hook := f.before
		f.before = nil
		hook(f)
	}
	if f.fail != nil {
		return false, f.fail
	}
	for key, want := range expected {
		value, ok := f.values[key]
		if want == nil {
			if ok {
				return false, nil
			}
		} else if !ok || value != *want {
			return false, nil
		}
	}
	for key, value := range updates {
		if value == nil {
			delete(f.values, key)
		} else {
			f.values[key] = *value
		}
	}
	return true, nil
}
func scriptFake(manifest string) *scriptCASFake {
	f := &scriptCASFake{values: map[string]string{}}
	if manifest != "" {
		f.values[nseManifestKey] = manifest
	}
	return f
}
func TestScriptAtomicCreatePreservesUnknownFields(t *testing.T) {
	f := scriptFake(`{"repository":{"revision":"abc"},"scripts":{"one":{"name":"One","future":{"x":1}}},"deletedScripts":{"two":true}}`)
	entry := &Script{ID: "two", Name: "Two", Protocol: "http", Content: &ScriptContent{Content: "return true", UpdatedAt: 123}}
	if err := mutateScript(context.Background(), f, "create", "two", entry, entry.Content); err != nil {
		t.Fatal(err)
	}
	var root map[string]json.RawMessage
	json.Unmarshal([]byte(f.values[nseManifestKey]), &root)
	if string(root["repository"]) != `{"revision":"abc"}` {
		t.Fatalf("lost metadata: %s", root["repository"])
	}
	m, err := readScriptManifest(context.Background(), f)
	if err != nil {
		t.Fatal(err)
	}
	if m.deleted["two"] || !strings.Contains(string(m.entries["one"]), `"future"`) || !strings.Contains(string(m.entries["two"]), `"type":"custom"`) {
		t.Fatalf("bad manifest: %s", f.values[nseManifestKey])
	}
	if !strings.Contains(f.values[nseScriptPrefix+"two"], `"updated_at":123`) {
		t.Fatal("wire timestamp changed")
	}
}
func TestScriptAtomicCreateAbsentAndFailure(t *testing.T) {
	for _, fail := range []error{nil, errors.New("unavailable")} {
		f := scriptFake("")
		f.fail = fail
		entry := &Script{Name: "One", Content: &ScriptContent{Content: "x"}}
		err := mutateScript(context.Background(), f, "create", "one", entry, entry.Content)
		if fail != nil {
			if err == nil || len(f.values) != 0 {
				t.Fatal("partial create")
			}
		} else if err != nil || len(f.values) != 2 {
			t.Fatalf("absent create: %v %v", err, f.values)
		}
	}
}
func TestScriptAtomicConcurrentCreateRereads(t *testing.T) {
	f := scriptFake(`{"scripts":{}}`)
	f.before = func(f *scriptCASFake) {
		f.values[nseManifestKey] = `{"scripts":{"other":{"name":"Other"}},"future":true}`
	}
	entry := &Script{Name: "One", Content: &ScriptContent{Content: "x"}}
	if err := mutateScript(context.Background(), f, "create", "one", entry, entry.Content); err != nil {
		t.Fatal(err)
	}
	if f.calls != 2 || !strings.Contains(f.values[nseManifestKey], `"other"`) || !strings.Contains(f.values[nseManifestKey], `"future":true`) {
		t.Fatal(f.values)
	}
}
func TestScriptAtomicUpdateCannotResurrectDeleted(t *testing.T) {
	f := scriptFake(`{"scripts":{"one":{"protocol":"custom"}}}`)
	f.values[nseScriptPrefix+"one"] = `{"content":"old"}`
	f.before = func(f *scriptCASFake) {
		f.values[nseManifestKey] = `{"scripts":{},"deletedScripts":{"one":true}}`
		delete(f.values, nseScriptPrefix+"one")
	}
	err := mutateScript(context.Background(), f, "update", "one", nil, &ScriptContent{Content: "new"})
	var fe *fiber.Error
	if !errors.As(err, &fe) || fe.Code != 404 {
		t.Fatalf("want 404 got %v", err)
	}
	if _, ok := f.values[nseScriptPrefix+"one"]; ok {
		t.Fatal("resurrected content")
	}
}
func TestScriptAtomicLegacyMigrationAndDelete(t *testing.T) {
	f := scriptFake(`{"scripts":{"scripts/one.nse":{"protocol":"custom","future":17}}}`)
	f.values[nseScriptPrefix+"scripts/one.nse"] = `{"content":"old"}`
	if err := mutateScript(context.Background(), f, "update", "one", nil, &ScriptContent{Content: "new"}); err != nil {
		t.Fatal(err)
	}
	if _, ok := f.values[nseScriptPrefix+"scripts/one.nse"]; ok {
		t.Fatal("left alias")
	}
	if !strings.Contains(f.values[nseManifestKey], `"future":17`) {
		t.Fatal("lost entry metadata")
	}
	if err := mutateScript(context.Background(), f, "delete", "one", nil, nil); err != nil {
		t.Fatal(err)
	}
	if _, ok := f.values[nseScriptPrefix+"one"]; ok {
		t.Fatal("left deleted content")
	}
	m, err := readScriptManifest(context.Background(), f)
	if err != nil || !m.deleted["one"] || len(m.entries) != 0 {
		t.Fatalf("missing tombstone %v", err)
	}
}
func TestScriptAtomicOwnershipAndCorruptionFailClosed(t *testing.T) {
	for _, manifest := range []string{
		`{"scripts":{"one":{"protocol":"custom","source":{"type":"repository"}}}}`,
		`{"scripts":{"one":{},"one.nse":{}}}`,
		`{"scripts":null}`,
		`{"scripts":{"one":null}}`,
		`{"scripts":{},"deletedScripts":null}`,
		`null`, `broken`,
	} {
		f := scriptFake(manifest)
		if err := mutateScript(context.Background(), f, "delete", "one", nil, nil); err == nil {
			t.Fatalf("accepted %s", manifest)
		}
		if f.calls != 0 || f.values[nseManifestKey] != manifest {
			t.Fatal("mutated invalid manifest")
		}
	}
}
func TestScriptAtomicCustomSourceCanDelete(t *testing.T) {
	f := scriptFake(`{"scripts":{"one":{"protocol":"http","source":{"type":"custom"}}}}`)
	if err := mutateScript(context.Background(), f, "delete", "one", nil, nil); err != nil {
		t.Fatal(err)
	}
}
func TestScriptAtomicAmbiguousContentRejected(t *testing.T) {
	f := scriptFake(`{"scripts":{"one.nse":{"protocol":"custom"}}}`)
	f.values[nseScriptPrefix+"one"] = "canonical"
	f.values[nseScriptPrefix+"one.nse"] = "legacy"
	if err := mutateScript(context.Background(), f, "update", "one", nil, &ScriptContent{Content: "new"}); err == nil || f.calls != 0 {
		t.Fatal("overwrote ambiguous aliases")
	}
}
func TestScriptHTTPDerivesCanonicalID(t *testing.T) {
	f := scriptFake(`{"scripts":{"scripts/one.nse":{"name":"One","id":"incorrect"}}}`)
	f.values[nseScriptPrefix+"scripts/one.nse"] = `{"content":"return true","updated_at":123}`
	original := newScriptStore
	newScriptStore = func() (store.KVStore, error) { return f, nil }
	t.Cleanup(func() { newScriptStore = original })
	app := fiber.New()
	app.Get("/scripts", GetScripts)
	app.Get("/scripts/:id", GetScript)
	for _, path := range []string{"/scripts", "/scripts/one.nse"} {
		response, err := app.Test(httptest.NewRequest("GET", path, nil))
		if err != nil {
			t.Fatal(err)
		}
		body, _ := io.ReadAll(response.Body)
		response.Body.Close()
		if response.StatusCode != 200 || !strings.Contains(string(body), `"id":"one"`) || strings.Contains(string(body), "incorrect") {
			t.Fatalf("%d %s", response.StatusCode, body)
		}
	}
}

type scriptNoCAS struct{ store.KVStore }
type scriptAlwaysConflict struct{ *scriptCASFake }

func (f scriptAlwaysConflict) CompareAndSwapValues(context.Context, map[string]*string, map[string]*string) (bool, error) {
	f.calls++
	return false, nil
}
func TestScriptAtomicUnsupportedReadFailureAndBoundedRetry(t *testing.T) {
	entry := &Script{Name: "One", Content: &ScriptContent{Content: "x"}}
	if err := mutateScript(context.Background(), scriptNoCAS{}, "create", "one", entry, entry.Content); err == nil {
		t.Fatal("accepted non-atomic store")
	}
	f := scriptFake("")
	f.readErr = errors.New("transport failure")
	if err := mutateScript(context.Background(), f, "create", "one", entry, entry.Content); err == nil || f.calls != 0 {
		t.Fatal("ignored failed read")
	}
	f = scriptFake("")
	err := mutateScript(context.Background(), scriptAlwaysConflict{f}, "create", "one", entry, entry.Content)
	var fe *fiber.Error
	if !errors.As(err, &fe) || fe.Code != 409 || f.calls != 8 || len(f.values) != 0 {
		t.Fatalf("unbounded/unsafe retries: %v %+v", err, f)
	}
}
func TestScriptAtomicConcurrentDeleteRereadsOwnership(t *testing.T) {
	f := scriptFake(`{"scripts":{"one":{"protocol":"custom"}}}`)
	f.values[nseScriptPrefix+"one"] = "old"
	f.before = func(f *scriptCASFake) {
		f.values[nseManifestKey] = `{"scripts":{"one":{"protocol":"custom","source":{"type":"repository"}}}}`
	}
	err := mutateScript(context.Background(), f, "delete", "one", nil, nil)
	var fe *fiber.Error
	if !errors.As(err, &fe) || fe.Code != 403 || f.values[nseScriptPrefix+"one"] != "old" {
		t.Fatalf("deleted replacement: %v", err)
	}
}
func TestScriptIncomingIDs(t *testing.T) {
	for _, raw := range []string{"", "*", "..", "foo.nse.nse", "scripts/foo.nse.nse", " one", "one ", " one ", "one two", "one\\two", ":bad"} {
		_, err := scriptID(raw)
		if err == nil {
			t.Fatalf("accepted %q", raw)
		}
	}
	if id, err := scriptID("scripts/one.nse"); err != nil || id != "one" {
		t.Fatalf("%q %v", id, err)
	}
}

func TestScriptManifestRejectsInvalidTombstones(t *testing.T) {
	cases := map[string]string{
		"whitespace ID":              `{"scripts":{},"deletedScripts":{" one ":true}}`,
		"false":                      `{"scripts":{},"deletedScripts":{"one":false}}`,
		"null value":                 `{"scripts":{},"deletedScripts":{"one":null}}`,
		"empty ID":                   `{"scripts":{},"deletedScripts":{"":true}}`,
		"wildcard":                   `{"scripts":{},"deletedScripts":{"*":true}}`,
		"extension alias":            `{"scripts":{},"deletedScripts":{"one.nse":true}}`,
		"path alias":                 `{"scripts":{},"deletedScripts":{"scripts/one":true}}`,
		"present and deleted":        `{"scripts":{"one":{}},"deletedScripts":{"one":true}}`,
		"legacy present and deleted": `{"scripts":{"scripts/one.nse":{}},"deletedScripts":{"one":true}}`,
	}
	for name, manifest := range cases {
		t.Run(name, func(t *testing.T) {
			f := scriptFake(manifest)
			if _, err := readScriptManifest(context.Background(), f); err == nil {
				t.Fatal("accepted corrupt tombstone")
			}
			entry := &Script{Name: "New", Content: &ScriptContent{Content: "x"}}
			if err := mutateScript(context.Background(), f, "create", "new", entry, entry.Content); err == nil {
				t.Fatal("mutated corrupt tombstone")
			}
			if f.calls != 0 || f.values[nseManifestKey] != manifest {
				t.Fatal("changed corrupt manifest")
			}
		})
	}
}
func TestScriptManifestTombstonesPreserveSDKCanonicalization(t *testing.T) {
	// The SDK intentionally preserves uppercase extensions.
	f := scriptFake(`{"scripts":{},"deletedScripts":{"one.NSE":true}}`)
	m, err := readScriptManifest(context.Background(), f)
	if err != nil || !m.deleted["one.NSE"] {
		t.Fatalf("changed SDK identity: %v", err)
	}
}

func TestScriptAtomicUpdatePreservesContentExtensions(t *testing.T) {
	f := scriptFake(`{"scripts":{"one":{"protocol":"custom"}}}`)
	f.values[nseScriptPrefix+"one"] = `{"content":"old","custom":true,"createdAt":42,"future":{"revision":"abc"},"updatedAt":50,"updated_at":50,"metadata":{"author":"old","description":"old","tags":["old"],"future":{"license":"MIT"}}}`
	content := &ScriptContent{Content: "new", UpdatedAt: 123, Metadata: ScriptMetadata{Author: "new", Tags: []string{"new"}}}
	if err := mutateScript(context.Background(), f, "update", "one", nil, content); err != nil {
		t.Fatal(err)
	}
	var got map[string]json.RawMessage
	if err := json.Unmarshal([]byte(f.values[nseScriptPrefix+"one"]), &got); err != nil {
		t.Fatal(err)
	}
	for key, want := range map[string]string{"content": `"new"`, "custom": "true", "createdAt": "42", "future": `{"revision":"abc"}`, "updatedAt": "123", "updated_at": "123"} {
		if string(got[key]) != want {
			t.Fatalf("%s: got %s want %s", key, got[key], want)
		}
	}
	var metadata map[string]json.RawMessage
	json.Unmarshal(got["metadata"], &metadata)
	for key, want := range map[string]string{"author": `"new"`, "tags": `["new"]`, "description": `""`, "future": `{"license":"MIT"}`} {
		if string(metadata[key]) != want {
			t.Fatalf("metadata %s: %s want %s", key, metadata[key], want)
		}
	}
}
func TestScriptAtomicUpdateRejectsCorruptContent(t *testing.T) {
	for _, previous := range []string{"broken", "null", "[]", "{}", `{"content":null}`, `{"metadata":null}`, `{"metadata":[]}`, `{"content":123}`, `{"updatedAt":"bad"}`} {
		f := scriptFake(`{"scripts":{"one":{"protocol":"custom"}}}`)
		f.values[nseScriptPrefix+"one"] = previous
		if err := mutateScript(context.Background(), f, "update", "one", nil, &ScriptContent{Content: "new"}); err == nil {
			t.Fatalf("accepted %s", previous)
		}
		if f.calls != 0 || f.values[nseScriptPrefix+"one"] != previous {
			t.Fatal("changed corrupt content")
		}
		// Explicit deletion can still remove a custom script with corrupt content.
		if err := mutateScript(context.Background(), f, "delete", "one", nil, nil); err != nil {
			t.Fatal(err)
		}
	}
}

func TestScriptManifestRejectsNonIdempotentIdentity(t *testing.T) {
	manifest := `{"scripts":{"scripts/foo.nse.nse":{"protocol":"custom"}}}`
	f := scriptFake(manifest)
	if _, err := readScriptManifest(context.Background(), f); err == nil {
		t.Fatal("accepted repeatedly stripped manifest identity")
	}
	entry := &Script{Name: "New", Content: &ScriptContent{Content: "x"}}
	if err := mutateScript(context.Background(), f, "create", "new", entry, entry.Content); err == nil || f.calls != 0 {
		t.Fatal("mutated ambiguous manifest")
	}
}

func TestScriptHTTPCreateRejectsNonIdempotentIdentity(t *testing.T) {
	original := newScriptStore
	newScriptStore = func() (store.KVStore, error) { t.Fatal("invalid ID reached store"); return nil, nil }
	t.Cleanup(func() { newScriptStore = original })
	app := fiber.New()
	app.Post("/scripts", CreateScript)
	request := httptest.NewRequest("POST", "/scripts", strings.NewReader(`{"id":"foo.nse.nse","name":"Foo","content":{"content":"x"}}`))
	request.Header.Set("Content-Type", "application/json")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode != 400 {
		t.Fatalf("got %d", response.StatusCode)
	}
}

func TestScriptManifestRejectsInvalidStableIDs(t *testing.T) {
	for _, id := range []string{"*", " bad ", "bad\\name", "bad:name"} {
		entries := map[string]interface{}{id: map[string]string{"name": "Invalid"}}
		manifest, _ := json.Marshal(map[string]interface{}{"scripts": entries})
		f := scriptFake(string(manifest))
		if _, err := readScriptManifest(context.Background(), f); err == nil {
			t.Fatalf("accepted invalid stored ID %q", id)
		}
	}
}
