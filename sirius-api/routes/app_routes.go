// routes/app_routes.go
package routes

import (
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

type AppRouteSetter struct{}

func (h *AppRouteSetter) SetupRoutes(app *fiber.App) {
	appRoutes := app.Group("/app")
	appRoutes.Post("/:appName", handlers.AppHandler)
}
