package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// Script represents an NSE script
type Script struct {
	ID       string         `json:"id"`
	Name     string         `json:"name"`
	Path     string         `json:"path"`
	Protocol string         `json:"protocol"`
	Content  *ScriptContent `json:"content,omitempty"`
}

// ScriptContent represents script content and metadata
type ScriptContent struct {
	Content   string         `json:"content"`
	Metadata  ScriptMetadata `json:"metadata"`
	UpdatedAt int64          `json:"updated_at"`
}

// ScriptMetadata represents script metadata
type ScriptMetadata struct {
	Author      string   `json:"author"`
	Tags        []string `json:"tags"`
	Description string   `json:"description"`
}

// Manifest represents the NSE scripts manifest
type Manifest struct {
	Name        string            `json:"name"`
	Version     string            `json:"version"`
	Description string            `json:"description"`
	Scripts     map[string]Script `json:"scripts"`
}

const (
	nseManifestKey  = "nse:manifest"
	nseScriptPrefix = "nse:script:"
)

// GetScripts returns all scripts from the manifest
func GetScripts(c *fiber.Ctx) error {
	ctx := context.Background()

	// Get ValKey store
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Get manifest
	manifest, err := getManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get script manifest",
		})
	}

	// Convert map to slice
	scripts := make([]Script, 0, len(manifest.Scripts))
	for _, script := range manifest.Scripts {
		scripts = append(scripts, script)
	}

	return c.JSON(scripts)
}

// GetScript returns a single script with its content
func GetScript(c *fiber.Ctx) error {
	ctx := context.Background()
	scriptID := c.Params("id")

	// Get ValKey store
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Get script from manifest
	manifest, err := getManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get script manifest",
		})
	}

	script, exists := manifest.Scripts[scriptID]
	if !exists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": fmt.Sprintf("Script '%s' not found", scriptID),
		})
	}

	// Get script content
	content, err := getScriptContent(ctx, kvStore, scriptID)
	if err != nil {
		// Return script without content if not available
		slog.Warn("Failed to get script content", "script_id", scriptID, "error", err)
	} else {
		script.Content = content
	}

	return c.JSON(script)
}

// UpdateScript updates script content and metadata
func UpdateScript(c *fiber.Ctx) error {
	ctx := context.Background()
	scriptID := c.Params("id")

	var content ScriptContent
	if err := c.BodyParser(&content); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate content
	if content.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Script content is required",
		})
	}

	// Set update timestamp
	content.UpdatedAt = time.Now().Unix()

	// Get ValKey store
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Check if script exists in manifest
	manifest, err := getManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get script manifest",
		})
	}

	if _, exists := manifest.Scripts[scriptID]; !exists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": fmt.Sprintf("Script '%s' not found", scriptID),
		})
	}

	// Store updated content
	if err := storeScriptContent(ctx, kvStore, scriptID, &content); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update script",
		})
	}

	slog.Info("Updated script", "script_id", scriptID)

	return c.JSON(fiber.Map{
		"message":   "Script updated successfully",
		"script_id": scriptID,
	})
}

// CreateScript creates a new custom script
func CreateScript(c *fiber.Ctx) error {
	ctx := context.Background()

	var script Script
	if err := c.BodyParser(&script); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate script
	if script.ID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Script ID is required",
		})
	}
	if script.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Script name is required",
		})
	}
	if script.Content == nil || script.Content.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Script content is required",
		})
	}

	// Get ValKey store
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Get manifest
	manifest, err := getManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get script manifest",
		})
	}

	// Check if script already exists
	if _, exists := manifest.Scripts[script.ID]; exists {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": fmt.Sprintf("Script '%s' already exists", script.ID),
		})
	}

	// Set default values if not provided
	if script.Protocol == "" {
		script.Protocol = "custom"
	}
	if script.Path == "" {
		script.Path = fmt.Sprintf("scripts/%s.nse", script.ID)
	}

	// Set update timestamp
	script.Content.UpdatedAt = time.Now().Unix()

	// Add to manifest
	manifest.Scripts[script.ID] = Script{
		ID:       script.ID,
		Name:     script.Name,
		Path:     script.Path,
		Protocol: script.Protocol,
	}

	// Store manifest
	if err := storeManifest(ctx, kvStore, manifest); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update manifest",
		})
	}

	// Store script content
	if err := storeScriptContent(ctx, kvStore, script.ID, script.Content); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store script content",
		})
	}

	slog.Info("Created custom script", "script_id", script.ID)

	return c.Status(fiber.StatusCreated).JSON(script)
}

// DeleteScript deletes a custom script
func DeleteScript(c *fiber.Ctx) error {
	ctx := context.Background()
	scriptID := c.Params("id")

	// Get ValKey store
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Get manifest
	manifest, err := getManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get script manifest",
		})
	}

	// Check if script exists
	script, exists := manifest.Scripts[scriptID]
	if !exists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": fmt.Sprintf("Script '%s' not found", scriptID),
		})
	}

	// Only allow deletion of custom scripts
	if script.Protocol != "custom" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Cannot delete system script",
		})
	}

	// Remove from manifest
	delete(manifest.Scripts, scriptID)

	// Store updated manifest
	if err := storeManifest(ctx, kvStore, manifest); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update manifest",
		})
	}

	// Delete script content
	key := nseScriptPrefix + scriptID
	if err := kvStore.DeleteValue(ctx, key); err != nil {
		slog.Warn("Failed to delete script content", "error", err)
	}

	slog.Info("Deleted custom script", "script_id", scriptID)

	return c.SendStatus(fiber.StatusNoContent)
}

// Helper functions

func getManifest(ctx context.Context, kvStore store.KVStore) (*Manifest, error) {
	resp, err := kvStore.GetValue(ctx, nseManifestKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get manifest: %w", err)
	}

	var manifest Manifest
	if err := json.Unmarshal([]byte(resp.Message.Value), &manifest); err != nil {
		return nil, fmt.Errorf("failed to unmarshal manifest: %w", err)
	}

	if manifest.Scripts == nil {
		manifest.Scripts = make(map[string]Script)
	}

	return &manifest, nil
}

func storeManifest(ctx context.Context, kvStore store.KVStore, manifest *Manifest) error {
	manifestJSON, err := json.Marshal(manifest)
	if err != nil {
		return fmt.Errorf("failed to marshal manifest: %w", err)
	}

	if err := kvStore.SetValue(ctx, nseManifestKey, string(manifestJSON)); err != nil {
		return fmt.Errorf("failed to store manifest: %w", err)
	}

	return nil
}

func getScriptContent(ctx context.Context, kvStore store.KVStore, scriptID string) (*ScriptContent, error) {
	key := nseScriptPrefix + scriptID
	resp, err := kvStore.GetValue(ctx, key)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return nil, fmt.Errorf("script content not found")
		}
		return nil, fmt.Errorf("failed to get script content: %w", err)
	}

	var content ScriptContent
	if err := json.Unmarshal([]byte(resp.Message.Value), &content); err != nil {
		return nil, fmt.Errorf("failed to unmarshal script content: %w", err)
	}

	return &content, nil
}

func storeScriptContent(ctx context.Context, kvStore store.KVStore, scriptID string, content *ScriptContent) error {
	contentJSON, err := json.Marshal(content)
	if err != nil {
		return fmt.Errorf("failed to marshal script content: %w", err)
	}

	key := nseScriptPrefix + scriptID
	if err := kvStore.SetValue(ctx, key, string(contentJSON)); err != nil {
		return fmt.Errorf("failed to store script content: %w", err)
	}

	return nil
}



