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

	coreAPI "github.com/0sm0s1z/Sirius-Scan/API/core"
	hostAPI "github.com/0sm0s1z/Sirius-Scan/API/hosts"
	scanAPI "github.com/0sm0s1z/Sirius-Scan/API/scan"
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	siriusHelper "github.com/0sm0s1z/Sirius-Scan/lib/utils"
)

func GetHost(c *gin.Context) {
	var hostRequest siriusDB.SVDBHost

	if c.ShouldBind(&hostRequest) != nil {
		log.Println("Vulnerability Report Failed for: ", hostRequest.IP)
	}

	//Get the host data from the database
	var result siriusDB.SVDBHost
	result, err := hostAPI.GetHost(hostRequest)
	if err != nil {
		log.Println("Error retrieving result from DB")
	}

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

//GetStatus returns the status of the API
func GetStatus(c *gin.Context) {

	//Get the status of the API from the database
	var result coreAPI.SystemStatus
	result = coreAPI.GetStatus()

	//Hardcode result for now
	//result := coreAPI.SystemStatus{Status: "Initializing"}

	c.IndentedJSON(http.StatusOK, result)
}

func NewScan(c *gin.Context) {
	//Get Scan Profile from Request
	var request scanAPI.ScanRequest
	if c.ShouldBind(&request) == nil {
		//log.Println("Request Received")
	}

	scanID := "scan-" + siriusHelper.RandomString(10)
	request.ScanID = scanID

	scanAPI.NewScan(request)

	c.IndentedJSON(http.StatusOK, scanID)
}

/* SCAN API */
func GetScanReport(c *gin.Context) {
	var scanRequest scanAPI.ScanRequest

	if c.ShouldBind(&scanRequest) != nil {
		log.Println("Scan Report Failed for: ", scanRequest.ScanID)
	}

	//Get the report data from the database
	scanRequest = scanAPI.GetScanReport(scanRequest.ScanID)

	c.IndentedJSON(http.StatusOK, scanRequest)
}
