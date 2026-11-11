package handlers

import (
	"context"
	"log/slog"
	"time"

	"github.com/SiriusScan/go-api/nvd"
	"github.com/SiriusScan/go-api/sirius"
	"github.com/gofiber/fiber/v2"
)

const hostNVDEnrichmentTimeout = 30 * time.Second

func newNVDEnrichmentContext(c *fiber.Ctx) (context.Context, context.CancelFunc) {
	// Fiber's request context does not cancel on client disconnect. Respect any
	// middleware-provided UserContext and always impose our own total budget.
	return context.WithTimeout(c.UserContext(), hostNVDEnrichmentTimeout)
}

func enrichHostVulnerability(ctx context.Context, vuln sirius.Vulnerability) sirius.Vulnerability {
	// Once the shared budget expires, persist the remaining original findings
	// without attempting further NVD requests.
	if ctx.Err() != nil {
		return vuln
	}
	cve, err := nvd.GetCVEContext(ctx, vuln.VID)
	if err != nil {
		slog.Warn("Failed to get CVE data", "vid", vuln.VID, "error", err)
		return vuln
	}
	if len(cve.Descriptions) > 0 {
		vuln.Description = cve.Descriptions[0].Value
	}
	if cve.ID != "" {
		vuln.Title = cve.ID
	}
	if len(cve.Metrics.CvssMetricV31) > 0 {
		vuln.RiskScore = cve.Metrics.CvssMetricV31[0].CvssData.BaseScore
	}
	return vuln
}
