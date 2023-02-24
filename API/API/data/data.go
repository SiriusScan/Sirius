package dataAPI

/*
Sirius Data API:
This file contains functions and objects to support interaction with agents. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API/data
The following functions are exported:
-
*/

import (
	"context"
	_ "encoding/json"
	_ "errors"
	"log"
	"net/http"
	_ "os"
	_ "os/exec"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

/*
[SIRIUS AGENTS API QUERIES]
*/

func TerminalHistory(c *gin.Context) {
	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)
	//Get base SiriusAgent from DB and append new task
	hostCollection := client.Database("Sirius").Collection("Hosts")

	//find records
	//pass these options to the Find method
	findOptions := options.Find()
	//Set the limit of the number of record to find
	findOptions.SetLimit(5)
	//Define an array in which you can store the decoded documents
	var results []siriusDB.SVDBHost

	//Passing the bson.D{{}} as the filter matches  documents in the collection
	cur, err := hostCollection.Find(context.TODO(), bson.D{{}}, findOptions)
	if err != nil {
		log.Fatal(err)
	}
	//Finding multiple documents returns a cursor
	//Iterate through the cursor allows us to decode documents one at a time

	for cur.Next(context.TODO()) {
		//Create a value into which the single document can be decoded
		var hosts siriusDB.SVDBHost
		err := cur.Decode(&hosts)
		if err != nil {
			log.Fatal(err)
		}

		results = append(results, hosts)
	}

	if err := cur.Err(); err != nil {
		log.Fatal(err)
	}

	//Close the cursor once finished
	cur.Close(context.TODO())

	var history []siriusDB.TerminalHistory
	var historyEntry siriusDB.TerminalHistory
	for i := 0; i < len(results); i++ {
		for j := 0; j < len(results[i].Agent.Tasks); j++ {
			historyEntry.Id = results[i].Agent.Tasks[j].ID
			historyEntry.IP = results[i].IP
			historyEntry.Command = results[i].Agent.Tasks[j].Command
			historyEntry.Result = results[i].Agent.Tasks[j].Result
			historyEntry.Status = results[i].Agent.Tasks[j].Status
			historyEntry.Date = results[i].Agent.Tasks[j].Date
			history = append(history, historyEntry)
		}
	}

	c.IndentedJSON(http.StatusOK, history)
}
