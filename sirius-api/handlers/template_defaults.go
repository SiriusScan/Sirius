package handlers

import (
	"time"
)

// mergeMissingCoreScanProfiles appends built-in Network+Agent and Agent-only profiles when
// ValKey has not been seeded with them (common in production / fresh installs). Stored
// templates with the same ID always win — this only fills gaps.
func mergeMissingCoreScanProfiles(templates []Template, now time.Time) []Template {
	seen := make(map[string]struct{}, len(templates))
	for _, t := range templates {
		seen[t.ID] = struct{}{}
	}

	base := pickBaselineTemplate(templates)
	out := append(make([]Template, 0, len(templates)+2), templates...)

	for _, def := range coreAgentScanProfiles(now, base) {
		if _, ok := seen[def.ID]; ok {
			continue
		}
		out = append(out, def)
		seen[def.ID] = struct{}{}
	}

	return out
}

func pickBaselineTemplate(templates []Template) Template {
	for _, id := range []string{"quick", "high-risk", "all"} {
		for _, t := range templates {
			if t.ID == id {
				return t
			}
		}
	}
	if len(templates) > 0 {
		return templates[0]
	}
	return Template{}
}

// coreAgentScanProfiles returns full-scan (network + agent) and agent-only presets.
func coreAgentScanProfiles(now time.Time, base Template) []Template {
	scripts := base.EnabledScripts
	if len(scripts) == 0 {
		scripts = []string{"default"}
	}
	scanTypes := base.ScanOptions.ScanTypes
	if len(scanTypes) == 0 {
		scanTypes = []string{"discovery", "vulnerability"}
	}

	portRange := base.ScanOptions.PortRange
	if portRange == "" {
		portRange = "1-65535"
	}

	agentCfg := func(mode string) *AgentScanConfig {
		return &AgentScanConfig{
			Enabled:        true,
			Mode:           mode,
			AgentIDs:       []string{},
			Timeout:        300,
			Concurrency:    5,
			TemplateFilter: nil,
		}
	}

	optsFull := base.ScanOptions
	optsFull.ScanTypes = scanTypes
	optsFull.PortRange = portRange
	optsFull.AgentScan = agentCfg("comprehensive")

	full := Template{
		ID:             "full-scan",
		Name:           "Full Scan (Network + Agent)",
		Description:    "Network scripts plus coordinated agent template scanning on discovered hosts.",
		Type:           "system",
		EnabledScripts: append([]string(nil), scripts...),
		ScanOptions:    optsFull,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	optsAgent := base.ScanOptions
	optsAgent.ScanTypes = []string{}
	optsAgent.PortRange = portRange
	optsAgent.AgentScan = agentCfg("comprehensive")

	agentOnly := Template{
		ID:             "agent-only",
		Name:           "Agent Scan (Templates)",
		Description:    "Template-based scanning via connected Sirius Agents (no network sweep).",
		Type:           "system",
		EnabledScripts: append([]string(nil), scripts...),
		ScanOptions:    optsAgent,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	return []Template{full, agentOnly}
}
