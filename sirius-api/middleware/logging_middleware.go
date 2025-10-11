package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// LoggingMiddleware creates a middleware for automatic API logging
func LoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		// Generate or get request ID
		requestID := c.Get("X-Request-ID")
		if requestID == "" {
			requestID = fmt.Sprintf("req_%d", time.Now().UnixNano())
			c.Set("X-Request-ID", requestID)
		}

		// Capture request body for logging (if not too large)
		var requestBody string
		if c.Body() != nil && len(c.Body()) < 1024 { // Only log small bodies
			requestBody = string(c.Body())
		}

		// Process request
		err := c.Next()

		// Calculate duration
		duration := time.Since(start)
		durationMs := duration.Milliseconds()

		// Prepare log entry
		logEntry := map[string]interface{}{
			"service":      "sirius-api",
			"subcomponent": "http-middleware",
			"level":        getLogLevel(c.Response().StatusCode(), err),
			"message":      fmt.Sprintf("%s %s - %d", c.Method(), c.Path(), c.Response().StatusCode()),
			"metadata": map[string]interface{}{
				"request_id":     requestID,
				"method":         c.Method(),
				"path":           c.Path(),
				"status_code":    c.Response().StatusCode(),
				"duration_ms":    durationMs,
				"user_agent":     c.Get("User-Agent"),
				"remote_ip":      c.IP(),
				"content_length": c.Get("Content-Length"),
			},
			"context": map[string]interface{}{
				"endpoint": c.Path(),
				"method":   c.Method(),
			},
		}

		// Add request body if available
		if requestBody != "" {
			logEntry["metadata"].(map[string]interface{})["request_body"] = requestBody
		}

		// Add error details if present
		if err != nil {
			logEntry["metadata"].(map[string]interface{})["error"] = err.Error()
		}

		// Add response size
		responseSize := len(c.Response().Body())
		logEntry["metadata"].(map[string]interface{})["response_size"] = responseSize

		// Submit log entry only for meaningful business events and errors
		shouldLog := false
		if c.Response().StatusCode() >= 400 { // Log all errors
			shouldLog = true
		} else if durationMs > 5000 { // Only log very slow requests (5+ seconds)
			shouldLog = true
		}
		
		if shouldLog && !strings.Contains(c.Path(), "/api/v1/logs") {
			go submitLogEntry(logEntry)
		}


		return err
	}
}

// getLogLevel determines the appropriate log level based on status code and error
func getLogLevel(statusCode int, err error) string {
	if err != nil {
		return "error"
	}
	
	switch {
	case statusCode >= 500:
		return "error"
	case statusCode >= 400:
		return "warn"
	case statusCode >= 200:
		return "info"
	default:
		return "debug"
	}
}

// submitLogEntry submits a log entry to the logging system
func submitLogEntry(logEntry map[string]interface{}) {
	// Serialize the log entry
	body, err := json.Marshal(logEntry)
	if err != nil {
		fmt.Printf("Failed to marshal log entry: %v\n", err)
		return
	}
	
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 2 * time.Second,
	}
	
	// Create request to our logging endpoint
	req, err := http.NewRequest("POST", "http://localhost:9001/api/v1/logs", bytes.NewBuffer(body))
	if err != nil {
		fmt.Printf("Failed to create log request: %v\n", err)
		return
	}
	
	req.Header.Set("Content-Type", "application/json")
	
	// Send request asynchronously to avoid blocking
	go func() {
		resp, err := client.Do(req)
		if err != nil {
			// Silently fail to avoid log spam
			return
		}
		defer resp.Body.Close()
		
		// Only log errors for debugging
		if resp.StatusCode >= 400 {
			fmt.Printf("Log submission failed with status %d\n", resp.StatusCode)
		}
	}()
}

// ErrorLoggingMiddleware creates middleware for comprehensive error logging
func ErrorLoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		err := c.Next()
		
		if err != nil {
			// Log detailed error information
			errorLogEntry := map[string]interface{}{
				"service":      "sirius-api",
				"subcomponent": "error-handler",
				"level":        "error",
				"message":      fmt.Sprintf("Request failed: %s %s - %v", c.Method(), c.Path(), err),
				"metadata": map[string]interface{}{
					"request_id": c.Get("X-Request-ID"),
					"method":     c.Method(),
					"path":       c.Path(),
					"error":      err.Error(),
					"user_agent": c.Get("User-Agent"),
					"remote_ip":  c.IP(),
				},
				"context": map[string]interface{}{
					"endpoint": c.Path(),
					"method":   c.Method(),
					"type":     "request_error",
				},
			}
			
			go submitLogEntry(errorLogEntry)
		}
		
		return err
	}
}

// PerformanceMetricsMiddleware tracks performance metrics
func PerformanceMetricsMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		err := c.Next()
		
		duration := time.Since(start)
		
		// Track performance metrics
		metrics := map[string]interface{}{
			"service":      "sirius-api",
			"subcomponent": "performance-metrics",
			"level":        "info",
			"message":      fmt.Sprintf("Performance metrics: %s %s", c.Method(), c.Path()),
			"metadata": map[string]interface{}{
				"request_id":     c.Get("X-Request-ID"),
				"method":         c.Method(),
				"path":           c.Path(),
				"duration_ms":    duration.Milliseconds(),
				"status_code":    c.Response().StatusCode(),
				"response_size":  len(c.Response().Body()),
				"timestamp":      time.Now().Unix(),
			},
			"context": map[string]interface{}{
				"endpoint": c.Path(),
				"method":   c.Method(),
				"type":     "performance_metrics",
			},
		}
		
		// Only log performance metrics for non-health-check endpoints to avoid spam
		if !strings.Contains(c.Path(), "/health") && !strings.Contains(c.Path(), "/api/v1/logs") {
			go submitLogEntry(metrics)
		}
		
		return err
	}
}
