package contract

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
)

// ReservedNamespace documents a policy-only API namespace.
type ReservedNamespace struct {
	PathPrefix string `json:"path_prefix" yaml:"path_prefix"`
	Purpose    string `json:"purpose" yaml:"purpose"`
}

// OpenAPIContract wraps a loaded, validated OpenAPI document plus extracted operations.
type OpenAPIContract struct {
	Doc                *openapi3.T
	Operations         map[string]struct{} // METHOD\t/openapi/path
	ReservedNamespaces []ReservedNamespace
	ContractVersion    string
}

// LoadOpenAPI parses OpenAPI YAML/JSON semantically via kin-openapi.
func LoadOpenAPI(path string) (*OpenAPIContract, error) {
	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = false

	doc, err := loader.LoadFromFile(path)
	if err != nil {
		return nil, fmt.Errorf("load openapi: %w", err)
	}
	if err := doc.Validate(loader.Context); err != nil {
		return nil, fmt.Errorf("validate openapi: %w", err)
	}

	ops := make(map[string]struct{})
	if doc.Paths != nil {
		for path, item := range doc.Paths.Map() {
			if item == nil {
				continue
			}
			for method, op := range item.Operations() {
				if op == nil {
					continue
				}
				ops[OperationKey(method, path)] = struct{}{}
			}
		}
	}

	reserved, err := extractReservedNamespaces(doc)
	if err != nil {
		return nil, err
	}
	version := strings.TrimSpace(doc.Info.Version)
	if ext, ok := doc.Info.Extensions["x-sirius-contract-version"]; ok {
		if s, ok := ext.(string); ok && strings.TrimSpace(s) != "" {
			version = strings.TrimSpace(s)
		}
	}

	return &OpenAPIContract{
		Doc:                doc,
		Operations:         ops,
		ReservedNamespaces: reserved,
		ContractVersion:    version,
	}, nil
}

func extractReservedNamespaces(doc *openapi3.T) ([]ReservedNamespace, error) {
	raw, ok := doc.Info.Extensions["x-sirius-reserved-namespaces"]
	if !ok {
		return nil, fmt.Errorf("openapi info.x-sirius-reserved-namespaces is required")
	}

	encoded, err := json.Marshal(raw)
	if err != nil {
		return nil, fmt.Errorf("encode reserved namespaces extension: %w", err)
	}
	var out []ReservedNamespace
	if err := json.Unmarshal(encoded, &out); err != nil {
		return nil, fmt.Errorf("decode reserved namespaces extension: %w", err)
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("openapi info.x-sirius-reserved-namespaces is empty")
	}
	for i := range out {
		out[i].PathPrefix = strings.TrimSpace(out[i].PathPrefix)
		out[i].Purpose = strings.TrimSpace(out[i].Purpose)
		if out[i].PathPrefix == "" || out[i].Purpose == "" {
			return nil, fmt.Errorf("reserved namespace[%d] requires path_prefix and purpose", i)
		}
	}
	return out, nil
}

// RequireReservedNamespaces ensures Pro and internal namespaces are reserved by policy.
func (c *OpenAPIContract) RequireReservedNamespaces(required ...string) error {
	have := make(map[string]struct{}, len(c.ReservedNamespaces))
	for _, ns := range c.ReservedNamespaces {
		have[strings.TrimRight(ns.PathPrefix, "/")] = struct{}{}
	}
	var missing []string
	for _, want := range required {
		key := strings.TrimRight(want, "/")
		if _, ok := have[key]; !ok {
			missing = append(missing, want)
		}
	}
	if len(missing) > 0 {
		sort.Strings(missing)
		return fmt.Errorf("missing reserved namespaces: %s", strings.Join(missing, ", "))
	}
	return nil
}

// APIV1Operations returns OpenAPI operations whose paths are under /api/v1.
func (c *OpenAPIContract) APIV1Operations() map[string]struct{} {
	out := make(map[string]struct{})
	for key := range c.Operations {
		_, path, ok := strings.Cut(key, "\t")
		if !ok {
			continue
		}
		if IsAPIV1(path) {
			out[key] = struct{}{}
		}
	}
	return out
}

// MustExistFile is a tiny helper for tests/CI path checks.
func MustExistFile(path string) error {
	st, err := os.Stat(path)
	if err != nil {
		return err
	}
	if st.IsDir() {
		return fmt.Errorf("%s is a directory", path)
	}
	return nil
}
