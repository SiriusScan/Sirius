package prompt

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func Ask(reader *bufio.Reader, message, fallback string) (string, error) {
	if _, err := fmt.Fprintf(os.Stdout, "%s [%s]: ", message, fallback); err != nil {
		return "", err
	}
	raw, err := reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	val := strings.TrimSpace(raw)
	if val == "" {
		return fallback, nil
	}
	return val, nil
}

func AskOptional(reader *bufio.Reader, message string) (string, error) {
	if _, err := fmt.Fprintf(os.Stdout, "%s (leave blank to auto-generate): ", message); err != nil {
		return "", err
	}
	raw, err := reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(raw), nil
}
