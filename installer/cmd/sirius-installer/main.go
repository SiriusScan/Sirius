package main

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
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

	apiKey, wasGenerated, err := resolveInternalAPIKey(opts.OutputPath, finalVals["SIRIUS_API_KEY"], opts.Force)
	if err != nil {
		return err
	}
	if wasGenerated {
		generated["SIRIUS_API_KEY"] = apiKey
	}
	delete(finalVals, "SIRIUS_API_KEY")

	rendered := config.Render(templateFile, finalVals)
	if err := writeSecure(opts.OutputPath, rendered); err != nil {
		return err
	}

	if err := writeSiriusAPISecretFile(opts.OutputPath, apiKey); err != nil {
		return fmt.Errorf("write internal API secret file: %w", err)
	}
	if err := verifySiriusAPISecretFile(opts.OutputPath, apiKey); err != nil {
		return fmt.Errorf("verify internal API secret file: %w", err)
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

func resolveInternalAPIKey(envOutputPath, legacyEnvValue string, force bool) (string, bool, error) {
	if !force {
		if existing, err := readSiriusAPISecretFile(envOutputPath); err == nil {
			if existing != "" {
				return existing, false, nil
			}
		} else if !errors.Is(err, os.ErrNotExist) {
			return "", false, fmt.Errorf("read existing secrets/sirius_api_key.txt: %w", err)
		}
		if trimmed := strings.TrimSpace(legacyEnvValue); trimmed != "" && !config.IsPlaceholder(trimmed) {
			return trimmed, false, nil
		}
	}

	generated, err := randomHex(32)
	if err != nil {
		return "", false, err
	}
	return generated, true, nil
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

func readSiriusAPISecretFile(envOutputPath string) (string, error) {
	rootDir := filepath.Dir(envOutputPath)
	if rootDir == "" || rootDir == "." {
		rootDir = "."
	}
	path := filepath.Join(rootDir, "secrets", "sirius_api_key.txt")
	raw, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(raw)), nil
}

// writeSiriusAPISecretFile writes secrets/sirius_api_key.txt next to the .env file
// so docker compose can mount it as the sirius_api_key secret.
func writeSiriusAPISecretFile(envOutputPath, apiKey string) error {
	apiKey = strings.TrimSpace(apiKey)
	if apiKey == "" {
		return fmt.Errorf("SIRIUS_API_KEY is empty; cannot write secrets/sirius_api_key.txt")
	}
	rootDir := filepath.Dir(envOutputPath)
	if rootDir == "" || rootDir == "." {
		rootDir = "."
	}
	secDir := filepath.Join(rootDir, "secrets")
	if err := os.MkdirAll(secDir, 0o700); err != nil {
		return fmt.Errorf("create secrets directory: %w", err)
	}
	path := filepath.Join(secDir, "sirius_api_key.txt")
	content := apiKey + "\n"
	// 0644 so non-root service UIDs (e.g. 1001 in sirius-api) can read the host
	// file when Docker Compose bind-mounts it as /run/secrets/sirius_api_key.
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		return err
	}
	return nil
}

func verifySiriusAPISecretFile(envOutputPath, apiKey string) error {
	apiKey = strings.TrimSpace(apiKey)
	rootDir := filepath.Dir(envOutputPath)
	if rootDir == "" || rootDir == "." {
		rootDir = "."
	}
	path := filepath.Join(rootDir, "secrets", "sirius_api_key.txt")
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	if strings.TrimSpace(string(raw)) != apiKey {
		return fmt.Errorf("%s does not match generated internal API key", path)
	}
	return nil
}

func randomHex(numBytes int) (string, error) {
	buf := make([]byte, numBytes)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("failed to read random bytes: %w", err)
	}
	return hex.EncodeToString(buf), nil
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
