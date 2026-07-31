//go:build !pro

package main

import (
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/module"
	"github.com/gofiber/fiber/v2"
)

type testExtensionModule struct {
	module.Base
}

func (m testExtensionModule) RegisterRoutes(app *fiber.App) error {
	app.Get("/api/v1/test-extension", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})
	return nil
}

func TestCommunityModuleInventory(t *testing.T) {
	registry, err := buildModuleRegistry(nil)
	if err != nil {
		t.Fatalf("build Community registry: %v", err)
	}

	if got, want := registry.ModuleIDs(), module.CommunityModuleIDs(); !reflect.DeepEqual(got, want) {
		t.Fatalf("Community module IDs changed:\n got: %v\nwant: %v", got, want)
	}
}

func TestCommunityRouteInventory(t *testing.T) {
	registry, err := buildModuleRegistry(nil)
	if err != nil {
		t.Fatalf("build Community registry: %v", err)
	}
	app := fiber.New()
	if err := registry.Mount(app, nil, nil); err != nil {
		t.Fatalf("mount Community registry: %v", err)
	}

	got := strings.Join(module.RouteInventory(app), "\n") + "\n"
	goldenPath := filepath.Join("testdata", "community_routes.golden")
	if os.Getenv("UPDATE_GOLDEN") == "1" {
		if err := os.WriteFile(goldenPath, []byte(got), 0o644); err != nil {
			t.Fatalf("update route golden: %v", err)
		}
	}
	want, err := os.ReadFile(goldenPath)
	if err != nil {
		t.Fatalf("read route golden: %v", err)
	}
	if got != string(want) {
		t.Fatalf("Community route inventory changed; run UPDATE_GOLDEN=1 go test . after intentional review")
	}
}

func TestExtensionModuleAddsRouteWithoutChangingCommunityComposition(t *testing.T) {
	registry, err := buildModuleRegistry(nil)
	if err != nil {
		t.Fatalf("build Community registry: %v", err)
	}
	extension := testExtensionModule{Base: module.Base{
		ModuleID:      "test.extension",
		ModuleVersion: module.ContractVersion,
	}}
	if err := registry.Register(extension); err != nil {
		t.Fatalf("register extension module: %v", err)
	}

	app := fiber.New()
	if err := registry.Mount(app, nil, nil); err != nil {
		t.Fatalf("mount registry: %v", err)
	}
	response, err := app.Test(
		httptest.NewRequest(fiber.MethodGet, "/api/v1/test-extension", nil),
	)
	if err != nil {
		t.Fatalf("request extension route: %v", err)
	}
	defer response.Body.Close()
	if response.StatusCode != fiber.StatusNoContent {
		t.Fatalf("extension route status = %d, want %d", response.StatusCode, fiber.StatusNoContent)
	}
}
