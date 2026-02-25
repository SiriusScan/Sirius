package handlers

import (
	"encoding/json"
	"log/slog"
	"net"
	"strconv"
	"strings"

	"github.com/SiriusScan/go-api/nvd"
	"github.com/SiriusScan/go-api/sirius"
	"github.com/SiriusScan/go-api/sirius/host"
	"github.com/SiriusScan/go-api/sirius/postgres/models"
	"github.com/SiriusScan/go-api/sirius/vulnerability"
	"github.com/gofiber/fiber/v2"
)

func isValidSingleHostIP(ip string) bool {
	candidate := strings.TrimSpace(ip)
	if candidate == "" {
		return false
	}
	// Host records must be concrete IPs, not CIDR/range/domain targets.
	if strings.Contains(candidate, "/") || strings.Contains(candidate, "-") {
		return false
	}
	return net.ParseIP(candidate) != nil
}

// GetHost handles the GET /host/{id} route with optional enhanced data
func GetHost(c *fiber.Ctx) error {
	hostID := c.Params("id")

	// Check for enhanced data query parameters
	includeParam := c.Query("include", "")
	includeEnhanced := c.Query("enhanced", "false")

	// Parse include fields
	var includeFields []string
	if includeParam != "" {
		includeFields = strings.Split(includeParam, ",")
		// Trim whitespace from each field
		for i, field := range includeFields {
			includeFields[i] = strings.TrimSpace(field)
		}
	}

	// Check if client wants enhanced response
	if includeEnhanced == "true" || len(includeFields) > 0 {
		// Enhanced response with JSONB fields
		enhancedData, err := host.GetHostWithEnhancedData(hostID, includeFields)
		if err != nil {
			// Fallback to basic response if enhanced data unavailable
			hostData, fallbackErr := host.GetHost(hostID)
			if fallbackErr != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fallbackErr.Error(),
				})
			}
			return c.JSON(hostData)
		}

		// Check if client also wants source information
		includeSource := c.Query("include_source", "false")
		if includeSource == "true" {
			hostWithSources, err := host.GetHostWithSources(hostID)
			if err == nil {
				// Add source information to enhanced response
				enhancedResponse := fiber.Map{
					"host":               enhancedData.Host,
					"software_inventory": enhancedData.SoftwareInventory,
					"system_fingerprint": enhancedData.SystemFingerprint,
					"agent_metadata":     enhancedData.AgentMetadata,
					"sources":            hostWithSources.Sources,
				}
				return c.JSON(enhancedResponse)
			}
		}

		return c.JSON(enhancedData)
	}

	// Use basic GetHost function for backward compatibility
	hostData, err := host.GetHost(hostID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Check if client wants source information (legacy support)
	includeSource := c.Query("include_source", "false")
	if includeSource == "true" {
		hostWithSources, err := host.GetHostWithSources(hostID)
		if err != nil {
			// Fallback to basic response if source data unavailable
			return c.JSON(hostData)
		}

		// Add source information to the response
		enhancedResponse := fiber.Map{
			"host":    hostData,
			"sources": hostWithSources.Sources,
		}

		return c.JSON(enhancedResponse)
	}

	// Legacy response format (unchanged for backward compatibility)
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
	slog.Debug("GetHostStatistics", "host_id", hostID)
	stats, err := host.GetHostRiskStatistics(hostID)
	if err != nil {
		slog.Error("GetHostStatistics failed", "host_id", hostID, "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error getting vulnerabilities: " + err.Error(),
		})
	}
	return c.JSON(stats)
}

// GetHostVulnerabilitySeverityCounts handles the GET /host/severity-counts route
func GetHostVulnerabilitySeverityCounts(c *fiber.Ctx) error {
	hostID := c.Params("id")
	slog.Debug("GetHostVulnerabilitySeverityCounts", "host_id", hostID)
	stats, err := host.GetHostVulnerabilitySeverityCounts(hostID)
	if err != nil {
		slog.Error("GetHostVulnerabilitySeverityCounts failed", "host_id", hostID, "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error getting vulnerabilities: " + err.Error(),
		})
	}
	return c.JSON(stats)
}

