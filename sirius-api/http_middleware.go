package main

import (
	"os"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/sirius-api/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// applyProductionHTTPMiddleware mounts the exact Community HTTP middleware stack
// used by main(). Tests must call this instead of assembling a partial stack so
// auth and request-ID behavior cannot silently diverge from production.
func applyProductionHTTPMiddleware(app *fiber.App, kvStore store.KVStore, serviceAPIKey string) {
	allowedOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "*"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins: allowedOrigins,
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	// Default Fiber requestid config: header X-Request-ID, generator utils.UUID
	// (RFC4122 v4-formatted seeded counter), locals key "requestid".
	app.Use(requestid.New())
	app.Use(requestLoggerMiddleware())
	app.Use(middleware.APIKeyMiddleware(kvStore, serviceAPIKey))
	app.Use(middleware.SDKLoggingMiddleware())
	app.Use(middleware.SDKErrorLoggingMiddleware())
	app.Use(middleware.SDKPerformanceMetricsMiddleware())
}
