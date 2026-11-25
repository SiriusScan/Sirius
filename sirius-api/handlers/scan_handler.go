package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"log/slog"
	"strings"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// ScanStatusResponse represents the current scan status
type ScanStatusResponse struct {
	ID              string   `json:"id,omitempty"`
	Status          string   `json:"status"`
	Targets         []string `json:"targets,omitempty"`
	Hosts           []string `json:"hosts,omitempty"`
	HostsCompleted  int      `json:"hosts_completed"`
	TotalHosts      int      `json:"total_hosts"`
	Vulnerabilities int      `json:"vulnerabilities"`
	StartTime       string   `json:"start_time,omitempty"`
	EndTime         string   `json:"end_time,omitempty"`
}

const currentScanKey = "currentScan"

// GetScanStatus handles the GET /api/v1/scans/status endpoint.
// It returns the current scan status from ValKey.
func GetScanStatus(c *fiber.Ctx) error {
	ctx := context.Background()

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	resp, err := kvStore.GetValue(ctx, currentScanKey)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.JSON(ScanStatusResponse{
				Status: "idle",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get scan status",
		})
	}

	// Decode base64-encoded scan result (UI stores it with btoa)
	decodedBytes, err := base64.StdEncoding.DecodeString(resp.Message.Value)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to decode scan status",
		})
	}

	// Parse and return the scan status
	var scanResult map[string]interface{}
	if err := json.Unmarshal(decodedBytes, &scanResult); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse scan status",
		})
	}

	// Build response
	response := ScanStatusResponse{
		Status: getStringField(scanResult, "status"),
	}
	if response.Status == "pending" {
		subScans, _ := scanResult["sub_scans"].(map[string]interface{})
		network, _ := subScans["network"].(map[string]interface{})
		if network["enabled"] == true && network["status"] == "running" {
			response.Status = "running"
		}
	}

	// Add optional fields if present
	if id, ok := scanResult["id"].(string); ok {
		response.ID = id
	}
	if hosts, ok := scanResult["hosts"].([]interface{}); ok {
		response.TotalHosts = len(hosts)
		for _, h := range hosts {
			if s, ok := h.(string); ok {
				response.Hosts = append(response.Hosts, s)
			}
		}
	}
	if completed, ok := scanResult["hosts_completed"].(float64); ok {
		response.HostsCompleted = int(completed)
	}
	if vulns, ok := scanResult["vulnerabilities"].([]interface{}); ok {
		response.Vulnerabilities = len(vulns)
	}
	if startTime, ok := scanResult["start_time"].(string); ok {
		response.StartTime = startTime
	}
	if endTime, ok := scanResult["end_time"].(string); ok {
		response.EndTime = endTime
	}

	return c.JSON(response)
}

// ResetScanState handles the POST /api/v1/scans/reset endpoint.
// This is the Tier 3 last-resort: it deletes the currentScan key from ValKey
// entirely, resetting the dashboard to an idle state. No RabbitMQ interaction.
func ResetScanState(c *fiber.Ctx) error {
	ctx := context.Background()

	slog.Warn("Received scan state RESET request")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		slog.Error("Failed to connect to ValKey", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Delete the currentScan key entirely
	if err := kvStore.DeleteValue(ctx, currentScanKey); err != nil {
		// If key doesn't exist, that's fine
		if !strings.Contains(err.Error(), "not found") {
			slog.Warn("Failed to delete currentScan key", "error", err)
			// Fall through - try to set it to empty state instead
		}
	}

	slog.Info("Scan state reset - dashboard cleared")

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Scan state reset",
		"status":  "idle",
	})
}

// getStringField safely extracts a string field from a map
func getStringField(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}
