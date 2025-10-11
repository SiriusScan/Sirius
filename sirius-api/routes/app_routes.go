// routes/app_routes.go
package routes

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/SiriusScan/sirius-api/services"
	"github.com/gofiber/fiber/v2"
)

type AppRouteSetter struct {
	dockerHandler        *handlers.DockerHandler
	valkeyMonitorService *services.ValkeyMonitorService
	rabbitMQService      *services.RabbitMQService
}

func (h *AppRouteSetter) SetupRoutes(app *fiber.App) {
	// Initialize Docker handler
	var err error
	h.dockerHandler, err = handlers.NewDockerHandler()
	if err != nil {
		fmt.Printf("Warning: Failed to initialize Docker handler: %v\n", err)
		fmt.Println("Falling back to mock data for Docker endpoints")
	}

	// Initialize Valkey monitor service
	h.valkeyMonitorService, err = services.NewValkeyMonitorService()
	if err != nil {
		fmt.Printf("Warning: Failed to initialize Valkey monitor service: %v\n", err)
		fmt.Println("Falling back to mock data for system monitoring endpoints")
	}

	// Initialize RabbitMQ service
	h.rabbitMQService, err = services.NewRabbitMQService()
	if err != nil {
		fmt.Printf("Warning: Failed to initialize RabbitMQ service: %v\n", err)
		fmt.Println("Admin commands will not be available")
	}
	// Health check route at root level
	app.Get("/health", handlers.HealthHandler)

	// System health check route
	app.Get("/api/v1/system/health", handlers.SystemHealthHandler)

	// Test route to verify route registration
	app.Get("/api/v1/test", func(c *fiber.Ctx) error {
		fmt.Println("🚀 Test endpoint called!")
		return c.JSON(fiber.Map{"message": "Test endpoint working"})
	})

	// Docker logs viewer route
	app.Get("/api/v1/system/logs", func(c *fiber.Ctx) error {

		containerName := c.Query("container", "all")
		linesStr := c.Query("lines", "100")
		lines, _ := strconv.Atoi(linesStr)

		if h.valkeyMonitorService != nil {
			// Use real Valkey integration
			logs, containerNames, err := h.valkeyMonitorService.GetDockerLogs(c.Context(), containerName, lines)
			if err != nil {
				fmt.Printf("Error getting Docker logs: %v\n", err)
				// Fall back to mock data on error
			} else {
				return c.JSON(fiber.Map{
					"message":   "Docker logs endpoint is working (real data)",
					"timestamp": time.Now(),
					"container": containerName,
					"lines":     linesStr,
					"logs":      logs,
					"summary": fiber.Map{
						"total_logs": len(logs),
						"containers": containerNames,
					},
				})
			}
		}

		// Fallback to mock data
		mockLogs := []fiber.Map{
			{
				"container": "sirius-api",
				"timestamp": time.Now().Add(-1 * time.Minute).Format("2006-01-02T15:04:05Z"),
				"level":     "INFO",
				"message":   "🚀 Sirius API starting on port 9001...",
			},
			{
				"container": "sirius-api",
				"timestamp": time.Now().Add(-2 * time.Minute).Format("2006-01-02T15:04:05Z"),
				"level":     "INFO",
				"message":   "✅ PostgreSQL database connection established",
			},
			{
				"container": "sirius-ui",
				"timestamp": time.Now().Add(-3 * time.Minute).Format("2006-01-02T15:04:05Z"),
				"level":     "INFO",
				"message":   "Ready - started server on 0.0.0.0:3000",
			},
			{
				"container": "sirius-engine",
				"timestamp": time.Now().Add(-4 * time.Minute).Format("2006-01-02T15:04:05Z"),
				"level":     "INFO",
				"message":   "Scanner service initialized successfully",
			},
			{
				"container": "sirius-postgres",
				"timestamp": time.Now().Add(-5 * time.Minute).Format("2006-01-02T15:04:05Z"),
				"level":     "INFO",
				"message":   "database system is ready to accept connections",
			},
		}

		// Filter logs by container if specified
		if containerName != "all" {
			filteredLogs := []fiber.Map{}
			for _, log := range mockLogs {
				if log["container"] == containerName {
					filteredLogs = append(filteredLogs, log)
				}
			}
			mockLogs = filteredLogs
		}

		return c.JSON(fiber.Map{
			"message":   "Docker logs endpoint is working (mock data)",
			"timestamp": time.Now(),
			"container": containerName,
			"lines":     lines,
			"logs":      mockLogs,
			"summary": fiber.Map{
				"total_logs": len(mockLogs),
				"containers": []string{"sirius-api", "sirius-ui", "sirius-engine", "sirius-postgres", "sirius-valkey", "sirius-rabbitmq"},
			},
		})
	})

	// System resource monitoring route
	app.Get("/api/v1/system/resources", func(c *fiber.Ctx) error {

		if h.valkeyMonitorService != nil {
			// Use real Valkey integration
			resources, summary, err := h.valkeyMonitorService.GetContainerResources(c.Context())
			if err != nil {
				fmt.Printf("Error getting container resources: %v\n", err)
				// Fall back to mock data on error
			} else {
				return c.JSON(fiber.Map{
					"message":    "System resource monitoring endpoint is working (real data)",
					"timestamp":  time.Now(),
					"containers": resources,
					"summary":    summary,
				})
			}
		}

		// Fallback to mock data
		return c.JSON(fiber.Map{
			"message":   "System resource monitoring endpoint is working (mock data)",
			"timestamp": time.Now(),
			"containers": []fiber.Map{
				{
					"name":           "sirius-api",
					"cpu_percent":    2.5,
					"memory_usage":   "45.2MB",
					"memory_percent": 1.2,
					"network_io":     "1.2kB / 856B",
					"block_io":       "0B / 0B",
					"status":         "running",
				},
				{
					"name":           "sirius-ui",
					"cpu_percent":    1.8,
					"memory_usage":   "128.5MB",
					"memory_percent": 3.4,
					"network_io":     "2.1kB / 1.2kB",
					"block_io":       "0B / 0B",
					"status":         "running",
				},
				{
					"name":           "sirius-engine",
					"cpu_percent":    0.5,
					"memory_usage":   "89.3MB",
					"memory_percent": 2.1,
					"network_io":     "856B / 432B",
					"block_io":       "0B / 0B",
					"status":         "running",
				},
				{
					"name":           "sirius-postgres",
					"cpu_percent":    0.2,
					"memory_usage":   "156.7MB",
					"memory_percent": 4.1,
					"network_io":     "3.2kB / 2.1kB",
					"block_io":       "1.2MB / 856kB",
					"status":         "running",
				},
				{
					"name":           "sirius-valkey",
					"cpu_percent":    0.1,
					"memory_usage":   "12.3MB",
					"memory_percent": 0.3,
					"network_io":     "432B / 256B",
					"block_io":       "0B / 0B",
					"status":         "running",
				},
				{
					"name":           "sirius-rabbitmq",
					"cpu_percent":    0.3,
					"memory_usage":   "67.8MB",
					"memory_percent": 1.8,
					"network_io":     "1.5kB / 1.1kB",
					"block_io":       "0B / 0B",
					"status":         "running",
				},
			},
			"summary": fiber.Map{
				"total_containers":     6,
				"running_containers":   6,
				"total_cpu_percent":    5.4,
				"total_memory_usage":   "499.8MB",
				"total_memory_percent": 13.1,
			},
		})
	})

	// Admin command route
	app.Post("/api/v1/admin/command", func(c *fiber.Ctx) error {

		var request struct {
			Action        string `json:"action"`
			ContainerName string `json:"container_name"`
		}

		if err := c.BodyParser(&request); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// Validate required fields
		if request.Action == "" || request.ContainerName == "" {
			return c.Status(400).JSON(fiber.Map{
				"error": "Missing required fields: action, container_name",
			})
		}

		// Generate request ID
		requestID := fmt.Sprintf("req_%d", time.Now().UnixNano())

		// Create admin command for RabbitMQ
		command := fiber.Map{
			"action":     request.Action,
			"target":     request.ContainerName,
			"timestamp":  time.Now(),
			"request_id": requestID,
		}

		// Marshal command to JSON
		commandJSON, err := json.Marshal(command)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to marshal command",
			})
		}

		// Publish command to RabbitMQ admin queue
		if h.rabbitMQService != nil {
			if err := h.rabbitMQService.PublishMessage("admin_commands", commandJSON); err != nil {
				return c.Status(500).JSON(fiber.Map{
					"error": "Failed to publish command to RabbitMQ",
				})
			}
		} else {
			return c.Status(500).JSON(fiber.Map{
				"error": "RabbitMQ service not available",
			})
		}

		return c.JSON(fiber.Map{
			"message":    "Admin command sent successfully",
			"request_id": requestID,
			"action":     request.Action,
			"container":  request.ContainerName,
			"timestamp":  time.Now(),
		})
	})

	// Performance metrics route (temporarily using health handler)
	app.Get("/api/v1/performance/metrics", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message":   "Performance metrics endpoint is working",
			"timestamp": time.Now(),
			"metrics": []fiber.Map{
				{
					"endpoint":    "/api/v1/system/health",
					"method":      "GET",
					"duration_ms": 15,
					"status_code": 200,
					"timestamp":   time.Now().Add(-1 * time.Minute),
				},
				{
					"endpoint":    "/api/v1/logs/stats",
					"method":      "GET",
					"duration_ms": 8,
					"status_code": 200,
					"timestamp":   time.Now().Add(-2 * time.Minute),
				},
			},
			"summary": fiber.Map{
				"total_requests":      2,
				"average_response_ms": 11.5,
				"error_rate":          0.0,
			},
		})
	})

	// Logging routes - specific routes first to avoid conflicts
	app.Get("/api/v1/logs/stats", handlers.LogStatsHandler)
	app.Delete("/api/v1/logs/clear", handlers.LogClearHandler)

	// Individual log operations (must come before general /api/v1/logs)
	app.Put("/api/v1/logs/:logId", handlers.LogUpdateHandler)
	app.Delete("/api/v1/logs/:logId", handlers.LogDeleteHandler)

	// General logging routes
	app.Post("/api/v1/logs", handlers.LogSubmissionHandler)
	app.Get("/api/v1/logs", handlers.LogRetrievalHandler)

	// App-specific routes
	appRoutes := app.Group("/app")
	appRoutes.Post("/:appName", handlers.AppHandler)
}
