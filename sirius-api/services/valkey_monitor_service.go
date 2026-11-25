package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
)

// ValkeyMonitorService handles reading system metrics from Valkey
type ValkeyMonitorService struct {
	valkeyStore store.KVStore
	freshness   time.Duration
	now         func() time.Time
}

// SystemMetrics represents system resource metrics from Valkey
type SystemMetrics struct {
	ContainerName   string  `json:"container_name"`
	Timestamp       string  `json:"timestamp"`
	CPUPercent      *float64 `json:"cpu_percent"`
	MemoryUsage     *int64  `json:"memory_usage_bytes"`
	MemoryPercent   *float64 `json:"memory_percent"`
	NetworkRx       int64   `json:"network_rx_bytes"`
	NetworkTx       int64   `json:"network_tx_bytes"`
	DiskRead        int64   `json:"disk_read_bytes"`
	DiskWrite       int64   `json:"disk_write_bytes"`
	DiskUsage       int64   `json:"disk_usage_bytes"`
	DiskTotal       int64   `json:"disk_total_bytes"`
	DiskPercent     float64 `json:"disk_percent"`
	ProcessCount    int     `json:"process_count"`
	FileDescriptors int     `json:"file_descriptors"`
	LoadAverage1m   float64 `json:"load_average_1m"`
	LoadAverage5m   float64 `json:"load_average_5m"`
	LoadAverage15m  float64 `json:"load_average_15m"`
	Uptime          *int64  `json:"uptime_seconds"`
	Status          string  `json:"status"`
	CollectorStartedAt string `json:"collector_started_at"`
	CollectorUptimeSeconds *int64 `json:"collector_uptime_seconds"`
}

// ValkeyContainerLog represents a container log entry from Valkey
type ValkeyContainerLog struct {
	ContainerName string `json:"container_name"`
	Timestamp     string `json:"timestamp"`
	Level         string `json:"level"`
	Message       string `json:"message"`
}

// ValkeyContainerResource represents container resource usage for API response
type ValkeyContainerResource struct {
	Name            string  `json:"name"`
	CPUPercent      float64 `json:"cpu_percent"`
	MemoryUsage     string  `json:"memory_usage"`
	MemoryPercent   float64 `json:"memory_percent"`
	NetworkIO       string  `json:"network_io"`
	BlockIO         string  `json:"block_io"`
	DiskUsage       string  `json:"disk_usage"`
	DiskPercent     float64 `json:"disk_percent"`
	ProcessCount    int     `json:"process_count"`
	FileDescriptors int     `json:"file_descriptors"`
	LoadAverage1m   float64 `json:"load_average_1m"`
	LoadAverage5m   float64 `json:"load_average_5m"`
	LoadAverage15m  float64 `json:"load_average_15m"`
	Uptime          string  `json:"uptime"`
	Status          string  `json:"status"`
	ObservedAt      *time.Time `json:"observed_at,omitempty"`
	TelemetryStatus string `json:"telemetry_status"`
	CollectorStartedAt *time.Time `json:"collector_started_at,omitempty"`
	CollectorUptimeSeconds *int64 `json:"collector_uptime_seconds,omitempty"`
}

// ValkeySystemResourcesSummary represents system resource summary
type ValkeySystemResourcesSummary struct {
	TotalContainers    int     `json:"total_containers"`
	RunningContainers  int     `json:"running_containers"`
	TotalCPUPercent    float64 `json:"total_cpu_percent"`
	TotalMemoryUsage   string  `json:"total_memory_usage"`
	TotalMemoryPercent float64 `json:"total_memory_percent"`
	FreshContainers       int `json:"fresh_containers"`
	StaleContainers       int `json:"stale_containers"`
	MissingContainers     int `json:"missing_containers"`
	InvalidContainers     int `json:"invalid_containers"`
	UnavailableContainers int `json:"unavailable_containers"`
	LatestObservedAt *time.Time `json:"latest_observed_at,omitempty"`
}

type SystemResourcesObservation struct {
	Message          string                       `json:"message"`
	Timestamp        time.Time                    `json:"timestamp"`
	Availability     string                       `json:"availability"`
	FreshnessSeconds int                          `json:"freshness_seconds"`
	Containers       []ValkeyContainerResource    `json:"containers"`
	Summary          ValkeySystemResourcesSummary `json:"summary"`
}

var ErrResourcesStoreUnavailable = errors.New("resource telemetry store unavailable")

