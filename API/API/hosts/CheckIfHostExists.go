package hostAPI

import (
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	"go.mongodb.org/mongo-driver/mongo"
)

func CheckIfHostExists(host string) bool {
	//Create a hostRequest object
	hostRequest := siriusDB.SVDBHost{
		IP: host,
	}
	//Get the host data from the database
	_, err := GetHost(hostRequest)
	if err != nil {
		return false
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return false
		}
	}
	return true
}
