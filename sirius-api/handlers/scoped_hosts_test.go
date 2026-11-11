package handlers

import (
	"errors"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/SiriusScan/go-api/sirius/scope"
	"github.com/gofiber/fiber/v2"
)

func TestScopedHostIngestUsesResolvedScope(t *testing.T) {
	app := fiber.New()
	called := false
	app.Post("/", scopedHostIngest(func(*fiber.Ctx) (scope.ResourceScope, error) { return scope.ForSubject("alice"), nil }, func(s scope.ResourceScope, r host.Report) error {
		called = true
		if s != scope.ForSubject("alice") || r.Host.IP != "192.0.2.1" {
			t.Errorf("unexpected scope/report: %+v %+v", s, r)
		}
		return nil
	}))
	req := httptest.NewRequest("POST", "/", strings.NewReader(`{"host":{"ip":"192.0.2.1"},"owner_subject_id":"bob"}`))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil || resp.StatusCode != 204 || !called {
		t.Fatalf("response=%v err=%v called=%v", resp, err, called)
	}
}

func TestScopedHostIngestFailsClosed(t *testing.T) {
	for _, resolve := range []ScopeResolver{nil, func(*fiber.Ctx) (scope.ResourceScope, error) { return scope.Global(), errors.New("unavailable") }} {
		app := fiber.New()
		called := false
		app.Post("/", scopedHostIngest(resolve, func(scope.ResourceScope, host.Report) error { called = true; return nil }))
		req := httptest.NewRequest("POST", "/", strings.NewReader(`{"host":{"ip":"192.0.2.1"}}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil || resp.StatusCode < 400 || called {
			t.Fatalf("response=%v err=%v called=%v", resp, err, called)
		}
	}
}
