// routes/app_routes.go
package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

type AppRouteSetter struct{}

func (h *AppRouteSetter) SetupRoutes(app *fiber.App) {
	// Health check route at root level
	app.Get("/health", handlers.HealthHandler)

	// System health check route
	app.Get("/api/v1/system/health", handlers.SystemHealthHandler)

	// App-specific routes
	appRoutes := app.Group("/app")
	appRoutes.Post("/:appName", handlers.AppHandler)
}
