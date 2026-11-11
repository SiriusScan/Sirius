package handlers

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/SiriusScan/go-api/sirius"
	"github.com/gofiber/fiber/v2"
	"github.com/valyala/fasthttp"
)

type enrichmentRoundTripFunc func(*http.Request) (*http.Response, error)

func (f enrichmentRoundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

type enrichmentStalledBody struct {
	ctx     context.Context
	entered chan struct{}
}

func (b *enrichmentStalledBody) Read([]byte) (int, error) {
	close(b.entered)
	<-b.ctx.Done()
	return 0, b.ctx.Err()
}
func (b *enrichmentStalledBody) Close() error { return nil }
func installEnrichmentTransport(t *testing.T, rt enrichmentRoundTripFunc) {
	t.Helper()
	old := http.DefaultTransport
	http.DefaultTransport = rt
	t.Cleanup(func() { http.DefaultTransport = old })
}

func TestNVDHostContextHasTotalBudgetAndParentCancellation(t *testing.T) {
	app := fiber.New()
	c := app.AcquireCtx(&fasthttp.RequestCtx{})
	defer app.ReleaseCtx(c)
	ctx, cancel := newNVDEnrichmentContext(c)
	defer cancel()
	deadline, ok := ctx.Deadline()
	if !ok || time.Until(deadline) > hostNVDEnrichmentTimeout || time.Until(deadline) <= 0 {
		t.Fatal("missing total budget")
	}
	parent, cancelParent := context.WithTimeout(context.Background(), time.Second)
	defer cancelParent()
	c.SetUserContext(parent)
	child, cancelChild := newNVDEnrichmentContext(c)
	defer cancelChild()
	parentDeadline, _ := parent.Deadline()
	childDeadline, _ := child.Deadline()
	if childDeadline.After(parentDeadline) {
		t.Fatal("extended middleware deadline")
	}
	cancelParent()
	if child.Err() != context.Canceled {
		t.Fatalf("middleware cancellation not propagated: %v", child.Err())
	}
}

func TestNVDHostEnrichmentCancellationPreservesFinding(t *testing.T) {
	for _, mode := range []string{"headers", "body"} {
		t.Run(mode, func(t *testing.T) {
			entered := make(chan struct{})
			var calls atomic.Int32
			installEnrichmentTransport(t, func(r *http.Request) (*http.Response, error) {
				calls.Add(1)
				if mode == "headers" {
					close(entered)
					<-r.Context().Done()
					return nil, r.Context().Err()
				}
				return &http.Response{StatusCode: 200, Body: &enrichmentStalledBody{ctx: r.Context(), entered: entered}, Header: make(http.Header)}, nil
			})
			original := sirius.Vulnerability{VID: "CVE-2024-0001", Title: "finding", Description: "scanner evidence", RiskScore: 9.8}
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			done := make(chan sirius.Vulnerability, 1)
			go func() { done <- enrichHostVulnerability(ctx, original) }()
			select {
			case <-entered:
			case <-time.After(time.Second):
				t.Fatal("lookup did not start")
			}
			cancel()
			select {
			case got := <-done:
				if !reflect.DeepEqual(got, original) {
					t.Fatalf("lost finding: %+v", got)
				}
			case <-time.After(time.Second):
				t.Fatal("lookup did not cancel")
			}
			for i := 0; i < 10; i++ {
				if got := enrichHostVulnerability(ctx, original); !reflect.DeepEqual(got, original) {
					t.Fatal("remaining findings changed")
				}
			}
			if calls.Load() != 1 {
				t.Fatalf("requested after cancellation: %d", calls.Load())
			}
		})
	}
}

func TestNVDHostEnrichmentSharedBudget(t *testing.T) {
	var calls atomic.Int32
	installEnrichmentTransport(t, func(r *http.Request) (*http.Response, error) {
		calls.Add(1)
		<-r.Context().Done()
		return nil, r.Context().Err()
	})
	ctx, cancel := context.WithTimeout(context.Background(), 25*time.Millisecond)
	defer cancel()
	original := sirius.Vulnerability{VID: "CVE-2024-0001", Title: "finding", Description: "scanner evidence", RiskScore: 9.8}
	start := time.Now()
	for i := 0; i < 10; i++ {
		if got := enrichHostVulnerability(ctx, original); !reflect.DeepEqual(got, original) {
			t.Fatal("lost finding")
		}
	}
	if calls.Load() != 1 {
		t.Fatalf("budget not shared: %d requests", calls.Load())
	}
	if time.Since(start) > time.Second {
		t.Fatal("shared budget not enforced")
	}
}

func TestNVDHostEnrichmentMissingAndSuccessfulMetadata(t *testing.T) {
	for _, tc := range []struct {
		name, body      string
		status          int
		wantDescription string
		wantScore       float64
	}{
		{"empty", `{"vulnerabilities":[]}`, 200, "scanner evidence", 9.8},
		{"failure", `{}`, 503, "scanner evidence", 9.8},
		{"malformed", `{`, 200, "scanner evidence", 9.8},
		{"success", `{"vulnerabilities":[{"cve":{"id":"CVE-2024-0001","descriptions":[{"value":"NVD detail"}],"metrics":{"cvssMetricV31":[{"cvssData":{"baseScore":7.2}}]}}}]}`, 200, "NVD detail", 7.2},
	} {
		t.Run(tc.name, func(t *testing.T) {
			installEnrichmentTransport(t, func(*http.Request) (*http.Response, error) {
				return &http.Response{StatusCode: tc.status, Body: io.NopCloser(strings.NewReader(tc.body)), Header: make(http.Header)}, nil
			})
			original := sirius.Vulnerability{VID: "CVE-2024-0001", Title: "CVE-2024-0001", Description: "scanner evidence", RiskScore: 9.8}
			got := enrichHostVulnerability(context.Background(), original)
			if got.VID != original.VID || got.Title != original.Title || got.Description != tc.wantDescription || got.RiskScore != tc.wantScore {
				t.Fatalf("unexpected enrichment: %+v", got)
			}
		})
	}
}

func TestNVDGetVulnerabilityHonorsUserContext(t *testing.T) {
	installEnrichmentTransport(t, func(*http.Request) (*http.Response, error) {
		t.Fatal("canceled API request reached NVD")
		return nil, nil
	})
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	app := fiber.New()
	app.Get("/vulnerability/:id", func(c *fiber.Ctx) error { c.SetUserContext(ctx); return c.Next() }, GetVulnerability)
	resp, err := app.Test(httptest.NewRequest(http.MethodGet, "/vulnerability/CVE-2024-0001", nil))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusInternalServerError {
		t.Fatalf("got status %d", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil || !strings.Contains(string(body), "context canceled") {
		t.Fatalf("got %s, %v", body, err)
	}
}
