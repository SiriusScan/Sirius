package lib

import (
	"net"
)

// IsHost checks if the given string is a valid host
func IsHost(target string) bool {
	if net.ParseIP(target) != nil {
		return true
	}
	return false
}
