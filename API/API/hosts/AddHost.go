package hostAPI

/*
Sirius Hosts API:
This file contains functions and objects to support interaction with hosts. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API/hosts
The following functions are exported:
- AddHost
*/

import (
	"context"
	_ "encoding/json"
	_ "errors"
	"log"
	"reflect"

	"fmt"
	_ "os"
	_ "os/exec"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

func AddHost(host siriusDB.SVDBHost) {
	log.Println(host)

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

	//Perform DB Operations
	fmt.Println(reflect.TypeOf(client))
	newHost(client, host)

	log.Println("Success: Operation completed successfully")
}

func newHost(client *mongo.Client, host siriusDB.SVDBHost) string {
	hostCollection := client.Database("Sirius").Collection("Hosts")
	//log.Println(hostCollection)

	fmt.Println(host)

	result, err := hostCollection.InsertOne(context.TODO(), host)
	// check for errors in the insertion
	if err != nil {
		panic(err)
	}
	// display the id of the newly inserted object
	fmt.Println(result.InsertedID)
	return "result"
}