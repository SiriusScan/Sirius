package integration_tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius/snapshot"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/sirius-api/handlers"
	"github.com/gofiber/fiber/v2"
)

// NOTE: These integration tests require:
// 1. Running PostgreSQL database (sirius-postgres container)
// 2. Running Valkey instance (sirius-valkey container)
// 3. Test data in the database (hosts and vulnerabilities)
//
// To run these tests:
//   1. Start the docker-compose environment
//   2. Ensure test data exists in the database
//   3. Run: go test -v ./integration_tests -tags=integration

func TestSnapshotAPICreate(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	t.Log("\n🔍 Testing snapshot creation via API...")

	app := fiber.New()
	app.Post("/api/v1/statistics/vulnerability-snapshot", handlers.CreateSnapshot)

	req := httptest.NewRequest("POST", "/api/v1/statistics/vulnerability-snapshot", nil)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("❌ Failed to make request: %v", err)
	}

	if resp.StatusCode != http.StatusCreated {
		t.Errorf("❌ Expected status 201, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatalf("❌ Failed to decode response: %v", err)
	}

	if result["message"] != "Snapshot created successfully" {
		t.Errorf("❌ Unexpected message: %v", result["message"])
	}

	t.Log("\n✅ Snapshot creation API test passed")
}

func TestSnapshotAPIList(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	t.Log("\n🔍 Testing snapshot listing via API...")

	app := fiber.New()
	app.Get("/api/v1/statistics/vulnerability-snapshots", handlers.ListSnapshots)

	req := httptest.NewRequest("GET", "/api/v1/statistics/vulnerability-snapshots", nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("❌ Failed to make request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("❌ Expected status 200, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatalf("❌ Failed to decode response: %v", err)
	}

	if _, ok := result["available_dates"]; !ok {
		t.Errorf("❌ Response missing 'available_dates' field")
	}

	t.Log("\n✅ Snapshot listing API test passed")
}

func TestSnapshotAPIGetTrends(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	t.Log("\n🔍 Testing vulnerability trends API...")

	app := fiber.New()
	app.Get("/api/v1/statistics/vulnerability-trends", handlers.GetVulnerabilityTrends)

	req := httptest.NewRequest("GET", "/api/v1/statistics/vulnerability-trends?days=7", nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("❌ Failed to make request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("❌ Expected status 200, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatalf("❌ Failed to decode response: %v", err)
	}

	if _, ok := result["snapshots"]; !ok {
		t.Errorf("❌ Response missing 'snapshots' field")
	}

	if daysRequested, ok := result["days_requested"].(float64); !ok || daysRequested != 7 {
		t.Errorf("❌ Unexpected days_requested: %v", result["days_requested"])
	}

	t.Log("\n✅ Vulnerability trends API test passed")
}

func TestSnapshotAPIGetSpecific(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	t.Log("\n🔍 Testing get specific snapshot API...")

	// First create a snapshot
	date := time.Now().UTC().Format("2006-01-02")
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		t.Skipf("Skipping test: Valkey not available: %v", err)
	}
	defer kvStore.Close()

	manager := snapshot.NewSnapshotManager(kvStore)
	ctx := context.Background()

	_, err = manager.CreateSnapshot(ctx, date)
	if err != nil {
		t.Skipf("Skipping test: Failed to create test snapshot: %v", err)
	}

	// Now test the API endpoint
	app := fiber.New()
	app.Get("/api/v1/statistics/vulnerability-snapshot/:date", handlers.GetSnapshot)

	req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/statistics/vulnerability-snapshot/%s", date), nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("❌ Failed to make request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("❌ Expected status 200, got %d", resp.StatusCode)
	}

	var snapshot store.VulnerabilitySnapshot
	if err := json.NewDecoder(resp.Body).Decode(&snapshot); err != nil {
		t.Fatalf("❌ Failed to decode response: %v", err)
	}

	if snapshot.SnapshotID != date {
		t.Errorf("❌ SnapshotID mismatch: expected %s, got %s", date, snapshot.SnapshotID)
	}

	t.Log("\n✅ Get specific snapshot API test passed")
}

func TestSnapshotAPIBadDate(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	t.Log("\n🔍 Testing API with invalid date format...")

	app := fiber.New()
	app.Get("/api/v1/statistics/vulnerability-snapshot/:date", handlers.GetSnapshot)

	req := httptest.NewRequest("GET", "/api/v1/statistics/vulnerability-snapshot/invalid-date", nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("❌ Failed to make request: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("❌ Expected status 400 for invalid date, got %d", resp.StatusCode)
	}

	t.Log("\n✅ Bad date format API test passed")
}

func TestSnapshotValkeyPersistence(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	t.Log("\n🔍 Testing Valkey persistence...")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		t.Skipf("Skipping test: Valkey not available: %v", err)
	}
	defer kvStore.Close()

	manager := snapshot.NewSnapshotManager(kvStore)
	ctx := context.Background()

	date := time.Now().UTC().Format("2006-01-02")

	// Create snapshot
	snapshot, err := manager.CreateSnapshot(ctx, date)
	if err != nil {
		t.Fatalf("❌ Failed to create snapshot: %v", err)
	}

	// Verify it was stored
	key := fmt.Sprintf("vuln:snapshot:%s", date)
	resp, err := kvStore.GetValue(ctx, key)
	if err != nil {
		t.Fatalf("❌ Failed to retrieve snapshot from Valkey: %v", err)
	}

	var retrieved store.VulnerabilitySnapshot
	if err := json.Unmarshal([]byte(resp.Message.Value), &retrieved); err != nil {
		t.Fatalf("❌ Failed to unmarshal snapshot from Valkey: %v", err)
	}

	if retrieved.SnapshotID != snapshot.SnapshotID {
		t.Errorf("❌ SnapshotID mismatch: expected %s, got %s", snapshot.SnapshotID, retrieved.SnapshotID)
	}

	t.Log("\n✅ Valkey persistence test passed")
}

func TestSnapshotCleanup(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	t.Log("\n🔍 Testing snapshot cleanup (10 snapshot limit)...")

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		t.Skipf("Skipping test: Valkey not available: %v", err)
	}
	defer kvStore.Close()

	manager := snapshot.NewSnapshotManager(kvStore)
	ctx := context.Background()

	// Create 12 snapshots (more than the 10 limit)
	baseDate := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	for i := 0; i < 12; i++ {
		date := baseDate.AddDate(0, 0, i).Format("2006-01-02")
		testSnapshot := &store.VulnerabilitySnapshot{
			SnapshotID: date,
			Timestamp:  time.Now().UTC(),
			Counts:     store.VulnerabilityCounts{Total: 10},
		}
		key := fmt.Sprintf("vuln:snapshot:%s", date)
		data, _ := json.Marshal(testSnapshot)
		kvStore.SetValue(ctx, key, string(data))
	}

	// Run cleanup
	if err := manager.CleanupOldSnapshots(ctx); err != nil {
		t.Fatalf("❌ Cleanup failed: %v", err)
	}

	// Verify only 10 snapshots remain
	dates, err := manager.ListSnapshots(ctx)
	if err != nil {
		t.Fatalf("❌ Failed to list snapshots: %v", err)
	}

	if len(dates) != 10 {
		t.Errorf("❌ Expected 10 snapshots after cleanup, got %d", len(dates))
	}

	t.Log("\n✅ Snapshot cleanup test passed")
}

