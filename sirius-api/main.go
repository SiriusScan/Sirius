package main

import (
	"fmt"
	"log/slog"
	"net"
	"os"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/SiriusScan/go-api/sirius/migrate"
	"github.com/SiriusScan/go-api/sirius/module"
	"github.com/SiriusScan/go-api/sirius/slogger"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/sirius-api/internal/infraauth"
	"github.com/SiriusScan/sirius-api/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// waitForDatabase waits for PostgreSQL to be available before running migrations
func waitForDatabase() error {
	dbHost := os.Getenv("POSTGRES_HOST")
	dbPort := os.Getenv("POSTGRES_PORT")
	if dbHost == "" {
		dbHost = "sirius-postgres"
	}
	if dbPort == "" {
		dbPort = "5432"
	}

	address := net.JoinHostPort(dbHost, dbPort)
	slog.Info("Waiting for database", "address", address)

	for attempts := 0; attempts < 30; attempts++ {
		conn, err := net.DialTimeout("tcp", address, 3*time.Second)
		if err == nil {
			conn.Close()
			slog.Info("Database is available", "address", address)
			return nil
		}
		slog.Debug("Database not ready, retrying", "attempt", attempts+1, "max", 30)
		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("database not available after 30 attempts")
}

// runMigrations applies forward-only core schema migrations via go-api's
// schema_migrations_core ledger. Failures are fatal (no silent skip).
func runMigrations() error {
	slog.Info("Running database migrations")

	if err := waitForDatabase(); err != nil {
		return fmt.Errorf("database connectivity check failed: %w", err)
	}

	if err := migrate.UpFromDefault(); err != nil {
		return fmt.Errorf("core schema migrations failed: %w", err)
	}

	slog.Info("Database migrations completed")
	return nil
}

func main() {
	// Initialize structured logging (reads LOG_LEVEL env var)
	slogger.Init()

	// Root service key is validated statelessly in middleware (file or env).
	// Valkey remains authoritative only for user-generated API keys.
	serviceAPIKey, err := infraauth.LoadSiriusAPIKey()
	if err != nil || strings.TrimSpace(serviceAPIKey) == "" {
		slog.Error("internal API key is required for sirius-api startup (SIRIUS_API_KEY_FILE or SIRIUS_API_KEY)", "error", err)
		os.Exit(1)
	}

	// Initialize the logging SDK
	logging.Init()
	defer logging.Close()

	// Run database migrations before starting the API
	if err := runMigrations(); err != nil {
		slog.Error("Failed to run migrations", "error", err)
		os.Exit(1)
	}

	// Initialize Valkey store for dynamic API key management.
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		slog.Error("Failed to connect to Valkey", "error", err)
		os.Exit(1)
	}
	defer kvStore.Close()

	app := fiber.New()

	// Add CORS middleware
	allowedOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "*" // Default to allow all origins
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins: allowedOrigins,
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	// Add request ID middleware
	app.Use(requestid.New())

	// Add level-aware request logging middleware
	app.Use(requestLoggerMiddleware())

	// Add API key authentication middleware
	app.Use(middleware.APIKeyMiddleware(kvStore, serviceAPIKey))

	// Add SDK-based logging middlewares
	app.Use(middleware.SDKLoggingMiddleware())
	app.Use(middleware.SDKErrorLoggingMiddleware())
	app.Use(middleware.SDKPerformanceMetricsMiddleware())

	moduleRegistry, err := buildModuleRegistry(kvStore)
	if err != nil {
		slog.Error("Failed to compose API modules", "error", err)
		os.Exit(1)
	}
	if err := moduleRegistry.Mount(app, module.NoopJobRegistrar{}, module.NoopEventRegistrar{}); err != nil {
		slog.Error("Failed to mount API modules", "error", err)
		os.Exit(1)
	}

	slog.Info("Sirius API starting", "port", 9001, "log_level", os.Getenv("LOG_LEVEL"), "auth_required", true)
	app.Listen(":9001")
}

// requestLoggerMiddleware returns a Fiber middleware that logs HTTP requests
// at a level appropriate to the configured LOG_LEVEL:
//
//   - debug: logs every request
//   - info:  skips /health and routine polling endpoints (GET /host/, GET /host/statistics/*)
//   - warn:  only logs slow requests (>1s) or 4xx+ status codes
//   - error: only logs 5xx status codes
func requestLoggerMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		err := c.Next()

		latency := time.Since(start)
		status := c.Response().StatusCode()
		method := c.Method()
		path := c.Path()

		attrs := []any{
			"method", method,
			"path", path,
			"status", status,
			"latency", latency.String(),
		}

		// error level: only 5xx
		if status >= 500 {
			slog.Error("request", attrs...)
			return err
		}

		// warn level: 4xx or slow requests (>1s)
		if status >= 400 {
			slog.Warn("request", attrs...)
			return err
		}
		if latency > 1*time.Second {
			slog.Warn("slow request", attrs...)
			return err
		}

		// info level: skip health checks and high-frequency polling endpoints
		if isNoisyEndpoint(method, path) {
			slog.Debug("request", attrs...)
			return err
		}

		// Everything else at info
		slog.Info("request", attrs...)
		return err
	}
}

// isNoisyEndpoint returns true for endpoints that fire on a recurring polling
// interval and would flood the logs at info level.
func isNoisyEndpoint(method, path string) bool {
	if method != "GET" {
		return false
	}
	switch {
	case path == "/health":
		return true
	case path == "/host/" || path == "/host":
		return true
	case strings.HasPrefix(path, "/host/statistics/"):
		return true
	default:
		return false
	}
}
