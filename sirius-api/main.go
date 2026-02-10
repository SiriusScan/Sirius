package main

import (
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/SiriusScan/go-api/sirius/slogger"
	"github.com/SiriusScan/sirius-api/middleware"
	"github.com/SiriusScan/sirius-api/routes"
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

// runMigrations executes database migrations before starting the API
func runMigrations() error {
	slog.Info("Running database migrations")

	// Wait for database to be available
	if err := waitForDatabase(); err != nil {
		return fmt.Errorf("database connectivity check failed: %w", err)
	}

	// Check if we're in development mode with volume mount
	var goApiPath string
	if _, err := os.Stat("/go-api"); err == nil {
		goApiPath = "/go-api"
	} else if _, err := os.Stat("../go-api"); err == nil {
		goApiPath = "../go-api"
	} else {
		slog.Warn("go-api not found, skipping migrations")
		return nil
	}

	migrationsPath := filepath.Join(goApiPath, "migrations")

	// Run migration 002_source_attribution (creates scan_history_entries table)
	migration002Path := filepath.Join(migrationsPath, "002_source_attribution", "main.go")
	if _, err := os.Stat(migration002Path); err == nil {
		slog.Info("Running migration", "name", "002_source_attribution")
		cmd := exec.Command("go", "run", migration002Path)
		cmd.Dir = goApiPath
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			slog.Warn("Migration failed (may already be applied)", "name", "002_source_attribution", "error", err)
		} else {
			slog.Info("Migration completed", "name", "002_source_attribution")
		}
	}

	// Run migration 004_add_sbom_schema if it exists
	migration004Path := filepath.Join(migrationsPath, "004_add_sbom_schema", "main.go")
	if _, err := os.Stat(migration004Path); err == nil {
		slog.Info("Running migration", "name", "004_add_sbom_schema")
		cmd := exec.Command("go", "run", migration004Path)
		cmd.Dir = goApiPath
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			slog.Warn("Migration failed (may already be applied)", "name", "004_add_sbom_schema", "error", err)
		} else {
			slog.Info("Migration completed", "name", "004_add_sbom_schema")
		}
	}

	slog.Info("Database migrations completed")
	return nil
}

func main() {
	// Initialize structured logging (reads LOG_LEVEL env var)
	slogger.Init()

	// Initialize the logging SDK
	logging.Init()
	defer logging.Close()

	// Run database migrations before starting the API
	if err := runMigrations(); err != nil {
		slog.Error("Failed to run migrations", "error", err)
		os.Exit(1)
	}

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

	// Add SDK-based logging middlewares
	app.Use(middleware.SDKLoggingMiddleware())
	app.Use(middleware.SDKErrorLoggingMiddleware())
	app.Use(middleware.SDKPerformanceMetricsMiddleware())

	vulnerabilityRouteSetter := &routes.VulnerabilityRouteSetter{}
	templateRouteSetter := &routes.TemplateRouteSetter{}
	scriptRouteSetter := &routes.ScriptRouteSetter{}
	agentTemplateRouteSetter := &routes.AgentTemplateRouteSetter{}
	agentTemplateRepositoryRouteSetter := &routes.AgentTemplateRepositoryRouteSetter{}
	eventRouteSetter := &routes.EventRouteSetter{}
	snapshotRouteSetter := &routes.SnapshotRouteSetter{}
	statisticsRouteSetter := &routes.StatisticsRoutes{}
	scanRouteSetter := &routes.ScanRouteSetter{}
	routes.SetupRoutes(
		app,
		&routes.HostRouteSetter{},
		&routes.AppRouteSetter{},
		vulnerabilityRouteSetter,
		templateRouteSetter,
		scriptRouteSetter,
		agentTemplateRepositoryRouteSetter, // Must be before agentTemplateRouteSetter to avoid :id matching
		agentTemplateRouteSetter,
		eventRouteSetter,      // Event routes for scan events
		snapshotRouteSetter,   // Snapshot and vulnerability trend routes
		statisticsRouteSetter, // Statistics routes
		scanRouteSetter,       // Scan control routes (cancel, status)
	)

	slog.Info("Sirius API starting", "port", 9001, "log_level", os.Getenv("LOG_LEVEL"))
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
