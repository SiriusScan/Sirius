package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http/httptest"
	"os"
	"strconv"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// Opt-in only. The marker must be seeded by the disposable cross-component runner.
func TestScriptRESTDisposableWorkflow(t *testing.T) {
	address := os.Getenv("SIRIUS_TEST_NSE_WORKFLOW_ADDR")
	if address == "" {
		t.Skip("disposable NSE workflow not configured")
	}
	host, port, err := net.SplitHostPort(address)
	number, parseErr := strconv.Atoi(port)
	if err != nil || host != "127.0.0.1" || parseErr != nil || number < 1024 || number > 65535 || number == 6379 {
		t.Fatal("refusing non-disposable workflow address")
	}
	token := os.Getenv("SIRIUS_TEST_NSE_WORKFLOW_TOKEN")
	if len(token) < 24 {
		t.Fatal("missing workflow marker token")
	}
	t.Setenv("VALKEY_ADDR", address)
	kv, err := store.NewValkeyStore()
	if err != nil {
		t.Fatal(err)
	}
	defer kv.Close()
	ctx := context.Background()
	marker, err := kv.GetValue(ctx, "sirius:test:nse-workflow:marker")
	if err != nil || marker.Message.Value != token {
		t.Fatal("disposable workflow marker mismatch")
	}
	original := newScriptStore
	newScriptStore = store.NewValkeyStore
	t.Cleanup(func() { newScriptStore = original })
	app := fiber.New()
	app.Get("/scripts", GetScripts)
	app.Get("/scripts/:id", GetScript)
	app.Post("/scripts", CreateScript)
	app.Put("/scripts/:id", UpdateScript)
	app.Delete("/scripts/:id", DeleteScript)
	request := func(method, path, body string, want int) []byte {
		t.Helper()
		req := httptest.NewRequest(method, path, strings.NewReader(body))
		if body != "" {
			req.Header.Set("Content-Type", "application/json")
		}
		response, err := app.Test(req, 10000)
		if err != nil {
			t.Fatal(err)
		}
		defer response.Body.Close()
		data, err := io.ReadAll(response.Body)
		if err != nil {
			t.Fatal(err)
		}
		if response.StatusCode != want {
			t.Fatalf("%s %s: got %d want %d: %s", method, path, response.StatusCode, want, data)
		}
		return data
	}
	getJSON := func(key string) map[string]json.RawMessage {
		t.Helper()
		response, err := kv.GetValue(ctx, key)
		if err != nil {
			t.Fatal(err)
		}
		var value map[string]json.RawMessage
		if err := json.Unmarshal([]byte(response.Message.Value), &value); err != nil {
			t.Fatal(err)
		}
		return value
	}
	var lower Script
	if err := json.Unmarshal(request("GET", "/scripts/lower", "", 200), &lower); err != nil {
		t.Fatal(err)
	}
	if lower.ID != "lower" || lower.Content == nil || lower.Content.Content != "-- UI override" {
		t.Fatalf("UI override not visible through REST: %+v", lower)
	}
	request("GET", "/scripts/demo.NSE", "", 404)
	// The repository entry cannot be deleted even through the REST route.
	request("DELETE", "/scripts/other", "", 403)

	// Omitted metadata must serialize a concrete tags array for UI readers.
	request("POST", "/scripts", `{"id":"rest-omitted-metadata","name":"REST minimal","content":{"content":"-- REST omitted metadata"}}`, 201)
	omitted := getJSON(nseScriptPrefix + "rest-omitted-metadata")
	var omittedMetadata map[string]json.RawMessage
	if err := json.Unmarshal(omitted["metadata"], &omittedMetadata); err != nil {
		t.Fatal(err)
	}
	if string(omittedMetadata["tags"]) != "[]" {
		t.Fatalf("omitted tags not normalized: %s", omitted["metadata"])
	}

	request("POST", "/scripts", `{"id":"rest-workflow","name":"REST workflow","protocol":"http","path":"/independent/rest-workflow.nse","content":{"content":"-- REST workflow"}}`, 201)
	manifest := getJSON(nseManifestKey)
	var entries map[string]json.RawMessage
	json.Unmarshal(manifest["scripts"], &entries)
	var created struct {
		Path   string
		Source struct{ Type string }
	}
	json.Unmarshal(entries["rest-workflow"], &created)
	if created.Source.Type != "custom" || created.Path != "/independent/rest-workflow.nse" {
		t.Fatalf("wrong custom ownership/path: %s", entries["rest-workflow"])
	}

	// Keep scanner/UI fixture bodies unchanged while proving real HTTP mutations.
	request("PUT", "/scripts/custom-workflow", `{"content":"-- custom workflow","metadata":{"author":"REST","tags":[],"description":"REST updated"}}`, 200)
	custom := getJSON(nseScriptPrefix + "custom-workflow")
	if string(custom["content"]) != `"-- custom workflow"` {
		t.Fatal("custom body changed unexpectedly")
	}
	request("DELETE", "/scripts/rest-workflow", "", 204)
	request("GET", "/scripts/rest-workflow", "", 404)
	if _, err := kv.GetValue(ctx, nseScriptPrefix+"rest-workflow"); err == nil {
		t.Fatal("deleted content still exists")
	}

	// Add an independent legacy fixture using CAS, never overwrite the UI fixture.
	manifestResponse, err := kv.GetValue(ctx, nseManifestKey)
	if err != nil {
		t.Fatal(err)
	}
	raw := manifestResponse.Message.Value
	var root map[string]json.RawMessage
	if err := json.Unmarshal([]byte(raw), &root); err != nil {
		t.Fatal(err)
	}
	// Unmarshal does not clear a nonnil map: do not reintroduce deleted fixtures.
	entries = nil
	if err := json.Unmarshal(root["scripts"], &entries); err != nil {
		t.Fatal(err)
	}
	legacyKey := "scripts/rest-legacy.nse"
	if _, exists := entries[legacyKey]; exists {
		t.Fatal("legacy fixture already exists")
	}
	entries[legacyKey] = json.RawMessage(`{"name":"REST legacy","protocol":"custom","path":"/independent/rest-legacy.nse","future":{"revision":"keep"}}`)
	root["scripts"], _ = json.Marshal(entries)
	data, _ := json.Marshal(root)
	updated := string(data)
	body := `{"content":"-- old REST legacy","custom":true,"createdAt":123,"updatedAt":10,"future":{"keep":true},"metadata":{"author":"old","tags":[],"description":"old","extra":"preserved"}}`
	atomic := kv.(store.AtomicValueUpdater)
	applied, err := atomic.CompareAndSwapValues(ctx, map[string]*string{nseManifestKey: &raw, nseScriptPrefix + legacyKey: nil, nseScriptPrefix + "rest-legacy": nil}, map[string]*string{nseManifestKey: &updated, nseScriptPrefix + legacyKey: &body})
	if err != nil || !applied {
		t.Fatalf("seed legacy fixture CAS: %v applied=%v", err, applied)
	}
	if _, err := readScriptManifest(ctx, kv); err != nil {
		t.Fatalf("legacy fixture produced invalid manifest: %v", err)
	}
	request("PUT", "/scripts/rest-legacy", `{"content":"-- REST legacy migrated","metadata":{"author":"new","tags":[],"description":"new"}}`, 200)
	migrated := getJSON(nseScriptPrefix + "rest-legacy")
	if string(migrated["createdAt"]) != "123" || string(migrated["custom"]) != "true" || string(migrated["future"]) != `{"keep":true}` {
		t.Fatalf("lost envelope extensions: %v", migrated)
	}
	var metadata map[string]json.RawMessage
	json.Unmarshal(migrated["metadata"], &metadata)
	if string(metadata["extra"]) != `"preserved"` || string(metadata["author"]) != `"new"` {
		t.Fatalf("lost metadata: %s", migrated["metadata"])
	}
	if string(migrated["updatedAt"]) != string(migrated["updated_at"]) {
		t.Fatal("timestamps disagree")
	}
	if _, err := kv.GetValue(ctx, nseScriptPrefix+legacyKey); err == nil {
		t.Fatal("legacy content slot not removed")
	}
	manifest = getJSON(nseManifestKey)
	entries = nil
	json.Unmarshal(manifest["scripts"], &entries)
	if _, ok := entries[legacyKey]; ok {
		t.Fatal("legacy manifest slot not removed")
	}
	if !strings.Contains(string(entries["rest-legacy"]), `"revision":"keep"`) || !strings.Contains(string(entries["rest-legacy"]), "/independent/rest-legacy.nse") {
		t.Fatal("lost manifest extensions/path")
	}
	request("DELETE", "/scripts/rest-legacy", "", 204)
	manifest = getJSON(nseManifestKey)
	var deleted map[string]bool
	json.Unmarshal(manifest["deletedScripts"], &deleted)
	for _, id := range []string{"demo.NSE", "rest-workflow", "rest-legacy"} {
		if !deleted[id] {
			t.Fatal(fmt.Sprintf("missing tombstone %s", id))
		}
	}
	lowerData := request("GET", "/scripts/lower", "", 200)
	json.Unmarshal(lowerData, &lower)
	if lower.Content.Content != "-- UI override" {
		t.Fatal("REST changed lower fixture")
	}
	unrelated, err := kv.GetValue(ctx, "unrelated:workflow")
	if err != nil || unrelated.Message.Value != "unchanged" {
		t.Fatal("unrelated key changed")
	}
}
