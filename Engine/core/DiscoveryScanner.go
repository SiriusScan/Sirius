package core

import (
	"log"
)

// VulnerabilityScanner subscribes to the queue and listens for scan requests
// When a scan request is received, it will execute scans for each target up to the scan queue
func DiscoveryScanner() {
	log.Println("Vulnerability Scanner Invoked")

}
