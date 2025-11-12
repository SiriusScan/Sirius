package handlers

import (
	"log"
	"strconv"
	"time"

	"github.com/SiriusScan/go-api/sirius/events"
	"github.com/gofiber/fiber/v2"
)

// GetEvents retrieves events with filters
func GetEvents(c *fiber.Ctx) error {
	// Parse query parameters
	filters := events.EventFilters{
		Service:    c.Query("service", ""),
		Severity:   c.Query("severity", ""),
		EventType:  c.Query("event_type", ""),
		EntityType: c.Query("entity_type", ""),
		EntityID:   c.Query("entity_id", ""),
	}

	// Parse limit and offset
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 500 {
		limit = 500
	}
	filters.Limit = limit

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}
	filters.Offset = offset

	// Parse time filters
	if startTimeStr := c.Query("start_time", ""); startTimeStr != "" {
		startTime, err := time.Parse(time.RFC3339, startTimeStr)
		if err == nil {
			filters.StartTime = &startTime
		}
	}

	if endTimeStr := c.Query("end_time", ""); endTimeStr != "" {
		endTime, err := time.Parse(time.RFC3339, endTimeStr)
		if err == nil {
			filters.EndTime = &endTime
		}
	}

	// Query events
	eventList, total, err := events.GetEvents(filters)
	if err != nil {
		log.Printf("Error retrieving events: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve events",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"events": eventList,
		"total":  total,
		"limit":  filters.Limit,
		"offset": filters.Offset,
	})
}

// GetEvent retrieves a single event by event_id
func GetEvent(c *fiber.Ctx) error {
	eventID := c.Params("id")
	if eventID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Event ID is required",
		})
	}

	event, err := events.GetEvent(eventID)
	if err != nil {
		log.Printf("Error retrieving event %s: %v", eventID, err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Event not found",
			"details": err.Error(),
		})
	}

	return c.JSON(event)
}

// GetEventStats returns event statistics
func GetEventStats(c *fiber.Ctx) error {
	stats, err := events.GetEventStatistics()
	if err != nil {
		log.Printf("Error retrieving event statistics: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve event statistics",
			"details": err.Error(),
		})
	}

	return c.JSON(stats)
}

// MarkEventsRead marks events as read (placeholder for future implementation)
func MarkEventsRead(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		EventIDs []string `json:"event_ids"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"details": err.Error(),
		})
	}

	if len(req.EventIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No event IDs provided",
		})
	}

	// TODO: Implement read status tracking in database
	// For now, just return success
	return c.JSON(fiber.Map{
		"message": "Mark as read functionality will be implemented in a future update",
		"event_ids": req.EventIDs,
		"marked_count": len(req.EventIDs),
	})
}

// GetEventsByEntity retrieves events for a specific entity
func GetEventsByEntity(c *fiber.Ctx) error {
	entityType := c.Query("entity_type", "")
	entityID := c.Query("entity_id", "")

	if entityType == "" || entityID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Both entity_type and entity_id are required",
		})
	}

	limitStr := c.Query("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}

	eventList, err := events.GetEventsByEntity(entityType, entityID, limit)
	if err != nil {
		log.Printf("Error retrieving events for entity %s/%s: %v", entityType, entityID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve events",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"entity_type": entityType,
		"entity_id": entityID,
		"events": eventList,
		"count": len(eventList),
	})
}

// GetRecentEventsBySeverity retrieves recent events filtered by severity
func GetRecentEventsBySeverity(c *fiber.Ctx) error {
	severity := c.Params("severity")
	if severity == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Severity is required",
		})
	}

	limitStr := c.Query("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}

	eventList, err := events.GetRecentEventsBySeverity(severity, limit)
	if err != nil {
		log.Printf("Error retrieving events by severity %s: %v", severity, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve events",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"severity": severity,
		"events": eventList,
		"count": len(eventList),
	})
}

