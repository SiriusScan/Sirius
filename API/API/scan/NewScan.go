package scanAPI

import (
	"bytes"
	"encoding/json"
	_ "encoding/json"
	_ "errors"
	"log"

	//Internal Libraries

	hostAPI "github.com/0sm0s1z/Sirius-Scan/API/hosts"
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	"github.com/streadway/amqp"
	//3rd Party Dependencies
)

type HostCVE struct {
	Host    string
	CVEList []string
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

//API Call to test any function
func NewScan(request ScanRequest) {
	//Connect to the RabbitMQ server
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"scan", // name
		false,  // durable
		false,  // delete when unused
		false,  // exclusive
		false,  // no-wait
		nil,    // arguments
	)
	failOnError(err, "Failed to declare a queue")

	request.Command = "new"

	body, error := json.Marshal(request)
	if error != nil {
		log.Fatal(error)
	}

	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	log.Println("=== Requesting Scan ===")
	failOnError(err, "Failed to publish a message")
}

func serialize(msg ScanRequest) ([]byte, error) {
	var b bytes.Buffer
	encoder := json.NewEncoder(&b)
	err := encoder.Encode(msg)
	return b.Bytes(), err
}

func deserialize(b []byte) (ScanRequest, error) {
	var msg ScanRequest
	buf := bytes.NewBuffer(b)
	decoder := json.NewDecoder(buf)
	err := decoder.Decode(&msg)
	return msg, err
}

// Update hosts in database with new findings
func SubmitFindings(cveList []HostCVE) {
	//For each host in cveList
	for _, host := range cveList {
		//Get the host from the database
		var hostRequest siriusDB.SVDBHost
		hostRequest.IP = host.Host
		hostRequest, err := hostAPI.GetHost(hostRequest)
		if err != nil {
			log.Println("Error retrieving result from DB")
		}

		//If host does not exist in the database, create it
		if hostRequest.IP == "" {
			hostRequest.IP = host.Host
			hostRequest.CVE = host.CVEList
			hostAPI.AddHost(hostRequest)
			continue
		} else {
			//If host exists in the database, update it
			//Combine the new cve list with the old cve
			hostRequest.CVE = append(hostRequest.CVE, host.CVEList...)

			//Remove duplicates from the hostRequest.CVE list
			hostRequest.CVE = removeDuplicateValues(hostRequest.CVE)

			//Update the host in the database
			hostAPI.UpdateHost(hostRequest)
		}
	}
}

func removeDuplicateValues(stringSlice []string) []string {
	keys := make(map[string]bool)
	list := []string{}

	// If the key(values of the slice) is not equal
	// to the already present value in new slice (list)
	// then we append it. else we jump on another element.
	for _, entry := range stringSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}
