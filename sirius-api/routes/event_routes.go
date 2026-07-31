package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// EventRouteSetter sets up event-related routes
type EventRouteSetter struct{}

// SetupRoutes sets up event endpoints
func (e *EventRouteSetter) SetupRoutes(app *fiber.App) {
	api := app.Group("/api/v1/events")

	// Fixed paths before parameterized routes so /stats and /by-entity are reachable.
	api.Get("/", handlers.GetEvents)
	api.Get("/stats", handlers.GetEventStats)
	api.Get("/by-entity", handlers.GetEventsByEntity)
	api.Get("/by-severity/:severity", handlers.GetRecentEventsBySeverity)
	api.Get("/:id", handlers.GetEvent)
}
