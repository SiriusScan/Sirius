package lib

type ScanRequest struct {
	ScanID     string
	Command    string
	Targets    []string
	ScanReport ScanReport
}

type ScanReport struct {
	ScanID       string
	ScanType     string
	ScanStatus   string
	ScanProgress int
	ScanResults  []SVDBHost
}
