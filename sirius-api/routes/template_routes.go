package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// TemplateRouteSetter sets up template routes
type TemplateRouteSetter struct{}

func (t *TemplateRouteSetter) SetupRoutes(app *fiber.App) {
	templates := app.Group("/templates")

	// Template CRUD operations
	templates.Get("/", handlers.GetTemplates)           // GET /templates - List all
	templates.Get("/:id", handlers.GetTemplate)         // GET /templates/:id - Get one
	templates.Post("/", handlers.CreateTemplate)        // POST /templates - Create
	templates.Put("/:id", handlers.UpdateTemplate)       // PUT /templates/:id - Update
	templates.Delete("/:id", handlers.DeleteTemplate)   // DELETE /templates/:id - Delete
}

