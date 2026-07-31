//go:build !pro

package main

import (
	"path/filepath"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/module"
	"github.com/SiriusScan/sirius-api/internal/contract"
	"github.com/gofiber/fiber/v2"
)

func TestLiveRouteContractCoverage(t *testing.T) {
	registry, err := buildModuleRegistry(nil)
	if err != nil {
		t.Fatalf("build Community registry: %v", err)
	}
	app := fiber.New()
	if err := registry.Mount(app, nil, nil); err != nil {
		t.Fatalf("mount Community registry: %v", err)
	}

	liveLines := module.RouteInventory(app)
	live, err := contract.ParseInventoryLines(strings.Join(liveLines, "\n") + "\n")
	if err != nil {
		t.Fatalf("parse live inventory: %v", err)
	}

	root := contract.ModuleRoot()
	class, err := contract.LoadClassification(filepath.Join(root, contract.DefaultClassificationPath))
	if err != nil {
		t.Fatalf("load classification: %v", err)
	}
	spec, err := contract.LoadOpenAPI(filepath.Join(root, contract.DefaultOpenAPIPath))
	if err != nil {
		t.Fatalf("load openapi: %v", err)
	}

	if err := contract.ValidateContract(live, class, spec); err != nil {
		t.Fatalf("live Fiber inventory drifted from OpenAPI/classification: %v", err)
	}
}

func TestUnclassifiedLiveRouteIsRejected(t *testing.T) {
	root := contract.ModuleRoot()
	class, err := contract.LoadClassification(filepath.Join(root, contract.DefaultClassificationPath))
	if err != nil {
		t.Fatalf("load classification: %v", err)
	}
	spec, err := contract.LoadOpenAPI(filepath.Join(root, contract.DefaultOpenAPIPath))
	if err != nil {
		t.Fatalf("load openapi: %v", err)
	}
	live, err := contract.LoadGoldenInventory(filepath.Join(root, contract.DefaultGoldenPath))
	if err != nil {
		t.Fatalf("load golden: %v", err)
	}
	live = append(live, contract.LiveRoute{Method: "GET", Path: "/api/v1/unclassified-canary"})
	err = contract.ValidateContract(live, class, spec)
	if err == nil {
		t.Fatal("expected unclassified live route to fail")
	}
	if !strings.Contains(err.Error(), "unclassified live route: GET\t/api/v1/unclassified-canary") &&
		!strings.Contains(err.Error(), "unclassified live route: GET /api/v1/unclassified-canary") &&
		!strings.Contains(err.Error(), "classification count") {
		t.Fatalf("unexpected error: %v", err)
	}
}
