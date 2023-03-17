package scanners

//Scan-TCP.go is a TCP sweeper
//It will scan a target for common open TCP ports to determine if the host is online

import (
	"context"
	"log"
	"net"
	"strings"
	"time"
)

type ScanResult struct {
	ScanID    string
	Target    string
	Port      string
	Protocol  string
	Service   string
	Product   string
	Version   string
	ExtraInfo string
}

//ScanTCP is the main TCP scanning function
func ScanTCP(target string) bool {
	//String array of common ports
	ports := []string{
		"21",
		"22",
		"23",
		"25",
		"53",
		"80",
		"110",
		"111",
		"135",
		"139",
		"143",
		"443",
		"445",
		"993",
		"995",
		"1723",
		"3306",
		"3389",
		"5900",
		"8080",
	}

	//Create a TCP connection for each port
	for _, port := range ports {
		//ctx, cancel := context.WithTimeout(context.Background(), 1000*time.Millisecond)
		//defer cancel()
		isOnline, err := checkHostOnline(target, port, 300*time.Millisecond)
		if err != nil {
			log.Printf("Error: %v\n", err)
		}

		if isOnline {
			return true
		}
	}
	return false
}

func checkHostOnline(host, port string, timeout time.Duration) (bool, error) {
	conn, err := net.DialTimeout("tcp", net.JoinHostPort(host, port), timeout)
	if err != nil {
		if strings.Contains(err.Error(), "refused") {
			return false, nil
		} else if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
			return false, nil
		} else {
			return false, err
		}
	} else {
		conn.Close()
		return true, nil
	}
}

func ScanPort(ctx context.Context, target string, port string) {
	//Create a TCP connection
	conn, err := net.DialTimeout("tcp", target+":"+port, 3*time.Second)
	if err != nil {
		log.Println(err)
	} else {

		//Close the connection
		conn.Close()

		//Create a new ScanResult
		scanResult := ScanResult{
			Target:    target,
			Port:      port,
			Protocol:  "TCP",
			Service:   "Unknown",
			Product:   "Unknown",
			Version:   "Unknown",
			ExtraInfo: "Unknown",
			//Timestamp: time.Now().Format("2006-01-02 15:04:05"),
		}

		//Get the service name
		scanResult.Service = getServiceName(port)
	}
}

func getServiceName(port string) string {
	//List of common services
	services := map[string]string{
		"21":   "FTP",
		"22":   "SSH",
		"23":   "Telnet",
		"25":   "SMTP",
		"53":   "DNS",
		"80":   "HTTP",
		"110":  "POP3",
		"111":  "RPC",
		"135":  "RPC",
		"139":  "SMB",
		"143":  "IMAP",
		"443":  "HTTPS",
		"445":  "SMB",
		"993":  "IMAPS",
		"995":  "POP3S",
		"1723": "PPTP",
		"3306": "MySQL",
		"3389": "RDP",
		"5900": "VNC",
		"8080": "HTTP",
	}

	//Return the service name
	return services[port]
}

func getServiceBanner(target string, port string) string {
	//Convert port to string

	//Create a TCP connection
	conn, err := net.DialTimeout("tcp", target+":"+port, 3*time.Second)
	if err != nil {
		log.Println(err)
	}

	//Close the connection
	defer conn.Close()

	//Read the banner
	buf := make([]byte, 1024)
	conn.Read(buf)

	//Return the banner
	return string(buf)
}
