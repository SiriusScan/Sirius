package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// StatisticsRoutes implements RouteSetter for statistics-related endpoints
type StatisticsRoutes struct{}

// SetupRoutes registers all statistics routes
func (StatisticsRoutes) SetupRoutes(app *fiber.App) {
	// API v1 statistics group
	api := app.Group("/api/v1/statistics")

	// Host statistics endpoints
	hosts := api.Group("/hosts")
	hosts.Get("/most-vulnerable", handlers.GetMostVulnerableHosts)
}

