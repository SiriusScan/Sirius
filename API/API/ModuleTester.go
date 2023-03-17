package APIHandler

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"

	scanAPI "github.com/0sm0s1z/Sirius-Scan/API/scan"
	siriusHelper "github.com/0sm0s1z/Sirius-Scan/lib/utils"
	"github.com/gin-gonic/gin"
	"github.com/streadway/amqp"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

//API Call to test any function
func TestFunction(c *gin.Context) {

	//Get the status of the API from the database
	//var result SystemStatus
	result := "OK"

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

	var request scanAPI.ScanRequest
	if c.ShouldBind(&request) == nil {
		//log.Println("Request Received")
	}

	var scanJob scanAPI.ScanRequest
	scanID := "scan-" + siriusHelper.RandomString(10)

	scanJob.ScanID = scanID
	scanJob.Command = "new"
	scanJob.Targets = request.Targets

	body, error := json.Marshal(scanJob)
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

	c.IndentedJSON(http.StatusOK, result)
}

func serialize(msg scanAPI.ScanRequest) ([]byte, error) {
	var b bytes.Buffer
	encoder := json.NewEncoder(&b)
	err := encoder.Encode(msg)
	return b.Bytes(), err
}

func deserialize(b []byte) (scanAPI.ScanRequest, error) {
	var msg scanAPI.ScanRequest
	buf := bytes.NewBuffer(b)
	decoder := json.NewDecoder(buf)
	err := decoder.Decode(&msg)
	return msg, err
}
