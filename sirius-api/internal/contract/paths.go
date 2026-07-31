package contract

import (
	"path/filepath"
	"runtime"
	"strings"
)

// Default artifact locations relative to the sirius-api module root.
const (
	DefaultOpenAPIPath         = "contracts/openapi.v1.yaml"
	DefaultBaselineOpenAPI     = DefaultBaselineOpenAPIPath
	DefaultClassificationPath  = "contracts/route_classification.yaml"
	DefaultBreakingOpenAPIPath = "contracts/fixtures/breaking_openapi.missing_operation.yaml"
	DefaultGoldenPath          = "testdata/community_routes.golden"
)

// ModuleRoot returns the absolute path to the sirius-api module root.
func ModuleRoot() string {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		return "."
	}
	// internal/contract/<file> -> sirius-api
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", ".."))
}

// RepoRoot returns the absolute path to the Sirius repository root.
func RepoRoot() string {
	return filepath.Clean(filepath.Join(ModuleRoot(), ".."))
}

// NormalizePath converts Fiber `:param` segments to OpenAPI `{param}` segments.
func NormalizePath(path string) string {
	if path == "" {
		return path
	}
	parts := strings.Split(path, "/")
	for i, part := range parts {
		if strings.HasPrefix(part, ":") && len(part) > 1 {
			parts[i] = "{" + part[1:] + "}"
		}
	}
	return strings.Join(parts, "/")
}

// OperationKey returns METHOD + normalized path for comparisons.
func OperationKey(method, path string) string {
	return strings.ToUpper(strings.TrimSpace(method)) + "\t" + NormalizePath(strings.TrimSpace(path))
}

// IsAPIV1 reports whether path is under the versioned Community /api/v1 surface.
func IsAPIV1(path string) bool {
	return strings.HasPrefix(path, "/api/v1/") || path == "/api/v1"
}
