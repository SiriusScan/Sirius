package contract

import "os"

func writeFileMode(path, content string) error {
	return os.WriteFile(path, []byte(content), 0o644)
}
