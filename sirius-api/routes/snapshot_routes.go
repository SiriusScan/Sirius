package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

type SnapshotRouteSetter struct{}

func (s *SnapshotRouteSetter) SetupRoutes(app *fiber.App) {
	api := app.Group("/api/v1")
	stats := api.Group("/statistics")

	// Trend retrieval
	stats.Get("/vulnerability-trends", handlers.GetVulnerabilityTrends)

	// Snapshot management
	stats.Get("/vulnerability-snapshots", handlers.ListSnapshots)
	stats.Get("/vulnerability-snapshot/:snapshotId", handlers.GetSnapshot)
	stats.Post("/vulnerability-snapshot", handlers.CreateSnapshot)
}

