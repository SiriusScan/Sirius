package scanAPI

import (
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
)

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
	CompletedHosts []string
	ScanProgress int
	ScanResults  []siriusDB.SVDBHost
}
