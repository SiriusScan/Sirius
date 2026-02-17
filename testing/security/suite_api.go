package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

// RunAPISuite tests authentication and authorization on the Go REST API (port 9001).
func RunAPISuite(cfg *Config) SuiteResult {
	suite := SuiteResult{Name: "Go API Authentication"}
	base := cfg.APIURL

	// ── Phase 0: Ensure API is reachable ────────────────────────────────
	code, _, _, err := httpGet(base+"/health", nil)
	if err != nil || code == 0 {
		suite.Results = append(suite.Results, TestResult{
			Name:     "API reachability check",
			Result:   Skip,
			Severity: SevCritical,
			Detail:   fmt.Sprintf("Cannot reach %s/health: %v", base, err),
		})
		return suite
	}

	// ── Phase 1: Obtain a valid API key for positive tests ──────────────
	validKey := cfg.APIKey
	if validKey == "" {
		validKey = bootstrapAPIKey(cfg, &suite)
		if validKey == "" {
			// Cannot proceed without a valid key; all remaining tests skipped.
			suite.Results = append(suite.Results, TestResult{
				Name:     "API key bootstrap",
				Result:   Skip,
				Severity: SevCritical,
				Detail:   "Could not obtain a valid API key; remaining tests skipped",
			})
			return suite
		}
	}

	// ── Phase 2: Health endpoint bypass ─────────────────────────────────
	suite.Results = append(suite.Results, testHealthBypass(base))

	// ── Phase 3: No API key on protected endpoints ──────────────────────
	protectedEndpoints := []struct {
		method string
		path   string
	}{
		{"GET", "/host/"},
		{"GET", "/vulnerability/nonexistent-id"},
		{"GET", "/templates"},
		{"GET", "/api/agent-templates"},
		{"GET", "/api/v1/scans/status"},
		{"GET", "/api/v1/events"},
		{"GET", "/api/v1/statistics/vulnerability-trends"},
		{"GET", "/api/v1/system/health"},
		{"GET", "/api/v1/logs"},
		{"GET", "/api/v1/keys"},
		{"POST", "/api/v1/keys"},
	}

	for _, ep := range protectedEndpoints {
		suite.Results = append(suite.Results, testNoAPIKey(base, ep.method, ep.path))
	}

	// ── Phase 4: Invalid API key variants ───────────────────────────────
	invalidKeys := []struct {
		label string
		key   string
	}{
		{"random string", "totally-invalid-key-12345"},
		{"malformed sk_ prefix", "sk_not-hex-at-all!!!"},
		{"empty value", ""},
		{"truncated valid key", validKey[:10]},
	}
	for _, ik := range invalidKeys {
		suite.Results = append(suite.Results, testInvalidKey(base, ik.label, ik.key))
	}

	// ── Phase 5: Valid API key succeeds ─────────────────────────────────
	for _, ep := range protectedEndpoints {
		suite.Results = append(suite.Results, testValidKey(base, validKey, ep.method, ep.path))
	}

	// ── Phase 6: Key in wrong header / query param ──────────────────────
	suite.Results = append(suite.Results, testKeyWrongHeader(base, validKey, "Authorization"))
	suite.Results = append(suite.Results, testKeyWrongHeader(base, validKey, "Api-Key"))
	suite.Results = append(suite.Results, testKeyInQueryParam(base, validKey))

	// ── Phase 7: Revoked key ────────────────────────────────────────────
	suite.Results = append(suite.Results, testRevokedKey(cfg, validKey)...)

	// ── Phase 8: Case sensitivity of header ─────────────────────────────
	suite.Results = append(suite.Results, testHeaderCaseSensitivity(base, validKey))

	return suite
}

// ────────────────── Individual test functions ──────────────────

func testHealthBypass(base string) TestResult {
	code, _, _, err := httpGet(base+"/health", nil)
	if err != nil {
		return TestResult{Name: "Health endpoint bypass (no key)", Result: Fail, Severity: SevHigh,
			Detail: fmt.Sprintf("request error: %v", err)}
	}
	if code == 200 {
		return TestResult{Name: "Health endpoint bypass (no key)", Result: Pass,
			Detail: "200 OK without API key"}
	}
	return TestResult{Name: "Health endpoint bypass (no key)", Result: Fail, Severity: SevHigh,
		Detail: fmt.Sprintf("expected 200, got %d", code)}
}

