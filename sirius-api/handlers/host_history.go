package handlers

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/SiriusScan/go-api/sirius/scope"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

const acceptedReportHistoryView = "accepted_reports"

type readAcceptedReportHistory func(context.Context, scope.ResourceScope, string, int, string) (host.AcceptedReportHistoryPage, error)

type hostHistoryResponse struct {
	View       string             `json:"view"`
	HostIP     string             `json:"host_ip"`
	Timeline   []hostHistoryEvent `json:"timeline"`
	Sources    []string           `json:"sources"`
	NextCursor string             `json:"next_cursor,omitempty"`
}

type hostHistoryEvent struct {
	ID        string               `json:"id"`
	EventType string               `json:"event_type"`
	Timestamp *time.Time           `json:"timestamp"`
	Source    string               `json:"source"`
	Details   string               `json:"details"`
	Report    *host.AcceptedReport `json:"report,omitempty"`
}

var communityAcceptedReportHistory = ScopedAcceptedReportHistory(func(*fiber.Ctx) (scope.ResourceScope, error) {
	return scope.Global(), nil
})

// ScopedAcceptedReportHistory reads journal rows using scope supplied by an
// authenticated resolver. Community mounts the global scope behind API-key auth.
func ScopedAcceptedReportHistory(resolve ScopeResolver) fiber.Handler {
	return scopedAcceptedReportHistory(resolve, func(
		ctx context.Context, resourceScope scope.ResourceScope, ip string, limit int, cursor string,
	) (host.AcceptedReportHistoryPage, error) {
		return host.NewHostRepository().ListAcceptedReportHistory(ctx, resourceScope, ip, limit, cursor)
	})
}

func scopedAcceptedReportHistory(resolve ScopeResolver, read readAcceptedReportHistory) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if resolve == nil || read == nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Host history is unavailable"})
		}
		resourceScope, err := resolve(c)
		if err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Host history access denied"})
		}

		ip, err := url.PathUnescape(c.Params("id"))
		ip = strings.TrimSpace(ip)
		if err != nil || !isValidSingleHostIP(ip) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "A concrete host IP is required"})
		}
		limit := host.DefaultAcceptedReportLimit
		if value := c.Query("limit"); value != "" {
			limit, err = strconv.Atoi(value)
			if err != nil || limit < 1 || limit > host.MaxAcceptedReportLimit {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid history page limit"})
			}
		}

		cursor := c.Query("cursor")
		page, err := read(c.UserContext(), resourceScope, ip, limit, cursor)
		switch {
		case errors.Is(err, host.ErrInvalidAcceptedReportPage):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid history page cursor"})
		case errors.Is(err, gorm.ErrRecordNotFound):
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Host not found"})
		case err != nil:
			slog.Warn("Failed to read accepted host report history", "error_type", fmt.Sprintf("%T", err))
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Host history is unavailable"})
		}
		return c.JSON(projectHostHistory(page, cursor == ""))
	}
}

func projectHostHistory(page host.AcceptedReportHistoryPage, includeDiscovery bool) hostHistoryResponse {
	timeline := make([]hostHistoryEvent, 0, len(page.Reports)+1)
	sources := make([]string, 0)
	seen := make(map[string]struct{})
	for i := range page.Reports {
		report := &page.Reports[i]
		timeline = append(timeline, hostHistoryEvent{
			ID:        "report-" + strconv.FormatUint(uint64(report.ID), 10),
			EventType: "report_accepted",
			Timestamp: report.AcceptedAt,
			Source:    report.Source,
			Details:   "Host report accepted",
			Report:    report,
		})
		if _, exists := seen[report.Source]; report.Source != "" && !exists {
			seen[report.Source] = struct{}{}
			sources = append(sources, report.Source)
		}
	}
	if includeDiscovery && page.HostCreatedAt != nil {
		timeline = append(timeline, hostHistoryEvent{
			ID:        "host-discovery-" + strconv.FormatUint(uint64(page.HostID), 10),
			EventType: "host_discovery",
			Timestamp: page.HostCreatedAt,
			Source:    "initial",
			Details:   "Host first discovered",
		})
	}
	sort.Strings(sources)
	return hostHistoryResponse{
		View:       acceptedReportHistoryView,
		HostIP:     page.HostIP,
		Timeline:   timeline,
		Sources:    sources,
		NextCursor: page.NextCursor,
	}
}
