package handlers

import (
	"bytes"
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

type handlerKV struct {
	data map[string]string
}

func newHandlerKV() *handlerKV { return &handlerKV{data: map[string]string{}} }

func (m *handlerKV) SetValue(_ context.Context, key, value string) error {
	m.data[key] = value
	return nil
}
func (m *handlerKV) SetValueWithTTL(ctx context.Context, key, value string, _ int) error {
	return m.SetValue(ctx, key, value)
}
func (m *handlerKV) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	value, ok := m.data[key]
	if !ok {
		return store.ValkeyResponse{}, errors.New("not found")
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: value}}, nil
}
func (m *handlerKV) GetTTL(context.Context, string) (int, error)  { return -1, nil }
func (m *handlerKV) SetExpire(context.Context, string, int) error { return nil }
func (m *handlerKV) ListKeys(_ context.Context, pattern string) ([]string, error) {
	prefix := strings.TrimSuffix(pattern, "*")
	var keys []string
	for key := range m.data {
		if strings.HasPrefix(key, prefix) {
			keys = append(keys, key)
		}
	}
	return keys, nil
}
func (m *handlerKV) DeleteValue(_ context.Context, key string) error {
	delete(m.data, key)
	return nil
}
func (m *handlerKV) Close() error { return nil }

func newKeyApp(kv store.KVStore, locals func(*fiber.Ctx)) *fiber.App {
	app := fiber.New()
	h := &APIKeyHandler{Store: kv}
	app.Post("/api/v1/keys", func(c *fiber.Ctx) error {
		if locals != nil {
			locals(c)
		}
		return h.CreateKey(c)
	})
	return app
}

func postKey(t *testing.T, app *fiber.App, body string) (int, map[string]any) {
	t.Helper()
	req := httptest.NewRequest(fiber.MethodPost, "/api/v1/keys", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	var decoded map[string]any
	_ = json.Unmarshal(raw, &decoded)
	return resp.StatusCode, decoded
}

func TestCreateKeyLegacyAndScoped(t *testing.T) {
	kv := newHandlerKV()
	app := newKeyApp(kv, func(c *fiber.Ctx) {
		c.Locals("apikey_label", "Infrastructure Key")
	})

	status, body := postKey(t, app, `{"label":"legacy"}`)
	if status != fiber.StatusCreated {
		t.Fatalf("legacy status=%d body=%v", status, body)
	}
	meta, _ := body["meta"].(map[string]any)
	if _, ok := meta["scopes"]; ok {
		t.Fatalf("legacy meta included scopes: %#v", meta)
	}
	legacyRaw, _ := body["key"].(string)
	loaded, err := store.ValidateAPIKey(context.Background(), kv, legacyRaw)
	if err != nil || !loaded.AllowsUnrestricted() {
		t.Fatalf("legacy validate err=%v meta=%#v", err, loaded)
	}

	status, body = postKey(t, app, `{"label":"reader","scopes":["mcp:read"]}`)
	if status != fiber.StatusCreated {
		t.Fatalf("scoped status=%d body=%v", status, body)
	}
	scopedRaw, _ := body["key"].(string)
	loaded, err = store.ValidateAPIKey(context.Background(), kv, scopedRaw)
	if err != nil || !loaded.HasScope(store.ScopeMCPRead) || loaded.AllowsUnrestricted() {
		t.Fatalf("scoped validate err=%v meta=%#v", err, loaded)
	}

	// Empty body still creates an unrestricted key (historical clients).
	req := httptest.NewRequest(fiber.MethodPost, "/api/v1/keys", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusCreated {
		t.Fatalf("empty body status=%d", resp.StatusCode)
	}
}

func TestCreateKeyRejectsInvalidScopes(t *testing.T) {
	kv := newHandlerKV()
	app := newKeyApp(kv, func(c *fiber.Ctx) {
		c.Locals("apikey_meta", store.APIKeyMeta{Label: "root"})
	})
	before := len(kv.data)
	for _, body := range []string{
		`{"label":"x","scopes":["admin"]}`,
		`{"label":"x","scopes":["MCP:READ"]}`,
		`{"label":"x","scopes":["mcp:read","admin"]}`,
		`{"label":"x","scopes":[" "]}`,
		`{"label":"x","scopes":"mcp:read"}`,
		`not-json`,
	} {
		status, decoded := postKey(t, app, body)
		if status != fiber.StatusBadRequest {
			t.Errorf("body %s status=%d decoded=%v", body, status, decoded)
		}
	}
	if len(kv.data) != before {
		t.Fatalf("invalid requests stored keys: %d -> %d", before, len(kv.data))
	}
}

func TestScopedCallerCannotMintKeys(t *testing.T) {
	kv := newHandlerKV()
	app := newKeyApp(kv, func(c *fiber.Ctx) {
		c.Locals("apikey_meta", store.APIKeyMeta{Label: "mcp", Scopes: []string{store.ScopeMCPRead}})
	})
	status, body := postKey(t, app, `{"label":"escalate","scopes":[]}`)
	if status != fiber.StatusForbidden {
		t.Fatalf("status=%d body=%v", status, body)
	}
	status, _ = postKey(t, app, `{"label":"escalate","scopes":["mcp:read"]}`)
	if status != fiber.StatusForbidden {
		t.Fatalf("scoped mint status=%d", status)
	}
	if len(kv.data) != 0 {
		t.Fatalf("scoped caller stored keys: %#v", kv.data)
	}

	// A caller with no middleware locals also cannot mint.
	bare := newKeyApp(kv, nil)
	status, _ = postKey(t, bare, `{"label":"nope"}`)
	if status != fiber.StatusForbidden {
		t.Fatalf("anonymous mint status=%d", status)
	}

	// An unrestricted Valkey key still can, including minting a narrower key.
	legacy := newKeyApp(kv, func(c *fiber.Ctx) {
		c.Locals("apikey_meta", store.APIKeyMeta{Label: "legacy"})
	})
	status, body = postKey(t, legacy, `{"label":"child","scopes":["mcp:read"]}`)
	if status != fiber.StatusCreated {
		t.Fatalf("legacy caller status=%d body=%v", status, body)
	}
}
