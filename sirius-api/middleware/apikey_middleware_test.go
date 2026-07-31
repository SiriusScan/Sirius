package middleware

import (
	"io"
	"net/http/httptest"
	"testing"

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
