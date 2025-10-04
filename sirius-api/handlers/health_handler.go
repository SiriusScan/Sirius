package handlers

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/SiriusScan/go-api/sirius/postgres"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Service   string    `json:"service"`
	Version   string    `json:"version"`
}

// SystemHealthResponse represents the comprehensive system health check response
type SystemHealthResponse struct {
	Status    string                 `json:"status"`
	Timestamp time.Time              `json:"timestamp"`
	Service   string                 `json:"service"`
	Version   string                 `json:"version"`
	Services  map[string]ServiceHealth `json:"services"`
	Overall   string                 `json:"overall"`
}

// ServiceHealth represents the health status of an individual service
type ServiceHealth struct {
	Status    string    `json:"status"`
	Message   string    `json:"message,omitempty"`
	Timestamp time.Time `json:"timestamp"`
	Port      int       `json:"port,omitempty"`
}

// HealthHandler handles the GET /health route
func HealthHandler(c *fiber.Ctx) error {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Service:   "sirius-api",
		Version:   "1.0.0",
	}

	return c.Status(200).JSON(response)
}

// SystemHealthHandler handles the GET /api/v1/system/health route
func SystemHealthHandler(c *fiber.Ctx) error {
	services := make(map[string]ServiceHealth)
	
	// Check UI service (self-check)
	uiHealth := checkUIService()
	services["sirius-ui"] = uiHealth
	
	// Check API service (self-check)
	apiHealth := checkAPIService()
	services["sirius-api"] = apiHealth
	
	// Check Engine service
	engineHealth := checkEngineService()
	services["sirius-engine"] = engineHealth
	
	// Check PostgreSQL
	postgresHealth := checkPostgreSQL()
	services["sirius-postgres"] = postgresHealth
	
	// Check Valkey
	valkeyHealth := checkValkey()
	services["sirius-valkey"] = valkeyHealth
	
	// Check RabbitMQ
	rabbitmqHealth := checkRabbitMQ()
	services["sirius-rabbitmq"] = rabbitmqHealth
	
	// Determine overall status
	overallStatus := "healthy"
	for _, service := range services {
		if service.Status == "down" {
			overallStatus = "degraded"
			break
		}
	}
	
	response := SystemHealthResponse{
		Status:    overallStatus,
		Timestamp: time.Now(),
		Service:   "sirius-api",
		Version:   "1.0.0",
		Services:  services,
		Overall:   overallStatus,
	}

	statusCode := 200
	if overallStatus == "degraded" {
		statusCode = 503
	}

	return c.Status(statusCode).JSON(response)
}

// checkUIService checks if the UI service is accessible
func checkUIService() ServiceHealth {
	// Try to connect to UI on port 3000 using container name
	conn, err := net.DialTimeout("tcp", "sirius-ui:3000", 2*time.Second)
	if err != nil {
		return ServiceHealth{
			Status:    "down",
			Message:   fmt.Sprintf("Cannot connect to UI: %v", err),
			Timestamp: time.Now(),
			Port:      3000,
		}
	}
	conn.Close()
	
	return ServiceHealth{
		Status:    "up",
		Message:   "UI service is accessible",
		Timestamp: time.Now(),
		Port:      3000,
	}
}

// checkAPIService performs a self-check of the API service
func checkAPIService() ServiceHealth {
	// This is a self-check, so we can assume it's healthy if we're responding
	return ServiceHealth{
		Status:    "up",
		Message:   "API service is running",
		Timestamp: time.Now(),
		Port:      9001,
	}
}

// checkEngineService checks if the Engine service is accessible via gRPC
func checkEngineService() ServiceHealth {
	// Try to connect to Engine gRPC port 50051
	conn, err := net.DialTimeout("tcp", "sirius-engine:50051", 2*time.Second)
	if err != nil {
		return ServiceHealth{
			Status:    "down",
			Message:   fmt.Sprintf("Cannot connect to Engine gRPC: %v", err),
			Timestamp: time.Now(),
			Port:      50051,
		}
	}
	conn.Close()
	
	return ServiceHealth{
		Status:    "up",
		Message:   "Engine gRPC service is accessible",
		Timestamp: time.Now(),
		Port:      50051,
	}
}

// checkPostgreSQL checks PostgreSQL connectivity
func checkPostgreSQL() ServiceHealth {
	// Use the existing database connection utility
	if postgres.IsConnected() {
		// Try a simple query to verify the connection is working
		db := postgres.GetDB()
		if db != nil {
			var result int
			err := db.Raw("SELECT 1").Scan(&result).Error
			if err != nil {
				return ServiceHealth{
					Status:    "down",
					Message:   fmt.Sprintf("Database query failed: %v", err),
					Timestamp: time.Now(),
					Port:      5432,
				}
			}
			
			return ServiceHealth{
				Status:    "up",
				Message:   "PostgreSQL is connected and responding",
				Timestamp: time.Now(),
				Port:      5432,
			}
		}
	}
	
	// If we get here, the database is not connected
	connErr := postgres.GetConnectionError()
	message := "PostgreSQL is not connected"
	if connErr != nil {
		message = fmt.Sprintf("PostgreSQL connection error: %v", connErr)
	}
	
	return ServiceHealth{
		Status:    "down",
		Message:   message,
		Timestamp: time.Now(),
		Port:      5432,
	}
}

// checkValkey checks Valkey/Redis connectivity
func checkValkey() ServiceHealth {
	// Create a new Valkey store connection for testing
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return ServiceHealth{
			Status:    "down",
			Message:   fmt.Sprintf("Cannot connect to Valkey: %v", err),
			Timestamp: time.Now(),
			Port:      6379,
		}
	}
	defer kvStore.Close()
	
	// Try a simple ping operation
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	
	// Try to set and get a test value
	testKey := "health-check-test"
	testValue := "ping"
	
	err = kvStore.SetValue(ctx, testKey, testValue)
	if err != nil {
		return ServiceHealth{
			Status:    "down",
			Message:   fmt.Sprintf("Valkey SET operation failed: %v", err),
			Timestamp: time.Now(),
			Port:      6379,
		}
	}
	
	// Clean up the test key
	kvStore.DeleteValue(ctx, testKey)
	
	return ServiceHealth{
		Status:    "up",
		Message:   "Valkey is connected and responding",
		Timestamp: time.Now(),
		Port:      6379,
	}
}

// checkRabbitMQ checks RabbitMQ connectivity
func checkRabbitMQ() ServiceHealth {
	// Try to connect to RabbitMQ on port 5672 using container name
	conn, err := net.DialTimeout("tcp", "sirius-rabbitmq:5672", 2*time.Second)
	if err != nil {
		return ServiceHealth{
			Status:    "down",
			Message:   fmt.Sprintf("Cannot connect to RabbitMQ: %v", err),
			Timestamp: time.Now(),
			Port:      5672,
		}
	}
	conn.Close()
	
	return ServiceHealth{
		Status:    "up",
		Message:   "RabbitMQ is accessible",
		Timestamp: time.Now(),
		Port:      5672,
	}
}
