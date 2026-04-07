package infraauth

import (
	"errors"
	"fmt"
	"os"
	"strings"
)

// LoadSiriusAPIKey returns the internal Sirius API key for service-to-service
// HTTP calls. It prefers SIRIUS_API_KEY_FILE (file contents, trimmed) and
// falls back to SIRIUS_API_KEY.
func LoadSiriusAPIKey() (string, error) {
	if p := strings.TrimSpace(os.Getenv("SIRIUS_API_KEY_FILE")); p != "" {
		b, err := os.ReadFile(p)
		if err != nil {
			return "", fmt.Errorf("read SIRIUS_API_KEY_FILE %q: %w", p, err)
		}
		if k := strings.TrimSpace(string(b)); k != "" {
			return k, nil
		}
	}
	if k := strings.TrimSpace(os.Getenv("SIRIUS_API_KEY")); k != "" {
		return k, nil
	}
	return "", errors.New("set SIRIUS_API_KEY_FILE or SIRIUS_API_KEY for internal API authentication")
}
