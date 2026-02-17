package main

import (
	"fmt"
	"net/http"
	"strings"
)

// RunHeadersSuite tests HTTP security headers and transport-level controls.
func RunHeadersSuite(cfg *Config) SuiteResult {
	suite := SuiteResult{Name: "Security Headers & Transport"}

	// We test both the Go API and the UI.
	targets := []struct {
		label string
		url   string
	}{
		{"Go API", cfg.APIURL + "/health"},
		{"UI", cfg.UIURL},
	}

	for _, t := range targets {
		_, _, hdrs, err := httpGet(t.url, nil)
		if err != nil {
			suite.Results = append(suite.Results, TestResult{
				Name:   t.label + " reachability",
				Result: Skip, Severity: SevInfo,
				Detail: fmt.Sprintf("cannot reach %s: %v", t.url, err),
			})
			continue
		}

		suite.Results = append(suite.Results, testSecurityHeaders(t.label, hdrs)...)
	}

	// ── CORS on Go API ──────────────────────────────────────────────────
	suite.Results = append(suite.Results, testCORS(cfg.APIURL)...)

	// ── Error information disclosure ────────────────────────────────────
	suite.Results = append(suite.Results, testErrorDisclosure(cfg.APIURL)...)

	// ── HTTP method testing ─────────────────────────────────────────────
	suite.Results = append(suite.Results, testHTTPMethods(cfg.APIURL)...)

	return suite
}

// ────────────────── Security headers ──────────────────

func testSecurityHeaders(label string, hdrs http.Header) []TestResult {
	var results []TestResult

	checks := []struct {
		header   string
		expected string // If non-empty, check that value contains this.
		severity Severity
	}{
		{"X-Content-Type-Options", "nosniff", SevLow},
		{"X-Frame-Options", "", SevLow},
		{"Strict-Transport-Security", "", SevMedium},
		{"Content-Security-Policy", "", SevLow},
		{"X-XSS-Protection", "", SevLow},
		{"Referrer-Policy", "", SevLow},
	}

	for _, c := range checks {
		name := fmt.Sprintf("%s: %s header", label, c.header)
		val := hdrs.Get(c.header)

		if val == "" {
			results = append(results, TestResult{
				Name: name, Result: Warn, Severity: c.severity,
				Detail: "header missing",
			})
			continue
		}

		if c.expected != "" && !strings.Contains(strings.ToLower(val), strings.ToLower(c.expected)) {
			results = append(results, TestResult{
				Name: name, Result: Warn, Severity: c.severity,
				Detail: fmt.Sprintf("unexpected value: %s (expected to contain %q)", val, c.expected),
			})
			continue
		}

		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: val,
		})
	}

	return results
}

// ────────────────── CORS ──────────────────

func testCORS(apiURL string) []TestResult {
	var results []TestResult

	// Send a preflight OPTIONS request with a foreign origin.
	headers := map[string]string{
		"Origin":                        "https://evil-attacker.com",
		"Access-Control-Request-Method": "GET",
	}

	code, _, respHdrs, err := httpDo("OPTIONS", apiURL+"/health", headers, "")
	if err != nil {
		results = append(results, TestResult{
			Name: "CORS preflight", Result: Skip, Severity: SevMedium,
			Detail: fmt.Sprintf("request error: %v", err),
		})
		return results
	}

	allowOrigin := respHdrs.Get("Access-Control-Allow-Origin")

	name := "CORS: Access-Control-Allow-Origin"
	if allowOrigin == "*" {
		results = append(results, TestResult{
			Name: name, Result: Warn, Severity: SevMedium,
			Detail: "wildcard (*) — allows any origin to make cross-origin requests",
		})
	} else if allowOrigin == "https://evil-attacker.com" {
		results = append(results, TestResult{
			Name: name, Result: Warn, Severity: SevHigh,
			Detail: "reflects arbitrary origin — CORS misconfiguration",
		})
	} else if allowOrigin == "" {
		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: "no CORS header returned for foreign origin (restrictive)",
		})
	} else {
		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: fmt.Sprintf("restricted to: %s", allowOrigin),
		})
	}

	// Check Allow-Credentials with wildcard (dangerous combination).
	allowCreds := respHdrs.Get("Access-Control-Allow-Credentials")
	if allowOrigin == "*" && strings.EqualFold(allowCreds, "true") {
		results = append(results, TestResult{
			Name: "CORS: wildcard + credentials", Result: Fail, Severity: SevHigh,
			Detail: "Access-Control-Allow-Origin: * with Allow-Credentials: true — credential theft risk",
		})
	}

	_ = code
	return results
}

