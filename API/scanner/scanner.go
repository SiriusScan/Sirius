package siriusScan

import (
	"encoding/json"
	"os"
	"fmt"

	//Internal Libraries
	siriusHelper "github.com/0sm0s1z/Sirius-Scan/lib/utils"

	//3rd Party Dependencies
)

// getFindings responds with the list of a Finding as JSON.
func GetProfile(scanID string, homedir string) ScanProfile {
	//Selector (CVE or other?)
	dat, err := os.ReadFile(homedir + "/.sirius/scans/" + scanID + "/profile.json")
	siriusHelper.ErrorCheck(err)


	// Parse options out of the scan profile


	var profile ScanProfile
	json.Unmarshal([]byte(dat), &profile)
	if err != nil {
		fmt.Println("JSON decode error!")
	}

	return profile
}