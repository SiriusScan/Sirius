package siriusScan

type ScanProfile struct {
	Targets   []string `json:"targets"`
	Discovery []string   `json:"discovery"`
	Ports     string   `json:"ports"`
}

type DiscoveryDetails struct {
	Targets   []string `json:"targets"`
	Discovery string   `json:"discovery"`
	Ports     string   `json:"ports"`
}
