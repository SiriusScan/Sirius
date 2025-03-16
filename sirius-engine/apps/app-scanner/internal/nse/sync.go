package nse

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/SiriusScan/go-api/sirius/store"
)

const (
	// ManifestPath is the path to the manifest file
	ManifestPath = "manifest.json"
)

// Repository represents a NSE script repository
type Repository struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

// RepositoryList represents the manifest file structure
type RepositoryList struct {
	Repositories []Repository `json:"repositories"`
}

// SyncManager handles synchronization between local NSE scripts and ValKey store
type SyncManager struct {
	repoManager *RepoManager
	kvStore     store.KVStore
}

// NewSyncManager creates a new SyncManager instance
func NewSyncManager(repoManager *RepoManager, kvStore store.KVStore) *SyncManager {
	return &SyncManager{
		repoManager: repoManager,
		kvStore:     kvStore,
	}
}

// loadRepositories loads the repository list from manifest.json
func (sm *SyncManager) loadRepositories() (*RepositoryList, error) {
	data, err := os.ReadFile(ManifestPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read manifest file: %w", err)
	}

	var repoList RepositoryList
	if err := json.Unmarshal(data, &repoList); err != nil {
		return nil, fmt.Errorf("failed to unmarshal repository list: %w", err)
	}

	return &repoList, nil
}

// Sync synchronizes the local NSE scripts with the ValKey store
func (sm *SyncManager) Sync(ctx context.Context) error {
	// Load repositories from manifest
	repoList, err := sm.loadRepositories()
	if err != nil {
		return fmt.Errorf("failed to load repositories: %w", err)
	}

	// Ensure base directory exists
	if err := os.MkdirAll(NSEBasePath, 0755); err != nil {
		return fmt.Errorf("failed to create NSE base directory: %w", err)
	}

	// Clone/update each repository
	for _, repo := range repoList.Repositories {
		repoPath := filepath.Join(NSEBasePath, repo.Name)
		repoManager := NewRepoManager(repoPath, repo.URL)

		if err := repoManager.EnsureRepo(); err != nil {
			return fmt.Errorf("failed to ensure repository %s: %w", repo.Name, err)
		}

		// Get local manifest
		localManifest, err := repoManager.GetManifest()
		if err != nil {
			return fmt.Errorf("failed to get local manifest for %s: %w", repo.Name, err)
		}

		// Get ValKey manifest
		valKeyManifest, err := sm.getValKeyManifest(ctx)
		if err != nil {
			log.Printf("Warning: failed to get ValKey manifest: %v, using local manifest", err)
			valKeyManifest = localManifest
		}

		// Compare and update scripts
		if err := sm.syncScripts(localManifest, valKeyManifest); err != nil {
			return fmt.Errorf("failed to sync scripts for %s: %w", repo.Name, err)
		}

		// Update ValKey manifest
		if err := sm.updateValKeyManifest(ctx, localManifest); err != nil {
			return fmt.Errorf("failed to update ValKey manifest for %s: %w", repo.Name, err)
		}
	}

	return nil
}

// getValKeyManifest retrieves the manifest from ValKey store
func (sm *SyncManager) getValKeyManifest(ctx context.Context) (*Manifest, error) {
	resp, err := sm.kvStore.GetValue(ctx, ValKeyManifestKey)
	if err != nil {
		return nil, err
	}

	var manifest Manifest
	if err := json.Unmarshal([]byte(resp.Message.Value), &manifest); err != nil {
		return nil, fmt.Errorf("failed to unmarshal ValKey manifest: %w", err)
	}

	return &manifest, nil
}

// updateValKeyManifest updates the manifest in ValKey store
func (sm *SyncManager) updateValKeyManifest(ctx context.Context, manifest *Manifest) error {
	data, err := json.Marshal(manifest)
	if err != nil {
		return fmt.Errorf("failed to marshal manifest: %w", err)
	}

	if err := sm.kvStore.SetValue(ctx, ValKeyManifestKey, string(data)); err != nil {
		return fmt.Errorf("failed to update ValKey manifest: %w", err)
	}

	return nil
}

// syncScripts synchronizes scripts between local and ValKey store
func (sm *SyncManager) syncScripts(local, valKey *Manifest) error {
	// First, sync the manifest
	if err := sm.updateValKeyManifest(context.Background(), local); err != nil {
		return fmt.Errorf("failed to update ValKey manifest: %w", err)
	}

	// Sync each script's content
	for id, script := range local.Scripts {
		if err := sm.syncScriptContent(id, script); err != nil {
			log.Printf("Warning: failed to sync script %s: %v", id, err)
			continue
		}
	}

	return nil
}

