package handlers

import (
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestKeyCreationRejectsInvalidOwnershipAndScopedIssuers(t *testing.T) {
	for _, body := range []string{`{"owner_subject_id":"alice"}`, `{"scopes":["unknown"]}`, `{"owner_subject_id":" alice","scopes":["agent:enroll"]}`, `{`} {
		app := fiber.New()
		app.Post("/keys", (&APIKeyHandler{}).CreateKey)
		req := httptest.NewRequest("POST", "/keys", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		resp.Body.Close()
		if resp.StatusCode != 400 {
			t.Fatalf("status %d", resp.StatusCode)
		}
	}
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("apikey_meta", store.APIKeyMeta{Scopes: []string{store.ScopeAgentEnroll}})
		return c.Next()
	})
	app.Post("/keys", (&APIKeyHandler{}).CreateKey)
	req := httptest.NewRequest("POST", "/keys", strings.NewReader(`{"scopes":["agent:enroll"]}`))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 403 {
		t.Fatalf("status %d", resp.StatusCode)
	}
}
