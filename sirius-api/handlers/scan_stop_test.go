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

const runningStopFixture = `{"id":"run-a","status":"running","hosts_completed":0,"extension":{"sequence":9007199254740993}}`

type scanStopFixture struct {
	store.KVStore
	raw    string
	swaps  int
	writes int
}

func (s *scanStopFixture) GetValue(_ context.Context, _ string) (store.ValkeyResponse, error) {
	if s.raw == "" {
		return store.ValkeyResponse{}, store.ErrKeyNotFound
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: s.raw}}, nil
}

func (s *scanStopFixture) CompareAndSetValue(_ context.Context, _, expected, next string) (bool, error) {
	s.swaps++
	if s.raw != expected {
		return false, nil
	}
	s.raw = next
	s.writes++
	return true, nil
}

func (s *scanStopFixture) Close() error { return nil }

func stopProjection(raw string) string {
	return base64.StdEncoding.EncodeToString([]byte(raw))
}

func exerciseScanStop(t *testing.T, action, body string, state *scanStopFixture, publish func() error) (int, map[string]any, []ControlMessage) {
	t.Helper()
	app := fiber.New()
	var commands []ControlMessage
	app.Post("/", func(c *fiber.Ctx) error {
		return handleScanStop(c, action, func() (store.KVStore, error) { return state, nil }, func(queue, message string) error {
			if queue != scanControlQueue {
				return errors.New("unexpected queue: " + queue)
			}
			var cmd ControlMessage
			if err := json.Unmarshal([]byte(message), &cmd); err != nil {
				return err
			}
			commands = append(commands, cmd)
			return publish()
		})
	})
	request := httptest.NewRequest(fiber.MethodPost, "/", strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	var result map[string]any
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	return response.StatusCode, result, commands
}

func requireExactStopCommand(t *testing.T, commands []ControlMessage, action string) {
	t.Helper()
	if len(commands) != 1 || commands[0].Action != action || commands[0].ScanID != "run-a" {
		t.Fatalf("expected one %s command for run-a, got %+v", action, commands)
	}
}

func TestScanStopPreservesConcurrentProjection(t *testing.T) {
	for _, action := range []string{cancelScanAction, forceStopScanAction} {
		t.Run(action, func(t *testing.T) {
			t.Run("same run progress", func(t *testing.T) {
				state := &scanStopFixture{raw: stopProjection(runningStopFixture)}
				fresh := strings.Replace(runningStopFixture, `"hosts_completed":0`, `"hosts_completed":1`, 1)
				status, result, commands := exerciseScanStop(t, action, "", state, func() error {
					state.raw = stopProjection(fresh)
					return nil
				})
				requireExactStopCommand(t, commands, action)
				want := "cancelling"
				if action == forceStopScanAction {
					want = "cancelled"
				}
				if status != fiber.StatusOK || result["status"] != want || state.swaps != 2 || state.writes != 1 {
					t.Fatalf("unexpected response or retry: %d %+v, swaps=%d writes=%d", status, result, state.swaps, state.writes)
				}
				payload, err := base64.StdEncoding.DecodeString(state.raw)
				if err != nil {
					t.Fatal(err)
				}
				var snapshot map[string]json.RawMessage
				if err := json.Unmarshal(payload, &snapshot); err != nil {
					t.Fatal(err)
				}
				if string(snapshot["hosts_completed"]) != "1" ||
					string(snapshot["extension"]) != `{"sequence":9007199254740993}` ||
					string(snapshot["status"]) != `"`+want+`"` {
					t.Fatalf("newer progress or extension lost in %s", payload)
				}
			})

			for _, fixture := range []struct{ name, newer, status string }{
				{"different run", `{"id":"run-b","status":"running","hosts_completed":3}`, "unconfirmed"},
				{"cleared selection", "", "unconfirmed"},
				{"terminal outcome", `{"id":"run-a","status":"completed","end_time":"2026-11-25T00:00:00Z"}`, "completed"},
				{"terminal failure", `{"id":"run-a","status":"failed","end_time":"2026-11-25T01:00:00Z"}`, "failed"},
			} {
				t.Run(fixture.name, func(t *testing.T) {
					state := &scanStopFixture{raw: stopProjection(runningStopFixture)}
					newer := stopProjection(fixture.newer)
					status, result, commands := exerciseScanStop(t, action, "", state, func() error {
						state.raw = newer
						return nil
					})
					requireExactStopCommand(t, commands, action)
					if status != fiber.StatusOK || result["status"] != fixture.status || state.raw != newer || state.writes != 0 {
						t.Fatalf("concurrent projection was not preserved: %d %+v, writes=%d", status, result, state.writes)
					}
				})
			}
		})
	}
}

func TestScanStopRejectsUnboundRequestsAndPreservesStateOnPublicationFailure(t *testing.T) {
	for _, action := range []string{cancelScanAction, forceStopScanAction} {
		for _, fixture := range []struct {
			name, body string
			status     int
		}{
			{"malformed body", `{"scan_id":`, fiber.StatusBadRequest},
			{"empty ID", `{"scan_id":""}`, fiber.StatusBadRequest},
			{"null ID", `{"scan_id":null}`, fiber.StatusBadRequest},
			{"stale ID", `{"scan_id":"run-b"}`, fiber.StatusConflict},
		} {
			t.Run(action+"/"+fixture.name, func(t *testing.T) {
				state := &scanStopFixture{raw: stopProjection(runningStopFixture)}
				status, _, commands := exerciseScanStop(t, action, fixture.body, state, func() error { return nil })
				if status != fixture.status || len(commands) != 0 || state.swaps != 0 {
					t.Fatalf("request was not rejected before publication: status=%d commands=%+v swaps=%d", status, commands, state.swaps)
				}
			})
		}

		t.Run(action+"/publication error", func(t *testing.T) {
			state := &scanStopFixture{raw: stopProjection(runningStopFixture)}
			status, result, commands := exerciseScanStop(t, action, `{"scan_id":"run-a"}`, state, func() error {
				return errors.New("fixture publication failure")
			})
			requireExactStopCommand(t, commands, action)
			if status != fiber.StatusInternalServerError || result["success"] != false ||
				state.raw != stopProjection(runningStopFixture) || state.swaps != 0 {
				t.Fatalf("publication error altered state or was hidden: %d %+v, swaps=%d", status, result, state.swaps)
			}
		})
	}
}
