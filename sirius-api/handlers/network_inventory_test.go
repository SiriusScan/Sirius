package handlers

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

func TestScanStatusNetworkInventoryFixtures(t *testing.T) {
	data, err := os.ReadFile("testdata/network_inventory.json")
	if err != nil {
		t.Fatal(err)
	}
	var fixtures []struct {
		Name     string         `json:"name"`
		Scan     map[string]any `json:"scan"`
		Expected any            `json:"expected"`
	}
	if err := json.Unmarshal(data, &fixtures); err != nil {
		t.Fatal(err)
	}
	for _, fixture := range fixtures {
		t.Run(fixture.Name, func(t *testing.T) {
			response := projectScanStatus(fixture.Scan)
			id, _ := fixture.Scan["id"].(string)
			status, _ := fixture.Scan["status"].(string)
			if response.ID != id || response.Status != status {
				t.Fatal("projection changed the scan ID or lifecycle status")
			}
			findings, _ := fixture.Scan["vulnerabilities"].([]any)
			if response.Vulnerabilities != len(findings) {
				t.Fatal("projection changed the live finding count")
			}

			data, err := json.Marshal(response)
			if err != nil {
				t.Fatal(err)
			}
			var fields map[string]any
			if err := json.Unmarshal(data, &fields); err != nil {
				t.Fatal(err)
			}
			actual, present := fields["network_inventory"]
			if present != (fixture.Expected != nil) || !reflect.DeepEqual(actual, fixture.Expected) {
				t.Errorf("network inventory = %#v, want %#v", actual, fixture.Expected)
			}
		})
	}
}
