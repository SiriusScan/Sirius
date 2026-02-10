package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// ScanRouteSetter implements RouteSetter for scan-related routes
type ScanRouteSetter struct{}

// SetupRoutes registers scan control routes
func (s *ScanRouteSetter) SetupRoutes(app *fiber.App) {
	// API v1 scan routes
	api := app.Group("/api/v1/scans")

	// POST /api/v1/scans/cancel - Cancel the current running scan (graceful)
	api.Post("/cancel", handlers.CancelScan)

	// POST /api/v1/scans/force-stop - Force stop the scan and reset state
	api.Post("/force-stop", handlers.ForceStopScan)

	// POST /api/v1/scans/reset - Reset scan dashboard state (last resort)
	api.Post("/reset", handlers.ResetScanState)

	// GET /api/v1/scans/status - Get the current scan status
	api.Get("/status", handlers.GetScanStatus)
}
