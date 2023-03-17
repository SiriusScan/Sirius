package coreAPI

import (
	"context"
	_ "encoding/json"
	_ "errors"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	svdbAPI "github.com/0sm0s1z/Sirius-Scan/API/svdb"
)

//GetStatus collects the status from the database and returns it to the caller
func GetStatus() SystemStatus {
	//Connect to the Database
	client, ctx := svdbAPI.DatabaseConnect()

	//Get the status collection
	statusCollection := client.Database("Sirius").Collection("Status")

	var status SystemStatus
	err := statusCollection.FindOne(context.TODO(), bson.D{{"profile", "root"}}).Decode(&status)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Set the status to Initializing
			fmt.Println("Initializing the vulnerability database")

			initStatus := SystemStatus{
				Profile: "root",
				Status:  "init",
				Tasks: []SystemTask{
					{
						TaskID:       "1",
						TaskName:     "Initializing",
						TaskStatus:   "Downloading Base Vulnerability Database from NVD...",
						TaskProgress: 10,
					},
				},
			}

			SetStatus(initStatus)
			//status = SystemStatus{Status: "Initializing"}
		}
	}
	defer client.Disconnect(ctx)

	//Get the status of the API from the database
	return status
}
