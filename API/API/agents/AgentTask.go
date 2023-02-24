package agentsAPI

/*
Sirius Agents API:
This file contains functions and objects to support interaction with agents. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API/agents
The following functions are exported:
- AgentRegistration
*/

import (
	_ "encoding/json"
	_ "errors"
	"log"
	_ "os"
	_ "os/exec"

	"github.com/gin-gonic/gin"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

func AgentTask(c *gin.Context) {
	var newAgent siriusDB.SiriusAgent

	if c.ShouldBind(&newAgent) == nil {
		log.Println("Assigning Agent Task")
	}
	TaskAgent(newAgent)

}
