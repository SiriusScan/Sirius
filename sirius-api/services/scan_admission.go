package services

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log/slog"
	"regexp"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
)

const currentScanKey = "currentScan"

var (
	scanIDPattern    = regexp.MustCompile(`^scan-[0-9]{1,20}-[a-z0-9]{1,9}$`)
	profileIDPattern = regexp.MustCompile(`^[A-Za-z0-9._:-]{1,128}$`)
)

type NetworkScanTarget struct {
	Value string `json:"value"`
	Type  string `json:"type"`
}

type NetworkScanRequest struct {
	ScanID     string              `json:"scan_id"`
	TemplateID string              `json:"template_id"`
	Targets    []NetworkScanTarget `json:"targets"`
	Priority   int                 `json:"priority"`
}

func (r NetworkScanRequest) Valid() bool {
	if !scanIDPattern.MatchString(r.ScanID) || len(r.Targets) == 0 {
		return false
	}
	if r.TemplateID != "" && !profileIDPattern.MatchString(r.TemplateID) {
		return false
	}
	for _, target := range r.Targets {
		if strings.TrimSpace(target.Value) == "" {
			return false
		}
		switch target.Type {
		case "single_ip", "ip_range", "cidr", "dns_name", "dns_wildcard":
		default:
			return false
		}
	}
	return true
}

type ScanAdmissionOutcome string

const (
	NetworkScanSubmitted   ScanAdmissionOutcome = "submitted"
	NetworkScanFailed      ScanAdmissionOutcome = "failed"
	NetworkScanUnconfirmed ScanAdmissionOutcome = "unconfirmed"
	NetworkScanBusy        ScanAdmissionOutcome = "busy"
	NetworkScanNotRecorded ScanAdmissionOutcome = "not_recorded"
)

type NetworkScanReceipt struct {
	ScanID  string               `json:"scan_id"`
	Outcome ScanAdmissionOutcome `json:"outcome"`
	Scan    *store.ScanResult    `json:"scan,omitempty"`
}

type ScanReservationStore interface {
	GetValue(context.Context, string) (store.ValkeyResponse, error)
	store.ValueCreator
	store.ValueCompareAndSetter
}

type ScanPublication int

const (
	ScanPublicationUnconfirmed ScanPublication = iota
	ScanPublicationSubmitted
	ScanPublicationNotSent
)

type NetworkScanPublisher interface {
	PublishNetworkScan(context.Context, []byte) ScanPublication
}

// ScanAdmission owns the network-only submission lifecycle. Its dependencies
// are the same process-owned store and broker configuration used by the API.
type ScanAdmission struct {
	state     ScanReservationStore
	publisher NetworkScanPublisher
}

func NewScanAdmission(state ScanReservationStore, publisher NetworkScanPublisher) *ScanAdmission {
	return &ScanAdmission{state: state, publisher: publisher}
}

type legacyNetworkScanMessage struct {
	ID       string                   `json:"id"`
	Targets  []NetworkScanTarget      `json:"targets"`
	Options  legacyNetworkScanOptions `json:"options"`
	Priority int                      `json:"priority"`
}

type legacyNetworkScanOptions struct {
	TemplateID string `json:"template_id"`
}

func (s *ScanAdmission) SubmitNetworkScan(ctx context.Context, request NetworkScanRequest) NetworkScanReceipt {
	receipt := NetworkScanReceipt{ScanID: request.ScanID, Outcome: NetworkScanNotRecorded}
	if s.state == nil || s.publisher == nil {
		return receipt
	}
	targets := make([]string, len(request.Targets))
	for i, target := range request.Targets {
		targets[i] = target.Value
	}
	scan := &store.ScanResult{
		ID:              request.ScanID,
		Status:          "pending",
		Targets:         targets,
		Hosts:           []store.HostEntry{},
		Vulnerabilities: []store.VulnerabilitySummary{},
		StartTime:       time.Now().UTC().Format(time.RFC3339Nano),
		SubScans: map[string]store.SubScan{
			"network": {
				Type:     "network",
				Enabled:  true,
				Status:   "pending",
				Progress: store.SubScanProgress{Label: "hosts"},
			},
		},
	}
	initial, err := encodeNetworkScanProjection(scan)
	if err != nil {
		return receipt
	}
	message, err := json.Marshal(legacyNetworkScanMessage{
		ID:       scan.ID,
		Targets:  request.Targets,
		Options:  legacyNetworkScanOptions{TemplateID: request.TemplateID},
		Priority: request.Priority,
	})
	if err != nil {
		return receipt
	}
	if outcome := s.reserve(ctx, scan.ID, initial); outcome != "" {
		receipt.Outcome = outcome
		if outcome == NetworkScanNotRecorded {
			slog.Warn("Could not record network scan admission", "scan_id", scan.ID)
		}
		return receipt
	}

	// Leave time in the request budget for a conditional pre-send failure
	// update even if the broker context expires.
	publishCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	publication := s.publisher.PublishNetworkScan(publishCtx, message)
	cancel()
	switch publication {
	case ScanPublicationSubmitted:
		receipt.Outcome = NetworkScanSubmitted
		receipt.Scan = scan
	case ScanPublicationNotSent:
		receipt.Outcome = NetworkScanFailed
		slog.Warn("Network scan message was not sent", "scan_id", scan.ID)
		scan.Status = "failed"
		scan.EndTime = time.Now().UTC().Format(time.RFC3339Nano)
		network := scan.SubScans["network"]
		network.Status = "failed"
		network.Metadata = json.RawMessage(`{"submission_error":"not_published"}`)
		scan.SubScans["network"] = network
		failed, err := encodeNetworkScanProjection(scan)
		if err == nil {
			_, err = s.state.CompareAndSetValue(ctx, currentScanKey, initial, failed)
		}
		if err != nil {
			slog.Warn("Could not record network scan publication failure", "scan_id", scan.ID)
		}
	default:
		receipt.Outcome = NetworkScanUnconfirmed
		receipt.Scan = scan
		slog.Warn("Network scan publication could not be confirmed", "scan_id", scan.ID)
	}
	return receipt
}

func (s *ScanAdmission) reserve(ctx context.Context, id, initial string) ScanAdmissionOutcome {
	for attempt := 0; attempt < 4; attempt++ {
		current, err := s.state.GetValue(ctx, currentScanKey)
		var reserved bool
		switch {
		case errors.Is(err, store.ErrKeyNotFound):
			reserved, err = s.state.SetValueIfAbsent(ctx, currentScanKey, initial)
		case err == nil:
			expected := current.Message.Value
			if !replaceableScan(expected, id) {
				return NetworkScanBusy
			}
			reserved, err = s.state.CompareAndSetValue(ctx, currentScanKey, expected, initial)
		}
		if err != nil {
			return NetworkScanNotRecorded
		}
		if reserved {
			return ""
		}
	}
	return NetworkScanBusy
}

func replaceableScan(encoded, id string) bool {
	raw, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return false
	}
	var current struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	}
	if err := json.Unmarshal(raw, &current); err != nil || current.ID == id {
		return false
	}
	switch current.Status {
	case "completed", "cancelled", "failed", "idle":
		return true
	default:
		return false
	}
}

func encodeNetworkScanProjection(scan *store.ScanResult) (string, error) {
	raw, err := json.Marshal(scan)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(raw), nil
}
