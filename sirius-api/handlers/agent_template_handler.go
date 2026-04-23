package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/queue"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/go-api/sirius/store/templates"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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
	agentTemplateSyncQueue = "agent.template.sync.jobs"
)

// templateSyncJobMessage mirrors app-agent's server.SyncJobMessage. Used
// to publish notify_agents requests on agent.template.sync.jobs.
type templateSyncJobMessage struct {
	Action      string `json:"action"`
	TemplateID  string `json:"template_id,omitempty"`
	TriggeredBy string `json:"triggered_by"`
	Timestamp   string `json:"timestamp"`
	JobID       string `json:"job_id"`
}

// detectionTypeFromYAML extracts the first detection step's "type" field.
// Mirrors app-agent's getDetectionType helper closely enough that meta
// records written here look like ones the agent-side sync writer emits.
func detectionTypeFromYAML(t *AgentTemplateYAML) string {
	for _, step := range t.Detection.Steps {
		if v, ok := step["type"].(string); ok && v != "" {
			return v
		}
	}
	return ""
}

// platformsFromYAML mirrors the platform extraction used elsewhere in
// this handler. Returns the first non-empty platforms list it finds in
// detection steps; defaults to ["linux"] for parity with the read path.
func platformsFromYAML(t *AgentTemplateYAML) []string {
	for _, step := range t.Detection.Steps {
		if p, ok := step["platforms"].([]interface{}); ok && len(p) > 0 {
			out := make([]string, len(p))
			for i, v := range p {
				out[i] = fmt.Sprintf("%v", v)
			}
			return out
		}
	}
	return []string{"linux"}
}

// buildTemplateRecord builds a templates.TemplateRecord ready to hand
// to templates.WriteTemplate. Returned alongside the checksum so the
// HTTP layer can echo it back to the caller for verification.
func buildTemplateRecord(yamlTemplate *AgentTemplateYAML, rawYAML []byte, isCustom bool, createdAt time.Time) (*templates.TemplateRecord, string, error) {
	checksum := templates.SHA256Hex(rawYAML)

	now := time.Now().UTC()
	if createdAt.IsZero() {
		createdAt = now
	}

	rec := &templates.TemplateRecord{
		ID:               yamlTemplate.ID,
		Version:          yamlTemplate.GetVersion(),
		Checksum:         checksum,
		Size:             int64(len(rawYAML)),
		Severity:         yamlTemplate.GetSeverity(),
		Platforms:        platformsFromYAML(yamlTemplate),
		DetectionType:    detectionTypeFromYAML(yamlTemplate),
		Author:           yamlTemplate.GetAuthor(),
		Created:          createdAt,
		Updated:          now,
		VulnerabilityIDs: nil,
		IsCustom:         isCustom,
		Content:          rawYAML,
		Metadata:         map[string]string{"source": "sirius-api-upload"},
	}
	return rec, checksum, nil
}