// syncScriptContent synchronizes a single script's content with the KV store
func (sm *SyncManager) syncScriptContent(id string, script Script) error {
	// Create script directory if it doesn't exist
	scriptPath := filepath.Join(NSEBasePath, script.Path)
	if err := os.MkdirAll(filepath.Dir(scriptPath), 0755); err != nil {
		return fmt.Errorf("failed to create script directory: %w", err)
	}

	// Read local script content
	localContent, err := os.ReadFile(scriptPath)
	if err != nil {
		if !os.IsNotExist(err) {
			return fmt.Errorf("failed to read script file: %w", err)
		}
		// If file doesn't exist, create it with empty content
		localContent = []byte{}
	}

	// Get script content from ValKey
	kvContent, err := sm.getScriptContent(context.Background(), id)
	if err != nil {
		if err.Error() == "key not found" { // ValKey's not found error
			// Create new script content
			newContent := &ScriptContent{
				Content: string(localContent),
				Metadata: Metadata{
					Author:      "Unknown", // Default values, can be updated through UI
					Tags:        []string{script.Protocol},
					Description: fmt.Sprintf("NSE script for %s protocol", script.Protocol),
				},
				UpdatedAt: time.Now().Unix(),
			}

			// Update the script content in ValKey
			if err := sm.updateScriptContent(context.Background(), id, newContent); err != nil {
				return fmt.Errorf("failed to update script content in ValKey: %w", err)
			}
			return nil
		}
		return fmt.Errorf("failed to get script content from ValKey: %w", err)
	}

	// If local content is different, update it while preserving metadata
	if string(localContent) != kvContent.Content {
		newContent := &ScriptContent{
			Content:   string(localContent),
			Metadata:  kvContent.Metadata,
			UpdatedAt: time.Now().Unix(),
		}

		// Update the script content in ValKey
		if err := sm.updateScriptContent(context.Background(), id, newContent); err != nil {
			return fmt.Errorf("failed to update script content in ValKey: %w", err)
		}
	}

	return nil
}

// getScriptContent retrieves a script's content from the KV store
func (sm *SyncManager) getScriptContent(ctx context.Context, scriptID string) (*ScriptContent, error) {
	key := ValKeyScriptPrefix + scriptID
	resp, err := sm.kvStore.GetValue(ctx, key)
	if err != nil {
		return nil, err
	}

	var content ScriptContent
	if err := json.Unmarshal([]byte(resp.Message.Value), &content); err != nil {
		return nil, fmt.Errorf("failed to unmarshal script content: %w", err)
	}

	return &content, nil
}

// updateScriptContent updates a script's content in the KV store
func (sm *SyncManager) updateScriptContent(ctx context.Context, scriptID string, content *ScriptContent) error {
	key := ValKeyScriptPrefix + scriptID
	data, err := json.Marshal(content)
	if err != nil {
		return fmt.Errorf("failed to marshal script content: %w", err)
	}

	if err := sm.kvStore.SetValue(ctx, key, string(data)); err != nil {
		return fmt.Errorf("failed to set script content in ValKey: %w", err)
	}

	return nil
}

// UpdateScriptFromUI updates a script's content and metadata from the UI
func (sm *SyncManager) UpdateScriptFromUI(ctx context.Context, scriptID string, content *ScriptContent) error {
	// Validate that the script exists in the manifest
	manifest, err := sm.repoManager.GetManifest()
	if err != nil {
		return fmt.Errorf("failed to get manifest: %w", err)
	}

	script, exists := manifest.Scripts[scriptID]
	if !exists {
		return fmt.Errorf("script %s not found in manifest", scriptID)
	}

	// Update the script content in ValKey
	if err := sm.updateScriptContent(ctx, scriptID, content); err != nil {
		return fmt.Errorf("failed to update script content: %w", err)
	}

	// Create script directory and write the updated content to the local file
	scriptPath := filepath.Join(NSEBasePath, script.Path)
	if err := os.MkdirAll(filepath.Dir(scriptPath), 0755); err != nil {
		return fmt.Errorf("failed to create script directory: %w", err)
	}

	if err := os.WriteFile(scriptPath, []byte(content.Content), 0644); err != nil {
		return fmt.Errorf("failed to write script file: %w", err)
	}

	return nil
}
