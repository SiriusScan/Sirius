package handlers

import (
	"reflect"
	"testing"
)

func TestNormalizeTemplateEnabledScripts(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{
			name:     "canonicalizes path-based script refs",
			input:    []string{"scripts/http-title.nse", " vulners ", "custom/smb-vuln-ms17-010.nse"},
			expected: []string{"http-title", "vulners", "smb-vuln-ms17-010"},
		},
		{
			name:     "deduplicates canonical collisions",
			input:    []string{"scripts/http-title.nse", "http-title", "scripts/http-title.nse"},
			expected: []string{"http-title"},
		},
		{
			name:     "wildcard wins over explicit refs",
			input:    []string{"scripts/http-title.nse", "*", "vulners"},
			expected: []string{"*"},
		},
		{
			name:     "drops empty values",
			input:    []string{"", "   ", "scripts/banner.nse"},
			expected: []string{"banner"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := normalizeTemplateEnabledScripts(tt.input)
			if !reflect.DeepEqual(got, tt.expected) {
				t.Fatalf("normalizeTemplateEnabledScripts(%v) = %v, want %v", tt.input, got, tt.expected)
			}
		})
	}
}

func TestNormalizeTemplateMutatesEnabledScripts(t *testing.T) {
	t.Parallel()

	template := &Template{
		EnabledScripts: []string{"scripts/http-title.nse", "http-title", "vulners"},
	}

	normalizeTemplate(template)

	expected := []string{"http-title", "vulners"}
	if !reflect.DeepEqual(template.EnabledScripts, expected) {
		t.Fatalf("normalizeTemplate() enabled scripts = %v, want %v", template.EnabledScripts, expected)
	}
}