// ────────────────── Error information disclosure ──────────────────

func testErrorDisclosure(apiURL string) []TestResult {
	var results []TestResult

	// Hit a non-existent route.
	code, body, _, err := httpGet(apiURL+"/nonexistent-path-12345", nil)
	if err != nil {
		return results
	}

	name := "Error response disclosure (404)"
	lower := strings.ToLower(body)

	leaks := []string{}
	if strings.Contains(lower, "stack") || strings.Contains(lower, "goroutine") {
		leaks = append(leaks, "stack trace")
	}
	if strings.Contains(lower, "/app/") || strings.Contains(lower, "/go/src/") || strings.Contains(lower, "/home/") {
		leaks = append(leaks, "internal file paths")
	}
	if strings.Contains(lower, "fiber") || strings.Contains(lower, "fasthttp") {
		leaks = append(leaks, "framework name")
	}
	if strings.Contains(lower, "postgres") || strings.Contains(lower, "valkey") || strings.Contains(lower, "redis") {
		leaks = append(leaks, "infrastructure names")
	}

	if len(leaks) > 0 {
		results = append(results, TestResult{
			Name: name, Result: Warn, Severity: SevMedium,
			Detail: fmt.Sprintf("%d response leaks: %s", code, strings.Join(leaks, ", ")),
		})
	} else {
		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: fmt.Sprintf("%d response — no sensitive information disclosed", code),
		})
	}

	// Hit with malformed JSON body.
	name = "Error response disclosure (malformed body)"
	code, body, _, err = httpPost(apiURL+"/host/", nil, `{{{invalid json`)
	if err != nil {
		return results
	}

	lower = strings.ToLower(body)
	if strings.Contains(lower, "stack") || strings.Contains(lower, "goroutine") ||
		strings.Contains(lower, "panic") {
		results = append(results, TestResult{
			Name: name, Result: Warn, Severity: SevMedium,
			Detail: fmt.Sprintf("%d response leaks internal details on malformed input", code),
		})
	} else {
		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: fmt.Sprintf("%d response — safe error handling", code),
		})
	}

	return results
}

// ────────────────── HTTP method testing ──────────────────

func testHTTPMethods(apiURL string) []TestResult {
	var results []TestResult

	// TRACE should be disabled — it can enable XSS via cross-site tracing.
	name := "TRACE method disabled"
	code, body, _, err := httpDo("TRACE", apiURL+"/health", nil, "")
	if err != nil {
		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: "TRACE request failed (likely disabled)",
		})
	} else if code == 405 || code == 404 || code == 501 {
		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: fmt.Sprintf("%d — TRACE method not allowed", code),
		})
	} else if code == 200 && strings.Contains(body, "TRACE") {
		results = append(results, TestResult{
			Name: name, Result: Warn, Severity: SevMedium,
			Detail: "TRACE method enabled — potential cross-site tracing risk",
		})
	} else {
		results = append(results, TestResult{
			Name: name, Result: Pass,
			Detail: fmt.Sprintf("%d response to TRACE (not echoing)", code),
		})
	}

	// OPTIONS should not reveal sensitive information.
	name = "OPTIONS method information"
	code, _, hdrs, err := httpDo("OPTIONS", apiURL+"/host/", nil, "")
	if err == nil {
		allow := hdrs.Get("Allow")
		if allow != "" {
			results = append(results, TestResult{
				Name: name, Result: Info, Severity: SevInfo,
				Detail: fmt.Sprintf("%d — Allow: %s", code, allow),
			})
		} else {
			results = append(results, TestResult{
				Name: name, Result: Pass,
				Detail: fmt.Sprintf("%d — no Allow header disclosed", code),
			})
		}
	}

	return results
}
