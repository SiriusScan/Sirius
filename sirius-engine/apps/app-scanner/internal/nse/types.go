package nse

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

const (
	// NSERepoURL is the Git repository URL for Sirius NSE scripts
	NSERepoURL = "https://github.com/SiriusScan/sirius-nse.git"
	// ManifestFile is the name of the manifest file
	ManifestFile = "manifest.json"
	// ValKeyManifestKey is the key used to store the manifest in ValKey
	ValKeyManifestKey = "nse:manifest"
	// ValKeyScriptPrefix is the prefix for script content keys in ValKey
	ValKeyScriptPrefix = "nse:script:"
	// ValKeyScriptMetaPrefix is the prefix for script metadata keys in ValKey
	ValKeyScriptMetaPrefix = "nse:meta:"
)

// NSEBasePath is the base path where NSE scripts are stored
var NSEBasePath = "/opt/sirius-nse"

// Script represents a single NSE script
type Script struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	Protocol string `json:"protocol"`
}

// Manifest represents the NSE scripts manifest
type Manifest struct {
	Name        string            `json:"name"`
	Version     string            `json:"version"`
	Description string            `json:"description"`
	Scripts     map[string]Script `json:"scripts"`
}

// ScriptContent represents a script's content and metadata in the KV store
type ScriptContent struct {
	Content   string   `json:"content"`   // The actual script content
	Metadata  Metadata `json:"metadata"`  // Script metadata
	UpdatedAt int64    `json:"updatedAt"` // Unix timestamp of last update
}

// Metadata represents additional information about a script
type Metadata struct {
	Author      string   `json:"author"`
	Tags        []string `json:"tags"`
	Description string   `json:"description"`
}

// LoadManifest loads a manifest from a file
func LoadManifest(path string) (*Manifest, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read manifest file: %w", err)
	}

	var manifest Manifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, fmt.Errorf("failed to unmarshal manifest: %w", err)
	}

	return &manifest, nil
}

// SaveManifest saves a manifest to a file
func SaveManifest(manifest *Manifest, path string) error {
	data, err := json.MarshalIndent(manifest, "", "    ")
	if err != nil {
		return fmt.Errorf("failed to marshal manifest: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return fmt.Errorf("failed to create manifest directory: %w", err)
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("failed to write manifest file: %w", err)
	}

	return nil
}