// GetAllVulnerabilities handles the GET /host/vulnerabilities route
func GetAllVulnerabilities(c *fiber.Ctx) error {
	vulnerabilities, err := host.GetAllVulnerabilities()
	if err != nil {
		slog.Error("GetAllVulnerabilities failed", "error", err)
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
		slog.Error("Error parsing request body", "error", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Error parsing request body: " + err.Error(),
		})
	}
	slog.Info("Adding host", "ip", newHost.IP)
	if !isValidSingleHostIP(newHost.IP) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Host IP must be a single IP address (CIDR/range/domain targets are not allowed)",
		})
	}

	// Detect source information from request metadata
	source := detectSourceFromRequest(c)
	slog.Info("Detected source", "name", source.Name, "version", source.Version)

	// Check all host vulns to confirm that they all exist in the database. If they do not, add them.
	for _, vuln := range newHost.Vulnerabilities {
		if !vulnerability.CheckVulnerabilityExists(vuln.VID) {
			slog.Info("Vulnerability not in database, adding", "vid", vuln.VID)

			cve, err := nvd.GetCVE(vuln.VID)
			if err != nil {
				slog.Warn("Failed to get CVE data", "vid", vuln.VID, "error", err)
				// Use provided vulnerability data as fallback
				vuln = sirius.Vulnerability{
					VID:         vuln.VID,
					Description: vuln.Description,
					Title:       vuln.Title,
					RiskScore:   vuln.RiskScore,
				}
			} else {
				// Safely extract CVE data with fallbacks
				description := vuln.Description
				if len(cve.Descriptions) > 0 {
					description = cve.Descriptions[0].Value
				}

				title := vuln.Title
				if cve.ID != "" {
					title = cve.ID
				}

				riskScore := vuln.RiskScore
				if len(cve.Metrics.CvssMetricV31) > 0 {
					riskScore = cve.Metrics.CvssMetricV31[0].CvssData.BaseScore
				}

				vuln = sirius.Vulnerability{
					VID:         vuln.VID,
					Description: description,
					Title:       title,
					RiskScore:   riskScore,
				}
			}

			err = vulnerability.AddVulnerability(vuln)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Error adding vulnerability: " + err.Error(),
				})
			}
		}
	}

	// Route to source-aware function if source detected, otherwise use legacy function
	if source.Name != "unknown" {
		err = host.AddHostWithSource(newHost, source)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error adding host with source: " + err.Error(),
			})
		}

		// Enhanced response with optional source information
		response := fiber.Map{
			"message": "Host added successfully with source attribution",
			"host_ip": newHost.IP,
		}

		// Add source information only if it was successfully detected
		if source.Name != "unknown" {
			response["source"] = fiber.Map{
				"name":    source.Name,
				"version": source.Version,
				"config":  source.Config,
			}
		}

		return c.JSON(response)
	} else {
		// Fallback to legacy function for backward compatibility
		err = host.AddHost(newHost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error adding host: " + err.Error(),
			})
		}

		// Legacy response format (unchanged for backward compatibility)
		return c.JSON(fiber.Map{
			"message": "Host added successfully",
		})
	}
}

// detectSourceFromRequest analyzes the HTTP request to determine the source of the scan data
func detectSourceFromRequest(c *fiber.Ctx) models.ScanSource {
	// Check User-Agent header for scanner identification
	userAgent := c.Get("User-Agent")

	// Check custom headers that scanners might set
	scannerName := c.Get("X-Scanner-Name")
	scannerVersion := c.Get("X-Scanner-Version")
	scannerConfig := c.Get("X-Scanner-Config")

	// Check for source information in query parameters
	if scannerName == "" {
		scannerName = c.Query("source")
	}
	if scannerVersion == "" {
		scannerVersion = c.Query("version")
	}

	// Analyze User-Agent string for known patterns
	if scannerName == "" {
		scannerName, scannerVersion = parseUserAgentForScanner(userAgent)
	}

	// Check client IP for known scanner hosts (if configured)
	clientIP := c.IP()
	if scannerName == "" {
		scannerName = detectSourceFromIP(clientIP)
	}

	// Default values if nothing detected
	if scannerName == "" {
		scannerName = "unknown"
	}
	if scannerVersion == "" {
		scannerVersion = "unknown"
	}
	if scannerConfig == "" {
		scannerConfig = "default"
	}

	// Validate and sanitize source information
	source := models.ScanSource{
		Name:    validateSourceName(scannerName),
		Version: validateSourceVersion(scannerVersion),
		Config:  validateSourceConfig(scannerConfig),
	}

	// Log source detection for debugging
	slog.Debug("Source detection", "user_agent", userAgent, "name", source.Name, "version", source.Version)

	return source
}

