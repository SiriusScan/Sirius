package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"log/slog"
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

// scanHandler keeps external I/O injectable without mutable package-level test hooks.
type scanHandler struct {
	newStore func() (store.KVStore, error)
	send     func(string, string) error
}

func defaultScanHandler() scanHandler {
	return scanHandler{newStore: store.NewValkeyStore, send: queue.Send}
}

// CancelScan handles the POST /api/v1/scans/cancel endpoint.
// It sends a cancel command to the scanner and updates the scan status.
func CancelScan(c *fiber.Ctx) error {
	return defaultScanHandler().CancelScan(c)
}

func (h scanHandler) CancelScan(c *fiber.Ctx) error {
	ctx := context.Background()

	// Get the optional scan ID from request body
	var requestBody struct {
		ScanID string `json:"scan_id"`
	}
	// An absent body is valid; an invalid supplied body must never become a global cancel.
	if len(c.Body()) > 0 {
		if err := c.BodyParser(&requestBody); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Invalid scan cancellation request"})
		}
	}

	slog.Info("Received scan cancel request", "scan_id", requestBody.ScanID)

	// Load the current scan before issuing any control command.
	kvStore, err := h.newStore()
	if err != nil {
		slog.Error("Failed to connect to ValKey", "error", err)
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
		slog.Error("Failed to get current scan", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get scan status",
		})
	}

	// Decode base64-encoded scan result (UI stores it with btoa)
	rawValue := resp.Message.Value
	decodedBytes, err := base64.StdEncoding.DecodeString(rawValue)
	if err != nil {
		slog.Error("Failed to decode base64 scan result", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to decode scan status",
		})
	}

	// Parse current scan
	var scanResult map[string]interface{}
	if err := json.Unmarshal(decodedBytes, &scanResult); err != nil || scanResult == nil {
		slog.Error("Failed to parse scan result", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to parse scan status",
		})
	}

	// Validate the target before publishing commands or changing dashboard state.
	currentID := getStringField(scanResult, "id")
	if requestBody.ScanID != "" && requestBody.ScanID != currentID {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"success": false, "error": "Requested scan is not the current scan"})
	}
	if currentID == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Current scan has no valid ID"})
	}
	requestBody.ScanID = currentID

	// Check if scan is already completed or cancelled
	status, _ := scanResult["status"].(string)
	if scanIsTerminal(status) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Scan is already " + status,
		})
	}

	cas, ok := kvStore.(store.ValueCompareAndSetter)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Store does not support atomic scan updates"})
	}

	// Send cancel command to scanner via RabbitMQ
	cancelCmd := ControlMessage{
		Action:    "cancel",
		ScanID:    requestBody.ScanID,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	cmdJSON, err := json.Marshal(cancelCmd)
	if err != nil {
		slog.Error("Failed to marshal cancel command", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create cancel command",
		})
	}

	if err := h.send(scanControlQueue, string(cmdJSON)); err != nil {
		slog.Error("Failed to send cancel command", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to send cancel command to scanner",
		})
	}

	finalStatus, updateErr := updateScanControlState(ctx, kvStore, cas, resp.Message.Value, currentID, "cancelling")
	if updateErr != nil {
		return c.Status(updateErr.Code).JSON(fiber.Map{"success": false, "error": updateErr.Message, "command_sent": true})
	}
	message := "Cancel request sent"
	if scanIsTerminal(finalStatus) {
		message = "Scan is already " + finalStatus
	}
	return c.JSON(fiber.Map{"success": true, "message": message, "status": finalStatus})
}

// GetScanStatus handles the GET /api/v1/scans/status endpoint.
// It returns the current scan status from ValKey.
func GetScanStatus(c *fiber.Ctx) error {
	return defaultScanHandler().GetScanStatus(c)
}

