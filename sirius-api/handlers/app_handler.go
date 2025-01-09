package handlers

import (
	"encoding/json"
	"fmt"

	"github.com/SiriusScan/go-api/sirius/queue"
	"github.com/gofiber/fiber/v2"
)

func AppHandler(c *fiber.Ctx) error {
	// Get the app name from the URL parameter
	appName := c.Params("appName")

	fmt.Println("asdf")

	// Get the message body from the POST request
	var message map[string]interface{}
	if err := c.BodyParser(&message); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Convert the message to a string (you can use JSON serialization or any other method)
	messageStr, err := convertMessageToString(message)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal Error"})
	}

	// Send the message to the queue
	if err := queue.Send(appName, messageStr); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to send message"})
	}

	// Return a success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "Message sent successfully"})
}

func convertMessageToString(message map[string]interface{}) (string, error) {
	messageBytes, err := json.Marshal(message)
	if err != nil {
		return "", err
	}
	return string(messageBytes), nil
}
