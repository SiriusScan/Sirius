package main

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestSchemaStartupOptions(t *testing.T) {
	tests := []struct {
		name, mode, timeout string
		wantMode            string
		wantTimeout         time.Duration
		wantError           bool
	}{
		{name: "legacy default", wantMode: "apply", wantTimeout: 10 * time.Minute},
		{name: "standalone apply", mode: "apply", wantMode: "apply", wantTimeout: 10 * time.Minute},
		{name: "verify with override", mode: " verify ", timeout: "2m", wantMode: "verify", wantTimeout: 2 * time.Minute},
		{name: "invalid mode", mode: "disabled", wantError: true},
		{name: "invalid timeout", timeout: "soon", wantError: true},
		{name: "zero timeout", timeout: "0s", wantError: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Setenv("SIRIUS_SCHEMA_MODE", test.mode)
			t.Setenv("SIRIUS_SCHEMA_STARTUP_TIMEOUT", test.timeout)
			mode, timeout, err := schemaStartupOptions()
			if (err != nil) != test.wantError || mode != test.wantMode || timeout != test.wantTimeout {
				t.Fatalf("got mode=%q timeout=%s err=%v", mode, timeout, err)
			}
		})
	}
}

func TestWaitForDatabaseHonorsCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	if err := waitForDatabase(ctx); !errors.Is(err, context.Canceled) {
		t.Fatalf("canceled database wait returned %v", err)
	}
}
