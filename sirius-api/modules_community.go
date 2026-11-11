//go:build !pro

package main

import (
	"github.com/SiriusScan/go-api/sirius/module"
	"github.com/SiriusScan/go-api/sirius/store"
)

// buildModuleRegistry is the Community composition entry point.
func buildModuleRegistry(kvStore store.KVStore) (*module.Registry, error) {
	return buildCommunityModuleRegistry(kvStore)
}
