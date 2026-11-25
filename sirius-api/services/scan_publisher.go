package services

import (
	"context"
	"net"
	"os"
	"strings"

	"github.com/SiriusScan/go-api/sirius/queue"
	"github.com/streadway/amqp"
)

// RabbitMQScanPublisher keeps its configuration for the process lifetime and
// releases each submission's AMQP resources once the bounded publish ends.
type RabbitMQScanPublisher struct {
	address string
}

func NewRabbitMQScanPublisher() *RabbitMQScanPublisher {
	address := strings.TrimSpace(os.Getenv("RABBITMQ_URL"))
	if address == "" {
		address = queue.SIRIUS_RABBITMQ
	}
	return &RabbitMQScanPublisher{address: address}
}

func (p *RabbitMQScanPublisher) PublishNetworkScan(ctx context.Context, body []byte) ScanPublication {
	dialer := net.Dialer{}
	var stop func() bool
	defer func() {
		if stop != nil {
			stop()
		}
	}()
	conn, err := amqp.DialConfig(p.address, amqp.Config{
		Dial: func(network, address string) (net.Conn, error) {
			socket, err := dialer.DialContext(ctx, network, address)
			if err != nil {
				return nil, err
			}
			// AMQP clears the socket deadline after its handshake. Close at
			// context expiry to bound handshake and later channel operations.
			stop = context.AfterFunc(ctx, func() { _ = socket.Close() })
			return socket, nil
		},
	})
	if err != nil {
		return ScanPublicationNotSent
	}
	defer conn.Close()

	channel, err := conn.Channel()
	if err != nil {
		return ScanPublicationNotSent
	}
	defer channel.Close()

	declared, err := channel.QueueDeclare("scan", false, false, false, false, nil)
	if err != nil || ctx.Err() != nil {
		return ScanPublicationNotSent
	}
	if err := channel.Publish("", declared.Name, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        body,
	}); err != nil {
		return ScanPublicationUnconfirmed
	}
	return ScanPublicationSubmitted
}
