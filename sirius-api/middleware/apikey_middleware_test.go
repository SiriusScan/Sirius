package middleware

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

func TestAPIKeyMiddlewarePublicHealthExactGETOnly(t *testing.T) {
	app := fiber.New()
	app.Use(APIKeyMiddleware(nil, "root-key"))
	app.All("/*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})

	cases := []struct {
		name   string
		method string
		path   string
		want   int
	}{
		{name: "exact health get", method: fiber.MethodGet, path: "/health", want: fiber.StatusNoContent},
		{name: "health trailing slash", method: fiber.MethodGet, path: "/health/", want: fiber.StatusNoContent},
		{name: "healthz requires auth", method: fiber.MethodGet, path: "/healthz", want: fiber.StatusUnauthorized},
		{name: "health subpath requires auth", method: fiber.MethodGet, path: "/health/ready", want: fiber.StatusUnauthorized},
		{name: "non-get health requires auth", method: fiber.MethodPost, path: "/health", want: fiber.StatusUnauthorized},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, nil)
			resp, err := app.Test(req)
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			if resp.StatusCode != tc.want {
				body, _ := io.ReadAll(resp.Body)
				t.Fatalf("status=%d want=%d body=%s", resp.StatusCode, tc.want, body)
			}
		})
	}
}

func TestAPIKeyMiddlewareAcceptsRootKey(t *testing.T) {
	app := fiber.New()
	app.Use(APIKeyMiddleware(nil, "root-key"))
	app.Get("/api/v1/test", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})

	req := httptest.NewRequest(fiber.MethodGet, "/api/v1/test", nil)
	req.Header.Set("X-API-Key", "root-key")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusNoContent {
		t.Fatalf("status=%d", resp.StatusCode)
	}
}

// scopeKV is the same in-memory store shape the SDK tests use, duplicated here
// so middleware tests do not depend on unexported SDK helpers. It proves the
// middleware validates a real hashed key rather than a caller-supplied claim.
type scopeKV struct {
	data map[string]string
}

func newScopeKV() *scopeKV { return &scopeKV{data: map[string]string{}} }

func (m *scopeKV) SetValue(_ context.Context, key, value string) error {
	m.data[key] = value
	return nil
}
func (m *scopeKV) SetValueWithTTL(ctx context.Context, key, value string, _ int) error {
	return m.SetValue(ctx, key, value)
}
func (m *scopeKV) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	value, ok := m.data[key]
	if !ok {
		return store.ValkeyResponse{}, errNotFound
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: value}}, nil
}
func (m *scopeKV) GetTTL(context.Context, string) (int, error)  { return -1, nil }
func (m *scopeKV) SetExpire(context.Context, string, int) error { return nil }
func (m *scopeKV) ListKeys(context.Context, string) ([]string, error) {
	return nil, nil
}
func (m *scopeKV) DeleteValue(_ context.Context, key string) error {
	delete(m.data, key)
	return nil
}
func (m *scopeKV) Close() error { return nil }

type notFoundError struct{}

func (notFoundError) Error() string { return "not found" }

var errNotFound notFoundError