// validateSourceName ensures the source name is valid and safe
func validateSourceName(name string) string {
	// Remove any potentially dangerous characters
	name = strings.TrimSpace(name)
	if len(name) == 0 || len(name) > 50 {
		return "unknown"
	}

	// Allow only alphanumeric, dash, underscore, and dot
	for _, char := range name {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') || char == '-' || char == '_' || char == '.') {
			return "unknown"
		}
	}

	return name
}

// validateSourceVersion ensures the version string is valid and safe
func validateSourceVersion(version string) string {
	version = strings.TrimSpace(version)
	if len(version) == 0 || len(version) > 20 {
		return "unknown"
	}

	// Allow only alphanumeric, dot, dash, and underscore for versions
	for _, char := range version {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') || char == '.' || char == '-' || char == '_') {
			return "unknown"
		}
	}

	return version
}

// validateSourceConfig ensures the config string is valid and safe
func validateSourceConfig(config string) string {
	config = strings.TrimSpace(config)
	if len(config) > 200 {
		config = config[:200] // Truncate if too long
	}
	if len(config) == 0 {
		return "default"
	}

	return config
}

// parseUserAgentForScanner extracts scanner information from User-Agent string
func parseUserAgentForScanner(userAgent string) (name, version string) {
	// Common patterns for scanner identification
	patterns := map[string]string{
		"sirius-agent":   "agent",
		"sirius-scanner": "network-scanner",
		"nmap":           "nmap",
		"rustscan":       "rustscan",
		"naabu":          "naabu",
		"curl":           "manual-curl",
		"wget":           "manual-wget",
		"python":         "python-script",
		"go-http":        "go-client",
	}

	userAgentLower := strings.ToLower(userAgent)

	for pattern, scannerType := range patterns {
		if strings.Contains(userAgentLower, pattern) {
			// Try to extract version if present
			version = extractVersionFromUserAgent(userAgent, pattern)
			return scannerType, version
		}
	}

	return "", ""
}

// extractVersionFromUserAgent attempts to extract version information from User-Agent
func extractVersionFromUserAgent(userAgent, toolName string) string {
	// Simple regex-like extraction for version patterns
	// Look for patterns like "tool/1.2.3" or "tool-1.2.3"
	userAgentLower := strings.ToLower(userAgent)
	toolLower := strings.ToLower(toolName)

	// Find the tool name in the user agent
	index := strings.Index(userAgentLower, toolLower)
	if index == -1 {
		return "unknown"
	}

	// Look for version after the tool name
	remaining := userAgent[index+len(toolName):]

	// Common version separators
	separators := []string{"/", "-", " ", "_"}

	for _, sep := range separators {
		if strings.HasPrefix(remaining, sep) {
			versionPart := remaining[1:]
			// Extract version until next space or special character
			for i, char := range versionPart {
				if !((char >= '0' && char <= '9') || char == '.' || char == '-') {
					return versionPart[:i]
				}
			}
			return versionPart
		}
	}

	return "unknown"
}

// detectSourceFromIP determines scanner type based on client IP (if configured)
func detectSourceFromIP(clientIP string) string {
	// This could be enhanced with configuration for known scanner IPs
	// For now, return empty to indicate no detection
	return ""
}

// UpdateHostRequest represents the request body for updating a host
type UpdateHostRequest struct {
	Hostname  *string       `json:"hostname,omitempty"`
	OS        *string       `json:"os,omitempty"`
	OSVersion *string       `json:"osversion,omitempty"`
	Ports     []sirius.Port `json:"ports,omitempty"`
	Notes     []string      `json:"notes,omitempty"`
}

// UpdateHost handles the PUT /host/:id route for updating host information
func UpdateHost(c *fiber.Ctx) error {
	hostIP := c.Params("id")
	if hostIP == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Host IP is required",
		})
	}

	slog.Info("UpdateHost", "ip", hostIP)

	// Parse update request
	var updateReq UpdateHostRequest
	if err := c.BodyParser(&updateReq); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Error parsing request body: " + err.Error(),
		})
	}

	// Build host object with updates
	hostUpdate := sirius.Host{
		IP: hostIP,
	}

	if updateReq.Hostname != nil {
		hostUpdate.Hostname = *updateReq.Hostname
	}
	if updateReq.OS != nil {
		hostUpdate.OS = *updateReq.OS
	}
	if updateReq.OSVersion != nil {
		hostUpdate.OSVersion = *updateReq.OSVersion
	}
	if updateReq.Ports != nil {
		hostUpdate.Ports = updateReq.Ports
	}
	if updateReq.Notes != nil {
		hostUpdate.Notes = updateReq.Notes
	}

	// Use source-aware update with "manual" source for UI-driven updates
	source := models.ScanSource{
		Name:    "manual",
		Version: "1.0",
		Config:  "ui-update",
	}

	err := host.AddHostWithSource(hostUpdate, source)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error updating host: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Host updated successfully",
		"host_ip": hostIP,
	})
}

