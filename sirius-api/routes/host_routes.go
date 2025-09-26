// routes/host_routes.go
package routes

// GetHost handles the GET /host/{id} route
// GetAllHosts handles the GET /host route

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

type HostRouteSetter struct{}

// SetupRoutes sets up all the routes for the host package
func (h *HostRouteSetter) SetupRoutes(app *fiber.App) {
	hostRoutes := app.Group("/host")

	// Specific routes first (before parameterized routes)
	hostRoutes.Get("/", handlers.GetAllHosts)
	hostRoutes.Post("/", handlers.AddHost)
	hostRoutes.Post("/delete", handlers.DeleteHost)
	hostRoutes.Get("/vulnerabilities/all", handlers.GetAllVulnerabilities)
	hostRoutes.Get("/source-coverage", handlers.GetSourceCoverageStats)

	// Source-aware endpoints for Phase 1 testing
	hostRoutes.Post("/with-source", handlers.AddHostWithSource)

	// SBOM and Enhanced Data endpoints (specific routes first)
	hostRoutes.Get("/:id/packages", handlers.GetHostPackages)
	hostRoutes.Get("/:id/fingerprint", handlers.GetHostFingerprint)
	hostRoutes.Get("/:id/software-stats", handlers.GetHostSoftwareStats)

	// Parameterized routes last (these catch patterns)
	hostRoutes.Get("/:id", handlers.GetHost)
	hostRoutes.Get("/statistics/:id", handlers.GetHostStatistics)
	hostRoutes.Get("/severity/:id", handlers.GetHostVulnerabilitySeverityCounts)
	hostRoutes.Get("/:id/sources", handlers.GetHostWithSources)
	hostRoutes.Get("/:id/history", handlers.GetHostHistory)
	hostRoutes.Get("/:id/vulnerability/:vulnId/history", handlers.GetVulnerabilityHistory)

	// Source-aware endpoints
	hostRoutes.Get("/:ip/sources", handlers.GetHostWithSources)
	hostRoutes.Get("/source-coverage", handlers.GetSourceCoverageStats)

	// Vulnerability source endpoint (at app level, not host level)
	app.Get("/vulnerability/:id/sources", handlers.GetVulnerabilitySources)
}
