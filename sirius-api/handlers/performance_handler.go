package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/logging"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// PerformanceMetricsResponse represents the response for performance metrics
type PerformanceMetricsResponse struct {
	Metrics    []PerformanceMetric `json:"metrics"`
	Total      int                 `json:"total"`
	Limit      int                 `json:"limit"`
	Offset     int                 `json:"offset"`
	Summary    PerformanceSummary  `json:"summary"`
	TimeRange  TimeRange           `json:"time_range"`
}

// PerformanceMetric represents a single performance metric
type PerformanceMetric struct {
	ID          string                 `json:"id"`
	Timestamp   time.Time              `json:"timestamp"`
	Service     string                 `json:"service"`
	Endpoint    string                 `json:"endpoint"`
	Method      string                 `json:"method"`
	Duration    int64                  `json:"duration_ms"`
	StatusCode  int                    `json:"status_code"`
	ResponseSize int                   `json:"response_size"`
	RequestID   string                 `json:"request_id,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// PerformanceSummary provides aggregated performance statistics
type PerformanceSummary struct {
	TotalRequests    int     `json:"total_requests"`
	AverageResponse  float64 `json:"average_response_ms"`
	MinResponse      int64   `json:"min_response_ms"`
	MaxResponse      int64   `json:"max_response_ms"`
	ErrorRate        float64 `json:"error_rate"`
	RequestsPerMinute float64 `json:"requests_per_minute"`
	TopEndpoints     []EndpointStats `json:"top_endpoints"`
	ServiceStats     []ServiceStats  `json:"service_stats"`
}

// EndpointStats represents statistics for a specific endpoint
type EndpointStats struct {
	Endpoint        string  `json:"endpoint"`
	Method          string  `json:"method"`
	RequestCount    int     `json:"request_count"`
	AverageResponse float64 `json:"average_response_ms"`
	ErrorCount      int     `json:"error_count"`
	ErrorRate       float64 `json:"error_rate"`
}

// ServiceStats represents statistics for a specific service
type ServiceStats struct {
	Service         string  `json:"service"`
	RequestCount    int     `json:"request_count"`
	AverageResponse float64 `json:"average_response_ms"`
	ErrorCount      int     `json:"error_count"`
	ErrorRate       float64 `json:"error_rate"`
}

// TimeRange represents the time range for the metrics
type TimeRange struct {
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

// PerformanceMetricsRequest represents the request parameters for performance metrics
type PerformanceMetricsRequest struct {
	Service   string `json:"service,omitempty"`
	Endpoint  string `json:"endpoint,omitempty"`
	Method    string `json:"method,omitempty"`
	Limit     int    `json:"limit,omitempty"`
	Offset    int    `json:"offset,omitempty"`
	TimeRange string `json:"time_range,omitempty"` // "1h", "24h", "7d", "30d"
}

const (
	PERFORMANCE_LOG_PREFIX = "logs"
)

// PerformanceMetricsHandler handles performance metrics retrieval
func PerformanceMetricsHandler(c *fiber.Ctx) error {
	var req PerformanceMetricsRequest

	// Parse query parameters
	req.Service = c.Query("service", "")
	req.Endpoint = c.Query("endpoint", "")
	req.Method = c.Query("method", "")
	req.TimeRange = c.Query("time_range", "1h")

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

	// Retrieve performance metrics
	metrics, total, summary, timeRange, err := retrievePerformanceMetrics(req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to retrieve performance metrics",
			"details": err.Error(),
		})
	}

	response := PerformanceMetricsResponse{
		Metrics:   metrics,
		Total:     total,
		Limit:     req.Limit,
		Offset:    req.Offset,
		Summary:   summary,
		TimeRange: timeRange,
	}

	return c.JSON(response)
}

// retrievePerformanceMetrics retrieves performance metrics from logs
func retrievePerformanceMetrics(req PerformanceMetricsRequest) ([]PerformanceMetric, int, PerformanceSummary, TimeRange, error) {
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return nil, 0, PerformanceSummary{}, TimeRange{}, fmt.Errorf("failed to create valkey store: %w", err)
	}
	defer kvStore.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Calculate time range
	timeRange := calculateTimeRange(req.TimeRange)
	
	// Build pattern based on service filter
	pattern := PERFORMANCE_LOG_PREFIX + ":*"
	if req.Service != "" {
		pattern = fmt.Sprintf("%s:%s:*", PERFORMANCE_LOG_PREFIX, req.Service)
	}

	// Get all matching keys
	keys, err := kvStore.ListKeys(ctx, pattern)
	if err != nil {
		return nil, 0, PerformanceSummary{}, TimeRange{}, fmt.Errorf("failed to list log keys: %w", err)
	}

	// Limit the number of keys we process to avoid memory issues
	maxKeysToProcess := 2000
	if len(keys) > maxKeysToProcess {
		keys = keys[:maxKeysToProcess]
	}

	var metrics []PerformanceMetric
	var allMetrics []PerformanceMetric

	for _, key := range keys {
		resp, err := kvStore.GetValue(ctx, key)
		if err != nil {
			continue // Skip keys that can't be retrieved
		}

		var logEntry logging.LogEntry
		if err := json.Unmarshal([]byte(resp.Message.Value), &logEntry); err != nil {
			continue // Skip malformed entries
		}

		// Only process performance metrics
		if logEntry.Context == nil || logEntry.Context["type"] != "performance_metric" {
			continue
		}

		// Check time range
		if logEntry.Timestamp.Before(timeRange.Start) || logEntry.Timestamp.After(timeRange.End) {
			continue
		}

		// Extract performance data from metadata
		performanceData, err := extractPerformanceData(logEntry)
		if err != nil {
			continue // Skip entries without valid performance data
		}

		// Apply filters
		if req.Endpoint != "" && !strings.Contains(performanceData.Endpoint, req.Endpoint) {
			continue
		}
		if req.Method != "" && performanceData.Method != req.Method {
			continue
		}

		allMetrics = append(allMetrics, performanceData)
	}

	// Sort by timestamp (newest first)
	sort.Slice(allMetrics, func(i, j int) bool {
		return allMetrics[i].Timestamp.After(allMetrics[j].Timestamp)
	})

	total := len(allMetrics)

	// Apply pagination
	start := req.Offset
	end := start + req.Limit
	if start >= len(allMetrics) {
		metrics = []PerformanceMetric{}
	} else {
		if end > len(allMetrics) {
			end = len(allMetrics)
		}
		metrics = allMetrics[start:end]
	}

	// Calculate summary
	summary := calculatePerformanceSummary(allMetrics, timeRange)

	return metrics, total, summary, timeRange, nil
}

// extractPerformanceData extracts performance data from a log entry
func extractPerformanceData(logEntry logging.LogEntry) (PerformanceMetric, error) {
	metric := PerformanceMetric{
		ID:        logEntry.ID,
		Timestamp: logEntry.Timestamp,
		Service:   logEntry.Service,
		Metadata:  logEntry.Metadata,
	}

	// Extract performance data from metadata
	if logEntry.Metadata != nil {
		if performance, ok := logEntry.Metadata["performance"].(map[string]interface{}); ok {
			if duration, ok := performance["duration"].(string); ok {
				if d, err := time.ParseDuration(duration); err == nil {
					metric.Duration = d.Milliseconds()
				}
			}
		}

		// Extract request details from metadata
		if requestID, ok := logEntry.Metadata["request_id"].(string); ok {
			metric.RequestID = requestID
		}
		if method, ok := logEntry.Metadata["method"].(string); ok {
			metric.Method = method
		}
		if path, ok := logEntry.Metadata["path"].(string); ok {
			metric.Endpoint = path
		}
		if statusCode, ok := logEntry.Metadata["status_code"].(float64); ok {
			metric.StatusCode = int(statusCode)
		}
		if responseSize, ok := logEntry.Metadata["response_size"].(float64); ok {
			metric.ResponseSize = int(responseSize)
		}
	}

	// Validate that we have essential data
	if metric.Duration == 0 || metric.Endpoint == "" {
		return metric, fmt.Errorf("missing essential performance data")
	}

	return metric, nil
}

// calculateTimeRange calculates the time range based on the request
func calculateTimeRange(timeRangeStr string) TimeRange {
	now := time.Now()
	var start time.Time

	switch timeRangeStr {
	case "1h":
		start = now.Add(-1 * time.Hour)
	case "24h":
		start = now.Add(-24 * time.Hour)
	case "7d":
		start = now.Add(-7 * 24 * time.Hour)
	case "30d":
		start = now.Add(-30 * 24 * time.Hour)
	default:
		start = now.Add(-1 * time.Hour) // Default to 1 hour
	}

	return TimeRange{
		Start: start,
		End:   now,
	}
}

// calculatePerformanceSummary calculates aggregated performance statistics
func calculatePerformanceSummary(metrics []PerformanceMetric, timeRange TimeRange) PerformanceSummary {
	if len(metrics) == 0 {
		return PerformanceSummary{}
	}

	summary := PerformanceSummary{
		TotalRequests: len(metrics),
		MinResponse:   metrics[0].Duration,
		MaxResponse:   metrics[0].Duration,
	}

	var totalDuration int64
	var errorCount int
	endpointStats := make(map[string]*EndpointStats)
	serviceStats := make(map[string]*ServiceStats)

	for _, metric := range metrics {
		// Calculate response time statistics
		totalDuration += metric.Duration
		if metric.Duration < summary.MinResponse {
			summary.MinResponse = metric.Duration
		}
		if metric.Duration > summary.MaxResponse {
			summary.MaxResponse = metric.Duration
		}

		// Count errors (status codes >= 400)
		if metric.StatusCode >= 400 {
			errorCount++
		}

		// Aggregate by endpoint
		endpointKey := fmt.Sprintf("%s %s", metric.Method, metric.Endpoint)
		if stats, exists := endpointStats[endpointKey]; exists {
			stats.RequestCount++
			stats.AverageResponse = (stats.AverageResponse*float64(stats.RequestCount-1) + float64(metric.Duration)) / float64(stats.RequestCount)
			if metric.StatusCode >= 400 {
				stats.ErrorCount++
			}
		} else {
			endpointStats[endpointKey] = &EndpointStats{
				Endpoint:        metric.Endpoint,
				Method:          metric.Method,
				RequestCount:    1,
				AverageResponse: float64(metric.Duration),
				ErrorCount:      0,
			}
			if metric.StatusCode >= 400 {
				endpointStats[endpointKey].ErrorCount = 1
			}
		}

		// Aggregate by service
		if stats, exists := serviceStats[metric.Service]; exists {
			stats.RequestCount++
			stats.AverageResponse = (stats.AverageResponse*float64(stats.RequestCount-1) + float64(metric.Duration)) / float64(stats.RequestCount)
			if metric.StatusCode >= 400 {
				stats.ErrorCount++
			}
		} else {
			serviceStats[metric.Service] = &ServiceStats{
				Service:         metric.Service,
				RequestCount:    1,
				AverageResponse: float64(metric.Duration),
				ErrorCount:      0,
			}
			if metric.StatusCode >= 400 {
				serviceStats[metric.Service].ErrorCount = 1
			}
		}
	}

	// Calculate averages and rates
	summary.AverageResponse = float64(totalDuration) / float64(len(metrics))
	summary.ErrorRate = float64(errorCount) / float64(len(metrics)) * 100

	// Calculate requests per minute
	durationMinutes := timeRange.End.Sub(timeRange.Start).Minutes()
	if durationMinutes > 0 {
		summary.RequestsPerMinute = float64(len(metrics)) / durationMinutes
	}

	// Calculate error rates for endpoints and services
	for _, stats := range endpointStats {
		stats.ErrorRate = float64(stats.ErrorCount) / float64(stats.RequestCount) * 100
	}
	for _, stats := range serviceStats {
		stats.ErrorRate = float64(stats.ErrorCount) / float64(stats.RequestCount) * 100
	}

	// Sort and get top endpoints (by request count)
	var topEndpoints []EndpointStats
	for _, stats := range endpointStats {
		topEndpoints = append(topEndpoints, *stats)
	}
	sort.Slice(topEndpoints, func(i, j int) bool {
		return topEndpoints[i].RequestCount > topEndpoints[j].RequestCount
	})
	if len(topEndpoints) > 10 {
		topEndpoints = topEndpoints[:10]
	}
	summary.TopEndpoints = topEndpoints

	// Sort and get service stats
	var serviceStatsList []ServiceStats
	for _, stats := range serviceStats {
		serviceStatsList = append(serviceStatsList, *stats)
	}
	sort.Slice(serviceStatsList, func(i, j int) bool {
		return serviceStatsList[i].RequestCount > serviceStatsList[j].RequestCount
	})
	summary.ServiceStats = serviceStatsList

	return summary
}
