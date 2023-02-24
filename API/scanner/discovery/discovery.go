package siriusScan

import (
	"fmt"
	"log"
	"os"

	//"os/exec"

	//Internal Libraries
	siriusHelper "github.com/0sm0s1z/Sirius-Scan/lib/utils"
	siriusScan "github.com/0sm0s1z/Sirius-Scan/scanner"
	siriusNmap "github.com/0sm0s1z/Sirius-Scan/scanner/engines/nmap"
	//3rd Party Dependencies
)

//ALL Discovery Types - Profile must match to one of these constants
const (
	nmapCommonPortSweep = "-A"
)

// getFindings responds with the list of a Finding as JSON.
func Discovery(profile siriusScan.ScanProfile, target string, homedir string) siriusScan.DiscoveryDetails {

	//Hardcoded scan name for now
	outputfile := homedir + "/.sirius/scans/0001/nmapdiscovery.xml"

	// Perform discovery for each type listed in the ScanProfile
	for i := 0; i < len(profile.Discovery); i++ {
		switch profile.Discovery[i] {
		case "nmapCommonPortSweep":
			fmt.Println("Performing Nmap Common Port Sweep")

			//Glaring command injection vulnerability here. Need to sanitize input
			//			cmd := exec.Command("/opt/homebrew/bin/nmap", nmapCommonPortSweep, "--script=vuln,vulners", target, "-oX", outputfile)

			//			cmd.Stdout = os.Stdout
			//			cmd.Stderr = os.Stderr
			//err := cmd.Run()
			//siriusHelper.ErrorCheck(err)
			//fmt.Println(cmd.Stdout)

			//Process Nmap XML Output
			dat, err := os.ReadFile(outputfile)
			siriusHelper.ErrorCheck(err)
			processScanResults(dat)
		}
	}

	var discovery siriusScan.DiscoveryDetails

	return discovery
}

// processScanResults processes the raw XML output from Nmap and returns a DiscoveryDetails struct
func processScanResults(dat []byte) siriusScan.DiscoveryDetails {
	var discovery siriusScan.DiscoveryDetails

	//Parse XML Using Lair Project's Nmap Parser
	var scanResults []siriusNmap.CVE
	scanResults = siriusNmap.ProcessReport(dat)

	log.Println(scanResults)

	//Return DiscoveryDetails struct

	return discovery
}
