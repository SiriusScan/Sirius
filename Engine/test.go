package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"strings"
	"time"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Println("Usage: go run main.go <IP or hostname>")
		os.Exit(1)
	}

	host := os.Args[1]
	port := "80"
	timeout := 3 * time.Second

	isOnline, err := checkHostOnline(host, port, timeout)

	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	if isOnline {
		fmt.Printf("Host %s is online\n", host)
	} else {
		fmt.Printf("Host %s is offline\n", host)
	}
}

func checkHostOnline(host, port string, timeout time.Duration) (bool, error) {
	conn, err := net.DialTimeout("tcp", net.JoinHostPort(host, port), timeout)
	if err != nil {
		if strings.Contains(err.Error(), "refused") {
			return true, nil
		} else if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
			log.Println(err)
			return false, nil
		} else {
			return false, err
		}
	}

	conn.Close()
	return true, nil
}
