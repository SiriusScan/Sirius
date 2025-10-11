package handlers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/SiriusScan/sirius-api/services"
	"github.com/gofiber/fiber/v2"
)

// DockerHandler handles Docker-related API endpoints
type DockerHandler struct {
	dockerService *services.DockerService
}

// NewDockerHandler creates a new Docker handler
func NewDockerHandler() (*DockerHandler, error) {
	dockerService, err := services.NewDockerService()
	if err != nil {
		return nil, fmt.Errorf("failed to create Docker service: %w", err)
	}

	return &DockerHandler{
		dockerService: dockerService,
	}, nil
}

// SystemResourcesHandler handles system resource monitoring
func (h *DockerHandler) SystemResourcesHandler(c *fiber.Ctx) error {
	ctx := context.Background()

	// Get container resources from Docker
	resources, summary, err := h.dockerService.GetContainerResources(ctx)
	if err != nil {
		// Return error response
		return c.Status(500).JSON(fiber.Map{
			"error":     "Failed to retrieve system resources",
			"message":   err.Error(),
			"timestamp": time.Now(),
		})
	}

	// Return successful response
	return c.JSON(fiber.Map{
		"message":    "System resource monitoring endpoint is working",
		"timestamp":  time.Now(),
		"containers": resources,
		"summary":    summary,
	})
}

// DockerLogsHandler handles Docker logs retrieval
func (h *DockerHandler) DockerLogsHandler(c *fiber.Ctx) error {
	ctx := context.Background()

	// Get query parameters
	containerName := c.Query("container", "all")
	linesStr := c.Query("lines", "100")

	// Parse lines parameter
	lines, err := strconv.Atoi(linesStr)
	if err != nil {
		lines = 100 // Default to 100 lines
	}

	// Get container logs from Docker
	logs, containerNames, err := h.dockerService.GetContainerLogs(ctx, containerName, lines)
	if err != nil {
		// Return error response
		return c.Status(500).JSON(fiber.Map{
			"error":     "Failed to retrieve Docker logs",
			"message":   err.Error(),
			"timestamp": time.Now(),
		})
	}

	// Return successful response
	return c.JSON(fiber.Map{
		"message":   "Docker logs endpoint is working",
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
