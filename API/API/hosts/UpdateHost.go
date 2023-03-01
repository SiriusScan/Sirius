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

func UpdateHost(updateRequest siriusDB.SVDBHost) {

	//DB Connection
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
	err = hostCollection.FindOne(context.TODO(), bson.M{"ip": updateRequest.IP}).Decode(&result)
	if err != nil {
		fmt.Println("Error retrieving result from DB")
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			fmt.Println("No result found with that ID")
			return
		}
		panic(err)
	}

	//Splice the new data into the old data (do it later)
	//This only does CPEs and CVEs for now
	for i := 0; i < len(updateRequest.CPE); i++ {
		result.CPE = append(result.CPE, updateRequest.CPE[i])
	}
	for i := 0; i < len(updateRequest.CVE); i++ {
		result.CVE = append(result.CVE, updateRequest.CVE[i])
	}

	//Update Host
	res, err := hostCollection.UpdateOne(
		ctx,
		bson.M{"ip": updateRequest.IP},
		bson.D{
			{"$set", bson.D{{"CPE", updateRequest.CPE}, {"CVE", updateRequest.CVE}}},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Updated", res.ModifiedCount, "documents in the hosts collection.")
	return
}
