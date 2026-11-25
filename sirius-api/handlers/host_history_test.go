package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/SiriusScan/go-api/sirius/scope"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func TestAcceptedHostHistoryPages(t *testing.T) {
	alice := scope.ForSubject("alice")
	acceptedAt := time.Date(2026, 11, 24, 18, 0, 0, 0, time.UTC)
	createdAt := acceptedAt.Add(-time.Hour)
	zero := 0
	app := fiber.New()
	app.Get("/host/:id/history", scopedAcceptedReportHistory(
		func(*fiber.Ctx) (scope.ResourceScope, error) { return alice, nil },
		func(ctx context.Context, actual scope.ResourceScope, ip string, limit int, cursor string) (host.AcceptedReportHistoryPage, error) {
			if ctx == nil || actual != alice || ip != "2001:db8::1" || limit != 1 {
				t.Errorf("history arguments: %v %+v %s %d", ctx, actual, ip, limit)
			}
			page := host.AcceptedReportHistoryPage{HostID: 19, HostIP: ip, HostCreatedAt: &createdAt}
			switch cursor {
			case "":
				page.Reports = []host.AcceptedReport{{
					ID: 3, Source: "network", SourceVersion: "2", AcceptedAt: &acceptedAt,
					SubmittedItemCount: &zero, AssessmentCoverage: "unknown",
				}}
				page.NextCursor = "fixture-next"
			case "fixture-next":
				page.Reports = []host.AcceptedReport{{ID: 2, Source: "agent", AssessmentCoverage: "unknown"}}
			default:
				t.Errorf("unexpected cursor %q", cursor)
			}
			return page, nil
		},
	))

	request := func(cursor string) hostHistoryResponse {
		t.Helper()
		path := "/host/2001%3Adb8%3A%3A1/history?limit=1&owner_subject_id=bob" + cursor
		resp, err := app.Test(httptest.NewRequest("GET", path, nil))
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != fiber.StatusOK {
			t.Fatalf("status = %d", resp.StatusCode)
		}
		var page hostHistoryResponse
		if err := json.NewDecoder(resp.Body).Decode(&page); err != nil {
			t.Fatal(err)
		}
		return page
	}
	first := request("")
	if first.View != acceptedReportHistoryView || first.NextCursor != "fixture-next" || len(first.Timeline) != 2 {
		t.Fatalf("first page = %+v", first)
	}
	event := first.Timeline[0]
	if event.ID != "report-3" || event.EventType != "report_accepted" || event.Report == nil ||
		event.Report.SubmittedItemCount == nil || *event.Report.SubmittedItemCount != 0 ||
		event.Report.AssessmentCoverage != "unknown" || event.Timestamp == nil || !event.Timestamp.Equal(acceptedAt) {
		t.Fatalf("first event = %+v", event)
	}
	if discovery := first.Timeline[1]; discovery.ID != "host-discovery-19" || discovery.EventType != "host_discovery" || discovery.Report != nil {
		t.Fatalf("discovery = %+v", discovery)
	}
	second := request("&cursor=fixture-next")
	if second.NextCursor != "" || len(second.Timeline) != 1 || second.Timeline[0].ID != "report-2" ||
		second.Timeline[0].Timestamp != nil || second.Timeline[0].Report == nil || second.Timeline[0].Report.SubmittedItemCount != nil {
		t.Fatalf("second page = %+v", second)
	}
}

func TestAcceptedHostHistoryErrorsAndEmpty(t *testing.T) {
	authorized := func(*fiber.Ctx) (scope.ResourceScope, error) { return scope.Global(), nil }
	denied := func(*fiber.Ctx) (scope.ResourceScope, error) { return scope.Global(), errors.New("denied") }
	for _, tc := range []struct {
		name        string
		query       string
		resolve     ScopeResolver
		readErr     error
		status      int
		readCalled  bool
	}{
		{"empty journal", "", authorized, nil, fiber.StatusOK, true},
		{"unknown host", "", authorized, gorm.ErrRecordNotFound, fiber.StatusNotFound, true},
		{"database failure", "", authorized, errors.New("backend fixture details"), fiber.StatusServiceUnavailable, true},
		{"no authorized scope", "", denied, nil, fiber.StatusForbidden, false},
		{"unavailable resolver", "", nil, nil, fiber.StatusServiceUnavailable, false},
		{"bad limit", "?limit=101", authorized, nil, fiber.StatusBadRequest, false},
		{"bad cursor", "?cursor=invalid", authorized, host.ErrInvalidAcceptedReportPage, fiber.StatusBadRequest, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			app := fiber.New()
			called := false
			app.Get("/host/:id/history", scopedAcceptedReportHistory(tc.resolve, func(
				_ context.Context, _ scope.ResourceScope, ip string, _ int, _ string,
			) (host.AcceptedReportHistoryPage, error) {
				called = true
				return host.AcceptedReportHistoryPage{HostID: 1, HostIP: ip}, tc.readErr
			}))
			resp, err := app.Test(httptest.NewRequest("GET", "/host/192.0.2.1/history"+tc.query, nil))
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			if resp.StatusCode != tc.status || called != tc.readCalled {
				t.Fatalf("status = %d, read called = %v", resp.StatusCode, called)
			}
			var body json.RawMessage
			if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
				t.Fatal(err)
			}
			if tc.status == fiber.StatusOK && !strings.Contains(string(body), `"timeline":[]`) {
				t.Errorf("expected empty timeline, got %s", body)
			}
			if strings.Contains(string(body), "backend fixture details") {
				t.Errorf("response exposed backend details: %s", body)
			}
		})
	}
}
