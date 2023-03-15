package siriusNmap

import (
	"github.com/lair-framework/go-nmap"
)


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
	CVE 		   []CVE 		   `json:"cve"`
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


type CVE struct {
	CVEID string `json:"cveid"`
}





