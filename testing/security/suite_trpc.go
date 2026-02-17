package main

import (
	"fmt"
	"strings"
)

// RunTRPCSuite tests authentication on tRPC endpoints (Next.js, port 3000).
// tRPC endpoints are called as plain HTTP — queries use GET, mutations use POST.
// Format: /api/trpc/{router.procedure}?input=<url-encoded-json> for queries
//         /api/trpc/{router.procedure} with JSON body for mutations
func RunTRPCSuite(cfg *Config) SuiteResult {
	suite := SuiteResult{Name: "tRPC Authentication"}
	base := cfg.UIURL

	// ── Phase 0: Reachability ───────────────────────────────────────────
	code, _, _, err := httpGet(base, nil)
	if err != nil || code == 0 {
		suite.Results = append(suite.Results, TestResult{
			Name:     "tRPC reachability check",
			Result:   Skip,
			Severity: SevCritical,
			Detail:   fmt.Sprintf("Cannot reach %s: %v", base, err),
		})
		return suite
	}

	// ── Phase 1: Protected procedures WITHOUT session cookie ────────────
	// These should all return UNAUTHORIZED when called without a valid session.
	protectedProcedures := []struct {
		router    string
		procedure string
		isQuery   bool // true = GET query, false = POST mutation
		input     string
	}{
		{"apikeys", "listKeys", true, ""},
		{"apikeys", "createKey", false, `{"json":{"label":"test"}}`},
		{"terminal", "executeCommand", false, `{"json":{"command":"whoami"}}`},
		{"terminal", "getHistory", true, ""},
		{"agent", "listAgentsWithHosts", true, ""},
		{"user", "getProfile", true, ""},
		{"agentScan", "getAgentScanStatus", true, `{"json":{"scanId":"test"}}`},
	}

	for _, p := range protectedProcedures {
		name := fmt.Sprintf("Protected %s.%s without session", p.router, p.procedure)
		endpoint := fmt.Sprintf("%s/api/trpc/%s.%s", base, p.router, p.procedure)

		var code int
		var body string
		var reqErr error

		if p.isQuery {
			url := endpoint
			if p.input != "" {
				url += "?input=" + p.input
			}
			code, body, _, reqErr = httpGet(url, map[string]string{
				"Content-Type": "application/json",
			})
		} else {
			payload := p.input
			if payload == "" {
				payload = "{}"
			}
			code, body, _, reqErr = httpPost(endpoint, nil, payload)
		}

		if reqErr != nil {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Fail, Severity: SevHigh,
				Detail: fmt.Sprintf("request error: %v", reqErr),
			})
			continue
		}

		if isUnauthorized(code, body) {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Pass,
				Detail: fmt.Sprintf("%d — correctly denied", code),
			})
		} else {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Fail, Severity: SevHigh,
				Detail: fmt.Sprintf("expected UNAUTHORIZED, got %d", code),
			})
		}
	}

	// ── Phase 2: Protected procedures with INVALID session cookie ───────
	fakeCookie := "next-auth.session-token=fake-invalid-session-value-12345"
	for _, p := range protectedProcedures[:3] { // test a representative sample
		name := fmt.Sprintf("Protected %s.%s with invalid session", p.router, p.procedure)
		endpoint := fmt.Sprintf("%s/api/trpc/%s.%s", base, p.router, p.procedure)
		headers := map[string]string{
			"Cookie":       fakeCookie,
			"Content-Type": "application/json",
		}

		var code int
		var body string
		var reqErr error

		if p.isQuery {
			code, body, _, reqErr = httpGet(endpoint, headers)
		} else {
			code, body, _, reqErr = httpPost(endpoint, headers, p.input)
		}

		if reqErr != nil {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Fail, Severity: SevHigh,
				Detail: fmt.Sprintf("request error: %v", reqErr),
			})
			continue
		}

		if isUnauthorized(code, body) {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Pass,
				Detail: fmt.Sprintf("%d — invalid session correctly rejected", code),
			})
		} else {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Fail, Severity: SevCritical,
				Detail: fmt.Sprintf("expected UNAUTHORIZED, got %d — invalid session accepted!", code),
			})
		}
	}

	// ── Phase 3: Public procedures accessibility (informational) ────────
	// These are expected to work without authentication — report for awareness.
	publicProcedures := []struct {
		router    string
		procedure string
		input     string
	}{
		{"host", "getHostList", ""},
		{"vulnerability", "getAllVulnerabilities", ""},
		{"scanner", "getLatestScan", ""},
		{"templates", "getTemplates", ""},
		{"statistics", "getVulnerabilityTrends", ""},
		{"events", "getEvents", ""},
	}

	for _, p := range publicProcedures {
		name := fmt.Sprintf("Public %s.%s accessible without session", p.router, p.procedure)
		endpoint := fmt.Sprintf("%s/api/trpc/%s.%s", base, p.router, p.procedure)
		url := endpoint
		if p.input != "" {
			url += "?input=" + p.input
		}

		code, _, _, reqErr := httpGet(url, map[string]string{
			"Content-Type": "application/json",
		})

		if reqErr != nil {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Warn, Severity: SevLow,
				Detail: fmt.Sprintf("request error: %v", reqErr),
			})
			continue
		}

		if code >= 200 && code < 500 && !isUnauthorized(code, "") {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Info, Severity: SevInfo,
				Detail: fmt.Sprintf("%d — public endpoint (no auth required)", code),
			})
		} else {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Pass,
				Detail: fmt.Sprintf("%d — unexpectedly protected (good!)", code),
			})
		}
	}

	// ── Phase 4: Public WRITE procedures audit ──────────────────────────
	// Flag public mutations that perform write/destructive operations.
	publicWriteProcedures := []struct {
		router    string
		procedure string
		risk      string
	}{
		{"scanner", "startScan", "Can initiate network scans without auth"},
		{"scanner", "cancelScan", "Can cancel running scans without auth"},
		{"scanner", "forceStopScan", "Can force-stop scans without auth"},
		{"scanner", "resetScanState", "Can reset scan state without auth"},
		{"templates", "createTemplate", "Can create templates without auth"},
		{"templates", "deleteTemplate", "Can delete templates without auth"},
		{"scripts", "createScript", "Can create scripts without auth"},
		{"scripts", "deleteScript", "Can delete scripts without auth"},
		{"store", "setValue", "Can write to Valkey store without auth"},
		{"queue", "sendMsg", "Can send messages to RabbitMQ without auth"},
		{"host", "createHost", "Can create host records without auth"},
		{"repositories", "add", "Can add template repositories without auth"},
		{"repositories", "delete", "Can delete repositories without auth"},
		{"agentTemplates", "uploadTemplate", "Can upload agent templates without auth"},
		{"agentTemplates", "deleteTemplate", "Can delete agent templates without auth"},
		{"agentTemplates", "deployTemplate", "Can deploy templates to agents without auth"},
	}

	for _, p := range publicWriteProcedures {
		name := fmt.Sprintf("Public write: %s.%s", p.router, p.procedure)
		endpoint := fmt.Sprintf("%s/api/trpc/%s.%s", base, p.router, p.procedure)

		// Send an empty/minimal mutation body — we just want to check if auth is enforced.
		code, body, _, reqErr := httpPost(endpoint, nil, `{}`)

		if reqErr != nil {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Warn, Severity: SevMedium,
				Detail: fmt.Sprintf("request error: %v", reqErr),
			})
			continue
		}

		if isUnauthorized(code, body) {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Pass,
				Detail: "requires authentication",
			})
		} else {
			suite.Results = append(suite.Results, TestResult{
				Name: name, Result: Warn, Severity: SevMedium,
				Detail: fmt.Sprintf("%d — %s", code, p.risk),
			})
		}
	}

	return suite
}

// isUnauthorized checks if a response indicates an authentication failure.
// tRPC returns 401 for protectedProcedure, or a JSON error with "UNAUTHORIZED".
func isUnauthorized(code int, body string) bool {
	if code == 401 || code == 403 {
		return true
	}
	lower := strings.ToLower(body)
	return strings.Contains(lower, "unauthorized") || strings.Contains(lower, "unauthenticated")
}