var monitoredContainers = [...]string{
	"sirius-api", "sirius-ui", "sirius-engine", "sirius-postgres", "sirius-valkey", "sirius-rabbitmq",
}

const defaultMetricsFreshness = 20 * time.Second

// NewValkeyMonitorService uses the API process's already-configured store.
func NewValkeyMonitorService(kv store.KVStore) *ValkeyMonitorService {
	freshness := defaultMetricsFreshness
	if seconds, err := strconv.Atoi(os.Getenv("SIRIUS_METRICS_FRESHNESS_SECONDS")); err == nil && seconds > 0 && seconds <= 3600 {
		freshness = time.Duration(seconds) * time.Second
	}
	return &ValkeyMonitorService{valkeyStore: kv, freshness: freshness, now: time.Now}
}

func (v *ValkeyMonitorService) GetContainerResources(ctx context.Context) (SystemResourcesObservation, error) {
	response := SystemResourcesObservation{
		Message:          "System resource observations",
		Availability:     "unavailable",
		FreshnessSeconds: int(v.freshness / time.Second),
		Containers:       make([]ValkeyContainerResource, 0, len(monitoredContainers)),
	}
	summary := &response.Summary
	summary.TotalContainers = len(monitoredContainers)
	var totalMemoryBytes int64

	for _, name := range monitoredContainers {
		resource, memoryBytes := v.readResource(ctx, name)
		response.Containers = append(response.Containers, resource)
		if at := resource.ObservedAt; at != nil &&
			(summary.LatestObservedAt == nil || at.After(*summary.LatestObservedAt)) {
			summary.LatestObservedAt = at
		}

		switch resource.TelemetryStatus {
		case "fresh":
			summary.FreshContainers++
			summary.TotalCPUPercent += resource.CPUPercent
			summary.TotalMemoryPercent += resource.MemoryPercent
			totalMemoryBytes += memoryBytes
			if resource.Status == "running" {
				summary.RunningContainers++
			}
		case "stale":
			summary.StaleContainers++
		case "missing":
			summary.MissingContainers++
		case "invalid":
			summary.InvalidContainers++
		case "unavailable":
			summary.UnavailableContainers++
		}
	}

	response.Timestamp = v.now().UTC()
	summary.TotalMemoryUsage = v.formatBytes(totalMemoryBytes)
	switch {
	case summary.FreshContainers == summary.TotalContainers:
		response.Availability = "available"
	case summary.FreshContainers > 0:
		response.Availability = "partial"
	case summary.UnavailableContainers == summary.TotalContainers:
		response.Message = "System resource telemetry store unavailable"
		return response, ErrResourcesStoreUnavailable
	}
	return response, nil
}

func (v *ValkeyMonitorService) readResource(ctx context.Context, name string) (ValkeyContainerResource, int64) {
	row := ValkeyContainerResource{
		Name: name, Status: "unknown", TelemetryStatus: "unavailable",
		MemoryUsage: "0B", NetworkIO: "0B / 0B", BlockIO: "0B / 0B", DiskUsage: "0B / 0B", Uptime: "0s",
	}
	if v.valkeyStore == nil {
		return row, 0
	}
	response, err := v.valkeyStore.GetValue(ctx, "system:metrics:"+name)
	if errors.Is(err, store.ErrKeyNotFound) {
		row.TelemetryStatus = "missing"
		return row, 0
	}
	if err != nil {
		return row, 0
	}
	var metrics SystemMetrics
	if err := json.Unmarshal([]byte(response.Message.Value), &metrics); err != nil ||
		metrics.ContainerName != name || metrics.CPUPercent == nil || metrics.MemoryUsage == nil ||
		metrics.MemoryPercent == nil {
		row.TelemetryStatus = "invalid"
		return row, 0
	}
	now := v.now()
	observed, err := time.Parse(time.RFC3339Nano, metrics.Timestamp)
	if err != nil || observed.After(now) {
		row.TelemetryStatus = "invalid"
		return row, 0
	}
	observed = observed.UTC()
	row.ObservedAt = &observed
	row.TelemetryStatus = "stale"
	if now.Sub(observed) <= v.freshness {
		row.TelemetryStatus = "fresh"
		row.Status = metrics.Status
		if row.Status == "" {
			row.Status = "unknown"
		}
	}

	row.CPUPercent = *metrics.CPUPercent
	row.MemoryUsage = v.formatBytes(*metrics.MemoryUsage)
	row.MemoryPercent = *metrics.MemoryPercent
	row.NetworkIO = fmt.Sprintf("%s / %s", v.formatBytes(metrics.NetworkRx), v.formatBytes(metrics.NetworkTx))
	row.BlockIO = fmt.Sprintf("%s / %s", v.formatBytes(metrics.DiskRead), v.formatBytes(metrics.DiskWrite))
	row.DiskUsage = fmt.Sprintf("%s / %s", v.formatBytes(metrics.DiskUsage), v.formatBytes(metrics.DiskTotal))
	row.DiskPercent = metrics.DiskPercent
	row.ProcessCount = metrics.ProcessCount
	row.FileDescriptors = metrics.FileDescriptors
	row.LoadAverage1m = metrics.LoadAverage1m
	row.LoadAverage5m = metrics.LoadAverage5m
	row.LoadAverage15m = metrics.LoadAverage15m

	if started, err := time.Parse(time.RFC3339Nano, metrics.CollectorStartedAt); err == nil && !started.After(observed) {
		started = started.UTC()
		row.CollectorStartedAt = &started
	}
	if metrics.CollectorUptimeSeconds != nil && *metrics.CollectorUptimeSeconds >= 0 {
		row.CollectorUptimeSeconds = metrics.CollectorUptimeSeconds
	} else if metrics.Uptime != nil && *metrics.Uptime >= 0 {
		row.CollectorUptimeSeconds = metrics.Uptime
	}
	if row.CollectorUptimeSeconds != nil {
		row.Uptime = v.formatUptime(*row.CollectorUptimeSeconds)
	}
	return row, *metrics.MemoryUsage
}

