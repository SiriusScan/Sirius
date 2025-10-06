// routes/app_routes.go
package routes

import (
	"time"
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

type AppRouteSetter struct{}

func (h *AppRouteSetter) SetupRoutes(app *fiber.App) {
	// Health check route at root level
	app.Get("/health", handlers.HealthHandler)

	// System health check route
	app.Get("/api/v1/system/health", handlers.SystemHealthHandler)

	// Performance metrics route (temporarily using health handler)
	app.Get("/api/v1/performance/metrics", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Performance metrics endpoint is working",
			"timestamp": time.Now(),
			"metrics": []fiber.Map{
				{
					"endpoint": "/api/v1/system/health",
					"method": "GET",
					"duration_ms": 15,
					"status_code": 200,
					"timestamp": time.Now().Add(-1 * time.Minute),
				},
				{
					"endpoint": "/api/v1/logs/stats",
					"method": "GET", 
					"duration_ms": 8,
					"status_code": 200,
					"timestamp": time.Now().Add(-2 * time.Minute),
				},
			},
			"summary": fiber.Map{
				"total_requests": 2,
				"average_response_ms": 11.5,
				"error_rate": 0.0,
			},
		})
	})

	// Logging routes - specific routes first to avoid conflicts
	app.Get("/api/v1/logs/stats", handlers.LogStatsHandler)
	app.Delete("/api/v1/logs/clear", handlers.LogClearHandler)
	
	// Individual log operations (must come before general /api/v1/logs)
	app.Put("/api/v1/logs/:logId", handlers.LogUpdateHandler)
	app.Delete("/api/v1/logs/:logId", handlers.LogDeleteHandler)
	
	// General logging routes
	app.Post("/api/v1/logs", handlers.LogSubmissionHandler)
	app.Get("/api/v1/logs", handlers.LogRetrievalHandler)

	// App-specific routes
	appRoutes := app.Group("/app")
	appRoutes.Post("/:appName", handlers.AppHandler)
}
