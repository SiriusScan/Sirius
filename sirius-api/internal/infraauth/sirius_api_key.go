package infraauth

import (
	"fmt"
	"os"
	"strings"
)

// LoadSiriusAPIKey returns the internal Sirius API key for service-to-service
// HTTP calls from the mounted secret file. Sirius uses a hard file-backed
// contract at runtime: SIRIUS_API_KEY_FILE must point at a readable secret.
func LoadSiriusAPIKey() (string, error) {
	p := strings.TrimSpace(os.Getenv("SIRIUS_API_KEY_FILE"))
	if p == "" {
		return "", fmt.Errorf("set SIRIUS_API_KEY_FILE to a readable internal API key secret")
	}

	b, err := os.ReadFile(p)
	if err != nil {
		return "", fmt.Errorf("read SIRIUS_API_KEY_FILE %q: %w", p, err)
	}

	k := strings.TrimSpace(string(b))
	if k == "" {
		return "", fmt.Errorf("SIRIUS_API_KEY_FILE %q is empty", p)
	}
	return k, nil
}
