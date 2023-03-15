package lib

import (
	"log"
	"net"
)

// IsNetwork checks if the given string is a valid network
func IsNetwork(target string) bool {
	ipv4Addr, ipv4Net, err := net.ParseCIDR(target)
	if err != nil {
		log.Fatal(err)
	} else {
		return true
	}
	ipv4Addr = ipv4Addr.Mask(ipv4Net.Mask)
	return false
}
