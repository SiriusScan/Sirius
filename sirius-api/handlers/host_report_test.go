package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/gofiber/fiber/v2"
)

func TestHostReportRejectsInvalidFindingBeforeEnrichment(t *testing.T) {
	installEnrichmentTransport(t, func(*http.Request) (*http.Response, error) {
		t.Fatal("invalid report reached enrichment")
		return nil, nil
	})
	for _, route := range []string{"/host", "/host/with-source"} {
		for _, invalid := range []string{`{"vid":"TEST-BAD","confidence":1.5}`, `{"vid":" ","confidence":0.5}`} {
			t.Run(route+invalid, func(t *testing.T) {
				body := `{"ip":"192.0.2.171","ports":[{"number":443}],"vulnerabilities":[{"vid":"CVE-2024-0001","confidence":0.9},` + invalid + `]}`
				if route != "/host" {
					body = `{"host":` + body + `,"source":{"name":"scanner"},"agent_metadata":{"agent":"fixture"}}`
				}
				app := fiber.New()
				app.Post("/host", AddHost)
				app.Post("/host/with-source", AddHostWithSource)
				req := httptest.NewRequest(http.MethodPost, route, strings.NewReader(body))
				req.Header.Set("Content-Type", "application/json")
				response, err := app.Test(req)
				if err != nil {
					t.Fatal(err)
				}
				defer response.Body.Close()
				if response.StatusCode != http.StatusBadRequest {
					t.Fatalf("status=%d", response.StatusCode)
				}
			})
		}
	}
}

func TestHostReportErrorStatus(t *testing.T) {
	if got := hostReportErrorStatus(fmt.Errorf("wrapped: %w", host.ErrInvalidReport)); got != 400 {
		t.Fatalf("validation status=%d", got)
	}
	if got := hostReportErrorStatus(errors.New("database failed")); got != 500 {
		t.Fatalf("persistence status=%d", got)
	}
}
