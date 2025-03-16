package nse

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
)

var errNotFound = errors.New("key not found")

// mockKVStore implements store.KVStore for testing
type mockKVStore struct {
	data map[string]string
}

func (m *mockKVStore) GetValue(ctx context.Context, key string) (store.ValkeyResponse, error) {
	if val, ok := m.data[key]; ok {
		return store.ValkeyResponse{
			Message: store.ValkeyValue{Value: val},
			Type:    "string",
		}, nil
	}
	return store.ValkeyResponse{}, errNotFound
}

func (m *mockKVStore) SetValue(ctx context.Context, key string, value string) error {
	m.data[key] = value
	return nil
}

func (m *mockKVStore) Close() error {
	return nil
}

// mockGitOps implements GitOperations for testing
type mockGitOps struct {
	cloneCalled bool
	fetchCalled bool
	resetCalled bool
	shouldFail  bool
}

func (m *mockGitOps) Clone(repoURL, targetPath string) error {
	m.cloneCalled = true
	if m.shouldFail {
		return errors.New("mock clone failure")
	}
	// Create a basic Git repository structure
	if err := os.MkdirAll(filepath.Join(targetPath, ".git", "refs", "heads"), 0755); err != nil {
		return fmt.Errorf("failed to create Git directory structure: %w", err)
	}
	if err := os.WriteFile(filepath.Join(targetPath, ".git", "HEAD"), []byte("ref: refs/heads/main\n"), 0644); err != nil {
		return fmt.Errorf("failed to write HEAD file: %w", err)
	}
	// Create a basic config file
	if err := os.WriteFile(filepath.Join(targetPath, ".git", "config"), []byte("[core]\n\trepositoryformatversion = 0\n"), 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}
	// Create a basic index file (12-byte header)
	indexHeader := []byte{
		'D', 'I', 'R', 'C', // signature
		0, 0, 0, 2, // version
		0, 0, 0, 0, // number of entries
	}
	if err := os.WriteFile(filepath.Join(targetPath, ".git", "index"), indexHeader, 0644); err != nil {
		return fmt.Errorf("failed to write index file: %w", err)
	}
	// Create a basic objects directory
	if err := os.MkdirAll(filepath.Join(targetPath, ".git", "objects"), 0755); err != nil {
		return fmt.Errorf("failed to create objects directory: %w", err)
	}
	return nil
}

func (m *mockGitOps) Fetch(repoPath string) error {
	m.fetchCalled = true
	if m.shouldFail {
		return errors.New("mock fetch failure")
	}
	// Simulate fetching by ensuring the Git directory structure exists
	gitDir := filepath.Join(repoPath, ".git")
	if _, err := os.Stat(gitDir); err != nil {
		return fmt.Errorf("not a git repository: %w", err)
	}
	// Create a basic refs/remotes/origin directory
	if err := os.MkdirAll(filepath.Join(gitDir, "refs", "remotes", "origin"), 0755); err != nil {
		return fmt.Errorf("failed to create remote refs directory: %w", err)
	}
	// Create a basic HEAD file in the remote refs
	if err := os.WriteFile(filepath.Join(gitDir, "refs", "remotes", "origin", "HEAD"), []byte("ref: refs/remotes/origin/main\n"), 0644); err != nil {
		return fmt.Errorf("failed to write remote HEAD file: %w", err)
	}
	return nil
}

func (m *mockGitOps) Reset(repoPath string) error {
	m.resetCalled = true
	if m.shouldFail {
		return errors.New("mock reset failure")
	}
	// Simulate resetting by ensuring the Git directory structure exists
	gitDir := filepath.Join(repoPath, ".git")
	if _, err := os.Stat(gitDir); err != nil {
		return fmt.Errorf("not a git repository: %w", err)
	}
	// Create a basic refs/heads/main file
	if err := os.WriteFile(filepath.Join(gitDir, "refs", "heads", "main"), []byte("0000000000000000000000000000000000000000\n"), 0644); err != nil {
		return fmt.Errorf("failed to write main branch ref: %w", err)
	}
	return nil
}

