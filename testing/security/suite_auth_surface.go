package main

import (
	"fmt"
	"strings"
)

// RunAuthSurfaceSuite validates authentication and selector-hardening behavior
// across direct tRPC backends (Valkey/RabbitMQ) and sensitive Go API endpoints.
func RunAuthSurfaceSuite(cfg *Config) SuiteResult {
	suite := SuiteResult{Name: "Auth Surface Coverage"}

	baseUI := cfg.UIURL
	baseAPI := cfg.APIURL

	// 1) tRPC direct-backend procedures must reject unauthenticated callers.
	trpcMutations := []struct {
		name string
		path string
		body string
	}{
		{
			name: "tRPC store.setValue without session",
			path: "/api/trpc/store.setValue",
			body: `{"json":{"key":"currentScan","value":"{}"}}`,
		},
		{
			name: "tRPC queue.sendMsg without session",
			path: "/api/trpc/queue.sendMsg",
			body: `{"json":{"queue":"agent_commands","message":"{\"action\":\"list_agents\"}"}}`,
		},
		{
			name: "tRPC terminal.executeCommand without session",
			path: "/api/trpc/terminal.executeCommand",
			body: `{"json":{"command":"whoami","target":{"type":"engine"}}}`,
		},
		{
			name: "tRPC agentScan.dispatchAgentScan without session",
			path: "/api/trpc/agentScan.dispatchAgentScan",
			body: `{"json":{"scanId":"scan-test","mode":"safe","concurrency":1,"timeout":30}}`,
		},
	}

	for _, tc := range trpcMutations {
		code, body, _, err := httpPost(baseUI+tc.path, nil, tc.body)
		if err != nil {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Fail, Severity: SevHigh,
				Detail: fmt.Sprintf("request error: %v", err),
			})
			continue
		}
		if isUnauthorizedLike(code, body) {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Pass, Detail: fmt.Sprintf("%d unauthorized as expected", code),
			})
		} else {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Fail, Severity: SevHigh,
				Detail: fmt.Sprintf("expected unauthorized, got %d", code),
			})
		}
	}

	// 2) Sensitive API endpoints must reject missing API key.
	apiProtected := []struct {
		name   string
		method string
		path   string
		body   string
	}{
		{"API admin command without key", "POST", "/api/v1/admin/command", `{"action":"restart","container_name":"sirius-api"}`},
		{"API logs clear without key", "DELETE", "/api/v1/logs/clear", ""},
		{"API source-aware host ingest without key", "POST", "/host/with-source", `{"host":{"ip":"10.10.10.10"},"source":{"name":"security-test","version":"1.0.0","config":"test"}}`},
		{"API key list without key", "GET", "/api/v1/keys", ""},
	}

	for _, tc := range apiProtected {
		code, body, _, err := httpDo(tc.method, baseAPI+tc.path, nil, tc.body)
		if err != nil {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Fail, Severity: SevHigh,
				Detail: fmt.Sprintf("request error: %v", err),
			})
			continue
		}
		if code == 401 || isUnauthorizedLike(code, body) {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Pass, Detail: fmt.Sprintf("%d unauthorized as expected", code),
			})
		} else {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Fail, Severity: SevHigh,
				Detail: fmt.Sprintf("expected 401/unauthorized, got %d", code),
			})
		}
	}

	// 3) Selector-hardening checks (requires a valid key).
	if cfg.APIKey == "" {
		suite.Results = append(suite.Results, TestResult{
			Name: "Selector-hardening checks",
			Result: Warn,
			Severity: SevLow,
			Detail: "Skipped: SIRIUS_API_KEY not set for positive-key validation",
		})
		return suite
	}

	authHeaders := apiHeaders(cfg.APIKey)
	selectorCases := []struct {
		name         string
		method       string
		path         string
		body         string
		expectStatus int
	}{
		{
			name:         "Template invalid ID format returns 400",
			method:       "GET",
			path:         "/templates/invalid!template",
			body:         "",
			expectStatus: 400,
		},
		{
			name:         "API key revoke invalid ID format returns 400",
			method:       "DELETE",
			path:         "/api/v1/keys/not-a-valid-hash",
			body:         "",
			expectStatus: 400,
		},
		{
			name:         "Agent template test requires connected agent",
			method:       "POST",
			path:         "/api/agent-templates/nonexistent/test",
			body:         `{"agentId":"definitely-not-connected-agent"}`,
			expectStatus: 400,
		},
	}

	for _, tc := range selectorCases {
		code, _, _, err := httpDo(tc.method, baseAPI+tc.path, authHeaders, tc.body)
		if err != nil {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Fail, Severity: SevMedium,
				Detail: fmt.Sprintf("request error: %v", err),
			})
			continue
		}
		if code == tc.expectStatus {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Pass, Detail: fmt.Sprintf("got expected status %d", code),
			})
		} else {
			suite.Results = append(suite.Results, TestResult{
				Name: tc.name, Result: Fail, Severity: SevMedium,
				Detail: fmt.Sprintf("expected %d, got %d", tc.expectStatus, code),
			})
		}
	}

	return suite
}

func isUnauthorizedLike(code int, body string) bool {
	if code == 401 || code == 403 {
		return true
	}
	lower := strings.ToLower(body)
	return strings.Contains(lower, "unauthorized") || strings.Contains(lower, "unauthenticated")
}

