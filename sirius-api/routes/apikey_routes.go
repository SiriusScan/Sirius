package routes

import (
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// APIKeyRouteSetter registers the API key management endpoints.
type APIKeyRouteSetter struct {
	Store store.KVStore
}

func (s *APIKeyRouteSetter) SetupRoutes(app *fiber.App) {
	h := &handlers.APIKeyHandler{Store: s.Store}

	keys := app.Group("/api/v1/keys")
	keys.Post("/", h.CreateKey)
	keys.Get("/", h.ListKeys)
	keys.Delete("/:id", h.RevokeKey)
}