func TestNSEIntegration(t *testing.T) {
	// Create temporary directories for testing
	tmpDir, err := os.MkdirTemp("", "nse-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp directory: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Set NSEBasePath to a temporary directory for testing
	originalNSEBasePath := NSEBasePath
	NSEBasePath = filepath.Join(tmpDir, "nse-base")
	defer func() {
		NSEBasePath = originalNSEBasePath
	}()

	// Create a test repository manifest file
	repoManifest := RepositoryList{
		Repositories: []Repository{
			{
				Name: "sirius-nse",
				URL:  "https://github.com/SiriusScan/sirius-nse.git",
			},
		},
	}
	repoManifestData, err := json.Marshal(repoManifest)
	if err != nil {
		t.Fatalf("Failed to marshal repository manifest: %v", err)
	}
	if err := os.WriteFile(ManifestPath, repoManifestData, 0644); err != nil {
		t.Fatalf("Failed to write repository manifest file: %v", err)
	}
	defer os.Remove(ManifestPath)

	// Create mock KV store
	kvStore := &mockKVStore{
		data: make(map[string]string),
	}

	// Create mock Git operations
	mockGit := &mockGitOps{}

	// Create repo manager with mock Git ops
	repoManager := NewRepoManager(filepath.Join(tmpDir, "sirius-nse"), repoManifest.Repositories[0].URL)
	repoManager.SetGitOps(mockGit)

	// Create sync manager
	syncManager := NewSyncManager(repoManager, kvStore)

	// Test repository setup
	t.Run("Repository Setup", func(t *testing.T) {
		if err := repoManager.EnsureRepo(); err != nil {
			t.Errorf("Failed to ensure repository: %v", err)
		}

		if !mockGit.cloneCalled {
			t.Error("Clone was not called")
		}
	})

	// Test repository update
	t.Run("Repository Update", func(t *testing.T) {
		// Reset mock
		mockGit.cloneCalled = false
		mockGit.fetchCalled = false
		mockGit.resetCalled = false

		// Create .git directory to simulate existing repo
		gitDir := filepath.Join(tmpDir, "sirius-nse", ".git")
		if err := os.MkdirAll(gitDir, 0755); err != nil {
			t.Fatalf("Failed to create .git directory: %v", err)
		}

		if err := repoManager.EnsureRepo(); err != nil {
			t.Errorf("Failed to update repository: %v", err)
		}

		if mockGit.cloneCalled {
			t.Error("Clone was called for existing repository")
		}
		if !mockGit.fetchCalled {
			t.Error("Fetch was not called")
		}
		if !mockGit.resetCalled {
			t.Error("Reset was not called")
		}
	})

	// Test error handling
	t.Run("Error Handling", func(t *testing.T) {
		// Reset mock and set it to fail
		mockGit.shouldFail = true
		mockGit.cloneCalled = false
		mockGit.fetchCalled = false
		mockGit.resetCalled = false

		if err := repoManager.EnsureRepo(); err == nil {
			t.Error("Expected error, got nil")
		}
	})

	// Test sync manager
	t.Run("Sync Manager", func(t *testing.T) {
		// Reset mock
		mockGit.shouldFail = false
		mockGit.cloneCalled = false
		mockGit.fetchCalled = false
		mockGit.resetCalled = false

		// Create a test repository manifest file
		repoManifest := RepositoryList{
			Repositories: []Repository{
				{
					Name: "sirius-nse",
					URL:  "https://github.com/SiriusScan/sirius-nse.git",
				},
			},
		}
		repoManifestData, err := json.Marshal(repoManifest)
		if err != nil {
			t.Fatalf("Failed to marshal repository manifest: %v", err)
		}
		if err := os.WriteFile(ManifestPath, repoManifestData, 0644); err != nil {
			t.Fatalf("Failed to write repository manifest file: %v", err)
		}
		defer os.Remove(ManifestPath)

		// Create the repository directory structure
		repoDir := filepath.Join(NSEBasePath, "sirius-nse")

		// Create a test NSE manifest file in the repository
		nseManifest := &Manifest{
			Name:        "sirius-nse",
			Version:     "1.0.0",
			Description: "Test NSE Scripts",
			Scripts: map[string]Script{
				"test-script": {
					Name:     "Test Script",
					Path:     "scripts/test.nse",
					Protocol: "*",
				},
			},
		}

		// Update the repo manager with the new path and URL
		repoManager.BasePath = repoDir
		repoManager.RepoURL = "https://github.com/SiriusScan/sirius-nse.git"

		// Ensure the repository exists (this will create the Git structure)
		if err := repoManager.EnsureRepo(); err != nil {
			t.Fatalf("Failed to ensure repository: %v", err)
		}

		// Write the NSE manifest to the repository
		nseManifestPath := filepath.Join(repoDir, ManifestFile)
		nseManifestData, err := json.Marshal(nseManifest)
		if err != nil {
			t.Fatalf("Failed to marshal NSE manifest: %v", err)
		}
		if err := os.WriteFile(nseManifestPath, nseManifestData, 0644); err != nil {
			t.Fatalf("Failed to write NSE manifest: %v", err)
		}

		// Test sync
		if err := syncManager.Sync(context.Background()); err != nil {
			t.Errorf("Failed to sync: %v", err)
		}

		// Verify manifest was stored in ValKey
		resp, err := kvStore.GetValue(context.Background(), ValKeyManifestKey)
		if err != nil {
			t.Errorf("Failed to get manifest from ValKey: %v", err)
		}

		var storedManifest Manifest
		if err := json.Unmarshal([]byte(resp.Message.Value), &storedManifest); err != nil {
			t.Errorf("Failed to unmarshal stored manifest: %v", err)
		}

		if storedManifest.Name != nseManifest.Name {
			t.Errorf("Expected manifest name %s, got %s", nseManifest.Name, storedManifest.Name)
		}
	})
}
