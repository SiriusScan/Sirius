package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"
)

// ────────────────── HTTP helpers ──────────────────

// httpDo performs an HTTP request and returns status code, body, headers.
// It does NOT follow redirects.
func httpDo(method, url string, headers map[string]string, body string) (int, string, http.Header, error) {
	var bodyReader io.Reader
	if body != "" {
		bodyReader = strings.NewReader(body)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return 0, "", nil, fmt.Errorf("create request: %w", err)
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse // don't follow redirects
		},
	}

	resp, err := client.Do(req)
	if err != nil {
		return 0, "", nil, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, string(respBody), resp.Header, nil
}

// httpGet is a convenience wrapper around httpDo for GET requests.
func httpGet(url string, headers map[string]string) (int, string, http.Header, error) {
	return httpDo("GET", url, headers, "")
}

// httpPost is a convenience wrapper for POST with a JSON body.
func httpPost(url string, headers map[string]string, jsonBody string) (int, string, http.Header, error) {
	if headers == nil {
		headers = map[string]string{}
	}
	if _, ok := headers["Content-Type"]; !ok {
		headers["Content-Type"] = "application/json"
	}
	return httpDo("POST", url, headers, jsonBody)
}

// httpDelete is a convenience wrapper for DELETE requests.
func httpDelete(url string, headers map[string]string) (int, string, http.Header, error) {
	return httpDo("DELETE", url, headers, "")
}

// ────────────────── TCP helpers ──────────────────

// tcpProbe tries to open a TCP connection to addr within the timeout.
// Returns true if the connection succeeded.
func tcpProbe(addr string, timeout time.Duration) bool {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	var d net.Dialer
	conn, err := d.DialContext(ctx, "tcp", addr)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}

// tcpSendRecv opens a TCP connection, sends data, and reads the response.
func tcpSendRecv(addr string, send string, timeout time.Duration) (string, error) {
	conn, err := net.DialTimeout("tcp", addr, timeout)
	if err != nil {
		return "", err
	}
	defer conn.Close()

	_ = conn.SetDeadline(time.Now().Add(timeout))

	if send != "" {
		_, err = conn.Write([]byte(send))
		if err != nil {
			return "", err
		}
	}

	buf := make([]byte, 4096)
	n, err := conn.Read(buf)
	if err != nil && n == 0 {
		return "", err
	}
	return string(buf[:n]), nil
}

// ────────────────── API key helpers ──────────────────

// apiHeaders returns a header map with the given API key.
func apiHeaders(key string) map[string]string {
	if key == "" {
		return nil
	}
	return map[string]string{"X-API-Key": key}
}
