package middleware

import (
	"context"
	"crypto/subtle"
	"log/slog"
	"strings"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// APIKeyMiddleware returns a Fiber middleware that validates the X-API-Key
// header against keys stored in Valkey. Only exact GET /health is allowed
// through without authentication.
// rootKey is the installer/internal service key (from SIRIUS_API_KEY_FILE or SIRIUS_API_KEY).
func APIKeyMiddleware(kvStore store.KVStore, rootKey string) fiber.Handler {
	rootKey = strings.TrimSpace(rootKey)
	return func(c *fiber.Ctx) error {
		if isPublicHealthProbe(c) {
			return c.Next()
		}

		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "missing API key – include X-API-Key header",
			})
		}

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

		// Scoped keys (e.g. agent:enroll) are for gRPC enrollment, not HTTP APIs.
		if scopedKeyForbidden(c.Path(), meta) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "API key scope does not allow this endpoint",
			})
		}

		// Store metadata in request locals for downstream handlers.
		c.Locals("auth_mode", "valkey")
		c.Locals("apikey_meta", meta)
		return c.Next()
	}
}

// scopedKeyForbidden reports whether a scoped API key must be denied for the
// given HTTP path. Class cut: any explicitly scoped key is denied on all
// authenticated HTTP routes (agent:enroll is used via gRPC in a later slice).
// Legacy unscoped keys (empty Scopes) keep full access.
func scopedKeyForbidden(path string, meta store.APIKeyMeta) bool {
	_ = path // reserved for future path allowlists
	return store.IsScoped(meta)
}

// isPublicHealthProbe reports the sole unauthenticated Community probe:
// exact GET /health (with or without a trailing slash). Prefix matches such as
// /healthz or /health/... and non-GET methods remain authenticated.
func isPublicHealthProbe(c *fiber.Ctx) bool {
	if c.Method() != fiber.MethodGet {
		return false
	}
	path := c.Path()
	return path == "/health" || path == "/health/"
}