// publishNotifyAgents publishes a notify_agents sync job so connected
// agents re-pull the template inventory. Best-effort: returns the
// underlying error but the caller decides whether to fail the request.
func publishNotifyAgents(templateID, triggeredBy string) error {
	msg := templateSyncJobMessage{
		Action:      "notify_agents",
		TemplateID:  templateID,
		TriggeredBy: triggeredBy,
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		JobID:       uuid.New().String(),
	}
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("marshal sync message: %w", err)
	}
	return queue.Send(agentTemplateSyncQueue, string(data))
}

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

	// Query both standard and custom template keys separately to avoid metadata/version keys
	standardKeys, err := kvStore.ListKeys(ctx, templates.KeyAgentTemplateStandardPrefix+"*")
	if err != nil {
		slog.Warn("Failed to retrieve standard templates", "error", err)
		standardKeys = []string{}
	}

	customKeys, err := kvStore.ListKeys(ctx, templates.KeyAgentTemplateCustomPrefix+"*")
	if err != nil {
		slog.Warn("Failed to retrieve custom templates", "error", err)
		customKeys = []string{}
	}

	keys := append(standardKeys, customKeys...)
	out := []AgentVulnTemplate{}

	for _, key := range keys {
		templateResp, err := kvStore.GetValue(ctx, key)
		if err != nil {
			slog.Warn("Failed to get template", "key", key, "error", err)
			continue
		}
		rec, decErr := templates.DecodeTemplate([]byte(templateResp.Message.Value))
		if decErr != nil {
			slog.Warn("Failed to decode template envelope", "key", key, "error", decErr)
			continue
		}

		var yamlTemplate AgentTemplateYAML
		if err := yaml.Unmarshal(rec.Content, &yamlTemplate); err != nil {
			slog.Warn("Failed to parse YAML template", "key", key, "error", err)
			continue
		}

		templateType := "repository"
		if rec.IsCustom || strings.Contains(key, ":custom:") {
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

		out = append(out, template)
	}

	return c.JSON(out)
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

	rec, err := templates.ReadTemplate(ctx, kvStore, templateID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to decode template",
		})
	}
	if rec == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Template not found",
		})
	}

	yamlContent := string(rec.Content)
	var yamlTemplate AgentTemplateYAML
	if err := yaml.Unmarshal(rec.Content, &yamlTemplate); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse template",
		})
	}

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
	if rec.IsCustom {
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
		CreatedAt:   rec.Created,
		UpdatedAt:   rec.Updated,
		Content:     yamlContent,
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

	if request.Author != "" {
		yamlTemplate.Info.Author = request.Author
		updatedYAML, mErr := yaml.Marshal(yamlTemplate)
		if mErr == nil {
			request.Content = string(updatedYAML)
		}
	}
	rawYAML := []byte(request.Content)

	rec, checksum, err := buildTemplateRecord(&yamlTemplate, rawYAML, true, time.Time{})
	if err != nil {
		slog.Error("Failed to build template record", "id", yamlTemplate.ID, "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to encode template",
		})
	}

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	if err := templates.WriteTemplate(ctx, kvStore, rec); err != nil {
		slog.Error("Failed to persist template", "id", yamlTemplate.ID, "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store template",
		})
	}

	if err := publishNotifyAgents(yamlTemplate.ID, "sirius-api"); err != nil {
		slog.Warn("Failed to publish notify_agents", "id", yamlTemplate.ID, "error", err)
	}

	return c.JSON(fiber.Map{
		"id":       yamlTemplate.ID,
		"checksum": checksum,
		"message":  "Template uploaded successfully",
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

	templateKey := templates.AgentTemplateKey(templateID, true)
	metaKey := templates.AgentTemplateMetaKey(templateID)
	if err := kvStore.DeleteValue(ctx, templateKey); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete template",
		})
	}
	if err := kvStore.DeleteValue(ctx, metaKey); err != nil {
		// Best-effort: a stale meta entry without the envelope would
		// surface as a missing template on enumeration; log and move on.
		slog.Warn("Failed to delete template meta", "id", templateID, "error", err)
	}

	if err := publishNotifyAgents(templateID, "sirius-api"); err != nil {
		slog.Warn("Failed to publish notify_agents on delete", "id", templateID, "error", err)
	}

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
	request.AgentID = strings.TrimSpace(request.AgentID)
	if request.AgentID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "agentId is required",
		})
	}
	if len(request.AgentID) > 128 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "agentId is too long",
		})
	}

	// Validate the requested agent is currently known/connected.
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	connectedAgentsResp, err := kvStore.GetValue(c.Context(), "connected_agents")
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "No connected agents available",
		})
	}

	var connectedAgents []string
	if err := json.Unmarshal([]byte(connectedAgentsResp.Message.Value), &connectedAgents); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read connected agent list",
		})
	}

	agentFound := false
	for _, agentID := range connectedAgents {
		if agentID == request.AgentID {
			agentFound = true
			break
		}
	}
	if !agentFound {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Requested agent is not connected",
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

// UpdateAgentTemplate replaces an existing custom template's envelope +
// meta records and triggers an agent re-pull. Built-in (non-custom)
// templates remain editable for parity with the upload path, but the
// `is_custom` flag and original `created` timestamp on the existing
// meta record are preserved so we never silently flip a built-in into
// a custom one (or vice versa) just because someone hit Save.
func UpdateAgentTemplate(c *fiber.Ctx) error {
	ctx := context.Background()
	templateID := strings.TrimSpace(c.Params("id"))
	if templateID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Template id is required",
		})
	}

	type UpdateRequest struct {
		Content  string `json:"content"`
		Filename string `json:"filename,omitempty"`
		Author   string `json:"author,omitempty"`
	}

	var request UpdateRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var yamlTemplate AgentTemplateYAML
	if err := yaml.Unmarshal([]byte(request.Content), &yamlTemplate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid YAML format",
		})
	}

	if yamlTemplate.ID == "" || yamlTemplate.GetName() == "" || yamlTemplate.GetSeverity() == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Template missing required fields (id, info.name, info.severity)",
		})
	}

	if yamlTemplate.ID != templateID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("URL id %q does not match YAML id %q", templateID, yamlTemplate.ID),
		})
	}

	if request.Author != "" {
		yamlTemplate.Info.Author = request.Author
		updatedYAML, mErr := yaml.Marshal(yamlTemplate)
		if mErr == nil {
			request.Content = string(updatedYAML)
		}
	}
	rawYAML := []byte(request.Content)

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	existing, err := templates.ReadTemplateMeta(ctx, kvStore, templateID)
	if err != nil {
		slog.Warn("Failed to read existing meta", "id", templateID, "error", err)
	}
	if existing == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Template not found",
		})
	}

	rec, checksum, err := buildTemplateRecord(&yamlTemplate, rawYAML, existing.IsCustom, existing.Created)
	if err != nil {
		slog.Error("Failed to build template record", "id", templateID, "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to encode template",
		})
	}

	if err := templates.WriteTemplate(ctx, kvStore, rec); err != nil {
		slog.Error("Failed to persist template", "id", templateID, "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store template",
		})
	}

	if err := publishNotifyAgents(templateID, "sirius-api"); err != nil {
		slog.Warn("Failed to publish notify_agents", "id", templateID, "error", err)
	}

	return c.JSON(fiber.Map{
		"id":       templateID,
		"checksum": checksum,
		"message":  "Template updated successfully",
	})
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
