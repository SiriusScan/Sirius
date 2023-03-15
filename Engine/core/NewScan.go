package core

import (
	"fmt"
	"log"
	"os"

	//Internal Libraries
	lib "github.com/0sm0s1z/Sirius-Scan/Engine/lib"
)

// NewScan is the main scanning engine
func NewScan(job lib.ScanRequest) {
	log.Printf("Starting New Scan Job: %s", job.ScanID)

	//Create Scratch Directory for Scan
	os.MkdirAll("/tmp/sirius/"+job.ScanID, 0755)

	//Transform ScanRequest into a TargetMatrix
	targetMatrix := lib.BuildTargetMatrix(job)

	//Start the Vulnerability Scan Consumer microservice
	go VulnerabilityScanner()

	//For each Target run a scan
	for _, target := range targetMatrix {
		//Execute Sirius Scan
		//Discovery Scanner
		//go scanners.DiscoveryScanner()
		fmt.Println(target)

	}

	//log.Println(targetMatrix)

	//For each Target run a scan
	/*
		for _, target := range request.Targets {
			//Execute Nmap Scan
			rawScanResults := "/tmp/sirius/" + scanID + "/" + target + "-nmapportscan.xml"
			cmd, err := exec.Command("nmap", "-sV", "-O", "--script=vuln,vulners,default,safe", target, "-oX", rawScanResults).Output()
			//Get command response
			if err != nil {
				log.Println(err)
			}
			log.Println(string(cmd))

		}*/

	scanStatus := lib.SystemStatus{
		Profile: "root",
		Status:  "OK",
		Tasks: []lib.SystemTask{
			{
				TaskID:       "2",
				TaskName:     job.ScanID,
				TaskStatus:   "Done",
				TaskProgress: 100,
			},
		},
	}

	log.Println(scanStatus)
	//var scanResults []siriusNmap.CVE
	//var hostCVEs []HostCVE

}
