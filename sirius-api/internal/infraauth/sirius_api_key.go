package infraauth

import (
	"errors"
	"fmt"
	"os"
	"strings"
)

// LoadSiriusAPIKey returns the internal Sirius API key for service-to-service
// HTTP calls. It prefers SIRIUS_API_KEY_FILE (file contents, trimmed) and
// falls back to SIRIUS_API_KEY. If the file path is set but the file is absent
// (typical when env is copied from templates without a compose secret mount),
// it falls back to SIRIUS_API_KEY like sirius-ui does.
func LoadSiriusAPIKey() (string, error) {
	if p := strings.TrimSpace(os.Getenv("SIRIUS_API_KEY_FILE")); p != "" {
		b, err := os.ReadFile(p)
		if err == nil {
			if k := strings.TrimSpace(string(b)); k != "" {
				return k, nil
			}
		} else if !errors.Is(err, os.ErrNotExist) {
			return "", fmt.Errorf("read SIRIUS_API_KEY_FILE %q: %w", p, err)
		}
	}
	if k := strings.TrimSpace(os.Getenv("SIRIUS_API_KEY")); k != "" {
		return k, nil
	}
	return "", errors.New("set SIRIUS_API_KEY_FILE or SIRIUS_API_KEY for internal API authentication")
}
