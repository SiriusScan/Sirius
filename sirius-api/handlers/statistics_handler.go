package handlers

import (
	"log/slog"

	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/gofiber/fiber/v2"
)

// GetMostVulnerableHosts handles GET /api/v1/statistics/hosts/most-vulnerable
// Query Parameters:
//   - limit: Maximum number of hosts to return (default: 10, max: 50)
//   - refresh: Force cache invalidation and recalculation (default: false)
//
// Returns: VulnerableHostsResponse with ranked host statistics
func GetMostVulnerableHosts(c *fiber.Ctx) error {
	// Parse query parameters
	limit := c.QueryInt("limit", 10)

	// Enforce limits for performance and reasonable response sizes
	if limit > 50 {
		limit = 50 // Max cap to prevent excessive query time
	}
	if limit < 1 {
		limit = 10 // Default to 10 if invalid
	}

	// Check if force refresh requested
	forceRefresh := c.Query("refresh", "false") == "true"

	if forceRefresh {
		// Invalidate cache first to force recalculation
		_ = host.InvalidateMostVulnerableHostsCache()
	}

	// Get data (cached or fresh)
	response, err := host.GetMostVulnerableHostsCached(limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve vulnerable hosts statistics",
			"details": err.Error(),
		})
	}

	// Debug: Log response details
	if len(response.Hosts) == 0 {
		slog.Warn("GetMostVulnerableHosts returned 0 hosts", "limit", limit, "cached", response.Cached)
		// If we got cached empty results, invalidate and try again
		if response.Cached {
			slog.Debug("GetMostVulnerableHosts: invalidating cache and retrying")
			_ = host.InvalidateMostVulnerableHostsCache()
			response, err = host.GetMostVulnerableHostsCached(limit)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "Failed to retrieve vulnerable hosts statistics after cache invalidation",
					"details": err.Error(),
				})
			}
		}
	} else {
		slog.Debug("GetMostVulnerableHosts returning", "host_count", len(response.Hosts), "cached", response.Cached)
	}

	return c.JSON(response)
}

// InvalidateVulnerableHostsCache handles POST /api/v1/statistics/hosts/most-vulnerable/invalidate
// This endpoint allows manual cache invalidation for immediate refresh
//
// Returns: Success confirmation
func InvalidateVulnerableHostsCache(c *fiber.Ctx) error {
	err := host.InvalidateMostVulnerableHostsCache()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to invalidate cache",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Cache invalidated successfully",
	})
}
