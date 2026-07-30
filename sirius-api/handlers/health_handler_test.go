package handlers

import "testing"

func TestServiceVersion(t *testing.T) {
	tests := []struct {
		name  string
		value string
		want  string
	}{
		{name: "release tag", value: "v1.1.0", want: "1.1.0"},
		{name: "plain version", value: "1.1.0", want: "1.1.0"},
		{name: "mutable tag", value: "latest", want: "latest"},
		{name: "unset", value: "", want: "dev"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("SIRIUS_VERSION", tt.value)
			if got := serviceVersion(); got != tt.want {
				t.Fatalf("serviceVersion() = %q, want %q", got, tt.want)
			}
		})
	}
}
