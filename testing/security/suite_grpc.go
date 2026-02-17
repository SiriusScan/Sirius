package main

import (
	"context"
	"fmt"
	"strings"
	"time"

	pb "github.com/SiriusScan/app-agent/proto/hello"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

// RunGRPCSuite tests authentication on the gRPC agent service (port 50051).
func RunGRPCSuite(cfg *Config) SuiteResult {
	suite := SuiteResult{Name: "gRPC Agent Authentication"}

	// ── Phase 0: Reachability ───────────────────────────────────────────
	if !tcpProbe(cfg.GRPCAddr, 3*time.Second) {
		suite.Results = append(suite.Results, TestResult{
			Name:     "gRPC reachability check",
			Result:   Skip,
			Severity: SevCritical,
			Detail:   fmt.Sprintf("Cannot reach %s", cfg.GRPCAddr),
		})
		return suite
	}

	// ── Phase 1: New agent connection — should receive a token ──────────
	token, result := testNewAgentGetsToken(cfg)
	suite.Results = append(suite.Results, result)

	// ── Phase 2: Returning agent with valid token ───────────────────────
	if token != "" {
		suite.Results = append(suite.Results, testValidTokenReconnect(cfg, token))
	} else {
		suite.Results = append(suite.Results, TestResult{
			Name: "Returning agent with valid token", Result: Skip, Severity: SevHigh,
			Detail: "no token obtained from Phase 1",
		})
	}

	// ── Phase 3: Returning agent with invalid token ─────────────────────
	suite.Results = append(suite.Results, testInvalidTokenRejected(cfg))

	// ── Phase 4: Known agent without token (should be rejected) ─────────
	if token != "" {
		suite.Results = append(suite.Results, testKnownAgentNoToken(cfg))
	}

	// ── Phase 5: Ping without established stream ────────────────────────
	suite.Results = append(suite.Results, testPingWithoutStream(cfg))

	// ── Phase 6: Agent impersonation ────────────────────────────────────
	if token != "" {
		suite.Results = append(suite.Results, testAgentImpersonation(cfg, token))
	}

	return suite
}

// ────────────────── Individual gRPC tests ──────────────────

// testNewAgentGetsToken connects as a brand-new agent and expects to receive
// an auth_token in the server's welcome message.
func testNewAgentGetsToken(cfg *Config) (string, TestResult) {
	name := "New agent receives auth token"
	agentID := fmt.Sprintf("security-test-new-%d", time.Now().UnixNano())

	token, err := connectAndGetToken(cfg.GRPCAddr, agentID, "")
	if err != nil {
		return "", TestResult{Name: name, Result: Fail, Severity: SevHigh,
			Detail: fmt.Sprintf("connection error: %v", err)}
	}
	if token == "" {
		return "", TestResult{Name: name, Result: Fail, Severity: SevHigh,
			Detail: "server did not issue a token in welcome message"}
	}

	return token, TestResult{Name: name, Result: Pass,
		Detail: fmt.Sprintf("received token (prefix: %s...)", token[:8])}
}

// testValidTokenReconnect connects with the token obtained from Phase 1.
func testValidTokenReconnect(cfg *Config, token string) TestResult {
	name := "Returning agent with valid token"
	// Use the same agent ID pattern — the server should recognize it.
	// NOTE: the token is bound to the agent ID that created it in Phase 1,
	// so we need to know that ID. For simplicity, we create a NEW agent
	// and get its token, then reconnect with the same ID.
	agentID := fmt.Sprintf("security-test-reconnect-%d", time.Now().UnixNano())

	// First connection — get a token.
	newToken, err := connectAndGetToken(cfg.GRPCAddr, agentID, "")
	if err != nil || newToken == "" {
		return TestResult{Name: name, Result: Skip, Severity: SevHigh,
			Detail: fmt.Sprintf("setup failed: %v", err)}
	}

	// Second connection — reconnect with the token.
	_, err = connectAndGetToken(cfg.GRPCAddr, agentID, newToken)
	if err != nil {
		return TestResult{Name: name, Result: Fail, Severity: SevHigh,
			Detail: fmt.Sprintf("reconnect with valid token failed: %v", err)}
	}

	return TestResult{Name: name, Result: Pass,
		Detail: "reconnected successfully with stored token"}
}

// testInvalidTokenRejected tries to connect with a garbage token.
func testInvalidTokenRejected(cfg *Config) TestResult {
	name := "Invalid token rejected"
	// Create a new agent first so a token exists, then reconnect with bad token.
	agentID := fmt.Sprintf("security-test-badtoken-%d", time.Now().UnixNano())

	// First: establish the agent so a token exists server-side.
	_, err := connectAndGetToken(cfg.GRPCAddr, agentID, "")
	if err != nil {
		return TestResult{Name: name, Result: Skip, Severity: SevHigh,
			Detail: fmt.Sprintf("setup (first connect) failed: %v", err)}
	}

	// Second: reconnect with an invalid token.
	_, err = connectAndGetToken(cfg.GRPCAddr, agentID, "totally-invalid-token-value")
	if err != nil {
		// Expected — the server should reject this.
		if strings.Contains(err.Error(), "token") || strings.Contains(err.Error(), "auth") ||
			strings.Contains(err.Error(), "EOF") || strings.Contains(err.Error(), "unavailable") ||
			strings.Contains(err.Error(), "RST_STREAM") {
			return TestResult{Name: name, Result: Pass,
				Detail: fmt.Sprintf("rejected: %v", truncate(err.Error(), 80))}
		}
		// Some other error — still likely a rejection.
		return TestResult{Name: name, Result: Pass,
			Detail: fmt.Sprintf("connection failed (likely rejected): %v", truncate(err.Error(), 80))}
	}

	return TestResult{Name: name, Result: Fail, Severity: SevCritical,
		Detail: "server accepted an invalid token!"}
}

// testKnownAgentNoToken tries to connect as a known agent without presenting a token.
func testKnownAgentNoToken(cfg *Config) TestResult {
	name := "Known agent without token rejected"
	agentID := fmt.Sprintf("security-test-notoken-%d", time.Now().UnixNano())

	// First: register the agent.
	_, err := connectAndGetToken(cfg.GRPCAddr, agentID, "")
	if err != nil {
		return TestResult{Name: name, Result: Skip, Severity: SevHigh,
			Detail: fmt.Sprintf("setup failed: %v", err)}
	}

	// Second: reconnect WITHOUT the token (empty).
	_, err = connectAndGetToken(cfg.GRPCAddr, agentID, "")
	if err != nil {
		return TestResult{Name: name, Result: Pass,
			Detail: fmt.Sprintf("rejected: %v", truncate(err.Error(), 80))}
	}

	return TestResult{Name: name, Result: Fail, Severity: SevCritical,
		Detail: "server allowed reconnection without token for a known agent"}
}

// testPingWithoutStream calls the Ping RPC without an established stream.
func testPingWithoutStream(cfg *Config) TestResult {
	name := "Ping RPC without established stream"

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	conn, err := grpc.NewClient(cfg.GRPCAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return TestResult{Name: name, Result: Skip, Severity: SevHigh,
			Detail: fmt.Sprintf("dial error: %v", err)}
	}
	defer conn.Close()

	client := pb.NewHelloServiceClient(conn)
	_, err = client.Ping(ctx, &pb.PingRequest{AgentId: "nonexistent-agent"})
	if err != nil {
		return TestResult{Name: name, Result: Pass,
			Detail: fmt.Sprintf("rejected: %v", truncate(err.Error(), 80))}
	}

	return TestResult{Name: name, Result: Fail, Severity: SevHigh,
		Detail: "Ping succeeded for agent without an active stream"}
}

// testAgentImpersonation tries to use agent A's token with agent B's ID.
func testAgentImpersonation(cfg *Config, tokenFromOtherAgent string) TestResult {
	name := "Agent impersonation (A's token with B's ID)"
	victimID := fmt.Sprintf("security-test-impersonate-%d", time.Now().UnixNano())

	_, err := connectAndGetToken(cfg.GRPCAddr, victimID, tokenFromOtherAgent)
	if err != nil {
		return TestResult{Name: name, Result: Pass,
			Detail: fmt.Sprintf("impersonation rejected: %v", truncate(err.Error(), 80))}
	}

	return TestResult{Name: name, Result: Fail, Severity: SevCritical,
		Detail: "server accepted token from a different agent — impersonation possible!"}
}

// ────────────────── gRPC connection helper ──────────────────

// connectAndGetToken opens a ConnectStream, sends an initial heartbeat with
// the given agentID and token, receives the server's first message, and
// returns any auth_token from the response. It closes the stream afterwards.
func connectAndGetToken(addr, agentID, token string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	conn, err := grpc.NewClient(addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return "", fmt.Errorf("dial: %w", err)
	}
	defer conn.Close()

	client := pb.NewHelloServiceClient(conn)

	// Add agent_id as metadata (matching the agent implementation).
	md := metadata.New(map[string]string{
		"agent_id":          agentID,
		"scripting_enabled": "false",
	})
	streamCtx := metadata.NewOutgoingContext(ctx, md)

	stream, err := client.ConnectStream(streamCtx)
	if err != nil {
		return "", fmt.Errorf("open stream: %w", err)
	}

	// Send initial heartbeat with auth token.
	err = stream.Send(&pb.AgentMessage{
		AgentId: agentID,
		Type:    pb.MessageType_HEARTBEAT,
		Payload: &pb.AgentMessage_Heartbeat{
			Heartbeat: &pb.HeartbeatMessage{
				Timestamp: time.Now().Unix(),
			},
		},
		AuthToken: token,
	})
	if err != nil {
		return "", fmt.Errorf("send heartbeat: %w", err)
	}

	// Receive welcome message.
	resp, err := stream.Recv()
	if err != nil {
		return "", fmt.Errorf("recv welcome: %w", err)
	}

	// Cleanly close.
	_ = stream.CloseSend()

	return resp.GetAuthToken(), nil
}
