package config

import (
	"testing"
)

func TestBuildDatabaseURL(t *testing.T) {
	tests := []struct {
		name   string
		values map[string]string
		want   string
	}{
		{
			name: "simple password",
			values: map[string]string{
				"POSTGRES_USER":     "postgres",
				"POSTGRES_PASSWORD": "secret",
				"POSTGRES_HOST":     "db-host",
				"POSTGRES_PORT":     "5432",
				"POSTGRES_DB":       "mydb",
			},
			want: "postgresql://postgres:secret@db-host:5432/mydb",
		},
		{
			name: "defaults when keys missing",
			values: map[string]string{
				"POSTGRES_PASSWORD": "pw",
			},
			want: "postgresql://postgres:pw@sirius-postgres:5432/sirius",
		},
		{
			name: "password with @",
			values: map[string]string{
				"POSTGRES_PASSWORD": "p@ss",
			},
			want: "postgresql://postgres:p%40ss@sirius-postgres:5432/sirius",
		},
		{
			name: "password with colon",
			values: map[string]string{
				"POSTGRES_PASSWORD": "p:ss",
			},
			want: "postgresql://postgres:p%3Ass@sirius-postgres:5432/sirius",
		},
		{
			name: "password with slash",
			values: map[string]string{
				"POSTGRES_PASSWORD": "p/ss",
			},
			want: "postgresql://postgres:p%2Fss@sirius-postgres:5432/sirius",
		},
		{
			name: "password with spaces",
			values: map[string]string{
				"POSTGRES_PASSWORD": "my pass word",
			},
			want: "postgresql://postgres:my%20pass%20word@sirius-postgres:5432/sirius",
		},
		{
			name: "complex special characters",
			values: map[string]string{
				"POSTGRES_PASSWORD": "p@ss:w/rd#123!",
			},
			want: "postgresql://postgres:p%40ss%3Aw%2Frd%23123%21@sirius-postgres:5432/sirius",
		},
		{
			name: "custom host and port",
			values: map[string]string{
				"POSTGRES_USER":     "admin",
				"POSTGRES_PASSWORD": "secret",
				"POSTGRES_HOST":     "10.0.0.5",
				"POSTGRES_PORT":     "5433",
				"POSTGRES_DB":       "sirius_prod",
			},
			want: "postgresql://admin:secret@10.0.0.5:5433/sirius_prod",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := BuildDatabaseURL(tt.values)
			if got != tt.want {
				t.Errorf("BuildDatabaseURL() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestEnsureRequired_SetsDatabaseURL(t *testing.T) {
	values := map[string]string{
		"SIRIUS_API_KEY":         "abcdef1234567890abcdef1234567890",
		"POSTGRES_PASSWORD":      "abcdef1234567890abcdef1234567890",
		"NEXTAUTH_SECRET":        "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
		"INITIAL_ADMIN_PASSWORD": "SomeStr0ng!Pass",
		"POSTGRES_USER":          "postgres",
		"POSTGRES_HOST":          "sirius-postgres",
		"POSTGRES_PORT":          "5432",
		"POSTGRES_DB":            "sirius",
	}

	result, _, err := EnsureRequired(values, Options{})
	if err != nil {
		t.Fatalf("EnsureRequired() error = %v", err)
	}

	expected := "postgresql://postgres:abcdef1234567890abcdef1234567890@sirius-postgres:5432/sirius"
	if result["DATABASE_URL"] != expected {
		t.Errorf("DATABASE_URL = %q, want %q", result["DATABASE_URL"], expected)
	}
}

func TestEnsureRequired_PreservesManualDatabaseURL(t *testing.T) {
	manual := "postgresql://custom:pass@remote:5432/otherdb"
	values := map[string]string{
		"SIRIUS_API_KEY":         "abcdef1234567890abcdef1234567890",
		"POSTGRES_PASSWORD":      "abcdef1234567890abcdef1234567890",
		"NEXTAUTH_SECRET":        "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
		"INITIAL_ADMIN_PASSWORD": "SomeStr0ng!Pass",
		"DATABASE_URL":           manual,
	}

	result, _, err := EnsureRequired(values, Options{})
	if err != nil {
		t.Fatalf("EnsureRequired() error = %v", err)
	}

	if result["DATABASE_URL"] != manual {
		t.Errorf("DATABASE_URL = %q, want %q (should be preserved)", result["DATABASE_URL"], manual)
	}
}
