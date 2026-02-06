package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/queue"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// ControlMessage represents a control command for the scanner
type ControlMessage struct {
	Action    string `json:"action"`    // Action to perform (e.g., "cancel")
	ScanID    string `json:"scan_id"`   // Optional: specific scan to cancel
	Timestamp string `json:"timestamp"` // When the command was issued
}

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

const (
	currentScanKey   = "currentScan"
	scanControlQueue = "scan_control"
)

// CancelScan handles the POST /api/v1/scans/cancel endpoint.
// It sends a cancel command to the scanner and updates the scan status.
func CancelScan(c *fiber.Ctx) error {
	ctx := context.Background()

	// Get the optional scan ID from request body
	var requestBody struct {
		ScanID string `json:"scan_id"`
	}
	// Ignore parsing errors - scan_id is optional
	_ = c.BodyParser(&requestBody)

	log.Printf("🛑 Received scan cancel request (scan_id: %s)", requestBody.ScanID)

	// First, update the scan status to "cancelling" in ValKey
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		log.Printf("Failed to connect to ValKey: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Get current scan to check if there's one running
	resp, err := kvStore.GetValue(ctx, currentScanKey)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "No scan is currently running",
			})
		}
		log.Printf("Failed to get current scan: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get scan status",
		})
	}

	// Decode base64-encoded scan result (UI stores it with btoa)
	rawValue := resp.Message.Value
	decodedBytes, err := base64.StdEncoding.DecodeString(rawValue)
	if err != nil {
		log.Printf("Failed to decode base64 scan result: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to decode scan status",
		})
	}

	// Parse current scan
	var scanResult map[string]interface{}
	if err := json.Unmarshal(decodedBytes, &scanResult); err != nil {
		log.Printf("Failed to parse scan result: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to parse scan status",
		})
	}

	// Check if scan is already completed or cancelled
	status, _ := scanResult["status"].(string)
	if status == "completed" || status == "cancelled" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Scan is already " + status,
		})
	}

	// Update status to "cancelling"
	scanResult["status"] = "cancelling"
	updatedJSON, err := json.Marshal(scanResult)
	if err != nil {
		log.Printf("Failed to marshal updated scan: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update scan status",
		})
	}

	// Encode back to base64 to maintain consistency with UI format
	encodedValue := base64.StdEncoding.EncodeToString(updatedJSON)

	if err := kvStore.SetValue(ctx, currentScanKey, encodedValue); err != nil {
		log.Printf("Failed to update scan status: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update scan status",
		})
	}

	// Send cancel command to scanner via RabbitMQ
	cancelCmd := ControlMessage{
		Action:    "cancel",
		ScanID:    requestBody.ScanID,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	cmdJSON, err := json.Marshal(cancelCmd)
	if err != nil {
		log.Printf("Failed to marshal cancel command: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create cancel command",
		})
	}

	if err := queue.Send(scanControlQueue, string(cmdJSON)); err != nil {
		log.Printf("Failed to send cancel command: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to send cancel command to scanner",
		})
	}

	log.Printf("✅ Cancel command sent successfully")

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Cancel request sent",
		"status":  "cancelling",
	})
}

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

// getStringField safely extracts a string field from a map
func getStringField(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}
