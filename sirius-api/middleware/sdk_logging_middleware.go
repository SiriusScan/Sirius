package middleware

import (
	"fmt"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/gofiber/fiber/v2"
)

// SDKLoggingMiddleware creates a middleware for automatic API logging using the SDK
func SDKLoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		// Generate or get request ID
		requestID := c.Get("X-Request-ID")
		if requestID == "" {
			requestID = fmt.Sprintf("req_%d", time.Now().UnixNano())
			c.Set("X-Request-ID", requestID)
		}

		// Process request
		err := c.Next()

		// Calculate duration
		duration := time.Since(start)
		durationMs := duration.Milliseconds()

		// Only log meaningful events (errors or very slow requests)
		shouldLog := false
		if c.Response().StatusCode() >= 400 { // Log all errors
			shouldLog = true
		} else if durationMs > 5000 { // Only log very slow requests (5+ seconds)
			shouldLog = true
		}
		
		if shouldLog && !strings.Contains(c.Path(), "/api/v1/logs") {
			// Prepare metadata
			metadata := map[string]interface{}{
				"request_id":     requestID,
				"method":         c.Method(),
				"path":           c.Path(),
				"status_code":    c.Response().StatusCode(),
				"duration_ms":    durationMs,
				"remote_ip":      c.IP(),
				"user_agent":     c.Get("User-Agent"),
				"content_length": c.Get("Content-Length"),
				"response_size":  len(c.Response().Body()),
			}

			// Add request body for small requests
			if c.Body() != nil && len(c.Body()) < 1024 {
				metadata["request_body"] = string(c.Body())
			}

			// Prepare context
			context := map[string]interface{}{
				"endpoint": c.Path(),
				"method":   c.Method(),
			}

			// Determine log level
			level := logging.LogLevelInfo
			if c.Response().StatusCode() >= 500 {
				level = logging.LogLevelError
			} else if c.Response().StatusCode() >= 400 {
				level = logging.LogLevelWarn
			}

			// Create message
			message := fmt.Sprintf("%s %s - %d", c.Method(), c.Path(), c.Response().StatusCode())
			if err != nil {
				message = fmt.Sprintf("%s %s - %d (error: %v)", c.Method(), c.Path(), c.Response().StatusCode(), err)
			}

			// Log using SDK
			logging.Log("sirius-api", "http-middleware", level, message, metadata, context)
		}

		return err
	}
}

// SDKErrorLoggingMiddleware creates middleware for comprehensive error logging using the SDK
func SDKErrorLoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		err := c.Next()
		if err != nil {
			// Log the error using SDK
			requestID := c.Get("X-Request-ID")
			
			metadata := map[string]interface{}{
				"request_id": requestID,
				"method":     c.Method(),
				"path":       c.Path(),
			}

			errorDetails := logging.ErrorDetails{
				ErrorMessage: err.Error(),
				Source:       "http-middleware",
				Metadata:     metadata,
			}

			logging.LogError("sirius-api", "error-handler", err, errorDetails, metadata)
		}
		return err
	}
}

// SDKPerformanceMetricsMiddleware creates middleware for capturing performance metrics using the SDK
func SDKPerformanceMetricsMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start)

		// Only log performance for non-logging endpoints and slow requests
		if !strings.Contains(c.Path(), "/api/v1/logs") && duration.Milliseconds() > 1000 {
			requestID := c.Get("X-Request-ID")
			
			metadata := map[string]interface{}{
				"request_id":  requestID,
				"method":      c.Method(),
				"path":        c.Path(),
				"status_code": c.Response().StatusCode(),
			}

			performanceMetric := logging.PerformanceMetric{
				Duration: duration,
				Metadata: metadata,
			}

			logging.LogPerformanceMetric("sirius-api", "performance-monitor", performanceMetric, metadata)
		}
		return err
	}
}
