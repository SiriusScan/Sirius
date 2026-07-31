package contract

import (
	"fmt"
	"net/http/httptest"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// DeprecatedShadowAllowlist lists METHOD\tPATH entries that may remain shadowed
// for inventory fidelity. Policy: only exact duplicate registrations already
// classified deprecated (currently the second GET /host/source-coverage) may be
// allowlisted. Do not expand this list for new public/internal routes.
var DeprecatedShadowAllowlist = map[string]string{
	"GET\t/host/source-coverage": "intentional duplicate registration retained for golden fidelity; first registration remains reachable",
}

// FindShadowedFixedRoutes reports routes that Fiber would dispatch to an earlier
// registration instead. Detection mounts pairs into a real Fiber app and probes
// a concrete path for the later route.
//
// Covers final-segment params, mid-path params (/x/:id/detail vs /x/stats/detail),
// partially parameterized later routes, wildcards, and optional params.
func FindShadowedFixedRoutes(live []LiveRoute) []string {
	var findings []string
	for i := 0; i < len(live); i++ {
		later := live[i]
		probe := materializeProbePath(later.Path)
		if probe == "" {
			continue
		}
		for j := 0; j < i; j++ {
			earlier := live[j]
			if earlier.Method != later.Method {
				continue
			}
			if !fiberEarlierWins(earlier, later, probe) {
				continue
			}
			key := later.Method + "\t" + later.Path
			if reason, ok := DeprecatedShadowAllowlist[key]; ok {
				_ = reason
				continue
			}
			findings = append(findings, fmt.Sprintf(
				"%s shadowed by earlier %s (probe %s)",
				key,
				earlier.Method+"\t"+earlier.Path,
				probe,
			))
			break
		}
	}
	return findings
}

func fiberEarlierWins(earlier, later LiveRoute, probe string) bool {
	app := fiber.New()
	hit := ""
	app.Add(earlier.Method, earlier.Path, func(c *fiber.Ctx) error {
		hit = "earlier"
		return c.SendStatus(fiber.StatusNoContent)
	})
	app.Add(later.Method, later.Path, func(c *fiber.Ctx) error {
		hit = "later"
		return c.SendStatus(fiber.StatusNoContent)
	})
	req := httptest.NewRequest(later.Method, probe, nil)
	resp, err := app.Test(req)
	if err != nil {
		return false
	}
	_ = resp.Body.Close()
	return hit == "earlier"
}

// materializeProbePath turns a Fiber route pattern into a concrete URL that the
// later route intends to serve. Fixed segments are preserved; parameters become
// distinctive tokens unlikely to equal neighboring fixed names.
func materializeProbePath(pattern string) string {
	if pattern == "" {
		return ""
	}
	parts := strings.Split(pattern, "/")
	out := make([]string, 0, len(parts))
	paramIdx := 0
	for _, part := range parts {
		if part == "" {
			out = append(out, "")
			continue
		}
		switch {
		case part == "*":
			out = append(out, "wildcard-leaf")
		case strings.HasPrefix(part, ":") && strings.HasSuffix(part, "?"):
			// Optional param: omit to exercise the optional-absent path.
			continue
		case strings.HasPrefix(part, ":") && len(part) > 1:
			paramIdx++
			out = append(out, fmt.Sprintf("p%d", paramIdx))
		case strings.HasPrefix(part, "{") && strings.HasSuffix(part, "}") && len(part) > 2:
			paramIdx++
			out = append(out, fmt.Sprintf("p%d", paramIdx))
		default:
			out = append(out, part)
		}
	}
	path := strings.Join(out, "/")
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return path
}
