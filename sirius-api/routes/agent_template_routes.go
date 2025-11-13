package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// AgentTemplateRouteSetter implements the RouteSetter interface for agent template routes
type AgentTemplateRouteSetter struct{}

func (s *AgentTemplateRouteSetter) SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	templates := api.Group("/agent-templates")

	// Template CRUD operations
	templates.Get("/", handlers.GetAgentTemplates)                    // GET /api/agent-templates - List all
	templates.Get("/:id", handlers.GetAgentTemplate)                 // GET /api/agent-templates/:id - Get one
	templates.Post("/", handlers.UploadAgentTemplate)                // POST /api/agent-templates - Upload custom
	templates.Put("/:id", handlers.UpdateAgentTemplate)              // PUT /api/agent-templates/:id - Update
	templates.Delete("/:id", handlers.DeleteAgentTemplate)           // DELETE /api/agent-templates/:id - Delete

	// Template operations
	templates.Post("/validate", handlers.ValidateAgentTemplate)       // POST /api/agent-templates/validate - Validate
	templates.Post("/:id/test", handlers.TestAgentTemplate)          // POST /api/agent-templates/:id/test - Test
	templates.Post("/:id/deploy", handlers.DeployAgentTemplate)      // POST /api/agent-templates/:id/deploy - Deploy
	templates.Get("/analytics", handlers.GetAgentTemplateAnalytics)  // GET /api/agent-templates/analytics - Analytics
	templates.Get("/:id/results", handlers.GetAgentTemplateResults)  // GET /api/agent-templates/:id/results - Results
}

