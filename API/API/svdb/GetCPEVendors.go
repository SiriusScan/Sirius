package svdbAPI

/*
NVD CPE Match API Vendor List
*/

import (
	"encoding/json"
	_ "encoding/json"
	_ "errors"
	"io/ioutil"
	"log"

	//"reflect"
	"fmt"
	"net/http"
	_ "os"
	_ "os/exec"

	"github.com/gin-gonic/gin"
)

type CPEVendor struct {
	VendorName string       `json:"vendor_name"`
	Product    []CPEProduct `json:"product"`
}
type CPEProduct struct {
	ProductName string `json:"product_name"`
}

func GetCPEVendors(c *gin.Context) {
	fmt.Println(c)

	//Retrieve CPE Vendor List
	var result []CPEVendor
	result = getVendors()

	c.IndentedJSON(http.StatusOK, result)
}

func getVendors() []CPEVendor {
	//Open CPE List File
	dat, err := ioutil.ReadFile("./data/vendorlist.json")
	if err != nil {
		log.Println("Error reading CPE List")
		log.Println(err)
	}
	//Parse CPE List
	var result []CPEVendor
	err = json.Unmarshal(dat, &result)
	if err != nil {
		log.Println("Error parsing CPE List")
	}

	return result
}