func testNoAPIKey(base, method, path string) TestResult {
	name := fmt.Sprintf("No API key on %s %s", method, path)
	code, _, _, err := httpDo(method, base+path, nil, "")
	if err != nil {
		return TestResult{Name: name, Result: Fail, Severity: SevHigh,
			Detail: fmt.Sprintf("request error: %v", err)}
	}
	if code == 401 {
		return TestResult{Name: name, Result: Pass, Detail: "401 Unauthorized"}
	}
	return TestResult{Name: name, Result: Fail, Severity: SevHigh,
		Detail: fmt.Sprintf("expected 401, got %d", code)}
}

func testInvalidKey(base, label, key string) TestResult {
	name := fmt.Sprintf("Invalid API key (%s)", label)
	headers := map[string]string{"X-API-Key": key}
	code, _, _, err := httpGet(base+"/host/", headers)
	if err != nil {
		return TestResult{Name: name, Result: Fail, Severity: SevHigh,
			Detail: fmt.Sprintf("request error: %v", err)}
	}
	if code == 401 {
		return TestResult{Name: name, Result: Pass, Detail: "401 Unauthorized"}
	}
	return TestResult{Name: name, Result: Fail, Severity: SevHigh,
		Detail: fmt.Sprintf("expected 401, got %d", code)}
}

func testValidKey(base, key, method, path string) TestResult {
	name := fmt.Sprintf("Valid API key on %s %s", method, path)
	headers := apiHeaders(key)

	var code int
	var err error
	if method == "POST" {
		code, _, _, err = httpPost(base+path, headers, `{"label":"test"}`)
	} else {
		code, _, _, err = httpDo(method, base+path, headers, "")
	}

	if err != nil {
		return TestResult{Name: name, Result: Fail, Severity: SevHigh,
			Detail: fmt.Sprintf("request error: %v", err)}
	}
	// Any non-401 response means auth succeeded. 404/500 etc. are functional
	// issues, not auth failures.
	if code != 401 {
		return TestResult{Name: name, Result: Pass,
			Detail: fmt.Sprintf("%d (auth passed)", code)}
	}
	return TestResult{Name: name, Result: Fail, Severity: SevHigh,
		Detail: "got 401 with valid key"}
}

func testKeyWrongHeader(base, key, headerName string) TestResult {
	name := fmt.Sprintf("API key in wrong header (%s)", headerName)
	headers := map[string]string{headerName: key}
	code, _, _, err := httpGet(base+"/host/", headers)
	if err != nil {
		return TestResult{Name: name, Result: Fail, Severity: SevMedium,
			Detail: fmt.Sprintf("request error: %v", err)}
	}
	if code == 401 {
		return TestResult{Name: name, Result: Pass,
			Detail: "401 — key only accepted via X-API-Key header"}
	}
	return TestResult{Name: name, Result: Fail, Severity: SevMedium,
		Detail: fmt.Sprintf("expected 401, got %d (key accepted in wrong header)", code)}
}

func testKeyInQueryParam(base, key string) TestResult {
	name := "API key in query parameter"
	url := fmt.Sprintf("%s/host/?api_key=%s", base, key)
	code, _, _, err := httpGet(url, nil)
	if err != nil {
		return TestResult{Name: name, Result: Fail, Severity: SevMedium,
			Detail: fmt.Sprintf("request error: %v", err)}
	}
	if code == 401 {
		return TestResult{Name: name, Result: Pass,
			Detail: "401 — key only accepted via header, not query param"}
	}
	return TestResult{Name: name, Result: Fail, Severity: SevMedium,
		Detail: fmt.Sprintf("expected 401, got %d (key accepted in query param)", code)}
}

