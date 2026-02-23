package middleware

import (
	"context"
	"crypto/subtle"
	"log/slog"
	"os"
	"strings"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// skipPaths lists route prefixes that do not require API key authentication.
var skipPaths = []string{
	"/health",
}

// APIKeyMiddleware returns a Fiber middleware that validates the X-API-Key
// header against keys stored in Valkey. Requests to health-check endpoints
// are allowed through without authentication.
func APIKeyMiddleware(kvStore store.KVStore) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Skip authentication for health and other excluded paths.
		for _, p := range skipPaths {
			if strings.HasPrefix(c.Path(), p) {
				return c.Next()
			}
		}

		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "missing API key – include X-API-Key header",
			})
		}

		rootKey := strings.TrimSpace(os.Getenv("SIRIUS_API_KEY"))
		if rootKey != "" && subtle.ConstantTimeCompare([]byte(apiKey), []byte(rootKey)) == 1 {
			c.Locals("auth_mode", "infra_env")
			c.Locals("apikey_label", "Infrastructure Key")
			slog.Debug("request authenticated with environment infrastructure key")
			return c.Next()
		}

		// Fallback: Check Valkey for dynamic, user-generated API keys
		meta, err := store.ValidateAPIKey(context.Background(), kvStore, apiKey)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid API key",
			})
		}

		// Store metadata in request locals for downstream handlers.
		c.Locals("auth_mode", "valkey")
		c.Locals("apikey_meta", meta)
		return c.Next()
	}
}

