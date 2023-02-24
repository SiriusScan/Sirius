package siriusNmap

import (
	"fmt"
	"log"
	"strings"

	"github.com/lair-framework/go-nmap"
)

const (
	version  = "2.1.1"
	tool     = "nmap"
	osWeight = 50
)

//Nmap Discovery Scan Options / Parser / Execution
func NmapDiscovery(n int) string {
	fmt.Println("JSON decode error!")
	return "asdf"
}

func ProcessReport(nmapXML []byte) []CVE {

	nmapRun, err := nmap.Parse(nmapXML)
	if err != nil {
		log.Fatalf("Fatal: Error parsing nmap. Error %s", err.Error())
	}

	scan := handleXML(nmapRun)

	return scan
}

func handleXML(run *nmap.NmapRun) []CVE {
	var scan Scan
	var cvelist []CVE

	// THIS IS GHETTO AND BAD AND I SHOULD FEEL BAD - but it works for now
	for i := 0; i < len(run.Hosts[0].Ports); i++ {
		for j := 0; j < len(run.Hosts[0].Ports[i].Scripts); j++ {

			scriptOutput := run.Hosts[0].Ports[i].Scripts[j].Output

			for _, line := range strings.Split(strings.TrimSuffix(scriptOutput, "\n"), "\n") {
				if strings.Contains(line, "CVE-") {
					cveid := strings.Split(line, "CVE-")[1]

					if len(cveid) > 9 {
						cveid = cveid[:10]
						cvelist = append(cvelist, CVE{CVEID: cveid})
					} else {
						cveid = cveid[:9]
						cvelist = append(cvelist, CVE{CVEID: cveid})
					}
				}
			}
		}
	}

	for _, h := range run.Hosts {
		host := Host{ID: "1"}
		if h.Status.State != "up" {
			continue
		}

		for _, address := range h.Addresses {
			switch {
			case address.AddrType == "ipv4":
				host.IPv4 = address.Addr
			case address.AddrType == "mac":
				host.MAC = address.Addr
			}
		}

		for _, hostname := range h.Hostnames {
			host.Hostnames = append(host.Hostnames, hostname.Name)
		}

		//Service Detection
		for _, p := range h.Ports {
			service := Service{}
			service.Port = p.PortId
			service.Protocol = p.Protocol

			if p.State.State != "open" {
				continue
			}

			if p.Service.Name != "" {
				service.Service = p.Service.Name
				service.Product = "Unknown"
				if p.Service.Product != "" {
					service.Product = p.Service.Product
					if p.Service.Version != "" {
						service.Product += " " + p.Service.Version
					}
				}

				if p.Service.CPEs != nil {
					service.CPE = p.Service.CPEs
				}
			}

			host.Services = append(host.Services, service)
		}

		scan.Hosts = append(scan.Hosts, host)

	}

	return cvelist
}
