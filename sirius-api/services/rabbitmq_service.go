package services

import (
	"fmt"
	"log"

	"github.com/SiriusScan/go-api/sirius/queue"
)

// RabbitMQService handles RabbitMQ operations for the API
type RabbitMQService struct {
	// No client needed since we use the static queue functions
}

// NewRabbitMQService creates a new RabbitMQ service
func NewRabbitMQService() (*RabbitMQService, error) {
	return &RabbitMQService{}, nil
}

// PublishMessage publishes a message to a RabbitMQ queue
func (r *RabbitMQService) PublishMessage(queueName string, message []byte) error {
	// Use the existing queue.Send function
	if err := queue.Send(queueName, string(message)); err != nil {
		return fmt.Errorf("failed to send message to queue %s: %w", queueName, err)
	}

	log.Printf("Message published to queue: %s", queueName)
	return nil
}

// Close closes the RabbitMQ connection (no-op since we use static functions)
func (r *RabbitMQService) Close() error {
	return nil
}
