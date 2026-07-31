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

	// Fixed paths before parameterized routes so /analytics and /validate are reachable.
	templates.Get("/", handlers.GetAgentTemplates)
	templates.Get("/analytics", handlers.GetAgentTemplateAnalytics)
	templates.Get("/:id", handlers.GetAgentTemplate)
	templates.Get("/:id/results", handlers.GetAgentTemplateResults)

	templates.Post("/", handlers.UploadAgentTemplate)
	templates.Post("/validate", handlers.ValidateAgentTemplate)
	templates.Post("/:id/test", handlers.TestAgentTemplate)
	templates.Post("/:id/deploy", handlers.DeployAgentTemplate)

	templates.Put("/:id", handlers.UpdateAgentTemplate)
	templates.Delete("/:id", handlers.DeleteAgentTemplate)
}
