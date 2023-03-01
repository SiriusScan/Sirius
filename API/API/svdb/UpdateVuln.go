package svdbAPI

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

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

func UpdateVuln(c *gin.Context) {
	var newVuln siriusDB.SVDBEntry

	// Call BindJSON to bind the received JSON a local variable
	//fmt.Println(c)
	if c.ShouldBind(&newVuln) == nil {
		log.Println("Updating Vulnerability Entry...")
	}

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
	vulnCollection := client.Database("Sirius").Collection("Vulnerabilities")

	//Find the appropriate vulnerability
	var finding siriusDB.SVDBEntry
	err = vulnCollection.FindOne(context.TODO(), bson.M{"cvedatameta.id": newVuln.CVEDataMeta.ID}).Decode(&finding)
	if err != nil {
		fmt.Println("Error retrieving finding from DB")
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			fmt.Println("No finding found with that ID")
			return
		}
		panic(err)
	}
	finding.Tags = append(finding.Tags, newVuln.Tags...)
	fmt.Println(finding.Tags)

	//Update Vulnerability
	res, err := vulnCollection.UpdateOne(
		ctx,
		bson.M{"cvedatameta.id": newVuln.CVEDataMeta.ID},
		bson.D{
			{"$set", bson.D{{"Tags", finding.Tags}}},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Updated %v Documents!\n", res.ModifiedCount)

	c.String(200, "Success")
}