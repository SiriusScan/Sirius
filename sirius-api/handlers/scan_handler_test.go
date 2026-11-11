package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
)

type scanStoreFake struct {
	store.KVStore
	casCalls                  int
	beforeCAS                 func(*scanStoreFake)
	value                     string
	getErr, setErr, deleteErr error
	writes, deletes, closes   int
}

func (s *scanStoreFake) GetValue(context.Context, string) (store.ValkeyResponse, error) {
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: s.value}}, s.getErr
}
func (s *scanStoreFake) SetValue(_ context.Context, _ string, value string) error {
	s.writes++
	if s.setErr == nil {
		s.value = value
	}
	return s.setErr
}
func (s *scanStoreFake) DeleteValue(context.Context, string) error { s.deletes++; return s.deleteErr }
func (s *scanStoreFake) Close() error                              { s.closes++; return nil }
func scanValue(value string) string                                { return base64.StdEncoding.EncodeToString([]byte(value)) }

func exerciseScanHandler(t *testing.T, handler fiber.Handler, body string) (int, map[string]interface{}) {
	t.Helper()
	app := fiber.New()
	app.Post("/", handler)
	req := httptest.NewRequest("POST", "/", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	return resp.StatusCode, result
}

func TestScanControlValidation(t *testing.T) {
	for _, force := range []bool{false, true} {
		name := "cancel"
		if force {
			name = "force"
		}
		t.Run(name, func(t *testing.T) {
			for _, tc := range []struct {
				name, body, value string
				code              int
			}{
				{"mismatch", `{"scan_id":"old"}`, `{"id":"new","status":"running"}`, 409},
				{"malformed", `{"scan_id":`, `{"id":"new","status":"running"}`, 400},
				{"wrong ID type", `{"scan_id":123}`, `{"id":"new","status":"running"}`, 400},
				{"null state", `{}`, `null`, 500},
				{"missing ID", `{}`, `{"status":"running"}`, 500},
				{"bad stored JSON", `{}`, `{`, 500},
			} {
				t.Run(tc.name, func(t *testing.T) {
					s := &scanStoreFake{value: scanValue(tc.value)}
					sends := 0
					h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }, send: func(string, string) error { sends++; return nil }}
					handler := h.CancelScan
					if force {
						handler = h.ForceStopScan
					}
					code, result := exerciseScanHandler(t, handler, tc.body)
					if code != tc.code || result["success"] != false {
						t.Fatalf("response = %d %v", code, result)
					}
					if s.writes != 0 || sends != 0 {
						t.Fatalf("invalid request caused writes=%d sends=%d", s.writes, sends)
					}
				})
			}
		})
	}
}

func TestScanControlTargetsCurrentID(t *testing.T) {
	for _, force := range []bool{false, true} {
		for _, body := range []string{"", `{}`, `{"scan_id":"current"}`} {
			s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running"}`)}
			var sent ControlMessage
			h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }, send: func(q, body string) error {
				if q != scanControlQueue {
					t.Fatalf("queue=%s", q)
				}
				return json.Unmarshal([]byte(body), &sent)
			}}
			handler := h.CancelScan
			action, status := "cancel", "cancelling"
			if force {
				handler = h.ForceStopScan
				action, status = "force_cancel", "cancelled"
			}
			code, _ := exerciseScanHandler(t, handler, body)
			if code != 200 || sent.ScanID != "current" || sent.Action != action || s.writes != 1 || s.closes != 1 {
				t.Fatalf("code=%d sent=%+v store=%+v", code, sent, s)
			}
			decoded, _ := base64.StdEncoding.DecodeString(s.value)
			var state map[string]interface{}
			_ = json.Unmarshal(decoded, &state)
			if state["status"] != status {
				t.Fatalf("state=%v", state)
			}
		}
	}
}

func TestCancelQueueFailurePreservesState(t *testing.T) {
	s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running"}`)}
	h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }, send: func(string, string) error { return errors.New("queue unavailable") }}
	code, result := exerciseScanHandler(t, h.CancelScan, `{}`)
	if code != 500 || result["success"] != false || s.writes != 0 {
		t.Fatalf("code=%d result=%v writes=%d", code, result, s.writes)
	}
}

