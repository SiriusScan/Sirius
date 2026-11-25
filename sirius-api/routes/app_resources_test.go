package routes

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/SiriusScan/sirius-api/middleware"
	"github.com/SiriusScan/sirius-api/services"
	"github.com/gofiber/fiber/v2"
)

func TestResourcesRouteRequiresKeyAndReportsStoreOutage(t *testing.T) {
	const fixtureKey = "test-resources-key"
	app := fiber.New()
	app.Use(middleware.APIKeyMiddleware(nil, fixtureKey))
	(&AppRouteSetter{Monitor: services.NewValkeyMonitorService(nil)}).SetupRoutes(app)

	for _, test := range []struct {
		key    string
		status int
	}{
		{"", fiber.StatusUnauthorized},
		{fixtureKey, fiber.StatusServiceUnavailable},
	} {
		req := httptest.NewRequest(fiber.MethodGet, "/api/v1/system/resources", nil)
		if test.key != "" {
			req.Header.Set("X-API-Key", test.key)
		}
		response, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if response.StatusCode != test.status {
			response.Body.Close()
			t.Fatalf("status = %d, want %d", response.StatusCode, test.status)
		}
		if test.status == fiber.StatusServiceUnavailable {
			var payload services.SystemResourcesObservation
			if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
				response.Body.Close()
				t.Fatal(err)
			}
			if payload.Availability != "unavailable" || payload.Summary.FreshContainers != 0 || payload.Summary.RunningContainers != 0 {
				response.Body.Close()
				t.Fatalf("outage returned live measurements: %+v", payload)
			}
		}
		response.Body.Close()
	}
}
