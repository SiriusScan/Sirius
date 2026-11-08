package middleware

import (
	"context"
	"crypto/subtle"
	"log/slog"
	"net"
	"net/url"
	"strings"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

// APIKeyMiddleware returns a Fiber middleware that validates the X-API-Key
// header against keys stored in Valkey. Only exact GET /health is allowed
// through without authentication.
// rootKey is the installer/internal service key (from SIRIUS_API_KEY_FILE or SIRIUS_API_KEY).
//
// Keys with no scopes keep historical full access (legacy and infrastructure
// keys). A key whose scopes are exactly the known set containing mcp:read is
// limited to the MCP read allow-list. Any other non-empty scope set, including
// one that merely contains an unknown name, is denied for every route.
func APIKeyMiddleware(kvStore store.KVStore, rootKey string) fiber.Handler {
	rootKey = strings.TrimSpace(rootKey)
	return func(c *fiber.Ctx) error {
		if isPublicHealthProbe(c) {
			return c.Next()
		}

		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "missing API key – include X-API-Key header",
			})
		}

		if rootKey != "" && subtle.ConstantTimeCompare([]byte(apiKey), []byte(rootKey)) == 1 {
			c.Locals("auth_mode", "infra_env")
			c.Locals("apikey_label", "Infrastructure Key")
			slog.Debug("request authenticated with environment infrastructure key")
			return c.Next()
		}

		// Fallback: Check Valkey for dynamic, user-generated API keys
		meta, err := store.ValidateAPIKey(context.Background(), kvStore, apiKey)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid API key",
			})
		}

		if !scopeAllowsRequest(meta, c) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "API key scope does not allow this request",
			})
		}

		// Store metadata in request locals for downstream handlers.
		c.Locals("auth_mode", "valkey")
		c.Locals("apikey_meta", meta)
		return c.Next()
	}
}

// scopeAllowsRequest enforces server-side scope policy. Agent claims are not
// consulted. Empty scopes preserve legacy full access. mcp:read allows only
// the exact GET inventory routes below. Anything else fails closed.
func scopeAllowsRequest(meta store.APIKeyMeta, c *fiber.Ctx) bool {
	if meta.AllowsUnrestricted() {
		return true
	}
	if !meta.HasScope(store.ScopeMCPRead) {
		return false
	}
	// mcp:read is the only grant. A key that also carries another known scope
	// in the future must not inherit this allow-list implicitly.
	if len(meta.Scopes) != 1 {
		return false
	}
	// The initial read contract has no query modes. In particular, host
	// enhanced/include modes must not widen a scoped response.
	if c.Request().URI().QueryArgs().Len() != 0 {
		return false
	}
	return methodAndPathAllowed(c.Method(), canonicalRequestPath(c))
}

// methodAndPathAllowed reports whether an mcp:read key may call method+path.
// The path must already be canonical (decoded, cleaned, no query).
func methodAndPathAllowed(method, path string) bool {
	if method != fiber.MethodGet {
		return false
	}
	if _, ok := mcpReadExactPaths[path]; ok {
		return true
	}
	return mcpReadHostPath(path) || mcpReadTemplatePath(path) || mcpReadVulnerabilityPath(path)
}

// mcpReadExactPaths are allow-list routes with no caller-controlled segment.
// Trailing-slash variants match Fiber's route table (Group + "/"), not a prefix.
var mcpReadExactPaths = map[string]struct{}{
	"/host":                      {},
	"/host/":                     {},
	"/host/vulnerabilities/all":  {},
	"/host/vulnerabilities/all/": {},
	"/api/v1/scans/status":       {},
	"/api/v1/scans/status/":      {},
	"/api/v1/system/health":      {},
	"/api/v1/system/health/":     {},
	"/templates":                 {},
	"/templates/":                {},
}

// mcpReadHostPath allows only:
//
//	GET /host/:ip
//	GET /host/:ip/sources
//
// where :ip is an IP literal. Neighboring static host routes and GETs such as
// /host/:id/packages stay denied, including future single-segment routes.
func mcpReadHostPath(path string) bool {
	rest, ok := cutPrefixSegment(path, "/host/")
	if !ok {
		return false
	}
	segment, extra, hasMore := splitNextSegment(rest)
	if net.ParseIP(segment) == nil {
		return false
	}
	if !hasMore || extra == "" {
		// /host/:ip and /host/:ip/ — Fiber keeps the trailing slash instead of
		// redirecting, and the :id route still names this one segment.
		return true
	}
	return extra == "sources" || extra == "sources/"
}

