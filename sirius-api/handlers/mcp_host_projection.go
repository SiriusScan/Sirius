package handlers

import (
	"time"

	"github.com/SiriusScan/go-api/sirius"
	"github.com/SiriusScan/go-api/sirius/postgres/models"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// mcp:read grants basic inventory and source-attributed findings, not software
// inventory, fingerprints, agent metadata/credentials, users, or free-form notes.
// Explicit DTOs prevent persistence-model additions from widening that grant.
func isMCPReadCaller(c *fiber.Ctx) bool {
	meta, ok := c.Locals("apikey_meta").(store.APIKeyMeta)
	return ok && meta.HasScope(store.ScopeMCPRead)
}

type mcpHostRead struct {
	HID             string           `json:"hid"`
	OS              string           `json:"os"`
	OSVersion       string           `json:"osversion"`
	IP              string           `json:"ip"`
	Hostname        string           `json:"hostname"`
	Ports           []sirius.Port    `json:"ports"`
	Services        []sirius.Service `json:"services"`
	CPE             []string         `json:"cpe"`
	Vulnerabilities []mcpCatalogRead `json:"vulnerabilities"`
}

type mcpCatalogRead struct {
	VID         string  `json:"vid"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	RiskScore   float64 `json:"riskScore"`
}

func projectMCPHost(h sirius.Host) mcpHostRead {
	vulns := make([]mcpCatalogRead, 0, len(h.Vulnerabilities))
	for _, v := range h.Vulnerabilities {
		vulns = append(vulns, mcpCatalogRead{v.VID, v.Title, v.Description, v.RiskScore})
	}
	return mcpHostRead{h.HID, h.OS, h.OSVersion, h.IP, h.Hostname, h.Ports, h.Services, h.CPE, vulns}
}

func sendHostRead(c *fiber.Ctx, h sirius.Host) error {
	if isMCPReadCaller(c) {
		return c.JSON(projectMCPHost(h))
	}
	return c.JSON(h)
}

func sendHostListRead(c *fiber.Ctx, hosts []sirius.Host) error {
	if !isMCPReadCaller(c) {
		return c.JSON(hosts)
	}
	result := make([]mcpHostRead, 0, len(hosts))
	for _, h := range hosts {
		result = append(result, projectMCPHost(h))
	}
	return c.JSON(result)
}

// Preserve the sources endpoint's existing field spellings without embedding
// models.Host or its recursive associations and JSONB fields.
type mcpHostSourcesRead struct {
	ID                   uint                         `json:"ID"`
	HID                  string                       `json:"HID"`
	OS                   string                       `json:"OS"`
	OSVersion            string                       `json:"OSVersion"`
	IP                   string                       `json:"IP"`
	Hostname             string                       `json:"Hostname"`
	VulnerabilitySources []mcpVulnerabilitySourceRead `json:"vulnerability_sources"`
	PortSources          []mcpPortSourceRead          `json:"port_sources"`
	Sources              []string                     `json:"sources"`
}

type mcpVulnerabilitySourceRead struct {
	VID           string    `json:"VID"`
	Description   string    `json:"Description"`
	Title         string    `json:"Title"`
	RiskScore     float64   `json:"RiskScore"`
	Source        string    `json:"source"`
	SourceVersion string    `json:"source_version"`
	FirstSeen     time.Time `json:"first_seen"`
	LastSeen      time.Time `json:"last_seen"`
	Status        string    `json:"status"`
	Confidence    float64   `json:"confidence"`
	Port          *int      `json:"port,omitempty"`
	ServiceInfo   string    `json:"service_info,omitempty"`
}

type mcpPortSourceRead struct {
	Number        int       `json:"Number"`
	Protocol      string    `json:"Protocol"`
	State         string    `json:"State"`
	Source        string    `json:"source"`
	SourceVersion string    `json:"source_version"`
	FirstSeen     time.Time `json:"first_seen"`
	LastSeen      time.Time `json:"last_seen"`
	Status        string    `json:"status"`
}

func sendHostSourcesRead(c *fiber.Ctx, h models.HostWithSources) error {
	if !isMCPReadCaller(c) {
		return c.JSON(h)
	}
	result := mcpHostSourcesRead{
		ID: h.ID, HID: h.HID, OS: h.OS, OSVersion: h.OSVersion, IP: h.IP, Hostname: h.Hostname,
		Sources:              h.Sources,
		VulnerabilitySources: make([]mcpVulnerabilitySourceRead, 0, len(h.VulnerabilitySources)),
		PortSources:          make([]mcpPortSourceRead, 0, len(h.PortSources)),
	}
	for _, v := range h.VulnerabilitySources {
		result.VulnerabilitySources = append(result.VulnerabilitySources, mcpVulnerabilitySourceRead{
			v.VID, v.Description, v.Title, v.RiskScore, v.Source, v.SourceVersion,
			v.FirstSeen, v.LastSeen, v.Status, v.Confidence, v.Port, v.ServiceInfo,
		})
	}
	for _, p := range h.PortSources {
		result.PortSources = append(result.PortSources, mcpPortSourceRead{
			p.Number, p.Protocol, p.State, p.Source, p.SourceVersion, p.FirstSeen, p.LastSeen, p.Status,
		})
	}
	return c.JSON(result)
}
