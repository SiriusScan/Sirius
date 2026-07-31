package contract

import (
	"strings"
	"testing"
)

func TestShadowDetectorFiberMidPathParam(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/x/:id/detail"},
		{Method: "GET", Path: "/x/stats/detail"},
	}
	findings := FindShadowedFixedRoutes(live)
	if len(findings) != 1 {
		t.Fatalf("findings=%v", findings)
	}
	if !strings.Contains(findings[0], "/x/stats/detail shadowed by") {
		t.Fatalf("unexpected: %v", findings)
	}
}

func TestShadowDetectorPartialParamLaterRoute(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/api/:version/items"},
		{Method: "GET", Path: "/api/v1/items"},
	}
	findings := FindShadowedFixedRoutes(live)
	if len(findings) == 0 {
		t.Fatal("expected later fixed route to be shadowed by earlier param route")
	}
}

func TestShadowDetectorDuplicateParamShapes(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/items/:id"},
		{Method: "GET", Path: "/items/:name"},
	}
	findings := FindShadowedFixedRoutes(live)
	if len(findings) != 1 {
		t.Fatalf("duplicate param shapes should shadow later registration: %v", findings)
	}
}

func TestShadowDetectorWildcard(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/files/*"},
		{Method: "GET", Path: "/files/report"},
	}
	findings := FindShadowedFixedRoutes(live)
	if len(findings) != 1 {
		t.Fatalf("findings=%v", findings)
	}
}

func TestShadowDetectorOptionalParam(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/items/:id?"},
		{Method: "GET", Path: "/items"},
	}
	findings := FindShadowedFixedRoutes(live)
	if len(findings) != 1 {
		t.Fatalf("expected /items shadowed by optional param route, got %v", findings)
	}
}

func TestShadowAllowlistsDeprecatedDuplicateHostSourceCoverage(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/host/source-coverage"},
		{Method: "GET", Path: "/host/source-coverage"},
	}
	findings := FindShadowedFixedRoutes(live)
	for _, f := range findings {
		if strings.Contains(f, "/host/source-coverage") {
			t.Fatalf("deprecated duplicate should be allowlisted: %s", f)
		}
	}
}

func TestShadowDetectorFinalSegment(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/api/v1/events/:id"},
		{Method: "GET", Path: "/api/v1/events/stats"},
	}
	findings := FindShadowedFixedRoutes(live)
	if len(findings) != 1 {
		t.Fatalf("findings=%v", findings)
	}
	if !strings.Contains(findings[0], "/api/v1/events/stats shadowed by") {
		t.Fatalf("unexpected finding: %s", findings[0])
	}
}

func TestShadowDetectorDoesNotFalsePositiveDistinctPaths(t *testing.T) {
	live := []LiveRoute{
		{Method: "GET", Path: "/a/:id"},
		{Method: "GET", Path: "/b/:id"},
	}
	if findings := FindShadowedFixedRoutes(live); len(findings) != 0 {
		t.Fatalf("unexpected findings: %v", findings)
	}
}
