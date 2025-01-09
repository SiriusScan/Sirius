package handlers

import (
	"encoding/json"
	"log"
	"fmt"

	"github.com/SiriusScan/go-api/sirius"
	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/gofiber/fiber/v2"
)

// GetHost handles the GET /host/{id} route
func GetHost(c *fiber.Ctx) error {
	log.Println("Adding host")
	
	hostID := c.Params("id")

	log.Println("WTFasdfsdds")
	log.Println("Host ID:", hostID)

	// Use your GetHost function from the host package
	hostData, err := host.GetHost(hostID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	fmt.Printf("Host Data: ", hostData)

	// Return the host data as JSON
	return c.JSON(hostData)
}

// GetAllHosts handles the GET /host route
func GetAllHosts(c *fiber.Ctx) error {
	log.Println("Retrieving all hosts")
	hosts, err := host.GetAllHosts()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(hosts)
}

// GetAllVulnerabilities handles the GET /host/vulnerabilities route
func GetAllVulnerabilities(c *fiber.Ctx) error {
	vulnerabilities, err := host.GetAllVulnerabilities()
	if err != nil {
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
	log.Println("Adding host", newHost.IP)

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
