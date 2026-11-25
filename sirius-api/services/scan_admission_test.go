package services

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"sync"
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
)

type scanStateFixture struct {
	mu    sync.Mutex
	value string
	err   error
}

func (s *scanStateFixture) GetValue(_ context.Context, _ string) (store.ValkeyResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.err != nil {
		return store.ValkeyResponse{}, s.err
	}
	if s.value == "" {
		return store.ValkeyResponse{}, store.ErrKeyNotFound
	}
	return store.ValkeyResponse{Message: store.ValkeyValue{Value: s.value}}, nil
}

func (s *scanStateFixture) SetValueIfAbsent(_ context.Context, _ string, value string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.value != "" {
		return false, nil
	}
	s.value = value
	return true, nil
}

func (s *scanStateFixture) CompareAndSetValue(_ context.Context, _, expected, value string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.value == "" || s.value != expected {
		return false, nil
	}
	s.value = value
	return true, nil
}

func (s *scanStateFixture) current(t *testing.T) store.ScanResult {
	t.Helper()
	current, err := s.GetValue(context.Background(), currentScanKey)
	if err != nil {
		t.Fatal(err)
	}
	decoded, err := base64.StdEncoding.DecodeString(current.Message.Value)
	if err != nil {
		t.Fatal(err)
	}
	var scan store.ScanResult
	if err := json.Unmarshal(decoded, &scan); err != nil {
		t.Fatal(err)
	}
	return scan
}

type scanPublisherFixture func(context.Context, []byte) ScanPublication

func (f scanPublisherFixture) PublishNetworkScan(ctx context.Context, body []byte) ScanPublication {
	return f(ctx, body)
}

func scanRequestFixture(id string) NetworkScanRequest {
	return NetworkScanRequest{
		ScanID:     id,
		TemplateID: "fixture-profile",
		Targets:    []NetworkScanTarget{{Type: "dns_name", Value: "fixture.invalid"}},
		Priority:   3,
	}
}

func TestScanAdmissionRecordsWaitingBeforeOneLegacyPublish(t *testing.T) {
	ctx := context.Background()
	state := &scanStateFixture{}
	request := scanRequestFixture("scan-1-request")
	calls := 0
	publisher := scanPublisherFixture(func(ctx context.Context, body []byte) ScanPublication {
		calls++
		if _, ok := ctx.Deadline(); !ok {
			t.Error("expected bounded publisher context")
		}
		const expected = `{"id":"scan-1-request","targets":[{"value":"fixture.invalid","type":"dns_name"}],"options":{"template_id":"fixture-profile"},"priority":3}`
		if string(body) != expected {
			t.Errorf("legacy payload = %s, want %s", body, expected)
		}
		scan := state.current(t)
		if scan.ID != request.ScanID || scan.Status != "pending" || scan.SubScans["network"].Status != "pending" {
			t.Errorf("expected pending projection before publish, got %+v", scan)
		}
		return ScanPublicationSubmitted
	})
	admission := NewScanAdmission(state, publisher)
	if got := admission.SubmitNetworkScan(ctx, request); got.Outcome != NetworkScanSubmitted || got.Scan == nil {
		t.Fatalf("receipt = %+v", got)
	}
	if got := admission.SubmitNetworkScan(ctx, request); got.Outcome != NetworkScanBusy || calls != 1 {
		t.Fatalf("repeated receipt = %+v, calls = %d", got, calls)
	}
}

func TestScanAdmissionPreservesActiveRecord(t *testing.T) {
	ctx := context.Background()
	for _, status := range []string{"pending", "running", "cancelling", "unknown"} {
		t.Run(status, func(t *testing.T) {
			raw := base64.StdEncoding.EncodeToString([]byte(`{"id":"scan-2-other","status":"` + status + `"}`))
			state := &scanStateFixture{value: raw}
			publisher := scanPublisherFixture(func(context.Context, []byte) ScanPublication {
				t.Fatal("busy request reached publisher")
				return ScanPublicationNotSent
			})
			admission := NewScanAdmission(state, publisher)
			if got := admission.SubmitNetworkScan(ctx, scanRequestFixture("scan-1-request")); got.Outcome != NetworkScanBusy {
				t.Errorf("receipt = %+v", got)
			}
			if state.value != raw {
				t.Fatal("active state was replaced")
			}
		})
	}
}

