package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"os"
	"strings"
	"time"

	"github.com/SiriusScan/go-api/sirius/migrate"
	"github.com/SiriusScan/go-api/sirius/postgres"
)

func schemaStartupOptions() (string, time.Duration, error) {
	mode := strings.TrimSpace(os.Getenv("SIRIUS_SCHEMA_MODE"))
	switch mode {
	case "":
		mode = "apply"
	case "apply", "verify":
	default:
		return "", 0, fmt.Errorf("SIRIUS_SCHEMA_MODE must be apply or verify, got %q", mode)
	}

	timeout := 10 * time.Minute
	if value := strings.TrimSpace(os.Getenv("SIRIUS_SCHEMA_STARTUP_TIMEOUT")); value != "" {
		var err error
		timeout, err = time.ParseDuration(value)
		if err != nil || timeout <= 0 {
			return "", 0, fmt.Errorf("SIRIUS_SCHEMA_STARTUP_TIMEOUT must be a positive Go duration, got %q", value)
		}
	}
	return mode, timeout, nil
}

func prepareDatabase(ctx context.Context) error {
	mode, timeout, err := schemaStartupOptions()
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	if !postgres.IsConnected() {
		if err := waitForDatabase(ctx); err != nil {
			return fmt.Errorf("wait for database: %w", err)
		}
	}

	if mode == "apply" {
		if err := migrate.UpFromDefaultContext(ctx); err != nil {
			return fmt.Errorf("apply core schema migrations: %w", err)
		}
	} else {
		db := postgres.GetDB()
		if err := ctx.Err(); err != nil {
			return err
		}
		if db == nil {
			if err := postgres.GetConnectionError(); err != nil {
				return fmt.Errorf("connect for schema verification: %w", err)
			}
			return fmt.Errorf("database not connected for schema verification")
		}
		if err := migrate.VerifyContext(ctx, db); err != nil {
			var pending *migrate.PendingVersionsError
			if errors.As(err, &pending) {
				return fmt.Errorf("run the one-shot migrator before starting the API: %w", pending)
			}
			return fmt.Errorf("verify core schema: %w", err)
		}
	}

	slog.Info("Database schema ready", "mode", mode)
	return nil
}

func waitForDatabase(ctx context.Context) error {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = os.Getenv("POSTGRES_HOST")
	}
	port := "5432"
	if host == "" {
		host = "localhost"
		if _, err := os.Stat("/.dockerenv"); err == nil {
			host = "sirius-postgres"
		}
	} else {
		if envPort := os.Getenv("DB_PORT"); envPort != "" {
			port = envPort
		} else if envPort := os.Getenv("POSTGRES_PORT"); envPort != "" {
			port = envPort
		}
	}

	address := net.JoinHostPort(host, port)
	slog.Info("Waiting for database", "address", address)
	dialer := net.Dialer{Timeout: 3 * time.Second}
	for attempt := 1; ; attempt++ {
		conn, err := dialer.DialContext(ctx, "tcp", address)
		if err == nil {
			_ = conn.Close()
			return nil
		}
		if attempt == 30 {
			return fmt.Errorf("database not available after %d attempts: %w", attempt, err)
		}
		slog.Debug("Database not ready, retrying", "attempt", attempt, "max", 30)
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(2 * time.Second):
		}
	}
}
