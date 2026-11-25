package main

import (
	"context"
	"log/slog"
	"net"
	"os"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/SiriusScan/go-api/sirius/module"
	"github.com/SiriusScan/go-api/sirius/slogger"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/sirius-api/internal/infraauth"
	"github.com/gofiber/fiber/v2"
)

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

	if err := prepareDatabase(context.Background()); err != nil {
		slog.Error("Failed to prepare database schema", "error", err)
		os.Exit(1)
	}

	// Initialize the logging SDK
	logging.Init()
	defer logging.Close()

	// Initialize Valkey store for dynamic API key management.
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		slog.Error("Failed to connect to Valkey", "error", err)
		os.Exit(1)
	}
	defer kvStore.Close()

	// Fiber's 4 MiB default is not sized for scan ingest and resets the
	// connection on vulnerability-rich /host/with-source reports. 16 MiB
	// gives ample headroom for large host reports without accepting
	// arbitrarily large bodies on every route.
	app := fiber.New(fiber.Config{
		BodyLimit: 16 * 1024 * 1024,
	})
	applyProductionHTTPMiddleware(app, kvStore, serviceAPIKey)

	moduleRegistry, err := buildModuleRegistry(kvStore)
	if err != nil {
		slog.Error("Failed to compose API modules", "error", err)
		os.Exit(1)
	}
	if err := moduleRegistry.Mount(app, module.NoopJobRegistrar{}, module.NoopEventRegistrar{}); err != nil {
		slog.Error("Failed to mount API modules", "error", err)
		os.Exit(1)
	}

	address := apiListenAddress(os.Getenv("API_HOST"), os.Getenv("API_PORT"))
	slog.Info("Sirius API starting", "address", address, "log_level", os.Getenv("LOG_LEVEL"), "auth_required", true)
	if err := app.Listen(address); err != nil {
		slog.Error("Sirius API stopped", "address", address, "error", err)
		os.Exit(1)
	}
}

func apiListenAddress(host, port string) string {
	port = strings.TrimSpace(port)
	if port == "" {
		port = "9001"
	}
	return net.JoinHostPort(strings.TrimSpace(host), port)
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
