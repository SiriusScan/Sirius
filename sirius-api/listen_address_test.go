package main

import "testing"

func TestAPIListenAddress(t *testing.T) {
	cases := []struct {
		host, port, want string
	}{
		{"", "", ":9001"},
		{"127.0.0.1", "19001", "127.0.0.1:19001"},
		{" 0.0.0.0 ", " 9001 ", "0.0.0.0:9001"},
		{"::1", "19001", "[::1]:19001"},
	}
	for _, tc := range cases {
		if got := apiListenAddress(tc.host, tc.port); got != tc.want {
			t.Fatalf("apiListenAddress(%q, %q) = %q, want %q", tc.host, tc.port, got, tc.want)
		}
	}
}
