package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	port := os.Getenv("ENGINE_MAIN_PORT")
	if port == "" {
		port = "5174"
	}

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"healthy","service":"sirius-engine","timestamp":"%s","environment":"%s"}`,
			time.Now().Format(time.RFC3339), os.Getenv("GO_ENV"))
	})

	// Root endpoint
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{
			"service": "sirius-engine",
			"version": "1.0.0",
			"status": "running",
			"environment": "%s",
			"ports": {
				"http": "%s",
				"grpc": "%s"
			},
			"endpoints": [
				"/health",
				"/status",
				"/components"
			]
		}`, os.Getenv("GO_ENV"), port, os.Getenv("GRPC_AGENT_PORT"))
	})

	// Status endpoint with more details
	http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{
			"status": "operational",
			"uptime": "%s",
			"components": {
				"scanner": "available",
				"terminal": "available", 
				"agent": "available",
				"api": "connected"
			},
			"dependencies": {
				"postgres": "%s:%s",
				"rabbitmq": "%s",
				"valkey": "%s:%s"
			}
		}`, time.Since(time.Now()).String(),
			os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_PORT"),
			os.Getenv("RABBITMQ_URL"),
			os.Getenv("VALKEY_HOST"), os.Getenv("VALKEY_PORT"))
	})

	// Components endpoint
	http.HandleFunc("/components", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{
			"components": [
				{"name": "app-scanner", "status": "integrated", "path": "/app-scanner"},
				{"name": "app-terminal", "status": "integrated", "path": "/app-terminal"},
				{"name": "app-agent", "status": "integrated", "path": "/app-agent"},
				{"name": "go-api", "status": "integrated", "path": "/go-api"},
				{"name": "sirius-nse", "status": "integrated", "path": "/sirius-nse"}
			]
		}`)
	})

	fmt.Printf("🚀 Sirius Engine starting on port %s...\n", port)
	fmt.Printf("🔗 Health check: http://localhost:%s/health\n", port)
	fmt.Printf("📊 Status: http://localhost:%s/status\n", port)
	fmt.Printf("🧩 Components: http://localhost:%s/components\n", port)

	log.Fatal(http.ListenAndServe(":"+port, nil))
}
