package agentsAPI

/*
Sirius Agents API:
This file contains functions and objects to support interaction with agents. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API/agents
The following functions are exported:
- AgentCheck: API Handler for agent checkin
*/

import (
	_ "encoding/json"
	_ "errors"
	"log"
	"net/http"
	_ "os"
	_ "os/exec"
	"sort"

	"github.com/gin-gonic/gin"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

func AgentCheck(c *gin.Context) {
	var newAgent siriusDB.SiriusAgent

	// Call BindJSON to bind the received JSON a local variable
	//fmt.Println(c)
	if c.ShouldBind(&newAgent) == nil {
		log.Println("Agent Checkin")
	}
	log.Println("Agent ID: ", newAgent.IP)

	//Should retrieve any commands for the agent and pass along in JSON Response below
	// - Get Task List from Host collection
	var taskList []siriusDB.Task
	taskList = GetTasks(newAgent)

	// - Sort by date
	sort.Slice(taskList, func(i, j int) bool {
		return taskList[i].Date.Before(taskList[j].Date)
	})
	// - foreach pick first status = 0
	var curTask siriusDB.Task
	for i := 0; i < len(taskList); i++ {
		if taskList[i].Status != "1" && taskList[i].Status != "2" {
			curTask = taskList[i]
			i = 1000000
		}
	}

	c.IndentedJSON(http.StatusOK, curTask)
}
