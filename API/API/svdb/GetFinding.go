package svdbAPI

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

// getFindings responds with the list of a Finding as JSON.
func GetFinding(c *gin.Context) {
	//Selector (CVE or other?)
	var request siriusDB.FindingRequest

	if c.ShouldBind(&request) == nil {
		log.Println("Building CVE Data")
		log.Println(request)
	}

	var finding []siriusDB.SVDBEntry
	finding = siriusDB.GetFinding(request)
	c.IndentedJSON(http.StatusOK, finding)
}
