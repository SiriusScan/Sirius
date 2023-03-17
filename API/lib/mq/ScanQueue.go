package mq

import (
	"encoding/json"
	"log"
	"strings"

	hostAPI "github.com/0sm0s1z/Sirius-Scan/API/hosts"
	scanAPI "github.com/0sm0s1z/Sirius-Scan/API/scan"
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
)

//ScanQueue is subscribed to the RabbitMQ for scan requests
// For each request, it will create a new scan and add it to the database
func ScanQueue() {
	//Connect to the RabbitMQ
	conn, err := ConnectToRabbitMQ()
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"scan-report", // name
		false,         // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			//Serialize the message into a ScanRequest struct
			var scanJob scanAPI.ScanRequest
			err = json.Unmarshal(d.Body, &scanJob)
			if err != nil {
				log.Fatal(err)
			}

			//Retrieve the current scan report from the database
			//Check if scan already exists
			var newRequest scanAPI.ScanRequest
			newRequest = scanAPI.GetScanReport(scanJob.ScanID)
			if newRequest.ScanID == "" {
				scanAPI.NewScanReport(scanJob)
			}

			//Get the last host in the scan report
			var host siriusDB.SVDBHost
			host = scanJob.ScanReport.ScanResults[len(scanJob.ScanReport.ScanResults)-1]

			if scanJob.Command == "scanVulnerability" {
				//scanAPI.NewScanReport(scanJob)
			} else if scanJob.Command == "complete" {
				//Remove duplicate CVEs
				host.CVE = removeDuplicates(host.CVE)

				//Add the host to the list of completed hosts
				newRequest.ScanReport.CompletedHosts = append(scanJob.ScanReport.CompletedHosts, host.IP)
				//Add the new host to the scan report
				newRequest.ScanReport.ScanResults = append(newRequest.ScanReport.ScanResults, host)

				//Check if the host already exists in the database
				//If it does, update the host
				//If it doesn't, add the host
				if hostAPI.CheckIfHostExists(host.IP) {
					hostAPI.UpdateHost(host)
				} else {
					hostAPI.AddHost(host)
				}

				//Update scan report
				scanAPI.UpdateScanReport(newRequest)

				log.Println("=== Scan Complete: " + scanJob.ScanReport.ScanResults[0].IP + " ===")
			}
		}
	}()

	log.Printf(" [*] API Scan Queue is now listening.")
	<-forever
}

func removeDuplicates(strs []string) []string {
	unique := make(map[string]bool)
	result := []string{}

	for _, str := range strs {
		//remove trailing whitespace
		str = strings.TrimSpace(str)
		if !unique[str] {
			unique[str] = true
			result = append(result, str)
		}
	}

	return result
}
