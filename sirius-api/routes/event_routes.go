package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// EventRouteSetter sets up event-related routes
type EventRouteSetter struct{}

// SetupRoutes sets up event endpoints
func (e *EventRouteSetter) SetupRoutes(app *fiber.App) {
	// Create event API group
	api := app.Group("/api/v1/events")

	// Event endpoints
	api.Get("/", handlers.GetEvents)                                  // List events with filters
	api.Get("/:id", handlers.GetEvent)                                 // Get single event by event_id
	api.Get("/stats", handlers.GetEventStats)                          // Get event statistics
	api.Get("/by-entity", handlers.GetEventsByEntity)                  // Get events by entity
	api.Get("/by-severity/:severity", handlers.GetRecentEventsBySeverity) // Get events by severity
}

