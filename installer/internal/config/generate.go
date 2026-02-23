package config

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"
)

type Options struct {
	Force             bool
	NonInteractive    bool
	AdminPassword     string
	NextAuthURL       string
	SiriusAPIURL      string
	NextPublicAPIURL  string
	CORSAllowedOrigin string
}

func Merge(templateVals, existingVals map[string]string, opts Options) map[string]string {
	out := make(map[string]string, len(templateVals)+len(existingVals)+8)
	for k, v := range templateVals {
		out[k] = v
	}
	for k, v := range existingVals {
		if strings.TrimSpace(v) != "" {
			out[k] = v
		}
	}

	applyOpt(out, "INITIAL_ADMIN_PASSWORD", opts.AdminPassword)
	applyOpt(out, "NEXTAUTH_URL", opts.NextAuthURL)
	applyOpt(out, "SIRIUS_API_URL", opts.SiriusAPIURL)
	applyOpt(out, "NEXT_PUBLIC_SIRIUS_API_URL", opts.NextPublicAPIURL)
	applyOpt(out, "CORS_ALLOWED_ORIGINS", opts.CORSAllowedOrigin)

	return out
}

func EnsureRequired(values map[string]string, opts Options) (map[string]string, map[string]string, error) {
	generated := map[string]string{}

	if shouldGenerate(values["SIRIUS_API_KEY"], opts.Force) {
		s, err := randomHex(32)
		if err != nil {
			return nil, nil, err
		}
		values["SIRIUS_API_KEY"] = s
		generated["SIRIUS_API_KEY"] = s
	}

	if shouldGenerate(values["POSTGRES_PASSWORD"], opts.Force) {
		s, err := randomHex(16)
		if err != nil {
			return nil, nil, err
		}
		values["POSTGRES_PASSWORD"] = s
		generated["POSTGRES_PASSWORD"] = s
	}

	if shouldGenerate(values["NEXTAUTH_SECRET"], opts.Force) {
		s, err := randomHex(32)
		if err != nil {
			return nil, nil, err
		}
		values["NEXTAUTH_SECRET"] = s
		generated["NEXTAUTH_SECRET"] = s
	}

	if shouldGenerate(values["INITIAL_ADMIN_PASSWORD"], opts.Force) {
		if strings.TrimSpace(opts.AdminPassword) != "" {
			values["INITIAL_ADMIN_PASSWORD"] = opts.AdminPassword
		} else {
			s, err := randomBase64(12)
			if err != nil {
				return nil, nil, err
			}
			values["INITIAL_ADMIN_PASSWORD"] = s
			generated["INITIAL_ADMIN_PASSWORD"] = s
		}
	}

	if strings.TrimSpace(values["INITIAL_ADMIN_PASSWORD"]) == "" {
		return nil, nil, fmt.Errorf("INITIAL_ADMIN_PASSWORD is required")
	}

	return values, generated, nil
}

func IsPlaceholder(v string) bool {
	s := strings.ToLower(strings.TrimSpace(v))
	if s == "" {
		return true
	}

	placeholders := []string{
		"password",
		"postgres",
		"change-me",
		"change_this",
		"dummy",
		"placeholder",
		"your_",
		"your-",
		"test-secret",
		"ci-placeholder-api-key",
	}
	for _, p := range placeholders {
		if strings.Contains(s, p) {
			return true
		}
	}
	return false
}

func shouldGenerate(v string, force bool) bool {
	return force || IsPlaceholder(v)
}

func applyOpt(values map[string]string, key, val string) {
	if strings.TrimSpace(val) != "" {
		values[key] = val
	}
}

func randomHex(numBytes int) (string, error) {
	buf := make([]byte, numBytes)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("failed to read random bytes: %w", err)
	}
	return hex.EncodeToString(buf), nil
}

func randomBase64(numBytes int) (string, error) {
	buf := make([]byte, numBytes)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("failed to read random bytes: %w", err)
	}
	return base64.RawStdEncoding.EncodeToString(buf), nil
}
