package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Service   string    `json:"service"`
	Version   string    `json:"version"`
}

// HealthHandler handles the GET /health route
func HealthHandler(c *fiber.Ctx) error {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Service:   "sirius-api",
		Version:   "1.0.0",
	}

	return c.Status(200).JSON(response)
}
