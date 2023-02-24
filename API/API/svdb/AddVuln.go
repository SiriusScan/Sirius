package svdbAPI

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

func AddVuln(c *gin.Context) {
	var newVuln siriusDB.SVDBEntry

	// Call BindJSON to bind the received JSON a local variable
	//fmt.Println(c)
	if c.ShouldBind(&newVuln) == nil {
		log.Println("Adding Vulnerability...")
	}
	siriusDB.AddVuln(newVuln)

	c.String(200, "Success")
}
