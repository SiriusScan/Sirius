package scanAPI

import (
	_ "encoding/json"
	_ "errors"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
	//Internal Libraries
	hostAPI "github.com/0sm0s1z/Sirius-Scan/API/hosts"
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	siriusHelper "github.com/0sm0s1z/Sirius-Scan/lib/utils"
	siriusNmap "github.com/0sm0s1z/Sirius-Scan/scanner/engines/nmap"
	//3rd Party Dependencies
)

type ScanRequest struct {
	ScanID  string
	Targets []string
}

type HostCVE struct {
	Host    string
	CVEList []string
}

// NewScan -
func NewScan(c *gin.Context) {

	log.Println("New Scan Requested")

	//Get Scan Profile from Request
	var request ScanRequest
	if c.ShouldBind(&request) == nil {
		//log.Println("Request Received")
	}

	//Create Scan ID
	scanID := "scan-" + siriusHelper.RandomString(10)

	//Create Scratch Directory for Scan
	os.MkdirAll("/tmp/sirius/"+scanID, 0755)

	//For each Target run a scan

	for _, target := range request.Targets {
		//Execute Nmap Scan
		rawScanResults := "/tmp/sirius/" + scanID + "/" + target + "-nmapportscan.xml"
		exec.Command("nmap", "-A", "--script=vuln,vulners", target, "-oX", rawScanResults).Output()
	}

	//Hardcoded Scan ID for Testing
	//scanID = "scan-BpLnfgDsc2"

	//log.Println("Processing Scan Results")
	var scanResults []siriusNmap.CVE
	var hostCVEs []HostCVE

	//Process Scan Results for each Target
	for _, target := range request.Targets {
		rawScanResults := "/tmp/sirius/" + scanID + "/" + target + "-nmapportscan.xml"
		dat, err := os.ReadFile(rawScanResults)
		siriusHelper.ErrorCheck(err)

		//Process Scan Results and append to scanResults
		scanResults = append(scanResults, processScanResults(dat)...)

		//Create HostCVE
		var hostCVE HostCVE
		hostCVE.Host = target

		//Create CVEList
		var cveList []string
		for _, cve := range scanResults {
			newCVE := "CVE-" + cve.CVEID
			cveList = append(cveList, newCVE)
		}

		hostCVE.CVEList = cveList

		//Append HostCVE to hostCVEs
		hostCVEs = append(hostCVEs, hostCVE)
	}

	//Send Scan Results to Database
	SubmitFindings(hostCVEs)
	log.Println("Scan Complete")
	//log.Println(hostCVEs)

	//Return Scan Results
	c.IndentedJSON(http.StatusOK, hostCVEs)
}

func processScanResults(dat []byte) []siriusNmap.CVE {

	//Parse XML Using Lair Project's Nmap Parser
	var scanResults []siriusNmap.CVE
	scanResults = siriusNmap.ProcessReport(dat)

	log.Println(scanResults)

	//Return DiscoveryDetails struct

	return scanResults
}

// Update hosts in database with new findings
func SubmitFindings(cveList []HostCVE) {
	//For each host in cveList
	for _, host := range cveList {
		//Get the host from the database
		var hostRequest siriusDB.SVDBHost
		hostRequest.IP = host.Host
		hostRequest = hostAPI.GetHost(hostRequest)

		//If host does not exist in the database, create it
		if hostRequest.IP == "" {
			hostRequest.IP = host.Host
			hostRequest.CVE = host.CVEList
			hostAPI.AddHost(hostRequest)
			continue
		} else {
			//If host exists in the database, update it
			//Combine the new cve list with the old cve
			hostRequest.CVE = append(hostRequest.CVE, host.CVEList...)

			//Update the host in the database
			hostAPI.UpdateHost(hostRequest)
		}
	}
}
