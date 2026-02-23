package main

import (
	"bufio"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/SiriusScan/sirius-installer/internal/config"
	"github.com/SiriusScan/sirius-installer/internal/prompt"
)

type cliOptions struct {
	TemplatePath     string
	OutputPath       string
	Force            bool
	NonInteractive   bool
	Quiet            bool
	PrintSecrets     bool
	NoPrintSecrets   bool
	AdminPassword    string
	NextAuthURL      string
	SiriusAPIURL     string
	NextPublicAPIURL string
	CORSOrigins      string
}

func main() {
	opts := parseFlags()
	if err := run(opts); err != nil {
		fmt.Fprintf(os.Stderr, "sirius-installer error: %v\n", err)
		os.Exit(1)
	}
}

func parseFlags() cliOptions {
	var opts cliOptions
	flag.StringVar(&opts.TemplatePath, "template", ".env.production.example", "path to .env template")
	flag.StringVar(&opts.OutputPath, "output", ".env", "path to generated .env output")
	flag.BoolVar(&opts.Force, "force", false, "regenerate required secrets even when already set")
	flag.BoolVar(&opts.NonInteractive, "non-interactive", false, "disable prompts and use generated/default values")
	flag.BoolVar(&opts.Quiet, "quiet", false, "minimize output")
	flag.BoolVar(&opts.PrintSecrets, "print-secrets", true, "print generated secrets to stdout")
	flag.BoolVar(&opts.NoPrintSecrets, "no-print-secrets", false, "never print generated secrets")
	flag.StringVar(&opts.AdminPassword, "admin-password", "", "explicit initial admin password")
	flag.StringVar(&opts.NextAuthURL, "nextauth-url", "", "override NEXTAUTH_URL")
	flag.StringVar(&opts.SiriusAPIURL, "sirius-api-url", "", "override SIRIUS_API_URL")
	flag.StringVar(&opts.NextPublicAPIURL, "next-public-sirius-api-url", "", "override NEXT_PUBLIC_SIRIUS_API_URL")
	flag.StringVar(&opts.CORSOrigins, "cors-origins", "", "override CORS_ALLOWED_ORIGINS")
	flag.Parse()
	return opts
}

func run(opts cliOptions) error {
	if opts.NoPrintSecrets {
		opts.PrintSecrets = false
	}

	templateFile, err := loadOrEmpty(opts.TemplatePath, false)
	if err != nil {
		return fmt.Errorf("failed to read template file %q: %w", opts.TemplatePath, err)
	}

	outputFile, err := loadOrEmpty(opts.OutputPath, true)
	if err != nil {
		return fmt.Errorf("failed to read output file %q: %w", opts.OutputPath, err)
	}

	cfgOpts := config.Options{
		Force:             opts.Force,
		NonInteractive:    opts.NonInteractive,
		AdminPassword:     opts.AdminPassword,
		NextAuthURL:       opts.NextAuthURL,
		SiriusAPIURL:      opts.SiriusAPIURL,
		NextPublicAPIURL:  opts.NextPublicAPIURL,
		CORSAllowedOrigin: opts.CORSOrigins,
	}

	if !opts.NonInteractive {
		cfgOpts, err = gatherInteractive(cfgOpts)
		if err != nil {
			return err
		}
	}

	merged := config.Merge(templateFile.Values, outputFile.Values, cfgOpts)
	finalVals, generated, err := config.EnsureRequired(merged, cfgOpts)
	if err != nil {
		return err
	}

	rendered := config.Render(templateFile, finalVals)
	if err := writeSecure(opts.OutputPath, rendered); err != nil {
		return err
	}

	if !opts.Quiet {
		fmt.Printf("Sirius installer wrote %s\n", opts.OutputPath)
		fmt.Println("Required startup secrets are configured.")
	}

	if opts.PrintSecrets && len(generated) > 0 {
		fmt.Println("\nGenerated values (save securely):")
		for _, key := range []string{
			"SIRIUS_API_KEY",
			"POSTGRES_PASSWORD",
			"NEXTAUTH_SECRET",
			"INITIAL_ADMIN_PASSWORD",
		} {
			if v, ok := generated[key]; ok {
				fmt.Printf("- %s=%s\n", key, v)
			}
		}
	}

	if !opts.Quiet {
		fmt.Println("\nNext step:")
		fmt.Println("docker compose up -d")
	}
	return nil
}

func gatherInteractive(in config.Options) (config.Options, error) {
	reader := bufio.NewReader(os.Stdin)

	if strings.TrimSpace(in.AdminPassword) == "" {
		pw, err := prompt.AskOptional(reader, "Initial admin password")
		if err != nil {
			return in, err
		}
		in.AdminPassword = pw
	}

	currentURL := fallback(in.NextAuthURL, "http://localhost:3000")
	url, err := prompt.Ask(reader, "NEXTAUTH_URL", currentURL)
	if err != nil {
		return in, err
	}
	in.NextAuthURL = url

	currentAPI := fallback(in.NextPublicAPIURL, "http://localhost:9001")
	pubAPI, err := prompt.Ask(reader, "NEXT_PUBLIC_SIRIUS_API_URL", currentAPI)
	if err != nil {
		return in, err
	}
	in.NextPublicAPIURL = pubAPI
	return in, nil
}

func loadOrEmpty(path string, allowMissing bool) (*config.EnvFile, error) {
	f, err := config.ParseEnvFile(path)
	if err == nil {
		return f, nil
	}
	if allowMissing && errors.Is(err, os.ErrNotExist) {
		return config.NewEmptyEnvFile(), nil
	}
	return nil, err
}

func writeSecure(path, content string) error {
	abs, err := filepath.Abs(path)
	if err == nil {
		dir := filepath.Dir(abs)
		if mkErr := os.MkdirAll(dir, 0o755); mkErr != nil {
			return fmt.Errorf("failed to create output directory %q: %w", dir, mkErr)
		}
	}

	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		return fmt.Errorf("failed writing %s: %w", path, err)
	}
	return nil
}

func fallback(v, d string) string {
	if strings.TrimSpace(v) == "" {
		return d
	}
	return v
}
