package contract

import (
	"fmt"
	"strings"
)

// FindShadowedFixedRoutes reports fixed-path routes that are unreachable because
// an earlier same-method sibling parameterized route would match first.
//
// Example: GET /api/v1/events/:id registered before GET /api/v1/events/stats
// shadows the stats handler.
func FindShadowedFixedRoutes(live []LiveRoute) []string {
	type entry struct {
		index  int
		method string
		parts  []string
		raw    string
	}

	entries := make([]entry, 0, len(live))
	for i, route := range live {
		parts := splitPath(route.Path)
		entries = append(entries, entry{
			index:  i,
			method: route.Method,
			parts:  parts,
			raw:    route.Method + "\t" + route.Path,
		})
	}

	var findings []string
	for i, later := range entries {
		if hasParamSegment(later.parts) {
			continue
		}
		for j := 0; j < i; j++ {
			earlier := entries[j]
			if earlier.method != later.method {
				continue
			}
			if !sameParentPrefix(earlier.parts, later.parts) {
				continue
			}
			if len(earlier.parts) != len(later.parts) {
				continue
			}
			if shadows(earlier.parts, later.parts) {
				findings = append(findings, fmt.Sprintf(
					"%s shadowed by earlier %s",
					later.raw,
					earlier.raw,
				))
				break
			}
		}
	}
	return findings
}

func splitPath(path string) []string {
	trimmed := strings.Trim(path, "/")
	if trimmed == "" {
		return nil
	}
	return strings.Split(trimmed, "/")
}

func hasParamSegment(parts []string) bool {
	for _, part := range parts {
		if isParamSegment(part) {
			return true
		}
	}
	return false
}

func isParamSegment(part string) bool {
	return (strings.HasPrefix(part, ":") && len(part) > 1) ||
		(strings.HasPrefix(part, "{") && strings.HasSuffix(part, "}") && len(part) > 2)
}

func sameParentPrefix(a, b []string) bool {
	if len(a) == 0 || len(b) == 0 {
		return len(a) == len(b)
	}
	if len(a) != len(b) {
		return false
	}
	for i := 0; i < len(a)-1; i++ {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func shadows(paramRoute, fixedRoute []string) bool {
	if len(paramRoute) != len(fixedRoute) {
		return false
	}
	sawParam := false
	for i := range paramRoute {
		if isParamSegment(paramRoute[i]) {
			sawParam = true
			continue
		}
		if paramRoute[i] != fixedRoute[i] {
			return false
		}
	}
	return sawParam
}