func TestForceStopQueueFailureStillUpdatesState(t *testing.T) {
	s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running"}`)}
	h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }, send: func(string, string) error { return errors.New("queue unavailable") }}
	code, result := exerciseScanHandler(t, h.ForceStopScan, `{}`)
	if code != 200 || result["status"] != "cancelled" || s.writes != 1 {
		t.Fatalf("code=%d result=%v writes=%d", code, result, s.writes)
	}
}

func TestResetScanStateReportsDeleteFailure(t *testing.T) {
	for _, tc := range []struct {
		name string
		err  error
		code int
	}{
		{"deleted", nil, 200}, {"already absent", errors.New("key not found"), 200}, {"unavailable", errors.New("connection refused"), 500},
	} {
		t.Run(tc.name, func(t *testing.T) {
			s := &scanStoreFake{deleteErr: tc.err}
			h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }}
			code, result := exerciseScanHandler(t, h.ResetScanState, "")
			if code != tc.code || result["success"] != (tc.code == 200) || s.deletes != 1 || s.closes != 1 {
				t.Fatalf("code=%d result=%v store=%+v", code, result, s)
			}
		})
	}
}

func TestGetScanStatusProjectsStructuredAndLegacyHosts(t *testing.T) {
	s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running","hosts":["192.0.2.1",{"id":"host","ip":"192.0.2.2","hostname":"test"}],"targets":["192.0.2.0/24"]}`)}
	h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }}
	code, result := exerciseScanHandler(t, h.GetScanStatus, "")
	hosts, ok := result["hosts"].([]interface{})
	if code != 200 || !ok || len(hosts) != 2 || hosts[0] != "192.0.2.1" || hosts[1] != "192.0.2.2" || result["total_hosts"] != float64(2) {
		t.Fatalf("code=%d result=%v", code, result)
	}
	targets, ok := result["targets"].([]interface{})
	if !ok || len(targets) != 1 || targets[0] != "192.0.2.0/24" {
		t.Fatalf("targets=%v", result["targets"])
	}
}

func TestScanControlStoreFailures(t *testing.T) {
	for _, force := range []bool{false, true} {
		for _, stage := range []string{"connect", "read", "write", "missing"} {
			t.Run(stage, func(t *testing.T) {
				failure := errors.New("store unavailable")
				s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running"}`)}
				if stage == "read" {
					s.getErr = failure
				}
				if stage == "write" {
					s.setErr = failure
				}
				if stage == "missing" {
					s.getErr = errors.New("key not found")
				}
				sends := 0
				h := scanHandler{newStore: func() (store.KVStore, error) {
					if stage == "connect" {
						return nil, failure
					}
					return s, nil
				}, send: func(string, string) error { sends++; return nil }}
				handler := h.CancelScan
				if force {
					handler = h.ForceStopScan
				}
				code, result := exerciseScanHandler(t, handler, `{}`)
				want := 500
				if stage == "missing" {
					want = 404
					if force {
						want = 200
					}
				}
				if code != want {
					t.Fatalf("force=%v code=%d result=%v", force, code, result)
				}
				if stage != "write" && sends != 0 {
					t.Fatalf("sent command without a valid current scan")
				}
				if stage == "write" && result["success"] != false {
					t.Fatalf("write failure returned success: %v", result)
				}
			})
		}
	}
}

func (s *scanStoreFake) CompareAndSetValue(ctx context.Context, key, expected, value string) (bool, error) {
	s.casCalls++
	if s.beforeCAS != nil {
		s.beforeCAS(s)
	}
	if s.setErr != nil {
		return false, s.setErr
	}
	if s.value != expected {
		return false, nil
	}
	return true, s.SetValue(ctx, key, value)
}

