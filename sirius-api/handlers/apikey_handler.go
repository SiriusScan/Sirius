package handlers

import (
	"context"
	"log/slog"
	"regexp"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

var apiKeyIDPattern = regexp.MustCompile("^[a-f0-9]{64}$")

// APIKeyHandler holds a reference to the Valkey store used for key management.
type APIKeyHandler struct {
	Store store.KVStore
}

// CreateKey generates a new API key, stores its metadata, and returns the raw
// key exactly once in the response body.
func (h *APIKeyHandler) CreateKey(c *fiber.Ctx) error {
	var body struct {
		Label string `json:"label"`
	}
	if err := c.BodyParser(&body); err != nil {
		body.Label = "Unnamed key"
	}
	if body.Label == "" {
		body.Label = "Unnamed key"
	}

	// Determine creator from the API key metadata (set by middleware).
	createdBy := "system"
	if label, ok := c.Locals("apikey_label").(string); ok && label != "" {
		createdBy = label
	}
	if meta, ok := c.Locals("apikey_meta").(store.APIKeyMeta); ok {
		createdBy = meta.Label
	}

	rawKey, err := store.GenerateAPIKey()
	if err != nil {
		slog.Error("Failed to generate API key", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate API key",
		})
	}

	meta, err := store.StoreAPIKey(context.Background(), h.Store, rawKey, body.Label, createdBy)
	if err != nil {
		slog.Error("Failed to store API key", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to store API key",
		})
	}

	slog.Info("API key created", "label", body.Label, "prefix", meta.Prefix)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"key":     rawKey, // Only time the raw key is returned.
		"raw_key": rawKey, // compatibility for clients expecting raw_key
		"meta":    meta,
	})
}

// ListKeys returns metadata for all stored API keys.
func (h *APIKeyHandler) ListKeys(c *fiber.Ctx) error {
	keys, err := store.ListAPIKeys(context.Background(), h.Store)
	if err != nil {
		slog.Error("Failed to list API keys", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to list API keys",
		})
	}
	if keys == nil {
		keys = []store.APIKeyMeta{}
	}
	return c.JSON(fiber.Map{"keys": keys})
}

// RevokeKey deletes an API key by its hash ID.
func (h *APIKeyHandler) RevokeKey(c *fiber.Ctx) error {
	keyID := c.Params("id")
	if keyID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "key id is required",
		})
	}
	if !apiKeyIDPattern.MatchString(keyID) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid key id format",
		})
	}

	// Enforce stable response contract: unknown key IDs return 404.
	if _, err := h.Store.GetValue(context.Background(), "apikey:"+keyID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "api key not found",
		})
	}

	if err := store.RevokeAPIKey(context.Background(), h.Store, keyID); err != nil {
		slog.Error("Failed to revoke API key", "error", err, "id", keyID)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to revoke API key",
		})
	}

	slog.Info("API key revoked", "id", keyID)
	return c.JSON(fiber.Map{"message": "API key revoked"})
}
