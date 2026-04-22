package config

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/url"
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

// templateAuthoritativeKeys are keys whose template definition always wins,
// even when the user's existing .env has a non-empty value. This exists so
// that intentional template changes (e.g. clearing IMAGE_TAG so compose can
// resolve the default `latest` tag) propagate to upgraders. Without this,
// stale values written by older template versions become permanently sticky
// because Merge otherwise prefers any non-empty existing value.
//
// Only add a key here when the template is the source of truth for it AND
// shipping a stale legacy value would break upgrades. IMAGE_TAG is the
// canonical case: v1.0.0's template hard-coded IMAGE_TAG=v1.0.0, which
// pinned every upgrader to that release until manually edited.
var templateAuthoritativeKeys = map[string]struct{}{
	"IMAGE_TAG": {},
}

func Merge(templateVals, existingVals map[string]string, opts Options) map[string]string {
	out := make(map[string]string, len(templateVals)+len(existingVals)+8)
	for k, v := range templateVals {
		out[k] = v
	}
	for k, v := range existingVals {
		if _, authoritative := templateAuthoritativeKeys[k]; authoritative {
			if _, definedInTemplate := templateVals[k]; definedInTemplate {
				continue
			}
		}
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

	// Rebuild DATABASE_URL when it is missing/placeholder or when the
	// password was just generated (so the URL always matches the password).
	dbURL := strings.TrimSpace(values["DATABASE_URL"])
	_, pwRegenerated := generated["POSTGRES_PASSWORD"]
	if dbURL == "" || pwRegenerated {
		values["DATABASE_URL"] = BuildDatabaseURL(values)
	}

	// Default in-container path for Docker Compose secret mount (see docker-compose.yaml).
	if strings.TrimSpace(values["SIRIUS_API_KEY_FILE"]) == "" {
		values["SIRIUS_API_KEY_FILE"] = "/run/secrets/sirius_api_key"
	}

	return values, generated, nil
}

// BuildDatabaseURL assembles a PostgreSQL connection URL from individual
// POSTGRES_* values. It uses net/url to properly encode the userinfo so
// passwords containing @, :, /, spaces, etc. are safe.
func BuildDatabaseURL(values map[string]string) string {
	user := valueOr(values, "POSTGRES_USER", "postgres")
	pass := values["POSTGRES_PASSWORD"]
	host := valueOr(values, "POSTGRES_HOST", "sirius-postgres")
	port := valueOr(values, "POSTGRES_PORT", "5432")
	db := valueOr(values, "POSTGRES_DB", "sirius")

	u := &url.URL{
		Scheme: "postgresql",
		User:   url.UserPassword(user, pass),
		Host:   fmt.Sprintf("%s:%s", host, port),
		Path:   "/" + db,
	}
	return u.String()
}

func valueOr(m map[string]string, key, fallback string) string {
	if v := strings.TrimSpace(m[key]); v != "" {
		return v
	}
	return fallback
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