func (h scanHandler) GetScanStatus(c *fiber.Ctx) error {
	ctx := context.Background()

	kvStore, err := h.newStore()
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
	if err := json.Unmarshal(decodedBytes, &scanResult); err != nil || scanResult == nil {
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
			switch host := h.(type) {
			case string: // Legacy scan records stored plain IP strings.
				response.Hosts = append(response.Hosts, host)
			case map[string]interface{}:
				if ip := getStringField(host, "ip"); ip != "" {
					response.Hosts = append(response.Hosts, ip)
				}
			}
		}
	}
	if targets, ok := scanResult["targets"].([]interface{}); ok {
		for _, target := range targets {
			if target, ok := target.(string); ok {
				response.Targets = append(response.Targets, target)
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

// ForceStopScan handles the POST /api/v1/scans/force-stop endpoint.
// It forcefully stops the scan by sending a force_cancel command to the scanner
// AND directly setting the scan status to "cancelled" in ValKey (does not wait
// for scanner acknowledgement). This is the Tier 2 escalation when graceful
// stop fails.
func ForceStopScan(c *fiber.Ctx) error {
	return defaultScanHandler().ForceStopScan(c)
}

func (h scanHandler) ForceStopScan(c *fiber.Ctx) error {
	ctx := context.Background()

	var requestBody struct {
		ScanID string `json:"scan_id"`
	}
	if len(c.Body()) > 0 {
		if err := c.BodyParser(&requestBody); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Invalid scan cancellation request"})
		}
	}

	slog.Warn("Received FORCE STOP request", "scan_id", requestBody.ScanID)

	kvStore, err := h.newStore()
	if err != nil {
		slog.Error("Failed to connect to ValKey", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to connect to store",
		})
	}
	defer kvStore.Close()

	// Directly update ValKey to "cancelled" regardless of scanner response
	resp, err := kvStore.GetValue(ctx, currentScanKey)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusOK).JSON(fiber.Map{
				"success": true,
				"message": "No scan data found - already clean",
				"status":  "idle",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get scan status",
		})
	}

	decodedBytes, err := base64.StdEncoding.DecodeString(resp.Message.Value)
	if err != nil {
		slog.Error("Failed to decode scan result during force stop", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to decode scan status",
		})
	}

	var scanResult map[string]interface{}
	if err := json.Unmarshal(decodedBytes, &scanResult); err != nil || scanResult == nil {
		slog.Error("Failed to parse scan result during force stop", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to parse scan status",
		})
	}

	// Validate the target before publishing commands or changing dashboard state.
	currentID := getStringField(scanResult, "id")
	if requestBody.ScanID != "" && requestBody.ScanID != currentID {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"success": false, "error": "Requested scan is not the current scan"})
	}
	if currentID == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Current scan has no valid ID"})
	}
	requestBody.ScanID = currentID

	if status := getStringField(scanResult, "status"); scanIsTerminal(status) {
		return c.JSON(fiber.Map{"success": true, "message": "Scan is already " + status, "status": status})
	}

	cas, ok := kvStore.(store.ValueCompareAndSetter)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Store does not support atomic scan updates"})
	}

	// Best-effort: send force_cancel command to scanner via RabbitMQ
	forceCmd := ControlMessage{
		Action:    "force_cancel",
		ScanID:    requestBody.ScanID,
		Timestamp: time.Now().Format(time.RFC3339),
	}
	commandSent := false
	cmdJSON, err := json.Marshal(forceCmd)
	if err == nil {
		if sendErr := h.send(scanControlQueue, string(cmdJSON)); sendErr != nil {
			slog.Warn("Failed to send force_cancel command (scanner may be unresponsive)", "error", sendErr)
			// Continue anyway - we'll update ValKey directly
		} else {
			commandSent = true
			slog.Info("Force cancel command sent to scanner")
		}
	}

	finalStatus, updateErr := updateScanControlState(ctx, kvStore, cas, resp.Message.Value, currentID, "cancelled")
	if updateErr != nil {
		return c.Status(updateErr.Code).JSON(fiber.Map{"success": false, "error": updateErr.Message, "command_sent": commandSent})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Scan status is " + finalStatus, "status": finalStatus})
}

// ResetScanState handles the POST /api/v1/scans/reset endpoint.
// This is the Tier 3 last-resort: it deletes the currentScan key from ValKey
// entirely, resetting the dashboard to an idle state. No RabbitMQ interaction.
func ResetScanState(c *fiber.Ctx) error {
	return defaultScanHandler().ResetScanState(c)
}

func (h scanHandler) ResetScanState(c *fiber.Ctx) error {
	ctx := context.Background()

	slog.Warn("Received scan state RESET request")

	kvStore, err := h.newStore()
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
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to reset scan state",
			})
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

const scanControlUpdateAttempts = 5

func scanIsTerminal(status string) bool {
	return status == "completed" || status == "cancelled" || status == "failed"
}

// updateScanControlState reapplies only the status transition to the latest
// snapshot. Exact-value CAS preserves concurrent progress and prevents an old
// control request from overwriting a new scan or a terminal result.
func updateScanControlState(ctx context.Context, kv store.KVStore, cas store.ValueCompareAndSetter, raw, scanID, desired string) (string, *fiber.Error) {
	for attempt := 0; attempt < scanControlUpdateAttempts; attempt++ {
		decoded, err := base64.StdEncoding.DecodeString(raw)
		if err != nil {
			return "", fiber.NewError(500, "Failed to decode scan status")
		}
		var state map[string]interface{}
		if err := json.Unmarshal(decoded, &state); err != nil || state == nil {
			return "", fiber.NewError(500, "Failed to parse scan status")
		}
		if getStringField(state, "id") != scanID {
			return "", fiber.NewError(409, "Current scan changed; no scan state was overwritten")
		}
		status := getStringField(state, "status")
		if scanIsTerminal(status) || status == desired {
			return status, nil
		}
		state["status"] = desired
		if desired == "cancelled" {
			state["end_time"] = time.Now().Format(time.RFC3339)
		}
		encoded, err := json.Marshal(state)
		if err != nil {
			return "", fiber.NewError(500, "Failed to encode scan status")
		}
		updated, err := cas.CompareAndSetValue(ctx, currentScanKey, raw, base64.StdEncoding.EncodeToString(encoded))
		if err != nil {
			return "", fiber.NewError(500, "Failed to update scan status")
		}
		if updated {
			return desired, nil
		}
		if attempt+1 == scanControlUpdateAttempts {
			break
		}
		latest, err := kv.GetValue(ctx, currentScanKey)
		if err != nil {
			if strings.Contains(err.Error(), "not found") {
				return "", fiber.NewError(409, "Current scan was removed; no scan state was recreated")
			}
			return "", fiber.NewError(500, "Failed to reload scan status")
		}
		raw = latest.Message.Value
	}
	return "", fiber.NewError(409, "Scan status kept changing; retry the request")
}
