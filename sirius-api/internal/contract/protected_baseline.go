package contract

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const (
	// EnvBaseRef selects the protected git ref/SHA that owns the authoritative
	// OpenAPI baseline (merge-base / PR base / main). Candidate PRs cannot
	// override this by editing a local baseline file.
	EnvBaseRef = "SIRIUS_OPENAPI_BASE_REF"

	// EnvAllowBreaking explicitly permits ERR-level oasdiff findings. This is
	// intentionally separate from normal feature PRs and must be set only for
	// an approved contract-break advancement (workflow_dispatch / human gate).
	EnvAllowBreaking = "SIRIUS_OPENAPI_ALLOW_BREAKING"

	// ProtectedOpenAPIRelPath is the authoritative published contract path in git.
	ProtectedOpenAPIRelPath = "sirius-api/contracts/openapi.v1.yaml"
)

// BaselineResolution describes how the protected baseline was obtained.
type BaselineResolution struct {
	Mode         string // "protected", "bootstrap", "allow_breaking"
	BaseRef      string
	BaselinePath string // filesystem path to baseline bytes for oasdiff
	Message      string
	cleanup      func()
}

// Cleanup removes any temporary files created while resolving the baseline.
func (r *BaselineResolution) Cleanup() {
	if r != nil && r.cleanup != nil {
		r.cleanup()
		r.cleanup = nil
	}
}

// ResolveProtectedBaseline loads openapi.v1.yaml from the protected git ref.
//
// Bootstrap (fail-open once): when the protected ref does not yet contain the
// contract file (this introductory PR), mode=bootstrap and baselinePath is empty.
// After the file exists on the protected base, resolution is fail-closed.
//
// Local checked-in openapi.v1.baseline.yaml is never used as the protected
// source — that would reintroduce candidate-controlled bypass.
func ResolveProtectedBaseline(repoRoot, baseRef string) (*BaselineResolution, error) {
	repoRoot = filepath.Clean(repoRoot)
	if baseRef == "" {
		baseRef = strings.TrimSpace(os.Getenv(EnvBaseRef))
	}
	if baseRef == "" {
		resolved, err := defaultMergeBase(repoRoot)
		if err != nil {
			return nil, err
		}
		baseRef = resolved
	}

	raw, err := gitShow(repoRoot, baseRef, ProtectedOpenAPIRelPath)
	if err != nil {
		if isMissingGitPath(err) {
			return &BaselineResolution{
				Mode:    "bootstrap",
				BaseRef: baseRef,
				Message: fmt.Sprintf("protected ref %s has no %s; bootstrap mode (one-time until merged)", baseRef, ProtectedOpenAPIRelPath),
			}, nil
		}
		return nil, err
	}

	tmpDir, err := os.MkdirTemp("", "sirius-openapi-baseline-*")
	if err != nil {
		return nil, err
	}
	baselinePath := filepath.Join(tmpDir, "openapi.v1.protected.yaml")
	if err := os.WriteFile(baselinePath, raw, 0o644); err != nil {
		_ = os.RemoveAll(tmpDir)
		return nil, err
	}

	return &BaselineResolution{
		Mode:         "protected",
		BaseRef:      baseRef,
		BaselinePath: baselinePath,
		Message:      fmt.Sprintf("using protected baseline from %s:%s", baseRef, ProtectedOpenAPIRelPath),
		cleanup:      func() { _ = os.RemoveAll(tmpDir) },
	}, nil
}

// CheckProtectedBreaking compares the working-tree candidate against the
// protected baseline. Bootstrap mode skips oasdiff but still validates the
// candidate OpenAPI loads. allow_breaking requires EnvAllowBreaking=1.
func CheckProtectedBreaking(repoRoot, candidatePath, baseRef string) (*BaselineResolution, error) {
	res, err := ResolveProtectedBaseline(repoRoot, baseRef)
	if err != nil {
		return nil, err
	}

	// Always ensure candidate is a syntactically valid OpenAPI document.
	if err := loadOpenAPIDocument(candidatePath); err != nil {
		return res, fmt.Errorf("candidate openapi invalid: %w", err)
	}

	if res.Mode == "bootstrap" {
		return res, nil
	}

	if err := CompareOpenAPIBreaking(res.BaselinePath, candidatePath); err != nil {
		if strings.TrimSpace(os.Getenv(EnvAllowBreaking)) == "1" {
			res.Mode = "allow_breaking"
			res.Message = "breaking changes permitted by " + EnvAllowBreaking + "=1"
			return res, nil
		}
		return res, fmt.Errorf("%v\nnote: intentional breaks require a separate approved gate with %s=1; editing a local baseline file cannot bypass protected-base comparison", err, EnvAllowBreaking)
	}
	return res, nil
}

func defaultMergeBase(repoRoot string) (string, error) {
	for _, remote := range []string{"origin/main", "main"} {
		out, err := execGit(repoRoot, "rev-parse", "--verify", remote)
		if err != nil {
			continue
		}
		base := strings.TrimSpace(string(out))
		mb, err := execGit(repoRoot, "merge-base", "HEAD", base)
		if err != nil {
			return base, nil
		}
		return strings.TrimSpace(string(mb)), nil
	}
	return "", fmt.Errorf("unable to resolve merge-base against origin/main or main; set %s", EnvBaseRef)
}

func gitShow(repoRoot, ref, path string) ([]byte, error) {
	return execGit(repoRoot, "show", ref+":"+path)
}

func execGit(repoRoot string, args ...string) ([]byte, error) {
	cmd := exec.Command("git", args...)
	cmd.Dir = repoRoot
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("git %s: %w: %s", strings.Join(args, " "), err, strings.TrimSpace(stderr.String()))
	}
	return out, nil
}

func isMissingGitPath(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "does not exist") ||
		strings.Contains(msg, "exists on disk, but not in") ||
		strings.Contains(msg, "path not in") ||
		strings.Contains(msg, "fatal: path") ||
		strings.Contains(msg, "bad object")
}
