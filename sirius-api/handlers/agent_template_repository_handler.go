package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/SiriusScan/go-api/sirius/queue"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const (
	repositoryManifestKey = "sirius:agent-templates:repositories"
	syncJobQueue          = "agent.template.sync.jobs"
)

// AgentTemplateRepository represents a template repository
type AgentTemplateRepository struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	URL           string  `json:"url"`
	Branch        string  `json:"branch"`
	Priority      int     `json:"priority"`
	Enabled       bool    `json:"enabled"`
	LastSync      *string `json:"last_sync"`
	TemplateCount int     `json:"template_count"`
	Status        string  `json:"status"`
	ErrorMessage  *string `json:"error_message"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

// RepositoryManifest represents the repository list structure in Valkey
type RepositoryManifest struct {
	Repositories []AgentTemplateRepository `json:"repositories"`
	Version      string                    `json:"version"`
	UpdatedAt    string                    `json:"updated_at"`
}

// SyncJobMessage represents a RabbitMQ sync job message
type SyncJobMessage struct {
	Action           string `json:"action"`
	RepositoryID     string `json:"repository_id,omitempty"`
	RepositoryURL    string `json:"repository_url,omitempty"`
	RepositoryBranch string `json:"repository_branch,omitempty"`
	TriggeredBy      string `json:"triggered_by"`
	Timestamp        string `json:"timestamp"`
	JobID            string `json:"job_id"`
}

// GetAgentTemplateRepositories returns all repositories
func GetAgentTemplateRepositories(c *fiber.Ctx) error {
	ctx := context.Background()

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Get repository manifest from Valkey
	resp, err := kvStore.GetValue(ctx, repositoryManifestKey)
	if err != nil {
		// No repositories exist - initialize default repository
		log.Printf("No repositories found, initializing default repository")
		if err := initializeDefaultRepository(ctx, kvStore); err != nil {
			log.Printf("Warning: Failed to initialize default repository: %v", err)
			// Return empty list even if initialization fails
			return c.JSON([]AgentTemplateRepository{})
		}
		// Retry getting the manifest after initialization
		resp, err = kvStore.GetValue(ctx, repositoryManifestKey)
		if err != nil {
			return c.JSON([]AgentTemplateRepository{})
		}
	}

	var manifest RepositoryManifest
	if err := json.Unmarshal([]byte(resp.Message.Value), &manifest); err != nil {
		log.Printf("Error parsing repository manifest: %v", err)
		return c.JSON([]AgentTemplateRepository{})
	}

	// If manifest exists but has no repositories, initialize default
	if len(manifest.Repositories) == 0 {
		log.Printf("Repository manifest exists but is empty, initializing default repository")
		if err := initializeDefaultRepository(ctx, kvStore); err != nil {
			log.Printf("Warning: Failed to initialize default repository: %v", err)
		} else {
			// Retry getting the manifest after initialization
			resp, err = kvStore.GetValue(ctx, repositoryManifestKey)
			if err == nil {
				if err := json.Unmarshal([]byte(resp.Message.Value), &manifest); err == nil {
					return c.JSON(manifest.Repositories)
				}
			}
		}
	}

	return c.JSON(manifest.Repositories)
}

// initializeDefaultRepository creates the default repository if it doesn't exist
func initializeDefaultRepository(ctx context.Context, kvStore store.KVStore) error {
	now := time.Now().Format(time.RFC3339)
	defaultRepo := AgentTemplateRepository{
		ID:            "default-sirius-official",
		Name:          "Sirius Official",
		URL:           "https://github.com/SiriusScan/sirius-agent-modules",
		Branch:        "main",
		Priority:      1,
		Enabled:       true,
		LastSync:      nil,
		TemplateCount: 0,
		Status:        "never_synced",
		ErrorMessage:  nil,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	manifest := RepositoryManifest{
		Repositories: []AgentTemplateRepository{defaultRepo},
		Version:      "1.0",
		UpdatedAt:    now,
	}

	return saveRepositoryManifest(ctx, kvStore, &manifest)
}

// AddAgentTemplateRepository adds a new repository
func AddAgentTemplateRepository(c *fiber.Ctx) error {
	ctx := context.Background()

	type AddRequest struct {
		Name     string `json:"name"`
		URL      string `json:"url"`
		Branch   string `json:"branch"`
		Priority int    `json:"priority"`
		Enabled  bool   `json:"enabled"`
	}

	var request AddRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if request.Name == "" || request.URL == "" || request.Branch == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing required fields: name, url, branch",
		})
	}

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Load existing manifest
	manifest, err := loadRepositoryManifest(ctx, kvStore)
	if err != nil {
		// Initialize new manifest if it doesn't exist
		manifest = &RepositoryManifest{
			Repositories: []AgentTemplateRepository{},
			Version:      "1.0",
			UpdatedAt:    time.Now().Format(time.RFC3339),
		}
	}

	// Check if repository with this name already exists
	for _, repo := range manifest.Repositories {
		if repo.Name == request.Name {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": fmt.Sprintf("Repository with name '%s' already exists", request.Name),
			})
		}
	}

	// Create new repository
	now := time.Now().Format(time.RFC3339)
	newRepo := AgentTemplateRepository{
		ID:            uuid.New().String(),
		Name:          request.Name,
		URL:           request.URL,
		Branch:        request.Branch,
		Priority:      request.Priority,
		Enabled:       request.Enabled,
		LastSync:      nil,
		TemplateCount: 0,
		Status:        "never_synced",
		ErrorMessage:  nil,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	// Add to manifest
	manifest.Repositories = append(manifest.Repositories, newRepo)
	manifest.UpdatedAt = now

	// Save manifest
	if err := saveRepositoryManifest(ctx, kvStore, manifest); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save repository",
		})
	}

	// Publish sync message to RabbitMQ
	jobID := uuid.New().String()
	syncMsg := SyncJobMessage{
		Action:           "sync_repository",
		RepositoryID:     newRepo.ID,
		RepositoryURL:    newRepo.URL,
		RepositoryBranch: newRepo.Branch,
		TriggeredBy:      "user",
		Timestamp:        now,
		JobID:            jobID,
	}

	if err := publishSyncJob(syncMsg); err != nil {
		log.Printf("Warning: Failed to publish sync job: %v", err)
		// Don't fail the request, sync can happen later
	}

	return c.Status(fiber.StatusCreated).JSON(newRepo)
}

// UpdateAgentTemplateRepository updates an existing repository
func UpdateAgentTemplateRepository(c *fiber.Ctx) error {
	ctx := context.Background()
	repoID := c.Params("id")

	type UpdateRequest struct {
		Name     *string `json:"name,omitempty"`
		URL      *string `json:"url,omitempty"`
		Branch   *string `json:"branch,omitempty"`
		Priority *int    `json:"priority,omitempty"`
		Enabled  *bool   `json:"enabled,omitempty"`
	}

	var request UpdateRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Load manifest
	manifest, err := loadRepositoryManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to load repositories",
		})
	}

	// Find repository to update
	var updated *AgentTemplateRepository
	urlChanged := false
	branchChanged := false

	for i := range manifest.Repositories {
		if manifest.Repositories[i].ID == repoID {
			if request.Name != nil {
				manifest.Repositories[i].Name = *request.Name
			}
			if request.URL != nil && *request.URL != manifest.Repositories[i].URL {
				manifest.Repositories[i].URL = *request.URL
				urlChanged = true
			}
			if request.Branch != nil && *request.Branch != manifest.Repositories[i].Branch {
				manifest.Repositories[i].Branch = *request.Branch
				branchChanged = true
			}
			if request.Priority != nil {
				manifest.Repositories[i].Priority = *request.Priority
			}
			if request.Enabled != nil {
				manifest.Repositories[i].Enabled = *request.Enabled
			}
			manifest.Repositories[i].UpdatedAt = time.Now().Format(time.RFC3339)
			updated = &manifest.Repositories[i]
			break
		}
	}

	if updated == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Repository not found",
		})
	}

	manifest.UpdatedAt = time.Now().Format(time.RFC3339)

	// Save manifest
	if err := saveRepositoryManifest(ctx, kvStore, manifest); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update repository",
		})
	}

	// If URL or branch changed, trigger resync
	if urlChanged || branchChanged {
		jobID := uuid.New().String()
		syncMsg := SyncJobMessage{
			Action:           "sync_repository",
			RepositoryID:     updated.ID,
			RepositoryURL:    updated.URL,
			RepositoryBranch: updated.Branch,
			TriggeredBy:      "user",
			Timestamp:        time.Now().Format(time.RFC3339),
			JobID:            jobID,
		}

		if err := publishSyncJob(syncMsg); err != nil {
			log.Printf("Warning: Failed to publish sync job: %v", err)
		}
	}

	return c.JSON(updated)
}

// DeleteAgentTemplateRepository deletes a repository
func DeleteAgentTemplateRepository(c *fiber.Ctx) error {
	ctx := context.Background()
	repoID := c.Params("id")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Load manifest
	manifest, err := loadRepositoryManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to load repositories",
		})
	}

	// Find and remove repository
	found := false
	newRepositories := []AgentTemplateRepository{}
	for _, repo := range manifest.Repositories {
		if repo.ID == repoID {
			found = true
			continue
		}
		newRepositories = append(newRepositories, repo)
	}

	if !found {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Repository not found",
		})
	}

	manifest.Repositories = newRepositories
	manifest.UpdatedAt = time.Now().Format(time.RFC3339)

	// Save manifest
	if err := saveRepositoryManifest(ctx, kvStore, manifest); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete repository",
		})
	}

	// Publish cleanup message
	jobID := uuid.New().String()
	syncMsg := SyncJobMessage{
		Action:       "delete_repository",
		RepositoryID: repoID,
		TriggeredBy:  "user",
		Timestamp:    time.Now().Format(time.RFC3339),
		JobID:        jobID,
	}

	if err := publishSyncJob(syncMsg); err != nil {
		log.Printf("Warning: Failed to publish cleanup job: %v", err)
	}

	return c.JSON(fiber.Map{
		"message": "Repository deleted successfully",
	})
}

// TriggerAgentTemplateRepositorySync triggers a manual sync
func TriggerAgentTemplateRepositorySync(c *fiber.Ctx) error {
	ctx := context.Background()
	repoID := c.Params("id")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Load manifest to verify repository exists
	manifest, err := loadRepositoryManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to load repositories",
		})
	}

	// Find repository
	var repo *AgentTemplateRepository
	for i := range manifest.Repositories {
		if manifest.Repositories[i].ID == repoID {
			repo = &manifest.Repositories[i]
			break
		}
	}

	if repo == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Repository not found",
		})
	}

	// Publish sync message
	jobID := uuid.New().String()
	syncMsg := SyncJobMessage{
		Action:           "sync_repository",
		RepositoryID:     repo.ID,
		RepositoryURL:    repo.URL,
		RepositoryBranch: repo.Branch,
		TriggeredBy:      "user",
		Timestamp:        time.Now().Format(time.RFC3339),
		JobID:            jobID,
	}

	if err := publishSyncJob(syncMsg); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to trigger sync",
		})
	}

	return c.JSON(fiber.Map{
		"status": "syncing",
		"job_id": jobID,
	})
}

// GetAgentTemplateRepositorySyncStatus returns sync status for a repository
func GetAgentTemplateRepositorySyncStatus(c *fiber.Ctx) error {
	ctx := context.Background()
	repoID := c.Params("id")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to database",
		})
	}
	defer kvStore.Close()

	// Load manifest
	manifest, err := loadRepositoryManifest(ctx, kvStore)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to load repositories",
		})
	}

	// Find repository
	for _, repo := range manifest.Repositories {
		if repo.ID == repoID {
			return c.JSON(fiber.Map{
				"status":         repo.Status,
				"last_sync":      repo.LastSync,
				"template_count": repo.TemplateCount,
				"error_message":  repo.ErrorMessage,
			})
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"error": "Repository not found",
	})
}

// Helper functions

func loadRepositoryManifest(ctx context.Context, kvStore store.KVStore) (*RepositoryManifest, error) {
	resp, err := kvStore.GetValue(ctx, repositoryManifestKey)
	if err != nil {
		return nil, err
	}

	var manifest RepositoryManifest
	if err := json.Unmarshal([]byte(resp.Message.Value), &manifest); err != nil {
		return nil, err
	}

	return &manifest, nil
}

func saveRepositoryManifest(ctx context.Context, kvStore store.KVStore, manifest *RepositoryManifest) error {
	data, err := json.Marshal(manifest)
	if err != nil {
		return err
	}

	return kvStore.SetValue(ctx, repositoryManifestKey, string(data))
}

func publishSyncJob(msg SyncJobMessage) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	return queue.Send(syncJobQueue, string(data))
}








