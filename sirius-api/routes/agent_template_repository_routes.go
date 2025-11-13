package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// AgentTemplateRepositoryRouteSetter sets up agent template repository routes
type AgentTemplateRepositoryRouteSetter struct{}

func (r *AgentTemplateRepositoryRouteSetter) SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	repos := api.Group("/agent-templates/repositories")

	// Repository CRUD operations
	repos.Get("/", handlers.GetAgentTemplateRepositories)                    // GET /api/agent-templates/repositories - List all
	repos.Post("/", handlers.AddAgentTemplateRepository)                    // POST /api/agent-templates/repositories - Add new
	repos.Put("/:id", handlers.UpdateAgentTemplateRepository)               // PUT /api/agent-templates/repositories/:id - Update
	repos.Delete("/:id", handlers.DeleteAgentTemplateRepository)             // DELETE /api/agent-templates/repositories/:id - Delete

	// Repository sync operations
	repos.Post("/:id/sync", handlers.TriggerAgentTemplateRepositorySync)     // POST /api/agent-templates/repositories/:id/sync - Trigger sync
	repos.Get("/:id/sync-status", handlers.GetAgentTemplateRepositorySyncStatus) // GET /api/agent-templates/repositories/:id/sync-status - Get sync status
}

