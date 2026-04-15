package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"regexp"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

var templateIDPattern = regexp.MustCompile("^[A-Za-z0-9._:-]{1,128}$")

// Template represents a scan configuration template
type Template struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	Type           string          `json:"type"` // "system" or "custom"
	EnabledScripts []string        `json:"enabled_scripts"`
	ScanOptions    TemplateOptions `json:"scan_options"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// AgentScanConfig matches sirius-ui scan_options.agent_scan (template scans via connected agents).
type AgentScanConfig struct {
	Enabled        bool     `json:"enabled"`
	Mode           string   `json:"mode"` // comprehensive | templates-only | scripts-only
	AgentIDs       []string `json:"agent_ids"`
	Timeout        int      `json:"timeout"`
	Concurrency    int      `json:"concurrency"`
	TemplateFilter []string `json:"template_filter,omitempty"`
}

// TemplateOptions defines the scan configuration for a template
type TemplateOptions struct {
	ScanTypes    []string         `json:"scan_types"`
	PortRange    string           `json:"port_range"`
	Aggressive   bool             `json:"aggressive"`
	MaxRetries   int              `json:"max_retries"`
	Parallel     bool             `json:"parallel"`
	ExcludePorts []string         `json:"exclude_ports,omitempty"`
	AgentScan    *AgentScanConfig `json:"agent_scan,omitempty"`
}

// TemplateList represents a list of template IDs
type TemplateList struct {
	Templates []string `json:"templates"`
}

const (
	templateKeyPrefix      = "scan:template:"
	templateListKey        = "scan:template:list"
	systemTemplatesListKey = "scan:system-templates"
	allScriptsMarker       = "*"
)

func canonicalizeEnabledScriptRef(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	if trimmed == allScriptsMarker {
		return allScriptsMarker
	}

	segments := strings.Split(trimmed, "/")
	lastSegment := trimmed
	for i := len(segments) - 1; i >= 0; i-- {
		if segments[i] != "" {
			lastSegment = segments[i]
			break
		}
	}

	if strings.HasSuffix(strings.ToLower(lastSegment), ".nse") {
		return lastSegment[:len(lastSegment)-4]
	}

	return lastSegment
}

func normalizeTemplateEnabledScripts(values []string) []string {
	if len(values) == 0 {
		return nil
	}

	normalized := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		canonical := canonicalizeEnabledScriptRef(value)
		if canonical == "" {
			continue
		}
		if canonical == allScriptsMarker {
			return []string{allScriptsMarker}
		}
		if _, exists := seen[canonical]; exists {
			continue
		}
		seen[canonical] = struct{}{}
		normalized = append(normalized, canonical)
	}

	return normalized
}

func normalizeTemplate(template *Template) {
	template.EnabledScripts = normalizeTemplateEnabledScripts(template.EnabledScripts)
}

// GetTemplates returns all templates
func GetTemplates(c *fiber.Ctx) error {
	ctx := context.Background()

	// Get ValKey store
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Get template list
	resp, err := kvStore.GetValue(ctx, templateListKey)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			slog.Warn("Template list is missing in store", "key", templateListKey)
			c.Set("X-Sirius-Template-State", "missing")
			now := time.Now()
			return c.JSON(mergeMissingCoreScanProfiles(nil, now))
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get template list",
		})
	}

	var templateList TemplateList
	if err := json.Unmarshal([]byte(resp.Message.Value), &templateList); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse template list",
		})
	}

	// Retrieve each template
	templates := make([]Template, 0, len(templateList.Templates))
	for _, id := range templateList.Templates {
		template, err := getTemplateByID(ctx, kvStore, id)
		if err != nil {
			slog.Warn("Failed to get template", "template_id", id, "error", err)
			continue
		}
		templates = append(templates, *template)
	}

	if len(templates) == 0 {
		slog.Warn("Template list resolved to empty set", "template_ids", len(templateList.Templates))
		c.Set("X-Sirius-Template-State", "empty")
	}

	templates = mergeMissingCoreScanProfiles(templates, time.Now())

	return c.JSON(templates)
}

// GetTemplate returns a single template by ID
func GetTemplate(c *fiber.Ctx) error {
	ctx := context.Background()
	templateID := c.Params("id")
	if !templateIDPattern.MatchString(templateID) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid template id format",
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

	template, err := getTemplateByID(ctx, kvStore, templateID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fmt.Sprintf("Template '%s' not found", templateID),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get template",
		})
	}

	return c.JSON(template)
}

// CreateTemplate creates a new custom template
func CreateTemplate(c *fiber.Ctx) error {
	ctx := context.Background()

	var template Template
	if err := c.BodyParser(&template); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	normalizeTemplate(&template)

	// Validate template
	if err := validateTemplate(&template); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Force type to custom for user-created templates
	template.Type = "custom"

	// Set timestamps
	now := time.Now()
	template.CreatedAt = now
	template.UpdatedAt = now

	// Get ValKey store
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Check if template already exists
	existingTemplate, err := getTemplateByID(ctx, kvStore, template.ID)
	if err == nil && existingTemplate != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": fmt.Sprintf("Template '%s' already exists", template.ID),
		})
	}

	// Store template
	if err := storeTemplate(ctx, kvStore, &template); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create template",
		})
	}

	// Add to template list
	if err := addToTemplateList(ctx, kvStore, template.ID); err != nil {
		slog.Warn("Failed to add template to list", "error", err)
	}

	slog.Info("Created template", "name", template.Name, "template_id", template.ID)

	return c.Status(fiber.StatusCreated).JSON(template)
}

// UpdateTemplate updates an existing template
func UpdateTemplate(c *fiber.Ctx) error {
	ctx := context.Background()
	templateID := c.Params("id")
	if !templateIDPattern.MatchString(templateID) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid template id format",
		})
	}

	var template Template
	if err := c.BodyParser(&template); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Ensure ID matches
	template.ID = templateID
	normalizeTemplate(&template)

	// Validate template
	if err := validateTemplate(&template); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
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

	// Check if template exists
	existing, err := getTemplateByID(ctx, kvStore, templateID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": fmt.Sprintf("Template '%s' not found", templateID),
		})
	}

	// Cannot modify system templates
	if existing.Type == "system" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Cannot modify system template",
		})
	}

	// Preserve creation time, update modification time
	template.CreatedAt = existing.CreatedAt
	template.UpdatedAt = time.Now()
	template.Type = "custom" // Ensure it stays custom

	// Store updated template
	if err := storeTemplate(ctx, kvStore, &template); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update template",
		})
	}

	slog.Info("Updated template", "name", template.Name, "template_id", template.ID)

	return c.JSON(template)
}

// DeleteTemplate deletes a template
func DeleteTemplate(c *fiber.Ctx) error {
	ctx := context.Background()
	templateID := c.Params("id")
	if !templateIDPattern.MatchString(templateID) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid template id format",
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

	// Check if template exists
	template, err := getTemplateByID(ctx, kvStore, templateID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": fmt.Sprintf("Template '%s' not found", templateID),
		})
	}

	// Cannot delete system templates
	if template.Type == "system" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Cannot delete system template",
		})
	}

	// Delete template
	key := templateKeyPrefix + templateID
	if err := kvStore.DeleteValue(ctx, key); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete template",
		})
	}

	// Remove from template list
	if err := removeFromTemplateList(ctx, kvStore, templateID); err != nil {
		slog.Warn("Failed to remove template from list", "error", err)
	}

	slog.Info("Deleted template", "name", template.Name, "template_id", templateID)

	return c.SendStatus(fiber.StatusNoContent)
}

// Helper functions

func getTemplateByID(ctx context.Context, kvStore store.KVStore, id string) (*Template, error) {
	key := templateKeyPrefix + id
	resp, err := kvStore.GetValue(ctx, key)
	if err != nil {
		return nil, err
	}

	var template Template
	if err := json.Unmarshal([]byte(resp.Message.Value), &template); err != nil {
		return nil, fmt.Errorf("failed to unmarshal template: %w", err)
	}
	normalizeTemplate(&template)

	return &template, nil
}

func storeTemplate(ctx context.Context, kvStore store.KVStore, template *Template) error {
	normalizeTemplate(template)
	templateJSON, err := json.Marshal(template)
	if err != nil {
		return fmt.Errorf("failed to marshal template: %w", err)
	}

	key := templateKeyPrefix + template.ID
	if err := kvStore.SetValue(ctx, key, string(templateJSON)); err != nil {
		return fmt.Errorf("failed to store template: %w", err)
	}

	return nil
}

func validateTemplate(template *Template) error {
	if template.ID == "" {
		return fmt.Errorf("template ID is required")
	}
	if !templateIDPattern.MatchString(template.ID) {
		return fmt.Errorf("template ID format is invalid")
	}
	if template.Name == "" {
		return fmt.Errorf("template name is required")
	}
	if len(template.EnabledScripts) == 0 {
		return fmt.Errorf("template must have at least one enabled script")
	}
	if len(template.ScanOptions.ScanTypes) == 0 {
		return fmt.Errorf("template must have at least one scan type")
	}
	return nil
}

func addToTemplateList(ctx context.Context, kvStore store.KVStore, id string) error {
	var templateList TemplateList
	resp, err := kvStore.GetValue(ctx, templateListKey)
	if err != nil {
		if !strings.Contains(err.Error(), "not found") {
			return fmt.Errorf("failed to get template list: %w", err)
		}
		// List doesn't exist yet, create new
		templateList = TemplateList{Templates: []string{}}
	} else {
		if err := json.Unmarshal([]byte(resp.Message.Value), &templateList); err != nil {
			return fmt.Errorf("failed to unmarshal template list: %w", err)
		}
	}

	// Check if already in list
	for _, tid := range templateList.Templates {
		if tid == id {
			return nil // Already in list
		}
	}

	// Add to list
	templateList.Templates = append(templateList.Templates, id)

	// Save updated list
	listJSON, err := json.Marshal(templateList)
	if err != nil {
		return fmt.Errorf("failed to marshal template list: %w", err)
	}

	if err := kvStore.SetValue(ctx, templateListKey, string(listJSON)); err != nil {
		return fmt.Errorf("failed to update template list: %w", err)
	}

	return nil
}

func removeFromTemplateList(ctx context.Context, kvStore store.KVStore, id string) error {
	resp, err := kvStore.GetValue(ctx, templateListKey)
	if err != nil {
		return fmt.Errorf("failed to get template list: %w", err)
	}

	var templateList TemplateList
	if err := json.Unmarshal([]byte(resp.Message.Value), &templateList); err != nil {
		return fmt.Errorf("failed to unmarshal template list: %w", err)
	}

	// Remove from list
	newList := make([]string, 0, len(templateList.Templates))
	for _, tid := range templateList.Templates {
		if tid != id {
			newList = append(newList, tid)
		}
	}
	templateList.Templates = newList

	// Save updated list
	listJSON, err := json.Marshal(templateList)
	if err != nil {
		return fmt.Errorf("failed to marshal template list: %w", err)
	}

	if err := kvStore.SetValue(ctx, templateListKey, string(listJSON)); err != nil {
		return fmt.Errorf("failed to update template list: %w", err)
	}

	return nil
}
