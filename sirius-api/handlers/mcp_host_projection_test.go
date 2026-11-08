package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius"
	"github.com/SiriusScan/go-api/sirius/postgres/models"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/sirius-api/middleware"
	"github.com/gofiber/fiber/v2"
)

func TestMCPHostProjectionWithPopulatedPrivateFields(t *testing.T) {
	kv := newHandlerKV()
	const scopedKey = "synthetic-scoped-reader"
	const legacyKey = "synthetic-legacy-reader"
	if _, err := store.StoreAPIKeyWithScopes(context.Background(), kv, scopedKey, "test", "test", []string{store.ScopeMCPRead}); err != nil {
		t.Fatal(err)
	}
	if _, err := store.StoreAPIKey(context.Background(), kv, legacyKey, "test", "test"); err != nil {
		t.Fatal(err)
	}
	const marker = "PRIVATE_FIELD_SENTINEL"
	basic := sirius.Host{
		IP: "192.0.2.10", HID: "synthetic-host", Hostname: "fixture-host",
		Users: []string{marker}, Notes: []string{marker}, Agent: &sirius.SiriusAgent{HostKey: marker},
	}
	sources := models.HostWithSources{Host: models.Host{
		IP: basic.IP, HID: basic.HID, Hostname: basic.Hostname,
		SoftwareInventory: models.JSONB{"package": marker},
		SystemFingerprint: models.JSONB{"fingerprint": marker},
		AgentMetadata:     models.JSONB{"token": marker},
		Notes:             []models.Note{{Content: marker}}, Users: []models.User{{Name: marker}},
	}}
	now := time.Date(2024, 1, 2, 3, 4, 5, 0, time.UTC)
	sources.VulnerabilitySources = []models.VulnerabilityWithSource{{
		Vulnerability:     models.Vulnerability{VID: "CVE-2024-1234", RiskScore: 8.1},
		SourceAttribution: models.SourceAttribution{Source: "synthetic", SourceVersion: "1.0", FirstSeen: now, LastSeen: now, Notes: marker},
	}}
	sources.PortSources = []models.PortWithSource{{Port: models.Port{Number: 22, Protocol: "tcp"}, SourceAttribution: models.SourceAttribution{Source: "synthetic", Notes: marker}}}
	sources.Sources = []string{"synthetic"}
	app := fiber.New()
	app.Use(middleware.APIKeyMiddleware(kv, "root-key"))
	// These are the same response functions used by production handlers, fed
	// populated synthetic records so no database/private inventory is needed.
	app.Get("/host", func(c *fiber.Ctx) error { return sendHostListRead(c, []sirius.Host{basic}) })
	app.Get("/host/:id", func(c *fiber.Ctx) error { return sendHostRead(c, basic) })
	app.Get("/host/:id/sources", func(c *fiber.Ctx) error { return sendHostSourcesRead(c, sources) })
	for _, path := range []string{"/host", "/host/192.0.2.10", "/host/192.0.2.10/sources"} {
		for _, key := range []string{scopedKey, legacyKey, "root-key"} {
			req := httptest.NewRequest("GET", path, nil)
			req.Header.Set("X-API-Key", key)
			resp, err := app.Test(req)
			if err != nil {
				t.Fatal(err)
			}
			raw, err := io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil || resp.StatusCode != 200 || !json.Valid(raw) {
				t.Fatalf("invalid response for %s", path)
			}
			if key == scopedKey {
				for _, forbidden := range []string{marker, "software_inventory", "system_fingerprint", "agent_metadata", "HostKey", "HostVulnerabilities", `"users"`, `"notes"`} {
					if strings.Contains(string(raw), forbidden) {
						t.Errorf("%s exposed %s", path, forbidden)
					}
				}
				if path == "/host/192.0.2.10/sources" {
					for _, required := range []string{"CVE-2024-1234", `"source_version":"1.0"`, `"RiskScore":8.1`, now.Format(time.RFC3339), `"Number":22`} {
						if !strings.Contains(string(raw), required) {
							t.Errorf("source projection lost %s", required)
						}
					}
				}
			} else if !strings.Contains(string(raw), marker) {
				t.Errorf("legacy/root response changed for %s", path)
			}
		}
	}
}