func TestScanAdmissionSerializesConcurrentRequests(t *testing.T) {
	ctx := context.Background()
	state := &scanStateFixture{value: base64.StdEncoding.EncodeToString(
		[]byte(`{"id":"scan-2-old","status":"completed","hosts":["fixture.invalid"]}`),
	)}
	started := make(chan struct{})
	release := make(chan struct{})
	first := make(chan NetworkScanReceipt, 1)
	publisher := scanPublisherFixture(func(ctx context.Context, _ []byte) ScanPublication {
		close(started)
		select {
		case <-ctx.Done():
			return ScanPublicationUnconfirmed
		case <-release:
			return ScanPublicationSubmitted
		}
	})
	admission := NewScanAdmission(state, publisher)
	go func() {
		first <- admission.SubmitNetworkScan(ctx, scanRequestFixture("scan-1-winner"))
	}()
	<-started
	second := admission.SubmitNetworkScan(ctx, scanRequestFixture("scan-1-loser"))
	close(release)
	if second.Outcome != NetworkScanBusy {
		t.Errorf("concurrent receipt = %+v", second)
	}
	if winner := <-first; winner.Outcome != NetworkScanSubmitted {
		t.Errorf("winning receipt = %+v", winner)
	}
	if scan := state.current(t); scan.ID != "scan-1-winner" {
		t.Fatalf("current ID = %q", scan.ID)
	}
}

func TestScanAdmissionDistinguishesPublicationOutcomes(t *testing.T) {
	ctx := context.Background()
	for _, test := range []struct {
		name        string
		publication ScanPublication
		want        ScanAdmissionOutcome
		status      string
	}{
		{"pre-send failure", ScanPublicationNotSent, NetworkScanFailed, "failed"},
		{"lost acknowledgement", ScanPublicationUnconfirmed, NetworkScanUnconfirmed, "pending"},
	} {
		t.Run(test.name, func(t *testing.T) {
			state := &scanStateFixture{}
			admission := NewScanAdmission(state, scanPublisherFixture(func(context.Context, []byte) ScanPublication {
				return test.publication
			}))
			got := admission.SubmitNetworkScan(ctx, scanRequestFixture("scan-1-request"))
			if got.Outcome != test.want {
				t.Errorf("outcome = %q, want %q", got.Outcome, test.want)
			}
			scan := state.current(t)
			if scan.Status != test.status || scan.SubScans["network"].Status != test.status {
				t.Errorf("projection = %+v, want %q", scan, test.status)
			}
			if test.status == "failed" && (scan.EndTime == "" ||
				string(scan.SubScans["network"].Metadata) != `{"submission_error":"not_published"}`) {
				t.Errorf("failed projection has no cause or end time: %+v", scan)
			}
		})
	}
}

func TestScanAdmissionFailureDoesNotOverwriteConcurrentState(t *testing.T) {
	ctx := context.Background()
	for _, replacement := range []string{
		`{"id":"scan-1-request","status":"cancelling"}`,
		`{"id":"scan-1-request","status":"pending","sub_scans":{"network":{"status":"running"}}}`,
		`{"id":"scan-2-other","status":"running"}`,
	} {
		t.Run(replacement, func(t *testing.T) {
			expected := base64.StdEncoding.EncodeToString([]byte(replacement))
			state := &scanStateFixture{}
			admission := NewScanAdmission(state, scanPublisherFixture(func(context.Context, []byte) ScanPublication {
				state.mu.Lock()
				state.value = expected
				state.mu.Unlock()
				return ScanPublicationNotSent
			}))
			got := admission.SubmitNetworkScan(ctx, scanRequestFixture("scan-1-request"))
			if got.Outcome != NetworkScanFailed || state.value != expected {
				t.Fatalf("receipt = %+v, concurrent state preserved = %t", got, state.value == expected)
			}
		})
	}
}

func TestScanAdmissionStopsAfterStoreFailure(t *testing.T) {
	state := &scanStateFixture{err: errors.New("fixture store unavailable")}
	admission := NewScanAdmission(state, scanPublisherFixture(func(context.Context, []byte) ScanPublication {
		t.Fatal("store error reached publisher")
		return ScanPublicationNotSent
	}))
	got := admission.SubmitNetworkScan(context.Background(), scanRequestFixture("scan-1-request"))
	if got.Outcome != NetworkScanNotRecorded {
		t.Errorf("outcome = %q", got.Outcome)
	}
}
