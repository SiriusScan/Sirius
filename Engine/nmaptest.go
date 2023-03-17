package main

import (
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/lair-framework/go-nmap"
)

type Service struct {
	// Define the Service struct fields
}

type SiriusAgent struct {
	// Define the SiriusAgent struct fields
}

type SVDBHost struct {
	OS        string      `json:"os"`
	OSVersion string      `json:"osversion"`
	IP        string      `json:"ip"`
	Hostname  string      `json:"hostname"`
	Services  []Service   `json:"services"`
	CVE       []string    `json:"cve"`
	CPE       []string    `json:"cpe"`
	Agent     SiriusAgent `json:"agent"`
}

func main() {
	if len(os.Args) != 2 {
		fmt.Println("Usage: go run main.go <nmap_xml_file>")
		os.Exit(1)
	}

	filePath := os.Args[1]
	svdbHost, err := parseNmapXML(filePath)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	// Use the svdbHost as needed
	fmt.Printf("%+v\n", svdbHost)
}

func parseNmapXML(filePath string) (*SVDBHost, error) {
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("unable to read file: %v", err)
	}

	var nmapRun nmap.NmapRun
	if err := xml.Unmarshal(data, &nmapRun); err != nil {
		return nil, fmt.Errorf("unable to unmarshal XML data: %v", err)
	}

	if len(nmapRun.Hosts) == 0 {
		return nil, fmt.Errorf("no hosts found in the nmap XML data")
	}

	host := nmapRun.Hosts[0]
	var ip string
	for _, address := range host.Addresses {
		if address.AddrType == "ipv4" || address.AddrType == "ipv6" {
			ip = address.Addr
			break
		}
	}

	var osName, osVersion string
	if len(host.Os.OsMatches) > 0 {
		osMatch := host.Os.OsMatches[0]
		osName = osMatch.Name
		osVersion = osMatch.OsClasses[0].OsGen
	}

	svdbHost := &SVDBHost{
		IP:        ip,
		Hostname:  host.Hostnames[0].Name,
		OS:        osName,
		OSVersion: osVersion,
	}

	// Parse the services, CPEs, CVEs, and agent data as needed
	// and fill in the corresponding fields in the SVDBHost struct

	return svdbHost, nil
}
