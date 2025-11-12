package handlers

import (
	"context"
	"fmt"
	"strconv"

	"github.com/SiriusScan/go-api/sirius/snapshot"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// GetVulnerabilityTrends handles GET /api/v1/statistics/vulnerability-trends
func GetVulnerabilityTrends(c *fiber.Ctx) error {
	// Parse query parameters - now uses limit (number of snapshots) instead of days
	limitParam := c.Query("limit", "7")
	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit < 1 {
		limit = 7
	}
	if limit > 10 {
		limit = 10 // Cap at maximum retention
	}

	// Initialize Valkey store and snapshot manager
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to data store",
		})
	}
	defer kvStore.Close()

	manager := snapshot.NewSnapshotManager(kvStore)
	ctx := context.Background()

	// Get trend data (returns up to limit most recent snapshots)
	snapshots, err := manager.GetTrendData(ctx, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to retrieve trend data: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"snapshots":        snapshots,
		"limit_requested":  limit,
		"snapshots_returned": len(snapshots),
	})
}

// GetSnapshot handles GET /api/v1/statistics/vulnerability-snapshot/:snapshotId
func GetSnapshot(c *fiber.Ctx) error {
	snapshotID := c.Params("snapshotId")

	if snapshotID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Snapshot ID is required",
		})
	}

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to data store",
		})
	}
	defer kvStore.Close()

	manager := snapshot.NewSnapshotManager(kvStore)
	ctx := context.Background()

	snapshot, err := manager.GetSnapshot(ctx, snapshotID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": fmt.Sprintf("Snapshot not found for ID %s", snapshotID),
		})
	}

	return c.JSON(snapshot)
}

// CreateSnapshot handles POST /api/v1/statistics/vulnerability-snapshot (manual trigger)
func CreateSnapshot(c *fiber.Ctx) error {
	// Optional: Add authentication/authorization check here

	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to data store",
		})
	}
	defer kvStore.Close()

	manager := snapshot.NewSnapshotManager(kvStore)
	ctx := context.Background()

	// Pass empty string to auto-generate timestamp-based snapshot ID
	snapshot, err := manager.CreateSnapshot(ctx, "")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to create snapshot: %v", err),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":  "Snapshot created successfully",
		"snapshot": snapshot,
	})
}

// ListSnapshots handles GET /api/v1/statistics/vulnerability-snapshots
func ListSnapshots(c *fiber.Ctx) error {
	kvStore, err := store.NewValkeyStore()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to data store",
		})
	}
	defer kvStore.Close()

	manager := snapshot.NewSnapshotManager(kvStore)
	ctx := context.Background()

	snapshotIDs, err := manager.ListSnapshots(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to list snapshots",
		})
	}

	return c.JSON(fiber.Map{
		"available_snapshot_ids": snapshotIDs,
		"count":                  len(snapshotIDs),
	})
}