// GetDockerLogs retrieves container logs from Valkey
func (v *ValkeyMonitorService) GetDockerLogs(ctx context.Context, containerNameFilter string, lines int) ([]ValkeyContainerLog, []string, error) {
	if v.valkeyStore == nil {
		return nil, nil, errors.New("Valkey log store unavailable")
	}
	// Get all log keys from Valkey
	pattern := "system:logs:*"
	keys, err := v.valkeyStore.ListKeys(ctx, pattern)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to list log keys: %w", err)
	}

	var logs []ValkeyContainerLog
	containerNames := []string{"sirius-api", "sirius-ui", "sirius-engine", "sirius-postgres", "sirius-valkey", "sirius-rabbitmq"}

	// Process each log key
	for _, key := range keys {
		if lines > 0 && len(logs) >= lines {
			break
		}

		// Get log entry from Valkey
		response, err := v.valkeyStore.GetValue(ctx, key)
		if err != nil {
			continue // Skip invalid entries
		}

		// Parse log entry
		var logEntry ValkeyContainerLog
		if err := json.Unmarshal([]byte(response.Message.Value), &logEntry); err != nil {
			continue // Skip invalid JSON
		}

		// Apply container filter
		if containerNameFilter != "all" && containerNameFilter != logEntry.ContainerName {
			continue
		}

		logs = append(logs, logEntry)
	}

	// Sort logs by timestamp (most recent first) - simple string comparison for ISO timestamps
	for i := 0; i < len(logs); i++ {
		for j := i + 1; j < len(logs); j++ {
			if logs[i].Timestamp < logs[j].Timestamp {
				logs[i], logs[j] = logs[j], logs[i]
			}
		}
	}

	// Limit results
	if lines > 0 && len(logs) > lines {
		logs = logs[:lines]
	}

	return logs, containerNames, nil
}

// formatBytes formats bytes into human-readable format
func (v *ValkeyMonitorService) formatBytes(bytes int64) string {
	if bytes == 0 {
		return "0B"
	}

	sizes := []string{"B", "KB", "MB", "GB", "TB"}
	i := 0
	fBytes := float64(bytes)

	for fBytes >= 1024 && i < len(sizes)-1 {
		fBytes /= 1024
		i++
	}

	return fmt.Sprintf("%.1f%s", fBytes, sizes[i])
}

// formatUptime formats uptime in seconds to human-readable format
func (v *ValkeyMonitorService) formatUptime(seconds int64) string {
	if seconds < 60 {
		return fmt.Sprintf("%ds", seconds)
	} else if seconds < 3600 {
		return fmt.Sprintf("%dm %ds", seconds/60, seconds%60)
	} else if seconds < 86400 {
		return fmt.Sprintf("%dh %dm", seconds/3600, (seconds%3600)/60)
	} else {
		return fmt.Sprintf("%dd %dh", seconds/86400, (seconds%86400)/3600)
	}
}
