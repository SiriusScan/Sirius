package mq

import (
	"github.com/streadway/amqp"
)

func ConnectToRabbitMQ() (*amqp.Connection, error) {
	//Connect to RabbitMQ
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	return conn, err
}
