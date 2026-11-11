package handlers

import (
	"errors"

	"github.com/SiriusScan/go-api/sirius"
	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/SiriusScan/go-api/sirius/postgres/models"
	"github.com/SiriusScan/go-api/sirius/scope"
	"github.com/gofiber/fiber/v2"
)

// ScopeResolver must authenticate and authorize each request and derive its
// scope from trusted server-side information. A client-supplied scope alone
// is never sufficient. The handler is not mounted by Community by default.
type ScopeResolver func(*fiber.Ctx) (scope.ResourceScope, error)

type scopedHostReport struct {
	Host              sirius.Host            `json:"host"`
	Source            models.ScanSource      `json:"source"`
	SoftwareInventory map[string]interface{} `json:"software_inventory,omitempty"`
	SystemFingerprint map[string]interface{} `json:"system_fingerprint,omitempty"`
	AgentMetadata     map[string]interface{} `json:"agent_metadata,omitempty"`
}

// ScopedHostIngest provides a reusable ingestion handler for an extension that
// installs an authenticated resolver. An absent or failing resolver denies the
// request; no client field can select the persistence scope.
func ScopedHostIngest(resolve ScopeResolver) fiber.Handler {
	return scopedHostIngest(resolve, host.AddReportScoped)
}

func scopedHostIngest(resolve ScopeResolver, save func(scope.ResourceScope, host.Report) error) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if resolve == nil || save == nil {
			return c.SendStatus(fiber.StatusServiceUnavailable)
		}
		resourceScope, err := resolve(c)
		if err != nil {
			return c.SendStatus(fiber.StatusForbidden)
		}
		var request scopedHostReport
		if err := c.BodyParser(&request); err != nil || !isValidSingleHostIP(request.Host.IP) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid host report"})
		}
		report := host.Report{Host: request.Host, Source: request.Source, SoftwareInventory: request.SoftwareInventory, SystemFingerprint: request.SystemFingerprint, AgentMetadata: request.AgentMetadata}
		if err := save(resourceScope, report); err != nil {
			if errors.Is(err, host.ErrInvalidReport) {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid host report"})
			}
			return c.SendStatus(fiber.StatusInternalServerError)
		}
		return c.SendStatus(fiber.StatusNoContent)
	}
}
