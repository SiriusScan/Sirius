package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/queue"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
	"gopkg.in/yaml.v3"
)

// AgentVulnTemplate represents an agent vulnerability detection template
type AgentVulnTemplate struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Type        string    `json:"type"` // "standard" or "custom"
	Severity    string    `json:"severity"`
	Author      string    `json:"author"`
	Platforms   []string  `json:"platforms"`
	Version     string    `json:"version"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Content     string    `json:"content,omitempty"` // YAML content
}

// AgentTemplateJSON represents the JSON structure stored in Valkey
type AgentTemplateJSON struct {
	ID               string   `json:"id"`
	Version          string   `json:"version"`
	Checksum         string   `json:"checksum"`
	Size             int      `json:"size"`
	Severity         string   `json:"severity"`
	Platforms        []string `json:"platforms"`
	DetectionType    string   `json:"detection_type"`
	Author           string   `json:"author"`
	Content          string   `json:"content"` // base64 encoded YAML
	VulnerabilityIDs []string `json:"vulnerability_ids"`
}

// AgentTemplateYAML represents the decoded YAML content structure
// Supports both old format (metadata at root) and new format (metadata under info)
type AgentTemplateYAML struct {
	ID          string   `yaml:"id"`
	Name        string   `yaml:"name"`        // Legacy: at root level
	Author      string   `yaml:"author"`      // Legacy: at root level
	Severity    string   `yaml:"severity"`    // Legacy: at root level
	Description string   `yaml:"description"` // Legacy: at root level
	Version     string   `yaml:"version"`     // Legacy: at root level
	Tags        []string `yaml:"tags"`        // Legacy: at root level
	Info        struct {
		Name        string   `yaml:"name"`
		Author      string   `yaml:"author"`
		Severity    string   `yaml:"severity"`
		Description string   `yaml:"description"`
		Version     string   `yaml:"version"`
		Tags        []string `yaml:"tags"`
	} `yaml:"info"`
	Detection struct {
		Steps []map[string]interface{} `yaml:"steps"`
	} `yaml:"detection"`
}

// GetName returns name from info section or root level
func (t *AgentTemplateYAML) GetName() string {
	if t.Info.Name != "" {
		return t.Info.Name
	}
	return t.Name
}

// GetAuthor returns author from info section or root level
func (t *AgentTemplateYAML) GetAuthor() string {
	if t.Info.Author != "" {
		return t.Info.Author
	}
	return t.Author
}

// GetSeverity returns severity from info section or root level
func (t *AgentTemplateYAML) GetSeverity() string {
	if t.Info.Severity != "" {
		return t.Info.Severity
	}
	return t.Severity
}

// GetDescription returns description from info section or root level
func (t *AgentTemplateYAML) GetDescription() string {
	if t.Info.Description != "" {
		return t.Info.Description
	}
	return t.Description
}

// GetVersion returns version from info section or root level
func (t *AgentTemplateYAML) GetVersion() string {
	if t.Info.Version != "" {
		return t.Info.Version
	}
	return t.Version
}

const (
	agentTemplateKeyPrefix = "template:"
	agentTemplateManifest  = "template:manifest"
)

// GetAgentTemplates returns all agent templates from Valkey
func GetAgentTemplates(c *fiber.Ctx) error {
	ctx := context.Background()

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Get template keys (both standard and custom)
	// Query both standard and custom template keys separately to avoid metadata/version keys
	standardKeys, err := kvStore.ListKeys(ctx, agentTemplateKeyPrefix+"standard:*")
	if err != nil {
		slog.Warn("Failed to retrieve standard templates", "error", err)
		standardKeys = []string{}
	}

	customKeys, err := kvStore.ListKeys(ctx, agentTemplateKeyPrefix+"custom:*")
	if err != nil {
		slog.Warn("Failed to retrieve custom templates", "error", err)
		customKeys = []string{}
	}

	// Combine keys
	keys := append(standardKeys, customKeys...)
	templates := []AgentVulnTemplate{}

	for _, key := range keys {
		templateResp, err := kvStore.GetValue(ctx, key)
		if err != nil {
			slog.Warn("Failed to get template", "key", key, "error", err)
			continue
		}
		templateData := templateResp.Message.Value

		// Check if data is JSON-wrapped (standard templates) or raw YAML (custom templates)
		var yamlTemplate AgentTemplateYAML
		var yamlContent string

		// Try to parse as JSON first (for standard templates)
		var jsonData AgentTemplateJSON
		if err := json.Unmarshal([]byte(templateData), &jsonData); err == nil && jsonData.Content != "" {
			// Decode base64 content
			decoded, decErr := base64.StdEncoding.DecodeString(jsonData.Content)
			if decErr != nil {
				slog.Warn("Failed to decode base64 content", "key", key, "error", decErr)
				continue
			}
			yamlContent = string(decoded)
		} else {
			// Treat as raw YAML (custom templates)
			yamlContent = templateData
		}

		// Parse YAML
		if err := yaml.Unmarshal([]byte(yamlContent), &yamlTemplate); err != nil {
			slog.Warn("Failed to parse YAML template", "key", key, "error", err)
			continue
		}

		// Determine type from key
		templateType := "repository"
		if strings.Contains(key, ":custom:") {
			templateType = "custom"
		}

		// Determine platforms from detection steps
		platforms := []string{"linux"} // default
		if len(yamlTemplate.Detection.Steps) > 0 {
			for _, step := range yamlTemplate.Detection.Steps {
				if p, ok := step["platforms"].([]interface{}); ok && len(p) > 0 {
					platforms = make([]string, len(p))
					for i, plat := range p {
						platforms[i] = fmt.Sprintf("%v", plat)
					}
					break
				}
			}
		}

		// Create template from YAML metadata (supports both old and new format)
		template := AgentVulnTemplate{
			ID:          yamlTemplate.ID,
			Name:        yamlTemplate.GetName(),
			Description: yamlTemplate.GetDescription(),
			Type:        templateType,
			Severity:    yamlTemplate.GetSeverity(),
			Author:      yamlTemplate.GetAuthor(),
			Platforms:   platforms,
			Version:     yamlTemplate.GetVersion(),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		templates = append(templates, template)
	}

	return c.JSON(templates)
}

// GetAgentTemplate returns a specific template with full content
func GetAgentTemplate(c *fiber.Ctx) error {
	ctx := context.Background()
	templateID := c.Params("id")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Try both standard and custom keys
	keys := []string{
		agentTemplateKeyPrefix + "standard:" + templateID,
		agentTemplateKeyPrefix + "custom:" + templateID,
	}

	var templateData string
	var foundKey string

	for _, key := range keys {
		resp, err := kvStore.GetValue(ctx, key)
		if err == nil && resp.Message.Value != "" {
			templateData = resp.Message.Value
			foundKey = key
			break
		}
	}

	if templateData == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Template not found",
		})
	}

	// Check if data is JSON-wrapped (standard templates) or raw YAML (custom templates)
	var yamlTemplate AgentTemplateYAML
	var yamlContent string

	// Try to parse as JSON first (for standard templates)
	var jsonData AgentTemplateJSON
	if err := json.Unmarshal([]byte(templateData), &jsonData); err == nil && jsonData.Content != "" {
		// Decode base64 content
		decoded, decErr := base64.StdEncoding.DecodeString(jsonData.Content)
		if decErr != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to decode template content",
			})
		}
		yamlContent = string(decoded)
	} else {
		// Treat as raw YAML (custom templates)
		yamlContent = templateData
	}

	// Parse YAML
	if err := yaml.Unmarshal([]byte(yamlContent), &yamlTemplate); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse template",
		})
	}

	// Determine platforms
	platforms := []string{"linux"}
	for _, step := range yamlTemplate.Detection.Steps {
		if p, ok := step["platforms"].([]interface{}); ok {
			platforms = make([]string, len(p))
			for i, plat := range p {
				platforms[i] = fmt.Sprintf("%v", plat)
			}
			break
		}
	}

	templateType := "repository"
	if strings.Contains(foundKey, ":custom:") {
		templateType = "custom"
	}

	template := AgentVulnTemplate{
		ID:          yamlTemplate.ID,
		Name:        yamlTemplate.GetName(),
		Description: yamlTemplate.GetDescription(),
		Type:        templateType,
		Severity:    yamlTemplate.GetSeverity(),
		Author:      yamlTemplate.GetAuthor(),
		Platforms:   platforms,
		Version:     yamlTemplate.GetVersion(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Content:     yamlContent, // Include full YAML (not JSON wrapper)
	}

	return c.JSON(template)
}

// UploadAgentTemplate uploads a new custom template
func UploadAgentTemplate(c *fiber.Ctx) error {
	ctx := context.Background()

	type UploadRequest struct {
		Content  string `json:"content"`
		Filename string `json:"filename"`
		Author   string `json:"author,omitempty"`
	}

	var request UploadRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Parse YAML
	var yamlTemplate AgentTemplateYAML
	if err := yaml.Unmarshal([]byte(request.Content), &yamlTemplate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid YAML format",
		})
	}

	// Validate required fields
	if yamlTemplate.ID == "" || yamlTemplate.Info.Name == "" || yamlTemplate.Info.Severity == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Template missing required fields (id, info.name, info.severity)",
		})
	}

	// Override author if provided
	if request.Author != "" {
		yamlTemplate.Info.Author = request.Author
		// Re-marshal with updated author
		updatedYAML, _ := yaml.Marshal(yamlTemplate)
		request.Content = string(updatedYAML)
	}

	// Store in Valkey
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	templateKey := agentTemplateKeyPrefix + "custom:" + yamlTemplate.ID
	if err := kvStore.SetValue(ctx, templateKey, request.Content); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store template",
		})
	}

	// Notify engine of new template
	message := map[string]interface{}{
		"command":     "internal:template upload",
		"template_id": yamlTemplate.ID,
		"timestamp":   time.Now().Format(time.RFC3339),
	}
	msgBytes, _ := json.Marshal(message)
	_ = queue.Send("engine.commands", string(msgBytes))

	return c.JSON(fiber.Map{
		"id":      yamlTemplate.ID,
		"message": "Template uploaded successfully",
	})
}

// ValidateAgentTemplate validates a template without storing
func ValidateAgentTemplate(c *fiber.Ctx) error {
	type ValidateRequest struct {
		Content string `json:"content"`
	}

	var request ValidateRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"valid":  false,
			"errors": []string{"Invalid request body"},
		})
	}

	var yamlTemplate AgentTemplateYAML
	if err := yaml.Unmarshal([]byte(request.Content), &yamlTemplate); err != nil {
		return c.JSON(fiber.Map{
			"valid":  false,
			"errors": []string{fmt.Sprintf("Invalid YAML: %v", err)},
		})
	}

	errors := []string{}
	warnings := []string{}

	if yamlTemplate.ID == "" {
		errors = append(errors, "Missing required field: id")
	}
	if yamlTemplate.Info.Name == "" {
		errors = append(errors, "Missing required field: info.name")
	}
	if yamlTemplate.Info.Severity == "" {
		errors = append(errors, "Missing required field: info.severity")
	}
	if yamlTemplate.Info.Description == "" {
		warnings = append(warnings, "Missing recommended field: info.description")
	}

	return c.JSON(fiber.Map{
		"valid":    len(errors) == 0,
		"errors":   errors,
		"warnings": warnings,
	})
}

// DeleteAgentTemplate deletes a custom template
func DeleteAgentTemplate(c *fiber.Ctx) error {
	ctx := context.Background()
	templateID := c.Params("id")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Only allow deleting custom templates
	templateKey := agentTemplateKeyPrefix + "custom:" + templateID
	if err := kvStore.DeleteValue(ctx, templateKey); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete template",
		})
	}

	// Notify engine
	message := map[string]interface{}{
		"command":     "internal:template delete",
		"template_id": templateID,
		"timestamp":   time.Now().Format(time.RFC3339),
	}
	msgBytes, _ := json.Marshal(message)
	_ = queue.Send("engine.commands", string(msgBytes))

	return c.JSON(fiber.Map{
		"message": "Template deleted",
	})
}

// TestAgentTemplate runs a template on a specific agent
func TestAgentTemplate(c *fiber.Ctx) error {
	templateID := c.Params("id")

	type TestRequest struct {
		AgentID string `json:"agentId"`
	}

	var request TestRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Send command to agent
	message := map[string]interface{}{
		"command":     fmt.Sprintf("internal:template-scan --template %s", templateID),
		"template_id": templateID,
		"agent_id":    request.AgentID,
		"timestamp":   time.Now().Format(time.RFC3339),
	}

	msgBytes, _ := json.Marshal(message)
	agentQueue := fmt.Sprintf("agent.%s.commands", request.AgentID)

	if err := queue.Send(agentQueue, string(msgBytes)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to send test command",
		})
	}

	return c.JSON(fiber.Map{
		"message":     "Template test initiated",
		"agent_id":    request.AgentID,
		"template_id": templateID,
	})
}

// Placeholder implementations for other endpoints
func UpdateAgentTemplate(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Update not yet implemented"})
}

func DeployAgentTemplate(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Deploy not yet implemented"})
}

func GetAgentTemplateAnalytics(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Analytics not yet implemented"})
}

func GetAgentTemplateResults(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Results not yet implemented"})
}
