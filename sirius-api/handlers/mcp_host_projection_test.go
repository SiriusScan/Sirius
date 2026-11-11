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
	finding := sirius.Vulnerability{
		VID: "CVE-2024-1234", Title: "Synthetic finding", Description: "Synthetic public description", RiskScore: 8.1,
		CVEID: "CVE-2024-1234", CVSSScore: 8.1, CVSSVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
		Severity: "high", Remediation: "Apply the vendor update", Category: "synthetic", Tags: []string{"fixture"}, Confidence: 0,
		Metadata: map[string]interface{}{
			"evidence": marker, "references": []string{"https://example.test/advisory"},
			"observation_id": json.Number("9007199254740993"),
		},
	}
	wantFinding, err := json.Marshal(finding)
	if err != nil {
		t.Fatal(err)
	}
	assertCompleteFinding := func(raw json.RawMessage, path string) {
		t.Helper()
		var fields map[string]json.RawMessage
		if err := json.Unmarshal(raw, &fields); err != nil {
			t.Fatalf("invalid finding JSON for %s: %v", path, err)
		}
		if confidence, ok := fields["confidence"]; !ok || string(confidence) != "0" {
			t.Errorf("%s omitted or changed explicit zero confidence: %s", path, raw)
		}
		var got sirius.Vulnerability
		decoder := json.NewDecoder(strings.NewReader(string(raw)))
		decoder.UseNumber()
		if err := decoder.Decode(&got); err != nil {
			t.Fatalf("invalid finding for %s: %v", path, err)
		}
		encoded, err := json.Marshal(got)
		if err != nil || string(encoded) != string(wantFinding) {
			t.Errorf("%s changed finding payload: got %s, want %s (error %v)", path, encoded, wantFinding, err)
		}
	}
	basic := sirius.Host{
		IP: "192.0.2.10", HID: "synthetic-host", Hostname: "fixture-host",
		Users: []string{marker}, Notes: []string{marker}, Agent: &sirius.SiriusAgent{HostKey: marker},
		Vulnerabilities: []sirius.Vulnerability{finding},
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
		SourceAttribution: models.SourceAttribution{Source: "synthetic", SourceVersion: "1.0", FirstSeen: now, LastSeen: now, Confidence: 0, Notes: marker},
		Finding:           &finding,
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
				for _, forbidden := range []string{marker, "software_inventory", "system_fingerprint", "agent_metadata", "HostKey", "HostVulnerabilities", `"users"`, `"notes"`, `"finding"`, `"metadata"`, `"remediation"`, `"category"`, `"tags"`, `"cvss_vector"`, `"cve_id"`} {
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
			} else {
				if !strings.Contains(string(raw), marker) {
					t.Errorf("legacy/root response changed for %s", path)
				}
				// Full-authority responses retain the complete finding for both
				// ordinary host reads and the additive source-specific snapshot.
				type hostFindingResponse struct {
					Vulnerabilities []json.RawMessage `json:"vulnerabilities"`
				}
				var findings []json.RawMessage
				switch path {
				case "/host":
					var hosts []hostFindingResponse
					if err := json.Unmarshal(raw, &hosts); err != nil || len(hosts) != 1 {
						t.Fatalf("invalid host list: %s (error %v)", raw, err)
					}
					findings = hosts[0].Vulnerabilities
				case "/host/192.0.2.10":
					var host hostFindingResponse
					if err := json.Unmarshal(raw, &host); err != nil {
						t.Fatal(err)
					}
					findings = host.Vulnerabilities
				case "/host/192.0.2.10/sources":
					var sourceHost struct {
						Sources []struct {
							Finding json.RawMessage `json:"finding"`
						} `json:"vulnerability_sources"`
					}
					if err := json.Unmarshal(raw, &sourceHost); err != nil || len(sourceHost.Sources) != 1 {
						t.Fatalf("invalid host sources: %s (error %v)", raw, err)
					}
					findings = []json.RawMessage{sourceHost.Sources[0].Finding}
				}
				if len(findings) != 1 {
					t.Fatalf("%s lost finding: %s", path, raw)
				}
				assertCompleteFinding(findings[0], path)
			}
		}
	}
}
