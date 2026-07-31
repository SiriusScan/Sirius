//go:build !pro

package main

import (
	"encoding/json"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"regexp"
	"sync/atomic"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/SiriusScan/go-api/sirius/module"
	"github.com/gofiber/fiber/v2"
)

var fiberUUIDPattern = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

// configureNoNetworkLoggingSink points the SDK logging client at an in-process
// httptest.Server with Async=false and Postgres events disabled so production
// middleware tests never dial localhost:9001 or open DB connections.
func configureNoNetworkLoggingSink(t *testing.T) *int32 {
	t.Helper()
	var hits int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&hits, 1)
		w.WriteHeader(http.StatusCreated)
		_, _ = w.Write([]byte(`{"message":"ok"}`))
	}))
	t.Cleanup(srv.Close)

	logging.InitWithConfig(&logging.LogConfig{
		APIBaseURL:           srv.URL + "/api/v1/logs",
		Timeout:              500 * time.Millisecond,
		MaxRetries:           0,
		RetryDelay:           0,
		Async:                false,
		BufferSize:           1,
		FlushInterval:        time.Second,
		EnablePostgresEvents: false,
	})
	t.Cleanup(func() {
		logging.Close()
	})
	return &hits
}

func newProductionTestApp(t *testing.T, rootKey string) *fiber.App {
	t.Helper()
	_ = configureNoNetworkLoggingSink(t)
	registry, err := buildModuleRegistry(nil)
	if err != nil {
		t.Fatalf("build registry: %v", err)
	}
	app := fiber.New()
	applyProductionHTTPMiddleware(app, nil, rootKey)
	if err := registry.Mount(app, module.NoopJobRegistrar{}, module.NoopEventRegistrar{}); err != nil {
		t.Fatalf("mount: %v", err)
	}
	return app
}

func TestProductionMiddlewareAuthAndRequestID(t *testing.T) {
	const rootKey = "test-root-key"
	app := newProductionTestApp(t, rootKey)

	t.Run("unauthenticated api rejected with request id", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/test", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != fiber.StatusUnauthorized {
			t.Fatalf("status=%d", resp.StatusCode)
		}
		rid := resp.Header.Get(fiber.HeaderXRequestID)
		if rid == "" {
			t.Fatal("expected X-Request-ID on unauthorized response")
		}
		if !fiberUUIDPattern.MatchString(rid) {
			t.Fatalf("generated X-Request-ID %q is not Fiber utils.UUID format", rid)
		}
		var body map[string]any
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			t.Fatal(err)
		}
		if _, ok := body["error"].(string); !ok {
			t.Fatalf("body=%v", body)
		}
	})

	t.Run("authenticated request succeeds", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/test", nil)
		req.Header.Set("X-API-Key", rootKey)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != fiber.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("status=%d body=%s", resp.StatusCode, body)
		}
	})

	t.Run("client request id echoed", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/test", nil)
		req.Header.Set("X-API-Key", rootKey)
		req.Header.Set(fiber.HeaderXRequestID, "client-corr-42")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		if got := resp.Header.Get(fiber.HeaderXRequestID); got != "client-corr-42" {
			t.Fatalf("X-Request-ID=%q", got)
		}
	})

	t.Run("public health remains unauthenticated", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/health", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != fiber.StatusOK {
			t.Fatalf("status=%d", resp.StatusCode)
		}
	})
}

func TestProductionMiddlewareLoggingUsesInProcessSink(t *testing.T) {
	hits := configureNoNetworkLoggingSink(t)
	const rootKey = "test-root-key"
	registry, err := buildModuleRegistry(nil)
	if err != nil {
		t.Fatalf("build registry: %v", err)
	}
	app := fiber.New()
	applyProductionHTTPMiddleware(app, nil, rootKey)
	if err := registry.Mount(app, module.NoopJobRegistrar{}, module.NoopEventRegistrar{}); err != nil {
		t.Fatalf("mount: %v", err)
	}

	// API-key middleware short-circuits before SDK logging on 401, so exercise an
	// authenticated domain 400 that passes through the full production stack.
	req := httptest.NewRequest(fiber.MethodGet, "/api/v1/events/by-entity", nil)
	req.Header.Set("X-API-Key", rootKey)
	resp, err := app.Test(req, 2000)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusBadRequest {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("status=%d body=%s", resp.StatusCode, body)
	}
	if atomic.LoadInt32(hits) < 1 {
		t.Fatal("expected in-process logging sink to receive at least one submission")
	}

	// Prove default external targets are not required for this stack.
	conn, dialErr := net.DialTimeout("tcp", "127.0.0.1:9001", 50*time.Millisecond)
	if dialErr == nil {
		_ = conn.Close()
		t.Log("localhost:9001 happens to be listening; test still used in-process sink")
	}
}

func TestFixedRoutesNotShadowedByParams(t *testing.T) {
	const rootKey = "test-root-key"
	app := newProductionTestApp(t, rootKey)

	cases := []struct {
		path string
	}{
		{path: "/api/v1/events/stats"},
		{path: "/api/v1/events/by-entity"},
		{path: "/api/agent-templates/analytics"},
	}

	for _, tc := range cases {
		t.Run(tc.path, func(t *testing.T) {
			req := httptest.NewRequest(fiber.MethodGet, tc.path, nil)
			req.Header.Set("X-API-Key", rootKey)
			resp, err := app.Test(req)
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			if resp.StatusCode == fiber.StatusNotFound {
				body, _ := io.ReadAll(resp.Body)
				t.Fatalf("fixed route appears shadowed (404): %s", body)
			}
		})
	}
}
