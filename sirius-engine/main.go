package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
)

type Manifest struct {
	Services []string `json:"services"`
}

func loadManifest() Manifest {
	file, _ := os.ReadFile("./manifest.json")
	var manifest Manifest
	json.Unmarshal(file, &manifest)
	return manifest
}

func executeService(serviceName string) {
	cmd := exec.Command("./apps/bin/" + serviceName)
	err := cmd.Run()
	if err != nil {
		fmt.Printf("Error executing service %s: %s\n", serviceName, err)
	}
}

func main() {
	fmt.Println("Sirius Engine v3 is starting up...")

	// Load manifest.json
	manifest := loadManifest()

	// Always execute the core service first
	// executeService("core")

	// Execute other services
	for _, service := range manifest.Services {
		fmt.Printf("Starting service: %s\n", service)
		go executeService(service) // Run services concurrently
	}

	// TODO: Add logging, monitoring, and other functionalities

	fmt.Println("Sirius Engine is running...")
}
