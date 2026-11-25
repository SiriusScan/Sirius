package handlers

import (
	"context"
	"time"

	"github.com/SiriusScan/sirius-api/services"
	"github.com/gofiber/fiber/v2"
)

type NetworkScanSubmitter interface {
	SubmitNetworkScan(context.Context, services.NetworkScanRequest) services.NetworkScanReceipt
}

func SubmitNetworkScan(admission NetworkScanSubmitter) fiber.Handler {
	return func(c *fiber.Ctx) error {
		request := services.NetworkScanRequest{Priority: 3}
		if err := c.BodyParser(&request); err != nil || !request.Valid() {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid network scan submission"})
		}
		if admission == nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(services.NetworkScanReceipt{
				ScanID: request.ScanID, Outcome: services.NetworkScanNotRecorded,
			})
		}
		ctx, cancel := context.WithTimeout(c.UserContext(), 12*time.Second)
		defer cancel()

		receipt := admission.SubmitNetworkScan(ctx, request)
		status := fiber.StatusAccepted
		switch receipt.Outcome {
		case services.NetworkScanBusy:
			status = fiber.StatusConflict
		case services.NetworkScanNotRecorded:
			status = fiber.StatusServiceUnavailable
		case services.NetworkScanFailed:
			status = fiber.StatusBadGateway
		}
		return c.Status(status).JSON(receipt)
	}
}
