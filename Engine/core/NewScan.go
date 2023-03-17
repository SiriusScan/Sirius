package core

import (
	"log"
	"os"

	//Internal Libraries
	scanners "github.com/0sm0s1z/Sirius-Scan/Engine/core/scanners"
	lib "github.com/0sm0s1z/Sirius-Scan/Engine/lib"
)

// NewScan is the main scanning engine
func NewScan(job lib.ScanRequest) {
	log.Printf("Starting New Scan Job: %s", job.ScanID)

	//Create Scratch Directory for Scan
	os.MkdirAll("/tmp/sirius/"+job.ScanID, 0755)

	//Start a Discovery Scan
	scanners.DiscoveryScanner(job)
}
