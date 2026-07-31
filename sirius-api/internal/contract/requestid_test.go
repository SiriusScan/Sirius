package contract

import (
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// Fiber v2.49.2 default requestid generator is utils.UUID: RFC4122 v4-formatted
// seeded counter string (not google/uuid random).
var fiberUUIDPattern = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

// Documents the concrete Fiber requestid semantics used by production middleware
// (requestid.New() with default config).
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

	t.Run("missing id is generated as Fiber utils.UUID format", func(t *testing.T) {
		req := httptest.NewRequest(fiber.MethodGet, "/probe", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		got := resp.Header.Get(fiber.HeaderXRequestID)
		if got == "" {
			t.Fatal("expected generated X-Request-ID response header")
		}
		if !fiberUUIDPattern.MatchString(got) {
			t.Fatalf("generated id %q is not Fiber utils.UUID format", got)
		}
	})
}
