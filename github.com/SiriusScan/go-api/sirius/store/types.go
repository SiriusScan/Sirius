// ScanResult represents the current state of a scan
type ScanResult struct {
    ID              string                 `json:"id"`
    Status          string                 `json:"status"`
    Targets         []string              `json:"targets"`
    Hosts           []string              `json:"hosts"`
    HostsCompleted  int                   `json:"hosts_completed"`
    Vulnerabilities []VulnerabilitySummary `json:"vulnerabilities"`
    StartTime       string                `json:"start_time"`
    EndTime         string                `json:"end_time,omitempty"`
} 