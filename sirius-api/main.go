package main

import (
	"github.com/SiriusScan/sirius-api/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	// Add CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000", // or "*" to allow any origin
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	// Add other middlewares
	app.Use(logger.New())

	vulnerabilityRouteSetter := &routes.VulnerabilityRouteSetter{}
	routes.SetupRoutes(app, &routes.HostRouteSetter{}, &routes.AppRouteSetter{}, vulnerabilityRouteSetter)

	app.Listen(":9001")
}
