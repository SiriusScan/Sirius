package scanners

import (
	"log"

	sirius "github.com/0sm0s1z/Sirius-Scan/Engine/lib"
)

// DiscoveryScanner accepts a TargetMatrix and enumerates each target
// Publish ScanReports to the scan queue
func DiscoveryScanner(job sirius.ScanRequest) {

	//Transform ScanRequest into a TargetMatrix
	targetMatrix := sirius.BuildTargetMatrix(job)

	//For each Target run a scan
	for _, target := range targetMatrix {
		host := discover(target)
		if host == true {
			//Create new SVDBHost
			var host sirius.SVDBHost
			host.IP = target

			//Append the host to the ScanReport
			job.ScanReport.ScanResults = append(job.ScanReport.ScanResults, host)

			//Set scan Command
			job.Command = "scanVulnerability"

			//Publish the ScanReport to the queue
			publishHost(job)
		}
	}
}

func discover(target string) bool {
	log.Println("Starting Discovery Scan on: " + target)
	host := ScanTCP(target)

	return host
}

func publishHost(scanRequest sirius.ScanRequest) {
	//Send the ScanResult to the queue
	sirius.SendToQueue(scanRequest, "scan")
	sirius.SendToQueue(scanRequest, "scan-report")
}
