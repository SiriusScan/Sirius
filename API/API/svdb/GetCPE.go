package svdbAPI

import (
	"context"
	_ "encoding/json"
	_ "errors"
	"fmt"
	"log"
	"net/http"
	_ "os"
	_ "os/exec"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

type CPE struct {
	Product  string
	Vendor   string
	Version  string
	CPE23URI string
}

// GetCPE responds with the list of a CPE as JSON.
func GetCPE(c *gin.Context) {
	//Selector (CPE or other?)
	var request siriusDB.CPEMatch

	if c.ShouldBind(&request) == nil {
		log.Println("CPE lookup request recieved!")
		log.Println("Building CVE Data for:", request.CPE23URI)
	}

	var finding []siriusDB.SVDBEntry
	finding = MatchToCVE(request)
	c.IndentedJSON(http.StatusOK, finding)
}

//Performs DB lookup for all vulnerabilities and matches underlying CVEs to matched CPE
func MatchToCVE(request siriusDB.CPEMatch) []siriusDB.SVDBEntry {
	//Get CPE Request Version String
	var cpeRequest CPE
	if request.CPE23URI != "" {
		cpeRequest.CPE23URI = request.CPE23URI
		cpeRequest.Vendor = strings.Split(request.CPE23URI, ":")[3]
		cpeRequest.Product = strings.Split(request.CPE23URI, ":")[4]
		cpeRequest.Version = strings.Split(request.CPE23URI, ":")[5]
	}

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

	var cveList []siriusDB.SVDBEntry
	filter := bson.D{}

	//Get ALL vulnerabilities & check CPE Match Details for each.
	//Add matches to cveList
	//Optimize this in the future by adding matched vulns to CVE cache DB (currently doesn't exist)
	vulnCollection := client.Database("Sirius").Collection("Vulnerabilities")

	cursor, err := vulnCollection.Find(context.TODO(), filter)
	if err == mongo.ErrNoDocuments {
		// Do something when no record was found
		// IE Database is empty/has not been built
		fmt.Println("record does not exist")
	} else if err != nil {
		log.Fatal(err)
	}

	//Iterate through all vulnerabilities
	for cursor.Next(context.TODO()) {
		var cveEntry siriusDB.SVDBEntry
		if err := cursor.Decode(&cveEntry); err != nil {
			log.Fatal(err)
		}
		vuln := cpeLookup(cveEntry, cpeRequest)

		//Append to list if not empty
		if (siriusDB.SVDBEntry{}.CVEDataType != vuln.CVEDataType) {
			cveList = append(cveList, vuln)

		}
	}
	if err := cursor.Err(); err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.TODO())

	return cveList
}

//CPE Match
func cpeLookup(cveEntry siriusDB.SVDBEntry, cpeRequest CPE) siriusDB.SVDBEntry {
	var vuln siriusDB.SVDBEntry
	var cpeMatch CPE

	//Iterate through all CPEs for each vulnerability
	for i := 0; i < len(cveEntry.CPE.CPEMatch); i++ {
		//Check for hard match
		if cveEntry.CPE.CPEMatch[i].CPE23URI == cpeRequest.CPE23URI {
			vuln = cveEntry
			return vuln
		} else {
			//Collect CPEMatch Details
			cpeMatch.Vendor = strings.Split(cveEntry.CPE.CPEMatch[i].CPE23URI, ":")[3]
			cpeMatch.Product = strings.Split(cveEntry.CPE.CPEMatch[i].CPE23URI, ":")[4]
			cpeMatch.Version = strings.Split(cveEntry.CPE.CPEMatch[i].CPE23URI, ":")[5]

			//Check Vendor & Product
			if cpeMatch.Vendor == cpeRequest.Vendor && cpeMatch.Product == cpeRequest.Product {
				//Get version details
				start := cveEntry.CPE.CPEMatch[i].VersionStartIncluding
				end := cveEntry.CPE.CPEMatch[i].VersionEndExcluding

				//Append if request is for * (all versions)
				if cpeRequest.Version == "*" {
					vuln = cveEntry
					return vuln
				} else {
					//Check if version is in range
					if cpeRequest.Version >= start && cpeMatch.Version < end {
						vuln = cveEntry
						return vuln
					}
				}
			}
		}
	}
	return vuln
}
