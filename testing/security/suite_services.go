package main

import (
	"fmt"
	"strings"
	"time"
)

// RunServicesSuite tests whether internal infrastructure services are
// improperly exposed to the host network.
func RunServicesSuite(cfg *Config) SuiteResult {
	suite := SuiteResult{Name: "Service Exposure"}
	timeout := 3 * time.Second

	// ── Valkey (port 6379) ──────────────────────────────────────────────
	suite.Results = append(suite.Results, testValkeyExposure(cfg.ValkeyAddr, timeout))

	// ── PostgreSQL (port 5432) ──────────────────────────────────────────
	suite.Results = append(suite.Results, testPostgresExposure(cfg.PostgresAddr, timeout))

	// ── RabbitMQ AMQP (port 5672) ───────────────────────────────────────
	suite.Results = append(suite.Results, testRabbitMQAMQP(cfg.RabbitMQAddr, timeout))

	// ── RabbitMQ Management UI (port 15672) ─────────────────────────────
	suite.Results = append(suite.Results, testRabbitMQManagement(cfg.RabbitMQMgmt, timeout)...)

	// ── Engine HTTP port (5174) ─────────────────────────────────────────
	suite.Results = append(suite.Results, testEngineHTTP(cfg.EngineHTTPAddr, timeout))

	return suite
}

// ────────────────── Valkey ──────────────────

func testValkeyExposure(addr string, timeout time.Duration) TestResult {
	name := "Valkey (Redis) exposure on " + addr

	// Try to connect and send PING.
	resp, err := tcpSendRecv(addr, "PING\r\n", timeout)
	if err != nil {
		return TestResult{Name: name, Result: Pass,
			Detail: "not reachable from host (good)"}
	}

	if strings.Contains(resp, "+PONG") {
		return TestResult{Name: name, Result: Warn, Severity: SevHigh,
			Detail: "Valkey accepts unauthenticated PING from host — no AUTH configured"}
	}

	if strings.Contains(resp, "-NOAUTH") || strings.Contains(resp, "-ERR") {
		return TestResult{Name: name, Result: Info, Severity: SevLow,
			Detail: "Valkey reachable but requires authentication (acceptable)"}
	}

	return TestResult{Name: name, Result: Warn, Severity: SevMedium,
		Detail: fmt.Sprintf("Valkey reachable, response: %s", truncate(resp, 60))}
}

// ────────────────── PostgreSQL ──────────────────

func testPostgresExposure(addr string, timeout time.Duration) TestResult {
	name := "PostgreSQL exposure on " + addr

	if !tcpProbe(addr, timeout) {
		return TestResult{Name: name, Result: Pass,
			Detail: "not reachable from host (good)"}
	}

	// PostgreSQL sends a greeting when a connection is opened. Try to read it.
	// If we can connect, the port is exposed.
	return TestResult{Name: name, Result: Warn, Severity: SevMedium,
		Detail: "PostgreSQL port is reachable from host — consider restricting to internal network only"}
}

// ────────────────── RabbitMQ AMQP ──────────────────

func testRabbitMQAMQP(addr string, timeout time.Duration) TestResult {
	name := "RabbitMQ AMQP exposure on " + addr

	resp, err := tcpSendRecv(addr, "", timeout)
	if err != nil {
		return TestResult{Name: name, Result: Pass,
			Detail: "not reachable from host (good)"}
	}

	if strings.Contains(resp, "AMQP") {
		return TestResult{Name: name, Result: Warn, Severity: SevMedium,
			Detail: "RabbitMQ AMQP port is reachable and responded with AMQP handshake"}
	}

	return TestResult{Name: name, Result: Warn, Severity: SevMedium,
		Detail: fmt.Sprintf("RabbitMQ port reachable, response: %s", truncate(resp, 60))}
}

// ────────────────── RabbitMQ Management ──────────────────

func testRabbitMQManagement(addr string, timeout time.Duration) []TestResult {
	var results []TestResult

	mgmtURL := fmt.Sprintf("http://%s", addr)
	name := "RabbitMQ Management UI exposure on " + addr

	code, _, _, err := httpGet(mgmtURL+"/api/overview", nil)
	if err != nil {
		results = append(results, TestResult{Name: name, Result: Pass,
			Detail: "management UI not reachable from host (good)"})
		return results
	}

	if code == 401 {
		results = append(results, TestResult{Name: name, Result: Info, Severity: SevLow,
			Detail: "management UI reachable but requires authentication"})
	} else {
		results = append(results, TestResult{Name: name, Result: Warn, Severity: SevMedium,
			Detail: fmt.Sprintf("management UI responded with %d — may be accessible", code)})
	}

	// Test default credentials.
	_ = timeout // already tested reachability above
	nameCreds := "RabbitMQ default credentials (guest:guest)"
	headers := map[string]string{
		"Authorization": "Basic Z3Vlc3Q6Z3Vlc3Q=", // base64("guest:guest")
	}
	code, _, _, err = httpGet(mgmtURL+"/api/overview", headers)
	if err != nil {
		results = append(results, TestResult{Name: nameCreds, Result: Pass,
			Detail: "request failed"})
		return results
	}

	if code == 200 {
		results = append(results, TestResult{Name: nameCreds, Result: Warn, Severity: SevHigh,
			Detail: "default credentials accepted — change RabbitMQ admin password"})
	} else if code == 401 {
		results = append(results, TestResult{Name: nameCreds, Result: Pass,
			Detail: "default credentials rejected (good)"})
	} else {
		results = append(results, TestResult{Name: nameCreds, Result: Info, Severity: SevLow,
			Detail: fmt.Sprintf("unexpected status %d", code)})
	}

	return results
}

// ────────────────── Engine HTTP ──────────────────

func testEngineHTTP(addr string, timeout time.Duration) TestResult {
	name := "Engine HTTP port exposure on " + addr

	url := fmt.Sprintf("http://%s/health", addr)
	code, _, _, err := httpGet(url, nil)
	if err != nil {
		return TestResult{Name: name, Result: Info, Severity: SevInfo,
			Detail: "engine HTTP port not reachable from host"}
	}

	if code == 200 {
		return TestResult{Name: name, Result: Info, Severity: SevLow,
			Detail: "engine health endpoint reachable (expected for monitoring)"}
	}

	return TestResult{Name: name, Result: Info, Severity: SevLow,
		Detail: fmt.Sprintf("engine HTTP reachable, status %d", code)}
}
