package contract

import (
	"fmt"
	"os"
	"sort"
	"strings"
)

// LiveRoute is one METHOD + PATH entry from Fiber RouteInventory / golden.
type LiveRoute struct {
	Method string
	Path   string
}

// ParseInventoryLines parses METHOD\tPATH lines (trailing blank lines ignored).
func ParseInventoryLines(raw string) ([]LiveRoute, error) {
	lines := strings.Split(strings.ReplaceAll(raw, "\r\n", "\n"), "\n")
	out := make([]LiveRoute, 0, len(lines))
	for i, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		method, path, ok := strings.Cut(line, "\t")
		if !ok {
			return nil, fmt.Errorf("inventory line %d: expected METHOD\\tPATH", i+1)
		}
		method = strings.ToUpper(strings.TrimSpace(method))
		path = strings.TrimSpace(path)
		if method == "" || path == "" {
			return nil, fmt.Errorf("inventory line %d: empty method or path", i+1)
		}
		out = append(out, LiveRoute{Method: method, Path: path})
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("inventory is empty")
	}
	return out, nil
}

// LoadGoldenInventory reads the checked-in Community route golden file.
func LoadGoldenInventory(path string) ([]LiveRoute, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read golden inventory: %w", err)
	}
	return ParseInventoryLines(string(raw))
}

// ValidationResult collects contract drift findings.
type ValidationResult struct {
	Errors []string
}

func (r *ValidationResult) addf(format string, args ...any) {
	r.Errors = append(r.Errors, fmt.Sprintf(format, args...))
}

func (r *ValidationResult) Err() error {
	if len(r.Errors) == 0 {
		return nil
	}
	return fmt.Errorf("api contract validation failed:\n  - %s", strings.Join(r.Errors, "\n  - "))
}

// ValidateContract compares live Fiber inventory, classification, and OpenAPI coverage.
//
// Rules:
//  1. Classification entries must exactly match live inventory order and path/method pairs.
//  2. Classification values must be public|internal|deprecated (enforced at load).
//  3. Every live /api/v1 route must appear in OpenAPI.
//  4. Every OpenAPI /api/v1 operation must appear in the live inventory.
//  5. Reserved /api/pro/v1 and /api/internal/v1 namespaces must be declared.
func ValidateContract(live []LiveRoute, class *ClassificationFile, spec *OpenAPIContract) error {
	result := &ValidationResult{}

	liveLines := make([]string, 0, len(live))
	for _, route := range live {
		liveLines = append(liveLines, route.Method+"\t"+route.Path)
	}
	classLines := class.Lines()

	if len(liveLines) != len(classLines) {
		result.addf("classification count %d != live inventory count %d", len(classLines), len(liveLines))
	}

	limit := len(liveLines)
	if len(classLines) < limit {
		limit = len(classLines)
	}
	for i := 0; i < limit; i++ {
		if liveLines[i] != classLines[i] {
			result.addf("classification mismatch at index %d: live=%q class=%q", i, liveLines[i], classLines[i])
		}
	}

	// Detect extra classifications beyond compared prefix.
	if len(classLines) > len(liveLines) {
		for i := len(liveLines); i < len(classLines); i++ {
			result.addf("extra classification entry: %s", classLines[i])
		}
	}
	if len(liveLines) > len(classLines) {
		for i := len(classLines); i < len(liveLines); i++ {
			result.addf("unclassified live route: %s", liveLines[i])
		}
	}

	liveAPIv1 := make(map[string]struct{})
	for _, route := range live {
		if !IsAPIV1(route.Path) {
			continue
		}
		liveAPIv1[OperationKey(route.Method, route.Path)] = struct{}{}
	}

	specAPIv1 := spec.APIV1Operations()

	var missingFromSpec []string
	for key := range liveAPIv1 {
		if _, ok := specAPIv1[key]; !ok {
			missingFromSpec = append(missingFromSpec, key)
		}
	}
	sort.Strings(missingFromSpec)
	for _, key := range missingFromSpec {
		result.addf("live /api/v1 route missing from OpenAPI: %s", strings.ReplaceAll(key, "\t", " "))
	}

	var extraInSpec []string
	for key := range specAPIv1 {
		if _, ok := liveAPIv1[key]; !ok {
			extraInSpec = append(extraInSpec, key)
		}
	}
	sort.Strings(extraInSpec)
	for _, key := range extraInSpec {
		result.addf("OpenAPI /api/v1 operation not present in live inventory: %s", strings.ReplaceAll(key, "\t", " "))
	}

	if err := spec.RequireReservedNamespaces("/api/pro/v1", "/api/internal/v1"); err != nil {
		result.addf("%v", err)
	}

	if strings.TrimSpace(spec.ContractVersion) == "" {
		result.addf("OpenAPI contract version is empty")
	}

	deprecated := map[string]struct{}{}
	for _, route := range class.Routes {
		if route.Class == ClassDeprecated {
			deprecated[route.Method+"\t"+route.Path] = struct{}{}
		}
	}
	for _, finding := range FindShadowedFixedRoutes(live) {
		// Deprecated duplicates may remain for inventory fidelity (e.g. the second
		// GET /host/source-coverage). Public/internal shadowed routes are defects.
		shadowedKey := shadowedRouteKey(finding)
		if _, ok := deprecated[shadowedKey]; ok {
			continue
		}
		result.addf("route shadowing: %s", finding)
	}

	return result.Err()
}

func shadowedRouteKey(finding string) string {
	// finding format: "METHOD\tPATH shadowed by earlier METHOD\tPATH"
	const marker = " shadowed by earlier "
	before, _, ok := strings.Cut(finding, marker)
	if !ok {
		return finding
	}
	return before
}
