package main

import "testing"

func TestAPIListenAddress(t *testing.T) {
	for _, tc := range []struct{ host, port, want string }{
		{"", "", ":9001"},
		{"127.0.0.1", "19001", "127.0.0.1:19001"},
		{" ::1 ", " 19001 ", "[::1]:19001"},
	} {
		if got := apiListenAddress(tc.host, tc.port); got != tc.want {
			t.Errorf("apiListenAddress(%q, %q) = %q; want %q", tc.host, tc.port, got, tc.want)
		}
	}
}
