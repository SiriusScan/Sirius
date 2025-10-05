package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// Use the SDK LogEntry type
type LogEntry = logging.LogEntry

// LogSubmissionRequest represents the request to submit a log entry
type LogSubmissionRequest struct {
	Service      string                 `json:"service" validate:"required"`
	Subcomponent string                 `json:"subcomponent,omitempty"`
	Level        string                 `json:"level" validate:"required,oneof=debug info warn error"`
	Message      string                 `json:"message" validate:"required"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
	Context      map[string]interface{} `json:"context,omitempty"`
}

// LogRetrievalRequest represents the request to retrieve logs
type LogRetrievalRequest struct {
	Service      string `json:"service,omitempty"`
	Level        string `json:"level,omitempty"`
	Subcomponent string `json:"subcomponent,omitempty"`
	Limit        int    `json:"limit,omitempty"`
	Offset       int    `json:"offset,omitempty"`
	Search       string `json:"search,omitempty"`
}

// LogRetrievalResponse represents the response for log retrieval
type LogRetrievalResponse struct {
	Logs   []LogEntry `json:"logs"`
	Total  int        `json:"total"`
	Limit  int        `json:"limit"`
	Offset int        `json:"offset"`
}

// LogStatsResponse represents log statistics
type LogStatsResponse struct {
	TotalLogs    int            `json:"total_logs"`
	ServiceStats map[string]int `json:"service_stats"`
	LevelStats   map[string]int `json:"level_stats"`
	RecentLogs   []LogEntry     `json:"recent_logs"`
}

const (
	MAX_LOGS   = 1000 // Maximum number of logs to keep (focused on meaningful events)
	LOG_PREFIX = "logs"
)

// LogSubmissionHandler handles log submission requests
func LogSubmissionHandler(c *fiber.Ctx) error {
	var req LogSubmissionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request body",
			"details": err.Error(),
		})
	}

	// Validate required fields
	if req.Service == "" || req.Level == "" || req.Message == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Missing required fields: service, level, message",
		})
	}

	// Validate log level using SDK
	if !logging.IsValidLogLevel(req.Level) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid log level. Must be one of: debug, info, warn, error",
		})
	}

	// Create log entry using SDK types
	logEntry := LogEntry{
		ID:           generateLogID(),
		Timestamp:    time.Now(),
		Service:      req.Service,
		Subcomponent: req.Subcomponent,
		Level:        logging.GetLogLevelFromString(req.Level),
		Message:      req.Message,
		Metadata:     req.Metadata,
		Context:      req.Context,
	}

	// Store log entry
	if err := storeLogEntry(logEntry); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to store log entry",
			"details": err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Log entry stored successfully",
		"log_id":  logEntry.ID,
	})
}

// LogRetrievalHandler handles log retrieval requests
func LogRetrievalHandler(c *fiber.Ctx) error {
	var req LogRetrievalRequest

	// Parse query parameters
	req.Service = c.Query("service", "")
	req.Level = c.Query("level", "")
	req.Subcomponent = c.Query("subcomponent", "")
	req.Search = c.Query("search", "")

	// Parse limit and offset with defaults
	limitStr := c.Query("limit", "100")
	offsetStr := c.Query("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000 // Cap at 1000
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	req.Limit = limit
	req.Offset = offset

	// Retrieve logs
	logs, total, err := retrieveLogs(req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to retrieve logs",
			"details": err.Error(),
		})
	}

	response := LogRetrievalResponse{
		Logs:   logs,
		Total:  total,
		Limit:  req.Limit,
		Offset: req.Offset,
	}

	return c.JSON(response)
}

// LogClearHandler handles clearing all logs
func LogClearHandler(c *fiber.Ctx) error {
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Failed to connect to Valkey: %v", err)})
	}
	defer kvStore.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get all log keys
	keys, err := kvStore.ListKeys(ctx, LOG_PREFIX+":*")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Failed to list log keys: %v", err)})
	}

	// Delete all log keys
	deletedCount := 0
	for _, key := range keys {
		if err := kvStore.DeleteValue(ctx, key); err == nil {
			deletedCount++
		}
	}

	return c.JSON(fiber.Map{
		"message": "Logs cleared successfully",
		"deleted_count": deletedCount,
	})
}

// LogStatsHandler provides log statistics
func LogStatsHandler(c *fiber.Ctx) error {
	stats, err := getLogStats()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to retrieve log statistics",
			"details": err.Error(),
		})
	}

	return c.JSON(stats)
}

// generateLogID creates a unique log ID
func generateLogID() string {
	timestamp := time.Now().Format("20060102_150405")
	nanos := time.Now().Nanosecond()
	return fmt.Sprintf("log_%s_%06d", timestamp, nanos%1000000)
}

// storeLogEntry stores a log entry in Valkey
func storeLogEntry(logEntry LogEntry) error {
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return fmt.Errorf("failed to create valkey store: %w", err)
	}
	defer kvStore.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Serialize log entry
	data, err := json.Marshal(logEntry)
	if err != nil {
		return fmt.Errorf("failed to marshal log entry: %w", err)
	}

	// Create key with timestamp for sorting
	key := fmt.Sprintf("%s:%s:%d:%s", LOG_PREFIX, logEntry.Service, logEntry.Timestamp.Unix(), logEntry.ID)

	// Store the log entry
	if err := kvStore.SetValue(ctx, key, string(data)); err != nil {
		return fmt.Errorf("failed to store log entry: %w", err)
	}

	// Maintain log count and cleanup old logs (only occasionally to avoid performance impact)
	// Only run maintenance every 10th log entry to reduce overhead
	if time.Now().Unix()%10 == 0 {
		if err := maintainLogCount(ctx, kvStore); err != nil {
			// Log the error but don't fail the request
			fmt.Printf("Warning: Failed to maintain log count: %v\n", err)
		}
	}

	return nil
}

// retrieveLogs retrieves logs based on criteria
func retrieveLogs(req LogRetrievalRequest) ([]LogEntry, int, error) {
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create valkey store: %w", err)
	}
	defer kvStore.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build pattern based on service filter
	pattern := LOG_PREFIX + ":*"
	if req.Service != "" {
		pattern = fmt.Sprintf("%s:%s:*", LOG_PREFIX, req.Service)
	}

	// Get all matching keys
	keys, err := kvStore.ListKeys(ctx, pattern)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list log keys: %w", err)
	}

	// Limit the number of keys we process to avoid memory issues
	maxKeysToProcess := 1000
	if len(keys) > maxKeysToProcess {
		keys = keys[:maxKeysToProcess]
	}

	var logs []LogEntry
	for _, key := range keys {
		resp, err := kvStore.GetValue(ctx, key)
		if err != nil {
			continue // Skip keys that can't be retrieved
		}

		var logEntry LogEntry
		if err := json.Unmarshal([]byte(resp.Message.Value), &logEntry); err != nil {
			continue // Skip malformed entries
		}

		// Apply filters
		if req.Level != "" && string(logEntry.Level) != req.Level {
			continue
		}
		if req.Subcomponent != "" && logEntry.Subcomponent != req.Subcomponent {
			continue
		}
		if req.Search != "" && !strings.Contains(strings.ToLower(logEntry.Message), strings.ToLower(req.Search)) {
			continue
		}

		logs = append(logs, logEntry)
	}

	// Sort by timestamp (newest first) - using a more efficient approach
	sort.Slice(logs, func(i, j int) bool {
		return logs[i].Timestamp.After(logs[j].Timestamp)
	})

	total := len(logs)

	// Apply pagination
	start := req.Offset
	end := start + req.Limit
	if start >= len(logs) {
		return []LogEntry{}, total, nil
	}
	if end > len(logs) {
		end = len(logs)
	}

	return logs[start:end], total, nil
}

// getLogStats provides log statistics
func getLogStats() (*LogStatsResponse, error) {
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return nil, fmt.Errorf("failed to create valkey store: %w", err)
	}
	defer kvStore.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all log keys
	keys, err := kvStore.ListKeys(ctx, LOG_PREFIX+":*")
	if err != nil {
		return nil, fmt.Errorf("failed to list log keys: %w", err)
	}

	serviceStats := make(map[string]int)
	levelStats := make(map[string]int)
	var recentLogs []LogEntry

	for _, key := range keys {
		resp, err := kvStore.GetValue(ctx, key)
		if err != nil {
			continue
		}

		var logEntry LogEntry
		if err := json.Unmarshal([]byte(resp.Message.Value), &logEntry); err != nil {
			continue
		}

		// Count by service
		serviceStats[logEntry.Service]++

		// Count by level
		levelStats[string(logEntry.Level)]++

		// Collect recent logs (last 10)
		if len(recentLogs) < 10 {
			recentLogs = append(recentLogs, logEntry)
		}
	}

	// Sort recent logs by timestamp (newest first)
	sort.Slice(recentLogs, func(i, j int) bool {
		return recentLogs[i].Timestamp.After(recentLogs[j].Timestamp)
	})

	return &LogStatsResponse{
		TotalLogs:    len(keys),
		ServiceStats: serviceStats,
		LevelStats:   levelStats,
		RecentLogs:   recentLogs,
	}, nil
}

// LogBusinessEvent logs a meaningful business event
func LogBusinessEvent(service, subcomponent, level, message string, metadata map[string]interface{}) {
	logEntry := map[string]interface{}{
		"service":      service,
		"subcomponent": subcomponent,
		"level":        level,
		"message":      message,
		"metadata":     metadata,
		"context": map[string]interface{}{
			"type": "business_event",
		},
	}
	
	// Submit asynchronously
	go func() {
		body, err := json.Marshal(logEntry)
		if err != nil {
			return
		}
		
		client := &http.Client{Timeout: 2 * time.Second}
		req, err := http.NewRequest("POST", "http://localhost:9001/api/v1/logs", bytes.NewBuffer(body))
		if err != nil {
			return
		}
		
		req.Header.Set("Content-Type", "application/json")
		client.Do(req)
	}()
}

// maintainLogCount ensures we don't exceed MAX_LOGS
func maintainLogCount(ctx context.Context, kvStore store.KVStore) error {
	// Use a longer timeout for log maintenance
	maintenanceCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	// Get all log keys
	keys, err := kvStore.ListKeys(maintenanceCtx, LOG_PREFIX+":*")
	if err != nil {
		return err
	}

	if len(keys) <= MAX_LOGS {
		return nil // No cleanup needed
	}

	// Sort keys by timestamp (oldest first)
	// Key format: logs:service:timestamp:id
	for i := 0; i < len(keys)-1; i++ {
		for j := i + 1; j < len(keys); j++ {
			// Extract timestamp from key for sorting
			partsI := strings.Split(keys[i], ":")
			partsJ := strings.Split(keys[j], ":")
			if len(partsI) >= 3 && len(partsJ) >= 3 {
				timestampI, errI := strconv.ParseInt(partsI[2], 10, 64)
				timestampJ, errJ := strconv.ParseInt(partsJ[2], 10, 64)
				if errI == nil && errJ == nil && timestampI > timestampJ {
					keys[i], keys[j] = keys[j], keys[i]
				}
			}
		}
	}

	// Delete oldest logs
	logsToDelete := len(keys) - MAX_LOGS
	for i := 0; i < logsToDelete; i++ {
		kvStore.DeleteValue(ctx, keys[i])
	}

	return nil
}

// LogUpdateHandler handles updating a log entry
func LogUpdateHandler(c *fiber.Ctx) error {
	logID := c.Params("logId")
	if logID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Log ID required",
		})
	}

	var req struct {
		Message  string                 `json:"message,omitempty"`
		Level    string                 `json:"level,omitempty"`
		Metadata map[string]interface{} `json:"metadata,omitempty"`
		Context  map[string]interface{} `json:"context,omitempty"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request body",
			"details": err.Error(),
		})
	}

	// Validate log level if provided
	if req.Level != "" && !logging.IsValidLogLevel(req.Level) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid log level. Must be one of: debug, info, warn, error",
		})
	}

	// Connect to Valkey
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to connect to Valkey",
			"details": err.Error(),
		})
	}
	defer kvStore.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get existing log entry
	key := fmt.Sprintf("logs:%s", logID)
	resp, err := kvStore.GetValue(ctx, key)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Log entry not found",
		})
	}

	var entry LogEntry
	if err := json.Unmarshal([]byte(resp.Message.Value), &entry); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Invalid log entry format",
		})
	}

	// Update fields if provided
	if req.Message != "" {
		entry.Message = req.Message
	}
	if req.Level != "" {
		entry.Level = logging.GetLogLevelFromString(req.Level)
	}
	if req.Metadata != nil {
		entry.Metadata = req.Metadata
	}
	if req.Context != nil {
		entry.Context = req.Context
	}

	// Store updated entry
	if err := storeLogEntry(entry); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to update log entry",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Log entry updated successfully",
		"log_id":  logID,
	})
}

// LogDeleteHandler handles deleting a log entry
func LogDeleteHandler(c *fiber.Ctx) error {
	logID := c.Params("logId")
	if logID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Log ID required",
		})
	}

	// Connect to Valkey
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to connect to Valkey",
			"details": err.Error(),
		})
	}
	defer kvStore.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete log entry
	key := fmt.Sprintf("logs:%s", logID)
	if err := kvStore.DeleteValue(ctx, key); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to delete log entry",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Log entry deleted successfully",
		"log_id":  logID,
	})
}
