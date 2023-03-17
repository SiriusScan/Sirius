package main

import (
	"fmt"
	"os"

	//"errors"
	//"os/exec"

	"log"

	//Internal Libraries
	siriusHelper "github.com/0sm0s1z/Sirius-Scan/lib/utils"
	siriusScan "github.com/0sm0s1z/Sirius-Scan/scanner"
	discoveryScan "github.com/0sm0s1z/Sirius-Scan/scanner/discovery"
	//3rd Party Dependencies
)

/*

### APPLICATION START
## USAGE
- Sirius can be run in command-line and graphical modes. In command-line mode simply execute the program while specifying a scan profile. Create and configure the settings in the ~/.sirius folder within the user home directory.
- Alternately, in graphical mode all settings for the scanner can be configured in the UI (this is the easier operating mode)

## PURPOSE
This is THE scan manager. This program will execute and manage all scanning tasks. Individual task may be external functions or even programs; however, from the scanners perspective everything is controlled and monitored here.

## CONTRIBUTION
Pull requests are always appreciated, but the issues you may be looking to solve likely exist in subordinate files. This one is intended to remain as basic as possible.

*/

func main() {
	log.Println("Initializing Sirius General Purpose Vulnerablity Scanning Engine...")

	scanID := ""

	// Two modes of execution. Specify Scan profile or gen new one if unspecified.
	// Eventually add ez cmdline options with -target
	if len(os.Args[1:]) > 0 {
		scanID = os.Args[1]
	} else {
		scanID = "scan-" + siriusHelper.RandomString(10)
	}

	homedir, err := os.UserHomeDir()
	siriusHelper.ErrorCheck(err)

	// Grab scanning profile
	var profile siriusScan.ScanProfile
	profile = siriusScan.GetProfile(scanID, homedir)

	log.Println("Beginning scan: " + scanID)
	log.Println("Beginning scan of targets: ")

	for i := 0; i < len(profile.Targets); i++ {
		fmt.Println(profile.Targets[i])
	}

	// Discovery First
	// Iterate through discovery techniques. Hard code this to Nmap for now.
	// Will need to compile and thread out scan jobs long term. Let's do them in serial for now

	var discovery siriusScan.DiscoveryDetails
	var discoveryList []siriusScan.DiscoveryDetails

	for i := 0; i < len(profile.Targets); i++ {
		fmt.Println("Ennumerating: " + profile.Targets[i])
		//outputfile := homedir + "/.sirius/scans/0001/nmapdiscovery.xml"

		//Perform discovery for each target and append to discovery list
		discovery = discoveryScan.Discovery(profile, profile.Targets[i], homedir)

		discoveryList = append(discoveryList, discovery)

		//Perform discovery
		//

		log.Println("Nmap Host Discovery Complete for: " + profile.Targets[i])
	}

	/*
		// IP Address Discovery
		outputfile := homedir + "/.sirius/scans/0001/nmapdiscovery.xml"
		exec.Command("/opt/homebrew/bin/nmap", profile.Discovery, profile.Targets, "-oX", outputfile).Output()

		log.Println("Nmap Host Discovery Complete for: " + profile.Targets)
		//output := string(out[:])
		//fmt.Println(output)

		// Port Scanning
		// Must make host directories for every system discovered
		// Will need to pull individual targets out of the previous discovery. Assuming single target for now
		path := homedir + "/.sirius/scans/0001/" + profile.Targets

		if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
			err := os.Mkdir(path, os.ModePerm)
			if err != nil {
				log.Println(err)
			}
		}

		// Hardcoded single target again
		outputfile = homedir + "/.sirius/scans/0001/" + profile.Targets + "/nmapportscan.xml"
		exec.Command("/opt/homebrew/bin/nmap", "-Pn", "-sV", profile.Targets, "-oX", outputfile).Output()

		log.Println("Nmap Version Scanning Complete for: " + profile.Targets)
		//output = string(out[:])
		//fmt.Println(output)
	*/

	log.Println("Success: Operation completed successfully")
}