// DeleteHost handles the POST /host/delete route
func DeleteHost(c *fiber.Ctx) error {
	// Read the raw request body
	requestBody := string(c.Body())
	slog.Debug("DeleteHost request body", "body", requestBody)

	// Define a local struct that matches the expected JSON structure
	var newHost sirius.Host

	// Manually unmarshal JSON into the struct
	err := json.Unmarshal([]byte(requestBody), &newHost)
	if err != nil {
		slog.Error("Error parsing request body", "error", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Error parsing request body: " + err.Error(),
		})
	}

	slog.Info("Deleting host", "ip", newHost.IP)

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

// ===== SOURCE-AWARE HANDLERS FOR PHASE 1 TESTING =====

// AddHostWithSourceRequest represents the request body for source-aware host addition
type AddHostWithSourceRequest struct {
	Host   sirius.Host       `json:"host"`
	Source models.ScanSource `json:"source"`
}

// EnhancedHostRequest represents the request body for enhanced host data with JSONB fields
type EnhancedHostRequest struct {
	Host              sirius.Host            `json:"host"`
	Source            models.ScanSource      `json:"source"`
	SoftwareInventory map[string]interface{} `json:"software_inventory,omitempty"`
	SystemFingerprint map[string]interface{} `json:"system_fingerprint,omitempty"`
	AgentMetadata     map[string]interface{} `json:"agent_metadata,omitempty"`
}

// AddHostWithSource handles the POST /host/with-source route
func AddHostWithSource(c *fiber.Ctx) error {
	// Try to parse as enhanced request first, fall back to basic request
	var enhancedRequest EnhancedHostRequest
	var request AddHostWithSourceRequest
	var hasEnhancedData bool

	// Attempt to parse as enhanced request
	if err := c.BodyParser(&enhancedRequest); err == nil &&
		(len(enhancedRequest.SoftwareInventory) > 0 ||
			len(enhancedRequest.SystemFingerprint) > 0 ||
			len(enhancedRequest.AgentMetadata) > 0) {
		// Successfully parsed enhanced data
		hasEnhancedData = true
		request.Host = enhancedRequest.Host
		request.Source = enhancedRequest.Source
		slog.Info("Received enhanced host data with JSONB fields", "ip", request.Host.IP)
	} else {
		// Fall back to basic request parsing
		if err := c.BodyParser(&request); err != nil {
			slog.Error("Error parsing request body", "error", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Error parsing request body: " + err.Error(),
			})
		}
		slog.Debug("Received basic host data", "ip", request.Host.IP)
	}

	slog.Info("Adding host with source", "ip", request.Host.IP, "source", request.Source.Name)
	if !isValidSingleHostIP(request.Host.IP) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Host IP must be a single IP address (CIDR/range/domain targets are not allowed)",
		})
	}

	// Ensure vulnerabilities exist in database (same logic as original AddHost)
	for _, vuln := range request.Host.Vulnerabilities {
		if !vulnerability.CheckVulnerabilityExists(vuln.VID) {
			slog.Info("Vulnerability not in database, adding", "vid", vuln.VID)

			cve, err := nvd.GetCVE(vuln.VID)
			if err != nil {
				slog.Warn("Failed to get CVE data", "vid", vuln.VID, "error", err)
				// Use provided vulnerability data as fallback
				vuln = sirius.Vulnerability{
					VID:         vuln.VID,
					Description: vuln.Description,
					Title:       vuln.Title,
					RiskScore:   vuln.RiskScore,
				}
			} else {
				// Safely extract CVE data with fallbacks
				description := vuln.Description
				if len(cve.Descriptions) > 0 {
					description = cve.Descriptions[0].Value
				}

				title := vuln.Title
				if cve.ID != "" {
					title = cve.ID
				}

				riskScore := vuln.RiskScore
				if len(cve.Metrics.CvssMetricV31) > 0 {
					riskScore = cve.Metrics.CvssMetricV31[0].CvssData.BaseScore
				}

				vuln = sirius.Vulnerability{
					VID:         vuln.VID,
					Description: description,
					Title:       title,
					RiskScore:   riskScore,
				}
			}

			err = vulnerability.AddVulnerability(vuln)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Error adding vulnerability: " + err.Error(),
				})
			}
		}
	}

	// Use enhanced source-aware function if we have enhanced data
	if hasEnhancedData {
		err := host.AddHostWithSourceAndJSONB(request.Host, request.Source,
			enhancedRequest.SoftwareInventory,
			enhancedRequest.SystemFingerprint,
			enhancedRequest.AgentMetadata)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error adding host with enhanced data: " + err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"message":                "Host added successfully with enhanced SBOM data",
			"source":                 request.Source.Name,
			"host_ip":                request.Host.IP,
			"enhanced_data_included": true,
			"software_inventory":     len(enhancedRequest.SoftwareInventory) > 0,
			"system_fingerprint":     len(enhancedRequest.SystemFingerprint) > 0,
			"agent_metadata":         len(enhancedRequest.AgentMetadata) > 0,
		})
	} else {
		// Use standard source-aware function
		err := host.AddHostWithSource(request.Host, request.Source)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error adding host with source: " + err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"message": "Host added successfully with source attribution",
			"source":  request.Source.Name,
			"host_ip": request.Host.IP,
		})
	}
}