func testRevokedKey(cfg *Config, validKey string) []TestResult {
	base := cfg.APIURL
	var results []TestResult

	// Create a new key, then revoke it, then try to use it.
	headers := apiHeaders(validKey)
	code, body, _, err := httpPost(base+"/api/v1/keys", headers, `{"label":"revoke-test"}`)
	if err != nil || code < 200 || code >= 300 {
		results = append(results, TestResult{
			Name: "Revoked key test (setup: create key)", Result: Skip, Severity: SevHigh,
			Detail: fmt.Sprintf("could not create test key: status=%d err=%v", code, err),
		})
		return results
	}

	// Parse the raw key and hash ID from the response.
	var createResp struct {
		RawKey string `json:"raw_key"`
		Key    string `json:"key"`
		Meta   struct {
			ID string `json:"id"`
		} `json:"meta"`
	}
	if err := json.Unmarshal([]byte(body), &createResp); err != nil {
		results = append(results, TestResult{
			Name: "Revoked key test (setup: parse key)", Result: Skip, Severity: SevHigh,
			Detail: fmt.Sprintf("could not parse create response: %v", err),
		})
		return results
	}

	newKey := strings.TrimSpace(createResp.RawKey)
	if newKey == "" {
		newKey = strings.TrimSpace(createResp.Key)
	}
	keyID := strings.TrimSpace(createResp.Meta.ID)
	if newKey == "" || keyID == "" {
		results = append(results, TestResult{
			Name: "Revoked key test (setup: parse key)", Result: Skip, Severity: SevHigh,
			Detail: "create key response missing raw key or key id metadata",
		})
		return results
	}

	// Verify the new key works.
	code, _, _, _ = httpGet(base+"/host/", apiHeaders(newKey))
	if code == 401 {
		results = append(results, TestResult{
			Name: "Revoked key test (setup: verify new key works)", Result: Skip, Severity: SevHigh,
			Detail: "newly created key already returns 401",
		})
		return results
	}

	// Revoke the key.
	code, _, _, err = httpDelete(base+"/api/v1/keys/"+keyID, headers)
	if err != nil || (code < 200 || code >= 300) {
		results = append(results, TestResult{
			Name: "Revoked key test (setup: revoke key)", Result: Skip, Severity: SevHigh,
			Detail: fmt.Sprintf("could not revoke key: status=%d err=%v", code, err),
		})
		return results
	}

	// Try to use the revoked key.
	code, _, _, err = httpGet(base+"/host/", apiHeaders(newKey))
	if err != nil {
		results = append(results, TestResult{
			Name: "Revoked key rejected", Result: Fail, Severity: SevHigh,
			Detail: fmt.Sprintf("request error: %v", err),
		})
		return results
	}
	if code == 401 {
		results = append(results, TestResult{
			Name: "Revoked key rejected", Result: Pass,
			Detail: "401 — revoked key correctly rejected",
		})
	} else {
		results = append(results, TestResult{
			Name: "Revoked key rejected", Result: Fail, Severity: SevCritical,
			Detail: fmt.Sprintf("expected 401, got %d — revoked key still accepted!", code),
		})
	}

	return results
}

func testHeaderCaseSensitivity(base, key string) TestResult {
	// HTTP headers are case-insensitive per spec, so x-api-key should work too.
	name := "Header case insensitivity (x-api-key lowercase)"
	headers := map[string]string{"x-api-key": key}
	code, _, _, err := httpGet(base+"/host/", headers)
	if err != nil {
		return TestResult{Name: name, Result: Warn, Severity: SevLow,
			Detail: fmt.Sprintf("request error: %v", err)}
	}
	if code != 401 {
		return TestResult{Name: name, Result: Pass,
			Detail: fmt.Sprintf("%d — header is case-insensitive (correct per HTTP spec)", code)}
	}
	return TestResult{Name: name, Result: Warn, Severity: SevLow,
		Detail: "lowercase header rejected — may cause client compatibility issues"}
}

// ────────────────── Bootstrap helper ──────────────────

// bootstrapAPIKey creates a test API key using the /api/v1/keys endpoint.
// It first tries without auth (in case API_KEY_REQUIRED=false in dev mode).
// Falls back to checking if there's an existing root key reference.
func bootstrapAPIKey(cfg *Config, suite *SuiteResult) string {
	base := cfg.APIURL

	// Try creating a key without auth (works if API_KEY_REQUIRED=false).
	code, body, _, err := httpPost(base+"/api/v1/keys", nil, `{"label":"security-test-bootstrap"}`)
	if err == nil && code >= 200 && code < 300 {
		var resp struct {
			RawKey string `json:"raw_key"`
		}
		if json.Unmarshal([]byte(body), &resp) == nil && resp.RawKey != "" {
			suite.Results = append(suite.Results, TestResult{
				Name: "API key bootstrap (no auth)", Result: Warn, Severity: SevHigh,
				Detail: "Key creation succeeded without API key — API_KEY_REQUIRED may be false",
			})
			return resp.RawKey
		}
	}

	// If we got 401, auth is enforced. We need a key from the environment.
	if code == 401 {
		suite.Results = append(suite.Results, TestResult{
			Name: "API key bootstrap", Result: Info, Severity: SevInfo,
			Detail: "API requires authentication — set SIRIUS_API_KEY env var with a valid key",
		})
	}

	// Last resort: check if the API returns something useful at health that hints at setup.
	if strings.Contains(body, "error") {
		suite.Results = append(suite.Results, TestResult{
			Name: "API key bootstrap", Result: Skip, Severity: SevInfo,
			Detail: fmt.Sprintf("Cannot bootstrap key: %s", truncate(body, 120)),
		})
	}

	return ""
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
