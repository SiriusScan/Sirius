package handlers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

// GetHost handles the GET /host/{id} route
func TestHandler(c *fiber.Ctx) error {

	fmt.Println("test")

	// Return the host data as JSON
	return c.JSON("hostData")
}
