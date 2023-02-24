# Sirius-Scan




#### Dev Notes

- Plugins vs Engines?
	- One off vs interchangable system

- Engines
	- Vulnerability Correlation Engine
		- Vulners
		- NVD
	- Port Scanning Engine
		- Nmap


##### Scanner Methodology

- Discover Live Systems
	- Nmap Discovery Custom -PS

- Discover Ports
	- Nmap default

- Discover Service Version
	- Nmap -sV
		- Split port/service/banner/version
		- Correlate into salient options
		- Try match to global services file
		- ID protocol/service/application => iterate on application if stack such as web
	- Nmap --script discovery
	- Custom discovery scripts


- Vulnerability Correlation
	- Vulners (deconflict duplicate CVEs)

- Vulnerability Identification
	- Nmap --script vuln (Sirius profiles long term)


- Authenticated Checks
	- Vulners Agent?
	- Windows WUA???
	- NSE authenticated script support

- Reporting








