package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/SiriusScan/sirius-api/middleware"
	"github.com/SiriusScan/sirius-api/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// waitForDatabase waits for PostgreSQL to be available before running migrations
func waitForDatabase() error {
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	if host == "" {
		host = "sirius-postgres"
	}
	if port == "" {
		port = "5432"
	}

	address := net.JoinHostPort(host, port)
	log.Printf("🔍 Waiting for database at %s...", address)

	for attempts := 0; attempts < 30; attempts++ {
		conn, err := net.DialTimeout("tcp", address, 3*time.Second)
		if err == nil {
			conn.Close()
			log.Printf("✅ Database is available at %s", address)
			return nil
		}
		log.Printf("⏳ Database not ready (attempt %d/30), retrying in 2s...", attempts+1)
		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("database not available after 30 attempts")
}

// runMigrations executes database migrations before starting the API
func runMigrations() error {
	log.Println("🔄 Running database migrations...")

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
		log.Println("⚠️  go-api not found, skipping migrations")
		return nil
	}

	migrationsPath := filepath.Join(goApiPath, "migrations")

	// Run migration 002_source_attribution (creates scan_history_entries table)
	migration002Path := filepath.Join(migrationsPath, "002_source_attribution", "main.go")
	if _, err := os.Stat(migration002Path); err == nil {
		log.Println("📋 Running 002_source_attribution migration...")
		cmd := exec.Command("go", "run", migration002Path)
		cmd.Dir = goApiPath
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			log.Printf("⚠️  Migration 002_source_attribution failed (may already be applied): %v", err)
		} else {
			log.Println("✅ Migration 002_source_attribution completed")
		}
	}

	// Run migration 004_add_sbom_schema if it exists
	migration004Path := filepath.Join(migrationsPath, "004_add_sbom_schema", "main.go")
	if _, err := os.Stat(migration004Path); err == nil {
		log.Println("📋 Running 004_add_sbom_schema migration...")
		cmd := exec.Command("go", "run", migration004Path)
		cmd.Dir = goApiPath
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			log.Printf("⚠️  Migration 004_add_sbom_schema failed (may already be applied): %v", err)
		} else {
			log.Println("✅ Migration 004_add_sbom_schema completed")
		}
	}

	log.Println("✅ Database migrations completed")
	return nil
}

func main() {
	// Initialize the logging SDK
	logging.Init()
	defer logging.Close()

	// Run database migrations before starting the API
	if err := runMigrations(); err != nil {
		log.Fatalf("❌ Failed to run migrations: %v", err)
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

	// Add Fiber logger middleware for standard endpoint logging
	app.Use(logger.New(logger.Config{
		Format:     "${time} ${status} - ${method} ${path} (${latency})\n",
		TimeFormat: "15:04:05",
		TimeZone:   "Local",
		Output:     os.Stdout,
	}))

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
	routes.SetupRoutes(
		app,
		&routes.HostRouteSetter{},
		&routes.AppRouteSetter{},
		vulnerabilityRouteSetter,
		templateRouteSetter,
		scriptRouteSetter,
		agentTemplateRepositoryRouteSetter, // Must be before agentTemplateRouteSetter to avoid :id matching
		agentTemplateRouteSetter,
		eventRouteSetter,        // Event routes for scan events
		snapshotRouteSetter,     // Snapshot and vulnerability trend routes
		statisticsRouteSetter,   // Statistics routes
	)

	log.Println("🚀 Sirius API starting on port 9001...")
	app.Listen(":9001")
}
