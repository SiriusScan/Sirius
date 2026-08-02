package handlers

import (
	"context"
	"log/slog"
	"regexp"
	"strings"

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
//
// Class cut: every session-created key requires owner_subject_id and is always
// scoped to agent:enroll (client-supplied broader scopes are ignored).
func (h *APIKeyHandler) CreateKey(c *fiber.Ctx) error {
	var body struct {
		Label          string `json:"label"`
		OwnerSubjectID string `json:"owner_subject_id"`
	}
	if err := c.BodyParser(&body); err != nil {
		body.Label = "Unnamed key"
	}
	if body.Label == "" {
		body.Label = "Unnamed key"
	}

	ownerSubjectID := strings.TrimSpace(body.OwnerSubjectID)
	if ownerSubjectID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "owner_subject_id is required",
		})
	}

	// Use owner subject as created_by for ownership clarity.
	createdBy := ownerSubjectID

	rawKey, err := store.GenerateAPIKey()
	if err != nil {
		slog.Error("Failed to generate API key", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate API key",
		})
	}

	// Class cut: force agent:enroll for all user-created keys.
	scopes := []string{store.ScopeAgentEnroll}

	meta, err := store.StoreAPIKey(context.Background(), h.Store, rawKey, body.Label, createdBy, ownerSubjectID, scopes)
	if err != nil {
		slog.Error("Failed to store API key", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to store API key",
		})
	}

	slog.Info("API key created", "label", body.Label, "prefix", meta.Prefix, "owner", ownerSubjectID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"key":     rawKey, // Only time the raw key is returned.
		"raw_key": rawKey, // compatibility for clients expecting raw_key
		"meta":    meta,
	})
}

// ListKeys returns metadata for API keys.
// When owner_subject_id is provided, only that owner's keys are returned;
// otherwise all keys are listed (admin path).
func (h *APIKeyHandler) ListKeys(c *fiber.Ctx) error {
	ownerSubjectID := strings.TrimSpace(c.Query("owner_subject_id"))

	var keys []store.APIKeyMeta
	var err error
	if ownerSubjectID != "" {
		keys, err = store.ListAPIKeysByOwner(context.Background(), h.Store, ownerSubjectID)
	} else {
		keys, err = store.ListAPIKeys(context.Background(), h.Store)
	}
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
// When owner_subject_id is provided, revoke is allowed only if the key is owned
// by that subject. Legacy keys with empty OwnerSubjectID may only be revoked
// via the admin path (owner_subject_id omitted).
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

	ownerSubjectID := strings.TrimSpace(c.Query("owner_subject_id"))

	meta, err := store.GetAPIKeyMeta(context.Background(), h.Store, keyID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "api key not found",
		})
	}

	if ownerSubjectID != "" {
		if meta.OwnerSubjectID == "" || meta.OwnerSubjectID != ownerSubjectID {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "not allowed to revoke this API key",
			})
		}
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
