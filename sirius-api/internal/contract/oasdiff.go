package contract

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/oasdiff/oasdiff/checker"
	"github.com/oasdiff/oasdiff/diff"
	"github.com/oasdiff/oasdiff/load"
)

// infoBreakingCheckIDs are oasdiff INFO-level findings that Sirius treats as
// contract failures. oasdiff classifies several security/response shape changes
// as INFO by default; we still fail closed on those named classes.
var infoBreakingCheckIDs = map[string]struct{}{
	"api-security-removed":                {},
	"api-security-added":                  {},
	"api-global-security-removed":         {},
	"api-global-security-added":           {},
	"response-property-became-required":   {},
	"response-required-property-added":    {},
	"response-non-success-status-removed": {},
	"response-success-status-removed":     {},
	"response-media-type-removed":         {},
}

// CompareOpenAPIBreaking runs oasdiff backward-compatibility checks between
// baseline and candidate OpenAPI documents.
//
// Failure policy:
//   - all ERR findings
//   - all WARN findings (e.g. request-parameter-removed)
//   - curated INFO findings in infoBreakingCheckIDs (security / response shape)
func CompareOpenAPIBreaking(baselinePath, candidatePath string) error {
	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = false

	base, err := load.NewSpecInfo(loader, load.NewSource(baselinePath))
	if err != nil {
		return fmt.Errorf("load baseline openapi: %w", err)
	}
	cand, err := load.NewSpecInfo(loader, load.NewSource(candidatePath))
	if err != nil {
		return fmt.Errorf("load candidate openapi: %w", err)
	}

	diffReport, opsSources, err := diff.GetWithOperationsSourcesMap(diff.NewConfig(), base, cand)
	if err != nil {
		return fmt.Errorf("oasdiff diff: %w", err)
	}

	cfg := checker.NewConfig(checker.GetAllChecks())
	// Include INFO so curated security/response-shape IDs are visible; oasdiff's
	// default CheckBackwardCompatibility stops at WARN.
	changes := checker.CheckBackwardCompatibilityUntilLevel(cfg, diffReport, opsSources, checker.INFO)

	msgs := make([]string, 0)
	loc := checker.NewDefaultLocalizer()
	for _, change := range changes {
		id := change.GetId()
		level := change.GetLevel()
		_, curated := infoBreakingCheckIDs[id]
		if level >= checker.WARN || curated {
			msgs = append(msgs, fmt.Sprintf("%s/%s: %s", level, id, change.GetUncolorizedText(loc)))
		}
	}
	if len(msgs) == 0 {
		return nil
	}
	sort.Strings(msgs)
	return fmt.Errorf("oasdiff breaking API contract changes:\n  - %s", strings.Join(msgs, "\n  - "))
}

// loadOpenAPIDocument loads and validates OpenAPI syntax without Sirius policy
// extensions (used for protected-baseline candidate syntax checks and fixtures).
func loadOpenAPIDocument(path string) error {
	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = false
	doc, err := loader.LoadFromFile(path)
	if err != nil {
		return fmt.Errorf("load openapi: %w", err)
	}
	if err := doc.Validate(loader.Context); err != nil {
		return fmt.Errorf("validate openapi: %w", err)
	}
	return nil
}

// MustWriteTempSpec writes OpenAPI bytes to a temp file and returns its path.
func MustWriteTempSpec(dir, name string, raw []byte) (string, error) {
	path := filepath.Join(dir, name)
	if err := os.WriteFile(path, raw, 0o644); err != nil {
		return "", err
	}
	return path, nil
}
