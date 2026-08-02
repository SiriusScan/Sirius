package middleware

import (
	"testing"

	"github.com/SiriusScan/go-api/sirius/store"
)

func TestScopedKeyForbidden(t *testing.T) {
	cases := []struct {
		name string
		path string
		meta store.APIKeyMeta
		want bool
	}{
		{
			name: "legacy empty scopes allowed",
			path: "/api/v1/host",
			meta: store.APIKeyMeta{},
			want: false,
		},
		{
			name: "legacy nil scopes allowed",
			path: "/api/v1/host",
			meta: store.APIKeyMeta{Scopes: nil},
			want: false,
		},
		{
			name: "agent enroll scoped denied on inventory",
			path: "/api/v1/host",
			meta: store.APIKeyMeta{Scopes: []string{store.ScopeAgentEnroll}},
			want: true,
		},
		{
			name: "agent enroll scoped denied on keys",
			path: "/api/v1/keys/",
			meta: store.APIKeyMeta{Scopes: []string{store.ScopeAgentEnroll}},
			want: true,
		},
		{
			name: "other scoped key denied",
			path: "/api/v1/vulnerabilities",
			meta: store.APIKeyMeta{Scopes: []string{"other:scope"}},
			want: true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := scopedKeyForbidden(tc.path, tc.meta)
			if got != tc.want {
				t.Fatalf("scopedKeyForbidden(%q, scopes=%v) = %v, want %v",
					tc.path, tc.meta.Scopes, got, tc.want)
			}
		})
	}
}
