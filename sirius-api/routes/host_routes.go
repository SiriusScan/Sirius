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
	hostRoutes.Get("/:id", handlers.GetHost)
	hostRoutes.Get("/", handlers.GetAllHosts)
	hostRoutes.Post("/", handlers.AddHost)
	hostRoutes.Post("/delete", handlers.DeleteHost)
	hostRoutes.Get("/vulnerabilities/all", handlers.GetAllVulnerabilities)
	hostRoutes.Get("/statistics/:id", handlers.GetHostStatistics)
	hostRoutes.Get("/severity/:id", handlers.GetHostVulnerabilitySeverityCounts)
	
}