// mcpReadTemplatePath allows GET /templates/:safeid where safeid matches the
// template handler's id pattern: one segment, [A-Za-z0-9._:-]{1,128}.
func mcpReadTemplatePath(path string) bool {
	rest, ok := cutPrefixSegment(path, "/templates/")
	if !ok {
		return false
	}
	segment, extra, hasMore := splitNextSegment(rest)
	if hasMore && extra != "" {
		return false
	}
	return isTemplateSafeID(segment)
}

// mcpReadVulnerabilityPath allows GET /vulnerability/:CVE for a single CVE-like
// segment. /vulnerability/:id/sources and other suffixes stay denied.
func mcpReadVulnerabilityPath(path string) bool {
	rest, ok := cutPrefixSegment(path, "/vulnerability/")
	if !ok {
		return false
	}
	segment, extra, hasMore := splitNextSegment(rest)
	if hasMore && extra != "" {
		return false
	}
	return isCVESegment(segment)
}

// isTemplateSafeID matches handlers.templateIDPattern without importing it.
func isTemplateSafeID(segment string) bool {
	if len(segment) == 0 || len(segment) > 128 {
		return false
	}
	for _, r := range segment {
		switch {
		case r >= 'A' && r <= 'Z':
		case r >= 'a' && r <= 'z':
		case r >= '0' && r <= '9':
		case r == '.' || r == '_' || r == ':' || r == '-':
		default:
			return false
		}
	}
	return true
}

// isCVESegment accepts a single CVE id such as CVE-2024-1234. Comparison is
// case-sensitive even when Fiber's router is case-insensitive. The scope
// deliberately grants only the explicit spelling used by the MCP client.
func isCVESegment(segment string) bool {
	const prefix = "CVE-"
	if !strings.HasPrefix(segment, prefix) {
		return false
	}
	body := segment[len(prefix):]
	year, rest, ok := strings.Cut(body, "-")
	if !ok || len(year) != 4 || !allDigits(year) || len(rest) < 4 || len(rest) > 7 || !allDigits(rest) {
		return false
	}
	return true
}

func allDigits(s string) bool {
	if s == "" {
		return false
	}
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

// canonicalRequestPath returns the path the allow-list matches against.
// c.Path() follows Fiber's configured UnescapePath (false in the running API).
// This function does not decode again or collapse "." or ".." — Fiber does not either,
// and collapsing would turn /templates/../host into the allowed path /host.
// Dot segments, empty segments, backslashes, and a leftover % that still
// decodes to something else (double-encoding) fail closed.
func canonicalRequestPath(c *fiber.Ctx) string {
	path := c.Path()
	if path == "" {
		path = "/"
	}
	// When configured to decode, Fiber turns %2F into a slash before routing.
	// That must not let an
	// encoded slash invent an allowed segment. A decoded path whose slash
	// structure differs from the raw request (or that contains a backslash)
	// fails closed. Ordinary encodings such as %2D stay intact.
	original := string(c.Request().URI().PathOriginal())
	if original != "" {
		decoded, err := url.PathUnescape(original)
		if err != nil || strings.Contains(decoded, "\\") || strings.Count(decoded, "/") != strings.Count(original, "/") {
			return "/"
		}
	}
	if strings.Contains(path, "%") {
		decoded, err := url.PathUnescape(path)
		if err != nil || decoded != path {
			return "/"
		}
	}
	if strings.Contains(path, "\\") || !strings.HasPrefix(path, "/") {
		return "/"
	}
	raw := path
	if strings.HasSuffix(raw, "/") && raw != "/" {
		raw = strings.TrimSuffix(raw, "/")
	}
	if strings.Contains(raw, "//") {
		return "/"
	}
	for _, part := range strings.Split(strings.Trim(raw, "/"), "/") {
		if part == "" || part == "." || part == ".." {
			return "/"
		}
	}
	return path
}

// cutPrefixSegment reports the remainder after an exact directory prefix.
// prefix must end in '/'. Matching is case-sensitive and does not treat the
// prefix as a string prefix of a longer segment (the trailing slash enforces that).
func cutPrefixSegment(path, prefix string) (string, bool) {
	if !strings.HasPrefix(path, prefix) {
		return "", false
	}
	return path[len(prefix):], true
}

// splitNextSegment splits one path segment from the front of rest.
// hasMore is true when a slash was present. A trailing slash yields extra == "".
func splitNextSegment(rest string) (segment, extra string, hasMore bool) {
	segment, extra, hasMore = strings.Cut(rest, "/")
	return segment, extra, hasMore
}

// isPublicHealthProbe reports the sole unauthenticated Community probe:
// exact GET /health (with or without a trailing slash). Prefix matches such as
// /healthz or /health/... and non-GET methods remain authenticated.
func isPublicHealthProbe(c *fiber.Ctx) bool {
	if c.Method() != fiber.MethodGet {
		return false
	}
	path := c.Path()
	return path == "/health" || path == "/health/"
}
