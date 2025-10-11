package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/SiriusScan/go-api/sirius/store"
)

// ValkeyMonitorService handles reading system metrics from Valkey
type ValkeyMonitorService struct {
	valkeyStore store.KVStore
}

// SystemMetrics represents system resource metrics from Valkey
type SystemMetrics struct {
	ContainerName   string  `json:"container_name"`
	Timestamp       string  `json:"timestamp"`
	CPUPercent      float64 `json:"cpu_percent"`
	MemoryUsage     int64   `json:"memory_usage_bytes"`
	MemoryPercent   float64 `json:"memory_percent"`
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
	Uptime          int64   `json:"uptime_seconds"`
	Status          string  `json:"status"`
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
}

// ValkeySystemResourcesSummary represents system resource summary
type ValkeySystemResourcesSummary struct {
	TotalContainers    int     `json:"total_containers"`
	RunningContainers  int     `json:"running_containers"`
	TotalCPUPercent    float64 `json:"total_cpu_percent"`
	TotalMemoryUsage   string  `json:"total_memory_usage"`
	TotalMemoryPercent float64 `json:"total_memory_percent"`
}

// NewValkeyMonitorService creates a new Valkey monitor service
func NewValkeyMonitorService() (*ValkeyMonitorService, error) {
	valkeyStore, err := store.NewValkeyStore()
	if err != nil {
		return nil, fmt.Errorf("failed to create Valkey store: %w", err)
	}

	return &ValkeyMonitorService{
		valkeyStore: valkeyStore,
	}, nil
}

// GetContainerResources retrieves system resources from Valkey
func (v *ValkeyMonitorService) GetContainerResources(ctx context.Context) ([]ValkeyContainerResource, ValkeySystemResourcesSummary, error) {
	// Get all container names
	containerNames := []string{"sirius-api", "sirius-ui", "sirius-engine", "sirius-postgres", "sirius-valkey", "sirius-rabbitmq"}

	var resources []ValkeyContainerResource
	var totalCPU float64
	var totalMemory float64
	var totalMemoryBytes int64
	var runningCount int

	for _, containerName := range containerNames {
		// Get metrics from Valkey
		metrics, err := v.getContainerMetrics(ctx, containerName)
		if err != nil {
			// If no metrics found, create a default entry
			resource := ValkeyContainerResource{
				Name:            containerName,
				CPUPercent:      0.0,
				MemoryUsage:     "0B",
				MemoryPercent:   0.0,
				NetworkIO:       "0B / 0B",
				BlockIO:         "0B / 0B",
				DiskUsage:       "0B / 0B",
				DiskPercent:     0.0,
				ProcessCount:    0,
				FileDescriptors: 0,
				LoadAverage1m:   0.0,
				LoadAverage5m:   0.0,
				LoadAverage15m:  0.0,
				Uptime:          "0s",
				Status:          "unknown",
			}
			resources = append(resources, resource)
			continue
		}

		// Convert SystemMetrics to ValkeyContainerResource
		resource := ValkeyContainerResource{
			Name:            metrics.ContainerName,
			CPUPercent:      metrics.CPUPercent,
			MemoryUsage:     v.formatBytes(metrics.MemoryUsage),
			MemoryPercent:   metrics.MemoryPercent,
			NetworkIO:       fmt.Sprintf("%s / %s", v.formatBytes(metrics.NetworkRx), v.formatBytes(metrics.NetworkTx)),
			BlockIO:         fmt.Sprintf("%s / %s", v.formatBytes(metrics.DiskRead), v.formatBytes(metrics.DiskWrite)),
			DiskUsage:       fmt.Sprintf("%s / %s", v.formatBytes(metrics.DiskUsage), v.formatBytes(metrics.DiskTotal)),
			DiskPercent:     metrics.DiskPercent,
			ProcessCount:    metrics.ProcessCount,
			FileDescriptors: metrics.FileDescriptors,
			LoadAverage1m:   metrics.LoadAverage1m,
			LoadAverage5m:   metrics.LoadAverage5m,
			LoadAverage15m:  metrics.LoadAverage15m,
			Uptime:          v.formatUptime(metrics.Uptime),
			Status:          metrics.Status,
		}
		resources = append(resources, resource)

		// Update totals
		if metrics.Status == "running" {
			totalCPU += metrics.CPUPercent
			totalMemory += metrics.MemoryPercent
			totalMemoryBytes += metrics.MemoryUsage
			runningCount++
		}
	}

	summary := ValkeySystemResourcesSummary{
		TotalContainers:    len(containerNames),
		RunningContainers:  runningCount,
		TotalCPUPercent:    totalCPU,
		TotalMemoryUsage:   v.formatBytes(totalMemoryBytes),
		TotalMemoryPercent: totalMemory,
	}

	return resources, summary, nil
}

// GetDockerLogs retrieves container logs from Valkey
func (v *ValkeyMonitorService) GetDockerLogs(ctx context.Context, containerNameFilter string, lines int) ([]ValkeyContainerLog, []string, error) {
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

// getContainerMetrics retrieves metrics for a specific container from Valkey
func (v *ValkeyMonitorService) getContainerMetrics(ctx context.Context, containerName string) (*SystemMetrics, error) {
	key := fmt.Sprintf("system:metrics:%s", containerName)

	response, err := v.valkeyStore.GetValue(ctx, key)
	if err != nil {
		return nil, fmt.Errorf("failed to get metrics for %s: %w", containerName, err)
	}

	var metrics SystemMetrics
	if err := json.Unmarshal([]byte(response.Message.Value), &metrics); err != nil {
		return nil, fmt.Errorf("failed to unmarshal metrics for %s: %w", containerName, err)
	}

	return &metrics, nil
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

// GetValkeyStore returns the Valkey store for external use
func (v *ValkeyMonitorService) GetValkeyStore() store.KVStore {
	return v.valkeyStore
}

// Close closes the Valkey connection
func (v *ValkeyMonitorService) Close() error {
	return v.valkeyStore.Close()
}
