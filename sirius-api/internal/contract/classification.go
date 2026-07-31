package contract

import (
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

// Allowed classification values for Community routes.
const (
	ClassPublic     = "public"
	ClassInternal   = "internal"
	ClassDeprecated = "deprecated"
)

// ClassificationFile is the machine-readable inventory of every live Community route.
type ClassificationFile struct {
	Version string            `yaml:"version"`
	Routes  []ClassifiedRoute `yaml:"routes"`
}

// ClassifiedRoute is a path/method-specific classification entry.
type ClassifiedRoute struct {
	Method string `yaml:"method"`
	Path   string `yaml:"path"`
	Class  string `yaml:"class"`
	Note   string `yaml:"note"`
}

// LoadClassification reads and validates the classification YAML structure.
func LoadClassification(path string) (*ClassificationFile, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read classification: %w", err)
	}
	var file ClassificationFile
	if err := yaml.Unmarshal(raw, &file); err != nil {
		return nil, fmt.Errorf("parse classification: %w", err)
	}
	if strings.TrimSpace(file.Version) == "" {
		return nil, fmt.Errorf("classification version is required")
	}
	if len(file.Routes) == 0 {
		return nil, fmt.Errorf("classification routes are empty")
	}

	seen := make(map[string]int)
	for i, route := range file.Routes {
		method := strings.ToUpper(strings.TrimSpace(route.Method))
		path := strings.TrimSpace(route.Path)
		class := strings.TrimSpace(route.Class)
		if method == "" || path == "" {
			return nil, fmt.Errorf("classification route[%d]: method and path are required", i)
		}
		switch class {
		case ClassPublic, ClassInternal, ClassDeprecated:
		default:
			return nil, fmt.Errorf("classification route[%d] %s %s: invalid class %q", i, method, path, class)
		}
		file.Routes[i].Method = method
		file.Routes[i].Path = path
		file.Routes[i].Class = class
		seen[OperationKey(method, path)]++
	}
	return &file, nil
}

// Lines returns METHOD\tPATH entries in inventory order (Fiber/golden format).
func (f *ClassificationFile) Lines() []string {
	out := make([]string, 0, len(f.Routes))
	for _, route := range f.Routes {
		out = append(out, route.Method+"\t"+route.Path)
	}
	return out
}
