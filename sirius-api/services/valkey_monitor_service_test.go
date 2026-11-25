package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
)

type monitorReadFixture struct {
	store.KVStore
	values map[string]string
	errors map[string]error
}

func (f *monitorReadFixture) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	if err := f.errors[key]; err != nil {
		return store.ValkeyResponse{}, err
	}
	value, ok := f.values[key]
	if !ok {
		return store.ValkeyResponse{}, fmt.Errorf("fixture: %w", store.ErrKeyNotFound)
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: value}}, nil
}

func metricFixture(t *testing.T, name string, observed time.Time, cpu float64, memory int64) string {
	t.Helper()
	value, err := json.Marshal(map[string]any{
		"container_name": name, "timestamp": observed, "observation_version": 2,
		"cpu_percent": cpu, "memory_usage_bytes": memory, "memory_percent": cpu,
		"uptime_seconds": 58, "status": "running",
	})
	if err != nil {
		t.Fatal(err)
	}
	return string(value)
}

func TestResourcesClassifyObservations(t *testing.T) {
	now := time.Date(2026, 11, 24, 12, 0, 0, 0, time.UTC)
	fresh := now.Add(-5 * time.Second)
	stale := now.Add(-21 * time.Second)
	fixture := &monitorReadFixture{
		values: map[string]string{
			"system:metrics:sirius-api":      metricFixture(t, "sirius-api", fresh, 0, 0),
			"system:metrics:sirius-ui":       metricFixture(t, "sirius-ui", stale, 92, 65536),
			"system:metrics:sirius-postgres": "{not-json",
			"system:metrics:sirius-valkey":   metricFixture(t, "sirius-valkey", now.Add(time.Second), 91, 65536),
		},
		errors: map[string]error{"system:metrics:sirius-rabbitmq": errors.New("fixture read failed")},
	}
	reader := NewValkeyMonitorService(fixture)
	reader.now = func() time.Time { return now }
	reader.freshness = 20 * time.Second

	data, err := reader.GetContainerResources(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if data.Availability != "partial" || !data.Timestamp.Equal(now) {
		t.Fatalf("unexpected observation response: %+v", data)
	}
	summary := data.Summary
	if summary.FreshContainers != 1 || summary.StaleContainers != 1 || summary.MissingContainers != 1 ||
		summary.InvalidContainers != 2 || summary.UnavailableContainers != 1 || summary.RunningContainers != 1 {
		t.Fatalf("unexpected coverage: %+v", summary)
	}
	if summary.PeakCPUPercent == nil || *summary.PeakCPUPercent != 0 ||
		summary.ObservedMemoryBytes == nil || *summary.ObservedMemoryBytes != 0 ||
		summary.LatestObservedAt == nil || !summary.LatestObservedAt.Equal(fresh) {
		t.Fatalf("fresh measured zero or observation timestamp was lost: %+v", summary)
	}
	for i, want := range []string{"fresh", "stale", "missing", "invalid", "invalid", "unavailable"} {
		if data.Containers[i].TelemetryStatus != want {
			t.Errorf("%s status = %q, want %q", data.Containers[i].Name, data.Containers[i].TelemetryStatus, want)
		}
	}
	if row := data.Containers[1]; row.ObservedAt == nil || !row.ObservedAt.Equal(stale) ||
		row.CPUPercent != 92 || row.Status == "running" {
		t.Errorf("stale last observation was lost or reported running: %+v", row)
	}
	if row := data.Containers[2]; row.ObservedAt != nil || row.CollectorUptimeSeconds != nil {
		t.Errorf("missing sample has fabricated metadata: %+v", row)
	}
	if row := data.Containers[0]; row.CollectorUptimeSeconds == nil || *row.CollectorUptimeSeconds != 58 {
		t.Errorf("collector age was not retained: %+v", row)
	}
}

func TestResourcesRecoverAndShowExpiredSamplesAsMissing(t *testing.T) {
	now := time.Date(2026, 11, 24, 12, 0, 0, 0, time.UTC)
	fixture := &monitorReadFixture{errors: make(map[string]error), values: make(map[string]string)}
	for _, name := range monitoredContainers {
		fixture.errors["system:metrics:"+name] = errors.New("fixture store unavailable")
	}
	reader := NewValkeyMonitorService(fixture)
	reader.now = func() time.Time { return now }
	reader.freshness = 20 * time.Second

	data, err := reader.GetContainerResources(context.Background())
	if !errors.Is(err, ErrResourcesStoreUnavailable) || data.Summary.UnavailableContainers != len(monitoredContainers) {
		t.Fatalf("outage was treated as missing or measured: %+v, %v", data, err)
	}
	clear(fixture.errors)
	const key = "system:metrics:sirius-api"
	fixture.values[key] = `{"container_name":"sirius-api","timestamp":"2026-11-24T12:00:00Z","collector_started_at":"2026-11-24T12:00:00Z","collector_uptime_seconds":0,"observation_version":2,"cpu_percent":5,"memory_usage_bytes":64,"memory_percent":1,"uptime_seconds":58,"status":"running"}`
	for _, status := range []string{"fresh", "stale", "missing"} {
		data, err = reader.GetContainerResources(context.Background())
		if err != nil || data.Containers[0].TelemetryStatus != status {
			t.Fatalf("expected %s after recovery, got %+v, %v", status, data.Containers[0], err)
		}
		if status == "fresh" {
			row := data.Containers[0]
			if row.CollectorStartedAt == nil || !row.CollectorStartedAt.Equal(now) ||
				row.CollectorUptimeSeconds == nil || *row.CollectorUptimeSeconds != 0 {
				t.Fatalf("upgraded collector provenance or measured zero missing: %+v", row)
			}
			if summary := data.Summary; summary.TotalCPUPercent != 5 || summary.TotalMemoryPercent != 1 || summary.TotalMemoryUsage != "64.0B" {
				t.Fatalf("legacy totals lost fresh measurements: %+v", summary)
			}
		} else if summary := data.Summary; summary.TotalCPUPercent != 0 || summary.TotalMemoryPercent != 0 || summary.TotalMemoryUsage != "0B" {
			t.Fatalf("legacy totals retained an expired observation: %+v", summary)
		}
		now = now.Add(31 * time.Second)
		if status == "stale" {
			delete(fixture.values, key)
		}
	}
}

func TestResourcesReadLegacyTimingWithoutAssumingMeasurements(t *testing.T) {
	now := time.Date(2026, 11, 24, 12, 0, 0, 0, time.UTC)
	fixture := &monitorReadFixture{values: map[string]string{
		"system:metrics:sirius-api": `{"container_name":"sirius-api","timestamp":"2026-11-24T12:00:00Z","cpu_percent":12,"memory_usage_bytes":1024,"memory_percent":50,"uptime_seconds":4,"status":"running"}`,
		"system:metrics:sirius-ui": `{"observation_version":2,"container_name":"sirius-ui","timestamp":"2026-11-24T12:00:00Z","cpu_percent":null,"memory_usage_bytes":512,"memory_percent":null,"network_rx_bytes":0,"network_tx_bytes":null,"uptime_seconds":5,"status":"running"}`,
	}}
	reader := NewValkeyMonitorService(fixture)
	reader.now = func() time.Time { return now }

	data, err := reader.GetContainerResources(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	legacy := data.Containers[0]
	if legacy.TelemetryStatus != "fresh" || legacy.ObservedAt == nil ||
		legacy.CollectorUptimeSeconds == nil || *legacy.CollectorUptimeSeconds != 4 ||
		legacy.Measurements.CPUPercent != nil || legacy.Measurements.MemoryUsage != nil {
		t.Fatalf("legacy sample has incorrect timing or measurement provenance: %+v", legacy)
	}
	measured := data.Containers[1].Measurements
	if measured.CPUPercent != nil || measured.MemoryPercent != nil || measured.NetworkTx != nil ||
		measured.MemoryUsage == nil || *measured.MemoryUsage != 512 ||
		measured.NetworkRx == nil || *measured.NetworkRx != 0 {
		t.Fatalf("nullable measurements did not retain independent observations: %+v", measured)
	}
	if data.Summary.PeakCPUPercent != nil || data.Summary.ObservedMemoryBytes == nil ||
		*data.Summary.ObservedMemoryBytes != 512 {
		t.Fatalf("unknown measurements contributed to summary: %+v", data.Summary)
	}
}
