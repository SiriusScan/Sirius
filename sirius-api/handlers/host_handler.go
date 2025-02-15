package handlers

import (
	"encoding/json"
	"log"

	"github.com/SiriusScan/go-api/nvd"
	"github.com/SiriusScan/go-api/sirius"
	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/SiriusScan/go-api/sirius/vulnerability"
	"github.com/fatih/color"
	"github.com/gofiber/fiber/v2"
)

// GetHost handles the GET /host/{id} route
func GetHost(c *fiber.Ctx) error {
	hostID := c.Params("id")

	// Use your GetHost function from the host package
	hostData, err := host.GetHost(hostID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Return the host data as JSON
	return c.JSON(hostData)
}

// GetAllHosts handles the GET /host route
func GetAllHosts(c *fiber.Ctx) error {
	hosts, err := host.GetAllHosts()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(hosts)
}

// GetHostStatistics handles the GET /host/statistics route
func GetHostStatistics(c *fiber.Ctx) error { 
	hostID := c.Params("id")
	log.Println("Host_Handler: GetHostStatistics")
	stats, err := host.GetHostRiskStatistics(hostID)
	if err != nil {
		log.Panicln("Error: Host_Handler => An error occured when executing the GetHostStatistics procedure (/host/vulnerabities route)") 
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error getting vulnerabilities: " + err.Error(),
		})
	}
	return c.JSON(stats)
}

// GetHostStatistics handles the GET /host/statistics route
func GetHostVulnerabilitySeverityCounts(c *fiber.Ctx) error { 
	hostID := c.Params("id")
	log.Println("Host_Handler: GetHostVulnerabilitySeverityCounts")
	stats, err := host.GetHostVulnerabilitySeverityCounts(hostID)
	if err != nil {
		log.Panicln("Error: Host_Handler => An error occured when executing the GetHostStatistics procedure (/host/vulnerabities route)")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error getting vulnerabilities: " + err.Error(),
		})
	}
	return c.JSON(stats)
}
	

// GetAllVulnerabilities handles the GET /host/vulnerabilities route
func GetAllVulnerabilities(c *fiber.Ctx) error {
	// log.Println("Host_Handler: GetAllVulnerabilities")
	vulnerabilities, err := host.GetAllVulnerabilities()
	if err != nil {
		log.Panicln("Error: Host_Handler => An error occured when executing the GetAllVulnerabilities procedure (/host/vulnerabities route)")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error getting vulnerabilities: " + err.Error(),
		})
	}

	return c.JSON(vulnerabilities)
}

// AddHost handles the POST /host route
// AddHost Chain: Handle the REST Request (API) (Here) -> SDK go-api sirius/host -> sirius/postgres/host-operations postgres
func AddHost(c *fiber.Ctx) error {
	// Read the raw request body
	requestBody := string(c.Body())

	// Define a local struct that matches the expected JSON structure
	var newHost sirius.Host

	// Manually unmarshal JSON into the struct
	err := json.Unmarshal([]byte(requestBody), &newHost)
	if err != nil {
		log.Println("Error parsing request body:", err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Error parsing request body: " + err.Error(),
		})
	}
	color.Green("Adding Host: %s", newHost.IP)

	// Check all host vulns to confirm that they all exist in the database. If they do not, add them.
	// log.Println(newHost.Vulnerabilities)
	for _, vuln := range newHost.Vulnerabilities {
		if !vulnerability.CheckVulnerabilityExists(vuln.VID) {
			log.Println("Vulnerability does not exist in database. Adding", vuln.VID)

			cve, err := nvd.GetCVE(vuln.VID)
			if err != nil {
				log.Println("Failed to get CVE data for", vuln.VID)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to get CVE data for " + vuln.VID,
				})
			}
			// riskScore := sirius.RiskScore{
			// 	CVSSV3: sirius.BaseMetricV3{
			// 		CVSSV3: sirius.CVSSV3{
			// 			BaseScore: cve.Metrics.CvssMetricV31[0].CvssData.BaseScore,
			// 		},
			// 	},
			// }
			//

			vuln = sirius.Vulnerability{
				VID:         vuln.VID,
				Description: cve.Descriptions[0].Value,
				Title:       cve.ID,
				RiskScore:   cve.Metrics.CvssMetricV31[0].CvssData.BaseScore,
			}

			err = vulnerability.AddVulnerability(vuln)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Error adding vulnerability: " + err.Error(),
				})
			}
		}
	}

	err = host.AddHost(newHost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error adding host: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Host added successfully",
	})
}

// DeleteHost handles the POST /host/delete route
func DeleteHost(c *fiber.Ctx) error {
	// Read the raw request body
	requestBody := string(c.Body())
	log.Println("Request body:", requestBody)

	// Define a local struct that matches the expected JSON structure
	var newHost sirius.Host

	// Manually unmarshal JSON into the struct
	err := json.Unmarshal([]byte(requestBody), &newHost)
	if err != nil {
		log.Println("Error parsing request body:", err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Error parsing request body: " + err.Error(),
		})
	}

	log.Println("Deleting host", newHost.IP)

	err = host.DeleteHost(newHost.IP)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error deleting host: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Host deleted successfully",
	})
}