// GetHostWithSources handles the GET /host/{id}/sources route
func GetHostWithSources(c *fiber.Ctx) error {
	hostIP := c.Params("id")

	hostWithSources, err := host.GetHostWithSources(hostIP)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Host not found or error retrieving sources: " + err.Error(),
		})
	}

	return c.JSON(hostWithSources)
}

// GetVulnerabilityHistory handles the GET /host/{id}/vulnerability/{vulnId}/history route
func GetVulnerabilityHistory(c *fiber.Ctx) error {
	hostIDStr := c.Params("id")
	vulnIDStr := c.Params("vulnId")

	// Convert string IDs to uint
	hostID, err := strconv.ParseUint(hostIDStr, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid host ID: " + err.Error(),
		})
	}

	vulnID, err := strconv.ParseUint(vulnIDStr, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid vulnerability ID: " + err.Error(),
		})
	}

	history, err := host.GetVulnerabilityHistory(uint(hostID), uint(vulnID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error retrieving vulnerability history: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"host_id":          hostID,
		"vulnerability_id": vulnID,
		"source_history":   history,
	})
}

// GetSourceCoverageStats handles the GET /host/source-coverage route
func GetSourceCoverageStats(c *fiber.Ctx) error {
	stats, err := host.GetSourceCoverageStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error retrieving source coverage statistics: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"source_coverage_stats": stats,
		"total_sources":         len(stats),
	})
}

// GetVulnerabilitySources handles the GET /vulnerability/{id}/sources route
func GetVulnerabilitySources(c *fiber.Ctx) error {
	vulnID := c.Params("id")

	// Get all sources that have reported this vulnerability
	sources, err := host.GetVulnerabilitySources(vulnID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error retrieving vulnerability sources: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"vulnerability_id": vulnID,
		"sources":          sources,
		"total_sources":    len(sources),
	})
}

// GetHostHistory handles the GET /host/{id}/history route
func GetHostHistory(c *fiber.Ctx) error {
	hostIP := c.Params("id")

	// This would get a comprehensive history of all scan activities for the host
	// For now, we'll return the sources information as a basic history
	hostWithSources, err := host.GetHostWithSources(hostIP)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Host not found or error retrieving history: " + err.Error(),
		})
	}

	// Transform the data into a timeline format
	timeline := make([]fiber.Map, 0)

	// Add scan events to timeline (this is a simplified version)
	// In a full implementation, this would query scan_history table
	timeline = append(timeline, fiber.Map{
		"event_type": "host_discovery",
		"timestamp":  hostWithSources.Host.CreatedAt,
		"source":     "initial",
		"details":    "Host first discovered",
	})

	return c.JSON(fiber.Map{
		"host_ip":  hostIP,
		"timeline": timeline,
		"sources":  hostWithSources.Sources,
	})
}

// ===== BACKWARD COMPATIBILITY UTILITIES =====

