package contract

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// Documents the concrete Fiber requestid semantics used by sirius-api/main.go
// (app.Use(requestid.New()) with default config).
func TestRequestIDMiddlewareSemantics(t *testing.T) {
	app := fiber.New()
	app.Use(requestid.New())
	app.Get("/probe", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"locals": c.Locals("requestid"),
		})
	})

	t.Run("client supplied id is echoed", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/probe", nil)
		req.Header.Set(fiber.HeaderXRequestID, "client-corr-1")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		if got := resp.Header.Get(fiber.HeaderXRequestID); got != "client-corr-1" {
			t.Fatalf("response X-Request-ID = %q, want client-corr-1", got)
		}
	})

	t.Run("missing id is generated", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/probe", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		if got := resp.Header.Get(fiber.HeaderXRequestID); got == "" {
			t.Fatal("expected generated X-Request-ID response header")
		}
	})
}
