package lib

import (
	"encoding/json"

	"github.com/streadway/amqp"
)

func SendToQueue(scanRequest ScanRequest, queueName string) {
	//Connect to RabbitMQ
	conn, err := ConnectToRabbitMQ()
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	//Open a channel
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	//Declare a queue
	q, err := ch.QueueDeclare(
		queueName, // name
		false,     // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Failed to declare a queue")

	//Publish a message
	body, err := json.Marshal(scanRequest)
	failOnError(err, "Failed to marshal scan request")
	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "text/plain",
			Body:         []byte(body),
		})
	failOnError(err, "Failed to publish a message")
}

func ConnectToRabbitMQ() (*amqp.Connection, error) {
	//Connect to RabbitMQ
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	return conn, err
}
