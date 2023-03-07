package coreAPI

import (
	_ "encoding/json"
	_ "errors"
	"log"

	coreAPI "github.com/0sm0s1z/Sirius-Scan/API/core"
	svdbAPI "github.com/0sm0s1z/Sirius-Scan/API/svdb"
)

//GetStatus collects the status from the database and returns it to the caller
func GetStatus() coreAPI.SystemStatus {
	log.Println("Getting System Status")

	//Connect to the Database
	client := svdbAPI.DatabaseConnect()

	//Get the status collection
	

	//statusCollection := client.Database("sirius").Collection("status")



	//Get the status of the API from the database
	var result coreAPI.SystemStatus



	//Hardcode result for now
	result = coreAPI.SystemStatus{Status: "OK"}
	return result
}