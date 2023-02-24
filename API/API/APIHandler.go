package APIHandler

/*
This is the API handler for the Sirius-Scan API. This is where the API calls are handled and the data is passed to the correct functions and the result is returned as a JSON response. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API
The following functions are exported:
- GetHost

TODO: Add the following functions:
- UpdateHost
- DeleteHost
- CreateHost
...and so on
*/

import (
	_ "encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	hostAPI "github.com/0sm0s1z/Sirius-Scan/API/hosts"
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
)

func GetHost(c *gin.Context) {
	var hostRequest siriusDB.SVDBHost

	if c.ShouldBind(&hostRequest) != nil {
		log.Println("Vulnerability Report Failed for: ", hostRequest.IP)
	}

	//Get the host data from the database
	var result siriusDB.SVDBHost
	result = hostAPI.GetHost(hostRequest)

	c.IndentedJSON(http.StatusOK, result)
}

func UpdateHost(c *gin.Context) {
	var newHostDetails siriusDB.SVDBHost

	// Call BindJSON to bind the received JSON a local variable
	//fmt.Println(c)
	if c.ShouldBind(&newHostDetails) == nil {
		log.Println("Updating Host: " + newHostDetails.IP)
	}

	hostAPI.UpdateHost(newHostDetails)

	response := "Updated "

	c.String(200, response)
}