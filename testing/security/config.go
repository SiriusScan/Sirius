package main

import "os"

// Config holds all target addresses and credentials for the security test harness.
type Config struct {
	// Service endpoints
	APIURL          string // Go API base URL (default http://localhost:9001)
	UIURL           string // Next.js / tRPC base URL (default http://localhost:3000)
	GRPCAddr        string // gRPC agent address (default localhost:50051)
	ValkeyAddr      string // Valkey / Redis address (default localhost:6379)
	PostgresAddr    string // PostgreSQL address (default localhost:5432)
	RabbitMQAddr    string // RabbitMQ AMQP address (default localhost:5672)
	RabbitMQMgmt    string // RabbitMQ Management address (default localhost:15672)
	EngineHTTPAddr  string // Engine HTTP address (default localhost:5174)

	// Credentials
	APIKey string // A valid API key for positive tests (auto-generated if empty)

	// Flags
	NoColor bool // Disable ANSI color codes
	Verbose bool // Enable verbose output
}

// LoadConfig reads environment variables with sensible defaults.
func LoadConfig() *Config {
	return &Config{
		APIURL:         envOr("SIRIUS_API_URL", "http://localhost:9001"),
		UIURL:          envOr("SIRIUS_UI_URL", "http://localhost:3000"),
		GRPCAddr:       envOr("SIRIUS_GRPC_ADDR", "localhost:50051"),
		ValkeyAddr:     envOr("SIRIUS_VALKEY_ADDR", "localhost:6379"),
		PostgresAddr:   envOr("SIRIUS_POSTGRES_ADDR", "localhost:5432"),
		RabbitMQAddr:   envOr("SIRIUS_RABBITMQ_ADDR", "localhost:5672"),
		RabbitMQMgmt:   envOr("SIRIUS_RABBITMQ_MGMT_ADDR", "localhost:15672"),
		EngineHTTPAddr: envOr("SIRIUS_ENGINE_ADDR", "localhost:5174"),
		APIKey:         os.Getenv("SIRIUS_API_KEY"),
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
