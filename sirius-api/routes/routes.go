package routes

import (
	"github.com/gofiber/fiber/v2"
)

type RouteSetter interface {
	SetupRoutes(*fiber.App)
}

// SetupRoutes sets up all the routes for the application
func SetupRoutes(app *fiber.App, setters ...RouteSetter) {
	for _, setter := range setters {
		setter.SetupRoutes(app)
	}
}