// isLegacyClient determines if the client expects legacy API responses
func isLegacyClient(c *fiber.Ctx) bool {
	// Check for API version header
	apiVersion := c.Get("X-API-Version")
	if apiVersion != "" && apiVersion < "2.0" {
		return true
	}

	// Check for legacy User-Agent patterns
	userAgent := c.Get("User-Agent")
	legacyPatterns := []string{
		"legacy",
		"v1.",
		"old-client",
	}

	userAgentLower := strings.ToLower(userAgent)
	for _, pattern := range legacyPatterns {
		if strings.Contains(userAgentLower, pattern) {
			return true
		}
	}

	return false
}

// wrapLegacyResponse wraps responses for legacy clients
func wrapLegacyResponse(data interface{}) fiber.Map {
	return fiber.Map{
		"data":    data,
		"version": "1.0",
		"format":  "legacy",
	}
}

// wrapEnhancedResponse wraps responses for modern clients with source information
func wrapEnhancedResponse(data interface{}, sources interface{}) fiber.Map {
	response := fiber.Map{
		"data":    data,
		"version": "2.0",
		"format":  "enhanced",
	}

	if sources != nil {
		response["sources"] = sources
	}

	return response
}

// assignLegacySource creates a default source for legacy submissions
func assignLegacySource() models.ScanSource {
	return models.ScanSource{
		Name:    "legacy",
		Version: "unknown",
		Config:  "legacy-submission",
	}
}

// GetHostPackages handles the GET /host/{id}/packages route
func GetHostPackages(c *fiber.Ctx) error {
	hostID := c.Params("id")

	inventory, err := host.GetHostSoftwareInventory(hostID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error retrieving software inventory: " + err.Error(),
		})
	}

	// Support filtering by package name, architecture, publisher
	packageFilter := c.Query("filter", "")
	architecture := c.Query("architecture", "")
	publisher := c.Query("publisher", "")

	filteredPackages := inventory.Packages

	// Apply filters if specified
	if packageFilter != "" || architecture != "" || publisher != "" {
		filteredPackages = []map[string]interface{}{}
		for _, pkg := range inventory.Packages {
			match := true

			if packageFilter != "" {
				if name, ok := pkg["name"].(string); !ok || !strings.Contains(strings.ToLower(name), strings.ToLower(packageFilter)) {
					match = false
				}
			}

			if architecture != "" && match {
				if arch, ok := pkg["architecture"].(string); !ok || arch != architecture {
					match = false
				}
			}

			if publisher != "" && match {
				if pub, ok := pkg["publisher"].(string); !ok || !strings.Contains(strings.ToLower(pub), strings.ToLower(publisher)) {
					match = false
				}
			}

			if match {
				filteredPackages = append(filteredPackages, pkg)
			}
		}
	}

	response := fiber.Map{
		"host_ip":       hostID,
		"packages":      filteredPackages,
		"package_count": len(filteredPackages),
		"total_count":   inventory.PackageCount,
		"collected_at":  inventory.CollectedAt,
		"source":        inventory.Source,
	}

	if inventory.Statistics != nil {
		response["statistics"] = inventory.Statistics
	}

	return c.JSON(response)
}

// GetHostFingerprint handles the GET /host/{id}/fingerprint route
func GetHostFingerprint(c *fiber.Ctx) error {
	hostID := c.Params("id")

	fingerprint, err := host.GetHostSystemFingerprint(hostID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error retrieving system fingerprint: " + err.Error(),
		})
	}

	response := fiber.Map{
		"host_ip":                hostID,
		"fingerprint":            fingerprint.Fingerprint,
		"collected_at":           fingerprint.CollectedAt,
		"source":                 fingerprint.Source,
		"platform":               fingerprint.Platform,
		"collection_duration_ms": fingerprint.CollectionDurationMs,
	}

	if fingerprint.Summary != nil {
		response["summary"] = fingerprint.Summary
	}

	return c.JSON(response)
}

// GetHostSoftwareStats handles the GET /host/{id}/software-stats route
func GetHostSoftwareStats(c *fiber.Ctx) error {
	hostID := c.Params("id")

	stats, err := host.GetHostSoftwareStatistics(hostID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error retrieving software statistics: " + err.Error(),
		})
	}

	response := fiber.Map{
		"host_ip":            hostID,
		"total_packages":     stats.TotalPackages,
		"architectures":      stats.Architectures,
		"publishers":         stats.Publishers,
		"packages_by_source": stats.PackagesBySource,
		"last_updated":       stats.LastUpdated,
	}

	return c.JSON(response)
}