func TestScanControlCASContention(t *testing.T) {
	for _, force := range []bool{false, true} {
		for _, tc := range []struct {
			name, replacement, wantStatus string
			code                          int
		}{
			{"new scan", `{"id":"new","status":"running"}`, "", 409},
			{"progress", `{"id":"current","status":"running","hosts_completed":7,"sub_scans":{"network":{"status":"running"}}}`, "", 200},
			{"completed", `{"id":"current","status":"completed","end_time":"original"}`, "completed", 200},
			{"cancelled", `{"id":"current","status":"cancelled","end_time":"original"}`, "cancelled", 200},
			{"failed", `{"id":"current","status":"failed","end_time":"original"}`, "failed", 200},
		} {
			t.Run(tc.name, func(t *testing.T) {
				s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running"}`)}
				replacement := scanValue(tc.replacement)
				sends := 0
				h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }, send: func(_, body string) error {
					sends++
					var cmd ControlMessage
					if err := json.Unmarshal([]byte(body), &cmd); err != nil {
						t.Fatal(err)
					}
					if cmd.ScanID != "current" {
						t.Fatalf("wrong command target: %+v", cmd)
					}
					s.value = replacement
					return nil
				}}
				handler := h.CancelScan
				desired := "cancelling"
				if force {
					handler = h.ForceStopScan
					desired = "cancelled"
				}
				code, result := exerciseScanHandler(t, handler, `{}`)
				if code != tc.code || sends != 1 {
					t.Fatalf("force=%v code=%d result=%v sends=%d", force, code, result, sends)
				}
				if tc.name == "progress" {
					raw, _ := base64.StdEncoding.DecodeString(s.value)
					var state map[string]interface{}
					_ = json.Unmarshal(raw, &state)
					if state["hosts_completed"] != float64(7) || state["status"] != desired || state["sub_scans"] == nil || s.casCalls != 2 {
						t.Fatalf("state=%v calls=%d", state, s.casCalls)
					}
				} else {
					if s.value != replacement || s.writes != 0 {
						t.Fatalf("concurrent state overwritten: %s", s.value)
					}
					if tc.wantStatus != "" && result["status"] != tc.wantStatus {
						t.Fatalf("untruthful terminal response: %v", result)
					}
				}
			})
		}
	}
}

func TestScanControlCASRetryFailures(t *testing.T) {
	for _, force := range []bool{false, true} {
		for _, scenario := range []string{"exhausted", "reread error", "removed", "CAS error"} {
			t.Run(scenario, func(t *testing.T) {
				s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running"}`)}
				s.beforeCAS = func(s *scanStoreFake) {
					// Distinct valid bytes each time force a CAS mismatch without mutation.
					s.value = scanValue(`{"id":"current","status":"running","progress":` + strings.Repeat(" ", s.casCalls) + `1}`)
					if scenario == "reread error" {
						s.getErr = errors.New("read unavailable")
					}
					if scenario == "removed" {
						s.getErr = errors.New("key not found")
					}
					if scenario == "CAS error" {
						s.setErr = errors.New("write unavailable")
					}
				}
				h := scanHandler{newStore: func() (store.KVStore, error) { return s, nil }, send: func(string, string) error { return nil }}
				handler := h.CancelScan
				if force {
					handler = h.ForceStopScan
				}
				code, result := exerciseScanHandler(t, handler, `{}`)
				want := 500
				if scenario == "exhausted" || scenario == "removed" {
					want = 409
				}
				if code != want || result["success"] != false || result["command_sent"] != true || s.writes != 0 {
					t.Fatalf("code=%d result=%v writes=%d", code, result, s.writes)
				}
				if scenario == "exhausted" && s.casCalls != scanControlUpdateAttempts {
					t.Fatalf("unbounded retries=%d", s.casCalls)
				}
			})
		}
	}
}

// Expose only the legacy KVStore method set, deliberately hiding CAS.
type scanStoreWithoutCAS struct{ store.KVStore }

func TestScanControlRejectsNonAtomicStore(t *testing.T) {
	for _, force := range []bool{false, true} {
		s := &scanStoreFake{value: scanValue(`{"id":"current","status":"running"}`)}
		sends := 0
		h := scanHandler{newStore: func() (store.KVStore, error) { return scanStoreWithoutCAS{s}, nil }, send: func(string, string) error { sends++; return nil }}
		handler := h.CancelScan
		if force {
			handler = h.ForceStopScan
		}
		code, result := exerciseScanHandler(t, handler, `{}`)
		if code != 500 || result["success"] != false || sends != 0 || s.writes != 0 {
			t.Fatalf("code=%d result=%v sends=%d writes=%d", code, result, sends, s.writes)
		}
	}
}
