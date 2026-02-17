package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	noColor := flag.Bool("no-color", false, "Disable ANSI color output")
	verbose := flag.Bool("verbose", false, "Enable verbose output")
	suiteFlag := flag.String("suite", "", "Run only a specific suite (api, trpc, grpc, services, headers, auth-surface)")
	flag.Parse()

	cfg := LoadConfig()
	cfg.NoColor = *noColor
	cfg.Verbose = *verbose

	report := NewReport(cfg.NoColor)

	// Map of available suites.
	type suiteRunner struct {
		name string
		fn   func(*Config) SuiteResult
	}

	allSuites := []suiteRunner{
		{"api", RunAPISuite},
		{"trpc", RunTRPCSuite},
		{"grpc", RunGRPCSuite},
		{"services", RunServicesSuite},
		{"headers", RunHeadersSuite},
		{"auth-surface", RunAuthSurfaceSuite},
	}

	// Filter to a single suite if requested.
	suitesToRun := allSuites
	if *suiteFlag != "" {
		suitesToRun = nil
		for _, s := range allSuites {
			if s.name == *suiteFlag {
				suitesToRun = append(suitesToRun, s)
				break
			}
		}
		if len(suitesToRun) == 0 {
			fmt.Fprintf(os.Stderr, "Unknown suite %q. Available: api, trpc, grpc, services, headers, auth-surface\n", *suiteFlag)
			os.Exit(2)
		}
	}

	// Run selected suites.
	for _, s := range suitesToRun {
		result := s.fn(cfg)
		report.AddSuite(result)
	}

	// Print report.
	report.Print()

	// Exit code 1 if any hard failures.
	if report.HasFailures() {
		os.Exit(1)
	}
}
