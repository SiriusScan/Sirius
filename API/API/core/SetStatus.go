package coreAPI

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"

	svdbAPI "github.com/0sm0s1z/Sirius-Scan/API/svdb"
)

//SetStatus sets the status of the system in the database
func SetStatus(status SystemStatus) {
	log.Println("Setting System Status: " + status.Status)

	//Connect to the Database
	client, ctx := svdbAPI.DatabaseConnect()

	//Get the status collection
	statusCollection := client.Database("Sirius").Collection("Status")

	//If status is initializing, create the root profile
	if status.Status == "init" {
		//Create the root profile
		//Insert the status into the database
		_, err := statusCollection.InsertOne(context.TODO(), status)
		if err != nil {
			log.Fatal(err)
		}

		//Trigger Build of the Vulnerability Database
		BuildDatabase()

	} else {
		//Update the status in the database
		_, err := statusCollection.UpdateOne(context.TODO(), bson.D{{"profile", "root"}}, bson.D{{"$set", status}})
		if err != nil {
			log.Println(err)
		}
	}
	defer client.Disconnect(ctx)

	return
}
