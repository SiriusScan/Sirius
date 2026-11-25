package handlers

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log/slog"
	"strconv"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/queue"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

const (
	scanControlQueue          = "scan_control"
	cancelScanAction          = "cancel"
	forceStopScanAction       = "force_cancel"
	maxStopProjectionUpdates = 4
)

// ControlMessage represents a command for one scanner run.
type ControlMessage struct {
	Action    string `json:"action"`
	ScanID    string `json:"scan_id"`
	Timestamp string `json:"timestamp"`
}

type scanStopStore interface {
	GetValue(context.Context, string) (store.ValkeyResponse, error)
	store.ValueCompareAndSetter
}

type scanStopSnapshot struct {
	id     string
	status string
	raw    string
	fields map[string]json.RawMessage
}

// CancelScan handles the graceful cancel route. The response describes request
// publication and the dashboard projection. The worker settles execution.
func CancelScan(c *fiber.Ctx) error {
	return handleScanStop(c, cancelScanAction, store.NewValkeyStore, queue.Send)
}

// ForceStopScan sends the existing force-stop command and conditionally updates
// the dashboard. Publication is not an acknowledgement from the worker.
func ForceStopScan(c *fiber.Ctx) error {
	return handleScanStop(c, forceStopScanAction, store.NewValkeyStore, queue.Send)
}

func handleScanStop(c *fiber.Ctx, action string, openStore func() (store.KVStore, error), publish func(string, string) error) error {
	requestedID, err := parseScanStopID(c.Body())
	if err != nil {
		return scanStopError(c, fiber.StatusBadRequest, err.Error())
	}

	ctx := c.UserContext()
	kv, err := openStore()
	if err != nil {
		slog.Warn("Could not open scan control store")
		return scanStopError(c, fiber.StatusInternalServerError, "Failed to connect to store")
	}
	defer kv.Close()

	state, ok := kv.(scanStopStore)
	if !ok {
		return scanStopError(c, fiber.StatusInternalServerError, "Scan state does not support atomic updates")
	}
	current, err := loadScanStopState(ctx, state)
	force := action == forceStopScanAction
	switch {
	case err != nil && !errors.Is(err, store.ErrKeyNotFound):
		slog.Warn("Could not read scan state before stop request")
		return scanStopError(c, fiber.StatusInternalServerError, "Failed to get scan status")
	case errors.Is(err, store.ErrKeyNotFound), current.id == "", current.status == "idle":
		if force && requestedID == "" {
			return scanStopResponse(c, "idle", "No scan data found")
		}
		return scanStopError(c, fiber.StatusNotFound, "No scan is currently running")
	case requestedID != "" && requestedID != current.id:
		return scanStopError(c, fiber.StatusConflict, "The requested scan is no longer current")
	case scanStopTerminal(current.status):
		if force {
			return scanStopResponse(c, current.status, "Scan is already "+current.status)
		}
		return scanStopError(c, fiber.StatusBadRequest, "Scan is already "+current.status)
	}

	// Resolve omitted legacy IDs once. A delayed command keeps this ID even if
	// the currentScan slot changes before publication or delivery.
	when := time.Now().UTC().Format(time.RFC3339Nano)
	command, err := json.Marshal(ControlMessage{Action: action, ScanID: current.id, Timestamp: when})
	if err != nil {
		return scanStopError(c, fiber.StatusInternalServerError, "Failed to create scan stop command")
	}
	if err := publish(scanControlQueue, string(command)); err != nil {
		slog.Warn("Could not confirm scan stop publication", "action", action)
		return scanStopError(c, fiber.StatusInternalServerError, "Could not confirm whether the scan stop request was sent")
	}

	status, err := recordScanStop(ctx, state, current, force, time.Now().UTC().Format(time.RFC3339Nano))
	if err != nil {
		slog.Warn("Could not record scan stop request in dashboard state", "action", action)
	}
	switch status {
	case "cancelling":
		return scanStopResponse(c, status, "Cancel request sent")
	case "cancelled":
		return scanStopResponse(c, status, "Stop request sent. Dashboard status is cancelled.")
	case "completed", "failed":
		return scanStopResponse(c, status, "Stop request sent. Scan is already "+status+".")
	default:
		return scanStopResponse(c, "unconfirmed", "Stop request sent. Waiting for scanner confirmation.")
	}
}

func parseScanStopID(body []byte) (string, error) {
	if len(bytes.TrimSpace(body)) == 0 {
		return "", nil
	}
	var request *struct {
		ScanID json.RawMessage `json:"scan_id"`
	}
	if err := json.Unmarshal(body, &request); err != nil || request == nil {
		return "", errors.New("Expected a JSON object with an optional scan_id")
	}
	if len(request.ScanID) == 0 {
		return "", nil
	}
	var id string
	if err := json.Unmarshal(request.ScanID, &id); err != nil || strings.TrimSpace(id) == "" {
		return "", errors.New("scan_id must be a nonempty string")
	}
	return id, nil
}

func loadScanStopState(ctx context.Context, state scanStopStore) (scanStopSnapshot, error) {
	result, err := state.GetValue(ctx, currentScanKey)
	if err != nil {
		return scanStopSnapshot{}, err
	}
	current := scanStopSnapshot{raw: result.Message.Value}
	payload, err := base64.StdEncoding.DecodeString(current.raw)
	if err != nil {
		return scanStopSnapshot{}, err
	}
	if err := json.Unmarshal(payload, &current.fields); err != nil {
		return scanStopSnapshot{}, err
	}
	if current.fields == nil {
		return scanStopSnapshot{}, errors.New("scan state is null")
	}
	if id, ok := current.fields["id"]; ok {
		if err := json.Unmarshal(id, &current.id); err != nil {
			return scanStopSnapshot{}, err
		}
	}
	if err := json.Unmarshal(current.fields["status"], &current.status); err != nil {
		return scanStopSnapshot{}, err
	}
	if current.status == "" {
		return scanStopSnapshot{}, errors.New("scan state has no status")
	}
	return current, nil
}

func recordScanStop(ctx context.Context, state scanStopStore, current scanStopSnapshot, force bool, when string) (string, error) {
	id := current.id
	for attempt := 0; attempt < maxStopProjectionUpdates; attempt++ {
		if current.id != id || current.status == "idle" {
			return "", nil
		}
		if scanStopTerminal(current.status) || (!force && current.status == "cancelling") {
			return current.status, nil
		}

		status := "cancelling"
		if force {
			status = "cancelled"
			current.fields["end_time"] = json.RawMessage(strconv.Quote(when))
		}
		current.fields["status"] = json.RawMessage(strconv.Quote(status))
		payload, err := json.Marshal(current.fields)
		if err != nil {
			return "", err
		}
		swapped, err := state.CompareAndSetValue(ctx, currentScanKey, current.raw, base64.StdEncoding.EncodeToString(payload))
		if err != nil {
			return "", err
		}
		if swapped {
			return status, nil
		}

		current, err = loadScanStopState(ctx, state)
		if errors.Is(err, store.ErrKeyNotFound) {
			return "", nil
		}
		if err != nil {
			return "", err
		}
	}
	return "", errors.New("scan projection changed repeatedly")
}

func scanStopTerminal(status string) bool {
	return status == "completed" || status == "cancelled" || status == "failed"
}

func scanStopResponse(c *fiber.Ctx, status, message string) error {
	return c.JSON(fiber.Map{"success": true, "message": message, "status": status})
}

func scanStopError(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{"success": false, "error": message})
}
