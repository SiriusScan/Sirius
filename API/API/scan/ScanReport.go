package scanAPI

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ScanReport retrieves information from the database given a scan ID and returns a ScanRequest struct
func GetScanReport(scanID string) ScanRequest {
	//Get the scan request from the database
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
	scanCollection := client.Database("Sirius").Collection("Scans")

	//Find the appropriate Scan
	var result ScanRequest
	err = scanCollection.FindOne(context.TODO(), bson.M{"scanid": scanID}).Decode(&result)
	if err != nil {
		log.Println("Error retrieving result from DB")
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			log.Println("No result found with that ID")
		}
	}
	return result
}

// UpdateScanReport updates the scan report in the database
func UpdateScanReport(scanRequest ScanRequest) {
	//Get the scan request from the database
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
	scanCollection := client.Database("Sirius").Collection("Scans")

	//Find the appropriate Scan
	_, err = scanCollection.UpdateOne(context.TODO(), bson.M{"scanid": scanRequest.ScanID}, bson.M{"$set": scanRequest})
	if err != nil {
		log.Println("Error updating result in DB")
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			log.Println("No result found with that ID")
			//Add the scan request to the database
		}
	}
}

func NewScanReport(scanRequest ScanRequest) {
	//Get the scan request from the database
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
	scanCollection := client.Database("Sirius").Collection("Scans")

	//Find the appropriate Scan
	_, err = scanCollection.InsertOne(context.TODO(), scanRequest)
	if err != nil {
		log.Println("Error inserting result into DB")
	}
}
