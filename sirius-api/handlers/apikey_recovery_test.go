package handlers

import (
	"context"
	"errors"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/gofiber/fiber/v2"
	"io"
	"net/http/httptest"
	"strings"
	"testing"
)

type recoveringKeyStore struct {
	store.KVStore
	reads, deletes         []error
	readCalls, deleteCalls int
	wrongKey               bool
}

func (s *recoveringKeyStore) GetValue(_ context.Context, key string) (store.ValkeyResponse, error) {
	s.wrongKey = s.wrongKey || key != "apikey:"+strings.Repeat("a", 64)
	i := s.readCalls
	s.readCalls++
	if i < len(s.reads) {
		return store.ValkeyResponse{}, s.reads[i]
	}
	return store.ValkeyResponse{}, nil
}
func (s *recoveringKeyStore) DeleteValue(_ context.Context, key string) error {
	s.wrongKey = s.wrongKey || key != "apikey:"+strings.Repeat("a", 64)
	i := s.deleteCalls
	s.deleteCalls++
	if i < len(s.deletes) {
		return s.deletes[i]
	}
	return nil
}
func TestRevokeKeyRecoversClosedStoreConnection(t *testing.T) {
	offline := errors.New("store offline")
	for _, tc := range []struct {
		name                           string
		reads, deletes                 []error
		status, readCalls, deleteCalls int
	}{
		{"closed lookup", []error{io.EOF, nil}, nil, 200, 2, 1},
		{"closed deletion", nil, []error{io.EOF, nil}, 200, 1, 2},
		{"missing key", []error{store.ErrKeyNotFound}, nil, 404, 1, 0},
		{"lookup offline", []error{offline}, nil, 503, 1, 0},
		{"lookup stays closed", []error{io.EOF, io.EOF}, nil, 503, 2, 0},
		{"deletion offline", nil, []error{offline}, 500, 1, 1},
		{"deletion stays closed", nil, []error{io.EOF, io.EOF}, 500, 1, 2},
	} {
		t.Run(tc.name, func(t *testing.T) {
			kv := &recoveringKeyStore{reads: tc.reads, deletes: tc.deletes}
			app := fiber.New()
			app.Delete("/keys/:id", (&APIKeyHandler{Store: kv}).RevokeKey)
			response, err := app.Test(httptest.NewRequest("DELETE", "/keys/"+strings.Repeat("a", 64), nil))
			if err != nil {
				t.Fatal(err)
			}
			defer response.Body.Close()
			if response.StatusCode != tc.status || kv.readCalls != tc.readCalls || kv.deleteCalls != tc.deleteCalls || kv.wrongKey {
				t.Fatalf("status=%d reads=%d deletes=%d wrongKey=%v", response.StatusCode, kv.readCalls, kv.deleteCalls, kv.wrongKey)
			}
		})
	}
}
