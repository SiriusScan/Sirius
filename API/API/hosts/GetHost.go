package hostAPI

/*
Sirius Hosts API:
This file contains functions and objects to support interaction with hosts. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API/hosts
The following functions are exported:
- CPEScan
*/

import (
	"context"
	_ "encoding/json"
	_ "errors"
	"log"

	//"reflect"
	"fmt"
	_ "os"
	_ "os/exec"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

func GetHost(hostRequest siriusDB.SVDBHost) siriusDB.SVDBHost {

	//Get the host data from the database
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	//Perform DB Operations
	hostCollection := client.Database("Sirius").Collection("Hosts")

	//Find the appropriate Host
	var result siriusDB.SVDBHost
	err = hostCollection.FindOne(context.TODO(), bson.M{"ip": hostRequest.IP}).Decode(&result)
	if err != nil {
		fmt.Println("Error retrieving result from DB")
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			fmt.Println("No result found with that ID")
		}
	}

	return result
}
