package routes

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/SiriusScan/sirius-api/services"
	"github.com/gofiber/fiber/v2"
)

type routeScanAdmissionFixture struct {
	requests []services.NetworkScanRequest
	outcome  services.ScanAdmissionOutcome
}

func (f *routeScanAdmissionFixture) SubmitNetworkScan(
	_ context.Context, request services.NetworkScanRequest,
) services.NetworkScanReceipt {
	f.requests = append(f.requests, request)
	return services.NetworkScanReceipt{ScanID: request.ScanID, Outcome: f.outcome}
}

func TestSubmitNetworkScanRouteOutcomes(t *testing.T) {
	fixture := &routeScanAdmissionFixture{}
	app := fiber.New()
	(&ScanRouteSetter{Submission: fixture}).SetupRoutes(app)

	for _, test := range []struct {
		outcome services.ScanAdmissionOutcome
		status  int
	}{
		{services.NetworkScanSubmitted, fiber.StatusAccepted},
		{services.NetworkScanUnconfirmed, fiber.StatusAccepted},
		{services.NetworkScanBusy, fiber.StatusConflict},
		{services.NetworkScanFailed, fiber.StatusBadGateway},
		{services.NetworkScanNotRecorded, fiber.StatusServiceUnavailable},
	} {
		t.Run(string(test.outcome), func(t *testing.T) {
			fixture.outcome = test.outcome
			req := httptest.NewRequest(fiber.MethodPost, "/api/v1/scans/submit", strings.NewReader(
				`{"scan_id":"scan-1-http","template_id":"fixture","targets":[{"type":"dns_name","value":"fixture.invalid"}]}`,
			))
			req.Header.Set("Content-Type", "application/json")
			res, err := app.Test(req)
			if err != nil {
				t.Fatal(err)
			}
			defer res.Body.Close()
			var receipt services.NetworkScanReceipt
			if err := json.NewDecoder(res.Body).Decode(&receipt); err != nil {
				t.Fatal(err)
			}
			if res.StatusCode != test.status || receipt.ScanID != "scan-1-http" || receipt.Outcome != test.outcome {
				t.Errorf("status = %d, receipt = %+v", res.StatusCode, receipt)
			}
			called := fixture.requests[len(fixture.requests)-1]
			if called.Priority != 3 || called.TemplateID != "fixture" || len(called.Targets) != 1 {
				t.Errorf("unexpected mapped request: %+v", called)
			}
		})
	}
}

func TestSubmitNetworkScanRouteRejectsInvalidIntent(t *testing.T) {
	fixture := &routeScanAdmissionFixture{}
	app := fiber.New()
	(&ScanRouteSetter{Submission: fixture}).SetupRoutes(app)

	req := httptest.NewRequest(fiber.MethodPost, "/api/v1/scans/submit", strings.NewReader(
		`{"scan_id":"scan-1-http","targets":[{"type":"unsupported","value":"fixture.invalid"}]}`,
	))
	req.Header.Set("Content-Type", "application/json")
	res, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != fiber.StatusBadRequest || len(fixture.requests) != 0 {
		t.Errorf("invalid request status = %d, admissions = %d", res.StatusCode, len(fixture.requests))
	}
}
