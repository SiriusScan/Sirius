package agentsAPI

//CRITICAL TODOs
	//Convert report to vulns
	//Store in hosts database

/*
Sirius Agents API:
This file contains functions and objects to support interaction with agents. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API/agents
The following functions are exported:
- AgentReport: API Handler for agent report submission
*/

import (
	_ "encoding/json"
	_ "errors"
	"log"
	"net/http"
	_ "os"
	_ "os/exec"

	"github.com/gin-gonic/gin"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

func AgentReport(c *gin.Context) {
	var newReport Report

	// Call BindJSON to bind the received JSON a local variable
	//fmt.Println(c)
	if c.ShouldBind(&newReport) == nil {
		log.Println("Agent Scan Report Recieved!")
	}
	//log.Println(newReport)

	//Get CVEs from report
	var cveList []string
	for i := 0; i < len(newReport.Updates); i++ {
		cveList = append(cveList, newReport.Updates[i].CVEIDs)
	}
	for i := 0; i < len(cveList); i++ {
		if cveList[i] != "CVEIDs" && cveList[i] != "" {
			siriusDB.NewCVE(newReport.IP, cveList[i])
		}
	}

	//Process Report
	for i := 0; i < len(newReport.Updates); i++ {
		//log.Println(newReport.Updates[i])
		//Get KB
		id := newReport.Updates[i].ID
		if id[0:1] == "M" {
			id = newReport.Updates[i].KBID
		}
		//log.Println(id)

	}

	//Convert to vulns
	//Store in hosts database

	//Should retrieve any commands for the agent and pass along in JSON Response below

	var msg = "Success"
	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"command": string(msg), // cast it to string before showing
	})
}
