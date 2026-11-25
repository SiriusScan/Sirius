package handlers

import "math"

// NetworkInventoryStatus projects the network worker's report acknowledgements.
type NetworkInventoryStatus struct {
	Status  string                   `json:"status"`
	Summary *NetworkInventorySummary `json:"summary,omitempty"`
}

type NetworkInventorySummary struct {
	Version   int              `json:"version"`
	Finalized bool             `json:"finalized"`
	Attempted int64            `json:"attempted"`
	Accepted  int64            `json:"accepted"`
	Rejected  int64            `json:"rejected"`
	Unknown   int64            `json:"unknown"`
	Reasons   map[string]int64 `json:"reasons,omitempty"`
}

const maxInventoryCount = 1<<53 - 1

func projectNetworkInventory(scan map[string]any) *NetworkInventoryStatus {
	if scan["status"] == "idle" {
		return nil
	}
	untracked := &NetworkInventoryStatus{Status: "untracked"}
	unavailable := &NetworkInventoryStatus{Status: "unavailable"}
	rawSubScans, present := scan["sub_scans"]
	if !present || rawSubScans == nil {
		return untracked
	}
	subScans, ok := rawSubScans.(map[string]any)
	if !ok {
		return unavailable
	}

	rawNetwork, present := subScans["network"]
	if !present {
		agent, _ := subScans["agent"].(map[string]any)
		if agent["enabled"] == true {
			return nil
		}
		return untracked
	}
	network, ok := rawNetwork.(map[string]any)
	if !ok {
		return unavailable
	}
	if network["enabled"] == false {
		return nil
	}
	rawMetadata, present := network["metadata"]
	if !present {
		return untracked
	}
	metadata, ok := rawMetadata.(map[string]any)
	if !ok {
		return unavailable
	}
	rawSummary, present := metadata["inventory_reports"]
	if !present {
		return untracked
	}

	summary := parseNetworkInventorySummary(rawSummary)
	if summary == nil || (summary.Finalized && network["status"] != "completed") {
		return unavailable
	}
	status := "complete"
	switch {
	case !summary.Finalized:
		status = "provisional"
	case summary.Attempted == 0:
		status = "no_attempts"
	case summary.Rejected > 0:
		status = "incomplete"
	case summary.Unknown > 0:
		status = "unavailable"
	}
	return &NetworkInventoryStatus{Status: status, Summary: summary}
}

func parseNetworkInventorySummary(value any) *NetworkInventorySummary {
	raw, ok := value.(map[string]any)
	if !ok || raw["version"] != float64(1) {
		return nil
	}
	finalized, finalizedOK := raw["finalized"].(bool)
	attempted, attemptedOK := inventoryCount(raw["attempted"])
	accepted, acceptedOK := inventoryCount(raw["accepted"])
	rejected, rejectedOK := inventoryCount(raw["rejected"])
	unknown, unknownOK := inventoryCount(raw["unknown"])
	if !finalizedOK || !attemptedOK || !acceptedOK || !rejectedOK || !unknownOK ||
		attempted != accepted+rejected+unknown {
		return nil
	}
	result := &NetworkInventorySummary{
		Version: 1, Finalized: finalized, Attempted: attempted,
		Accepted: accepted, Rejected: rejected, Unknown: unknown,
	}
	if rawReasons, present := raw["reasons"]; present {
		reasons, ok := parseInventoryReasons(rawReasons, rejected, unknown)
		if !ok {
			return nil
		}
		result.Reasons = reasons
	}
	return result
}

func inventoryCount(value any) (int64, bool) {
	number, ok := value.(float64)
	if !ok || number < 0 || number > maxInventoryCount || math.Trunc(number) != number {
		return 0, false
	}
	return int64(number), true
}

func parseInventoryReasons(value any, rejected, unknown int64) (map[string]int64, bool) {
	raw, ok := value.(map[string]any)
	if !ok {
		return nil, false
	}
	allowed := []struct {
		keys  []string
		count int64
	}{
		{[]string{"local_error", "http_rejected"}, rejected},
		{[]string{"timeout", "transport_error", "http_unconfirmed"}, unknown},
	}
	reasons := make(map[string]int64)
	for _, group := range allowed {
		var total int64
		for _, key := range group.keys {
			if value, present := raw[key]; present {
				count, ok := inventoryCount(value)
				if !ok {
					return nil, false
				}
				if count > 0 {
					reasons[key] = count
					total += count
				}
			}
		}
		if total > group.count {
			return nil, false
		}
	}
	return reasons, true
}
