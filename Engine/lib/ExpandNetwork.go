package lib

import (
	"encoding/binary"
	"log"
	"net"
	"strings"
)

// ExpandNetwork expands a CIDR notation into a list of hosts
func ExpandNetwork(target string) []string {
	//Generate Host List
	//Expand CIDR notation into a list of hosts
	_, ipv4Net, err := net.ParseCIDR(target)
	if err != nil {
		log.Fatal(err)
	}

	// convert IPNet struct mask and address to uint32
	// network is BigEndian
	mask := binary.BigEndian.Uint32(ipv4Net.Mask)
	start := binary.BigEndian.Uint32(ipv4Net.IP)

	// find the final address
	finish := (start & mask) | (mask ^ 0xffffffff)

	var hostList []string
	// loop through addresses as uint32
	for i := start; i <= finish; i++ {
		// convert back to net.IP
		ip := make(net.IP, 4)
		binary.BigEndian.PutUint32(ip, i)
		hostList = append(hostList, strings.Join([]string{ip.String()}, ""))
	}

	//Add to targetMatrix
	return hostList

}