func newScopedTestApp(t *testing.T, kv store.KVStore) *fiber.App {
	t.Helper()
	// UnescapePath is Fiber's default. Set it explicitly so the test records
	// the routing behavior the allow-list is aligned to.
	app := fiber.New(fiber.Config{UnescapePath: true})
	app.Use(APIKeyMiddleware(kv, "root-key"))
	app.All("/*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})
	return app
}

func doRequest(t *testing.T, app *fiber.App, method, path, key string) int {
	t.Helper()
	req, err := http.NewRequest(method, path, nil)
	if err != nil {
		t.Fatalf("build request %s %s: %v", method, path, err)
	}
	if key != "" {
		req.Header.Set("X-API-Key", key)
	}
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
	return resp.StatusCode
}

func TestMCPReadScopeAllowList(t *testing.T) {
	kv := newScopeKV()
	const scopedKey = "sk_mcp_reader_test_key_0001"
	const legacyKey = "sk_legacy_full_access_key_01"
	if _, err := store.StoreAPIKeyWithScopes(context.Background(), kv, scopedKey, "mcp", "root", []string{store.ScopeMCPRead}); err != nil {
		t.Fatal(err)
	}
	if _, err := store.StoreAPIKey(context.Background(), kv, legacyKey, "legacy", "root"); err != nil {
		t.Fatal(err)
	}
	app := newScopedTestApp(t, kv)

	allowed := []string{
		"/host",
		"/host/",
		"/host/10.0.0.8",
		"/host/10.0.0.8/",
		"/host/2001:db8::1",
		"/host/10.0.0.8/sources",
		"/host/10.0.0.8/sources/",
		"/host/vulnerabilities/all",
		"/host/vulnerabilities/all/",
		"/vulnerability/CVE-2024-1234",
		"/vulnerability/CVE-2024-1234/",
		"/templates",
		"/templates/",
		"/templates/nmap-basic",
		"/templates/agent.template:1",
		"/api/v1/scans/status",
		"/api/v1/scans/status/",
		"/api/v1/system/health",
		"/api/v1/system/health/",
	}
	for _, path := range allowed {
		if got := doRequest(t, app, http.MethodGet, path, scopedKey); got != fiber.StatusNoContent {
			t.Errorf("GET %s status=%d want=%d", path, got, fiber.StatusNoContent)
		}
	}

	denied := []struct {
		method string
		path   string
	}{
		// Neighbor GETs that must not ride a prefix allow-list.
		{http.MethodGet, "/host/10.0.0.8/packages"},
		{http.MethodGet, "/host/10.0.0.8/fingerprint"},
		{http.MethodGet, "/host/10.0.0.8/software-stats"},
		{http.MethodGet, "/host/10.0.0.8/history"},
		{http.MethodGet, "/host/statistics/10.0.0.8"},
		{http.MethodGet, "/host/severity/10.0.0.8"},
		{http.MethodGet, "/host/source-coverage"},
		{http.MethodGet, "/host/vulnerabilities"},
		{http.MethodGet, "/host/vulnerabilities/all/extra"},
		{http.MethodGet, "/vulnerability/CVE-2024-1234/sources"},
		{http.MethodGet, "/vulnerability/not-a-cve"},
		{http.MethodGet, "/templates/../host"},
		{http.MethodGet, "/templates/bad%20id"},
		{http.MethodGet, "/templates/has/slash"},
		// Case is not folded.
		{http.MethodGet, "/Host"},
		{http.MethodGet, "/HOST/10.0.0.8"},
		{http.MethodGet, "/vulnerability/cve-2024-1234"},
		{http.MethodGet, "/api/v1/Scans/status"},
		// Method tricks on allowed paths.
		{http.MethodPost, "/host"},
		{http.MethodPut, "/host/10.0.0.8"},
		{http.MethodDelete, "/templates/nmap-basic"},
		{http.MethodPatch, "/api/v1/scans/status"},
		{http.MethodHead, "/api/v1/system/health"},
		// Store, queue, logs, keys, admin, and other GETs stay denied.
		{http.MethodGet, "/api/v1/keys"},
		{http.MethodGet, "/api/v1/keys/"},
		{http.MethodGet, "/api/v1/system/logs"},
		{http.MethodGet, "/api/v1/system/resources"},
		{http.MethodGet, "/api/v1/logs"},
		{http.MethodGet, "/api/v1/test"},
		{http.MethodGet, "/api/v1/admin/command"},
		{http.MethodGet, "/api/v1/performance/metrics"},
		{http.MethodGet, "/api/v1/statistics/hosts/most-vulnerable"},
		{http.MethodGet, "/api/v1/scans/cancel"},
		{http.MethodPost, "/api/v1/scans/cancel"},
		{http.MethodPost, "/api/v1/keys/"},
		{http.MethodGet, "/app"},
		// GET /health is the unauthenticated probe and never reaches scope
		// enforcement. /healthz and /health/ready stay authenticated above.
	}
	for _, tc := range denied {
		if got := doRequest(t, app, tc.method, tc.path, scopedKey); got != fiber.StatusForbidden {
			t.Errorf("%s %s status=%d want=%d", tc.method, tc.path, got, fiber.StatusForbidden)
		}
	}

	// Percent-encoded slash must not become an extra segment or a bypass.
	// Fiber decodes %2F before routing when UnescapePath is set, so the
	// resulting path contains a slash and cannot match a single-segment rule.
	encoded := []string{
		"/host/10.0.0.8%2Fsources",
		"/host/%2e%2e/templates",
		"/templates/%2e%2e/host",
		"/api/v1/scans/status%2f",
		"/host/10.0.0.8%2fpackages",
		"/HOST%2f10.0.0.8",
	}
	for _, path := range encoded {
		if got := doRequest(t, app, http.MethodGet, path, scopedKey); got != fiber.StatusForbidden {
			t.Errorf("GET %s status=%d want=%d", path, got, fiber.StatusForbidden)
		}
	}

	// A decoded-but-safe character (%2D is '-') still names an allowed template.
	if got := doRequest(t, app, http.MethodGet, "/templates/nmap%2Dbasic", scopedKey); got != fiber.StatusNoContent {
		t.Errorf("decoded hyphen template status=%d", got)
	}

	// Legacy unrestricted key and the infrastructure root key are not narrowed.
	for _, key := range []string{legacyKey, "root-key"} {
		if got := doRequest(t, app, http.MethodGet, "/api/v1/system/logs", key); got != fiber.StatusNoContent {
			t.Errorf("legacy/root GET logs with %q status=%d", key, got)
		}
		if got := doRequest(t, app, http.MethodPost, "/api/v1/keys/", key); got != fiber.StatusNoContent {
			t.Errorf("legacy/root POST keys with %q status=%d", key, got)
		}
	}

	// Missing and unknown keys stay 401, not 403.
	if got := doRequest(t, app, http.MethodGet, "/host", ""); got != fiber.StatusUnauthorized {
		t.Errorf("missing key status=%d", got)
	}
	if got := doRequest(t, app, http.MethodGet, "/host", "sk_does_not_exist"); got != fiber.StatusUnauthorized {
		t.Errorf("unknown key status=%d", got)
	}
}

func TestUnknownPersistedScopeFailsClosed(t *testing.T) {
	kv := newScopeKV()
	const rawKey = "sk_widened_scope_key"
	meta, err := store.StoreAPIKeyWithScopes(context.Background(), kv, rawKey, "widened", "root", []string{store.ScopeMCPRead})
	if err != nil {
		t.Fatal(err)
	}
	// Persist an unknown extra scope the way a buggy writer might.
	meta.Scopes = []string{store.ScopeMCPRead, "admin"}
	payload := `{"id":"` + meta.ID + `","label":"widened","prefix":"sk_widen","created_by":"root","created_at":"2020-01-01T00:00:00Z","scopes":["mcp:read","admin"]}`
	if err := kv.SetValue(context.Background(), "apikey:"+meta.ID, payload); err != nil {
		t.Fatal(err)
	}
	app := newScopedTestApp(t, kv)
	if got := doRequest(t, app, http.MethodGet, "/host", rawKey); got != fiber.StatusForbidden {
		t.Fatalf("widened scope status=%d want 403", got)
	}
	if strings.Contains(payload, "admin") && meta.HasScope(store.ScopeMCPRead) {
		t.Fatal("HasScope matched a key carrying an unknown scope")
	}
}
