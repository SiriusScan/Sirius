package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
  //"reflect"

	"github.com/lair-framework/go-nmap"
)

const (
	version  = "2.1.1"
	tool     = "nmap"
	osWeight = 50
	usage    = `
Parses an nmap XML file into a lair project.
Usage:
  drone-nmap [options] <id> <filename>
  export LAIR_ID=<id>; drone-nmap [options] <filename>
Options:
  -v              show version and exit
  -h              show usage and exit
  -k              allow insecure SSL connections
  -force-ports    disable data protection in the API server for excessive ports
  -limit-hosts    only import hosts that have listening ports
  -tags           a comma separated list of tags to add to every host that is imported
`
)





func handleXML(run *nmap.NmapRun) (res string, err error) {

  // CPE (Common Platform Enumeration) is a standardized way to name software

  type Service struct {
  	ID             string `json:"_id" bson:"_id"`
  	ProjectID      string `json:"projectId" bson:"projectId"`
  	HostID         string `json:"hostId" bson:"hostId"`
  	Port           int    `json:"port" bson:"port"`
  	Protocol       string `json:"protocol" bson:"protocol"`
  	Service        string `json:"service" bson:"service"`
  	Product        string `json:"product" bson:"product"`
  	Status         string `json:"status" bson:"status"`
  	IsFlagged      bool   `json:"isFlagged" bson:"isFlagged"`
  	LastModifiedBy string `json:"lastModifiedBy" bson:"lastModifiedBy"`
    CPE            []nmap.CPE `json:"cpe" bson:"cpe"`
  }

  type Host struct {
  	ID             string         `json:"_id" bson:"_id"`
  	ProjectID      string         `json:"projectId" bson:"projectId"`
  	LongIPv4Addr   uint64         `json:"longIpv4Addr" bson:"longIpv4Addr"`
  	IPv4           string         `json:"ipv4" bson:"ipv4"`
  	MAC            string         `json:"mac" bson:"mac"`
  	Hostnames      []string       `json:"hostnames" bson:"hostnames"`
  	StatusMessage  string         `json:"statusMessage" bson:"statusMessage"`
  	Tags           []string       `json:"tags" bson:"tags"`
  	Status         string         `json:"status" bson:"status"`
  	LastModifiedBy string         `json:"lastModifiedBy" bson:"lastModifiedBy"`
  	IsFlagged      bool           `json:"isFlagged" bson:"isFlagged"`
    Services       []Service      `json:"services"`
  }

  type Scan struct {
  	ID             string          `json:"_id" bson:"_id"`
  	Tool           string          `json:"tool"`
  	Hosts          []Host          `json:"hosts"`
  }


  // OS fingerprint for a host.
  type OS struct {
  	Tool        string `json:"tool" bson:"tool"`
  	Weight      int    `json:"weight" bson:"weight"`
  	Fingerprint string `json:"fingerprint" bson:"fingerprint"`
  }

  scan := new(Scan)


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
    fmt.Println(host.Services)
    fmt.Println("===========")

	}

	return "asdf", nil
}


func main() {

	showVersion := flag.Bool("v", false, "")

	flag.Usage = func() {
		fmt.Println(usage)
	}
	flag.Parse()
	if *showVersion {
		log.Println(version)
		os.Exit(0)
	}




	data, err := ioutil.ReadFile("./testdata")
	if err != nil {
		log.Fatalf("Fatal: Could not open file. Error %s", err.Error())
	}

	nmapRun, err := nmap.Parse(data)
	if err != nil {
		log.Fatalf("Fatal: Error parsing nmap. Error %s", err.Error())
	}
  //xType := fmt.Sprintf("%T", nmapRun)
  //fmt.Println(xType) // "[]int"
  //fmt.Println(nmapRun)
  scan, err := handleXML(nmapRun)
  fmt.Println(scan)

  //val := reflect.Indirect(reflect.ValueOf(&nmapRun))
  //fmt.Println(val.Type().Field(0).Name)



	log.Println("Success: Operation completed successfully")
}
