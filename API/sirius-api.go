package main

import (
	_ "encoding/json"
	_ "errors"
	"fmt"
	"log"
	_ "log"
	_ "os"
	_ "os/exec"

	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	//Internal Libraries
	APIHandler "github.com/0sm0s1z/Sirius-Scan/API"
	agentsAPI "github.com/0sm0s1z/Sirius-Scan/API/agents"
	dataAPI "github.com/0sm0s1z/Sirius-Scan/API/data"
	scanAPI "github.com/0sm0s1z/Sirius-Scan/API/scan"
	svdbAPI "github.com/0sm0s1z/Sirius-Scan/API/svdb"
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//siriusNVD "github.com/0sm0s1z/Sirius-Scan/lib/nvd"
	//3rd Party Dependencies
)

// host represents data about a target host.
type host struct {
	ID       string `json:"id"`
	IP       string `json:"ip"`
	Hostname string `json:"hostname"`
	OS       string `json:"os"`
}

// SVDBEntry represents data about a target SVDBEntry.

func main() {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders: []string{"Content-Type,access-control-allow-origin, access-control-allow-headers"},
	}))

	//Sirius Host API
	router.GET("/api/get/hosts", getHosts)
	router.POST("/api/get/host", APIHandler.GetHost)
	router.POST("/api/add/host", addHost)
	router.POST("/api/new/host", addHost)
	router.POST("/api/update/host", APIHandler.UpdateHost)
	//router.POST("/api/new/cve", hostAPI.AddCVE)
	//router.POST("/api/new/cpe", hostAPI.AddCPE)

	//SVDB APIs
	router.POST("/api/svdb/new/vuln", svdbAPI.AddVuln)
	router.POST("/api/svdb/add/vuln", svdbAPI.AddVuln)
	router.POST("/api/svdb/update/vuln", svdbAPI.UpdateVuln)
	//router.POST("/api/svdb/add/cve", svdbAPI.AddCVE)
	router.POST("/api/svdb/get/finding", svdbAPI.GetFinding)
	router.POST("/api/svdb/get/cpe", svdbAPI.GetCPE)

	router.POST("/api/svdb/report/host", svdbAPI.VulnerabilityReport)
	router.POST("/api/svdb/report/vulnerability", svdbAPI.FullVulnerabilityReport)

	//Agent APIs
	router.POST("/api/agent/check", agentsAPI.AgentCheck)
	router.POST("/api/agent/report", agentsAPI.AgentReport)
	router.POST("/api/agent/register", agentsAPI.AgentRegistration)
	router.POST("/api/agent/task", agentsAPI.AgentTask)
	router.POST("/api/agent/response", agentsAPI.AgentResponse)

	//Data APIs
	router.POST("/api/data/terminalhistory", dataAPI.TerminalHistory)
	router.GET("/api/data/cpe_vendors", svdbAPI.GetCPEVendors)

	//Scanner APIs
	router.POST("/api/scan/new", scanAPI.NewScan)

	router.Run(":8080")
}

// getHosts responds with the list of all hosts as JSON.
func getHosts(c *gin.Context) {
	fmt.Println(c)
	results := siriusDB.GetHosts()
	c.IndentedJSON(http.StatusOK, results)
}

func addHost(c *gin.Context) {
	var newHost siriusDB.SVDBHost

	// Call BindJSON to bind the received JSON a local variable
	if c.ShouldBind(&newHost) == nil {
		log.Println("Adding Host...")
	}

	siriusDB.AddHost(newHost)
	c.String(200, "Success")
}
