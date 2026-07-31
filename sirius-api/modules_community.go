//go:build !pro

package main

import (
	"fmt"

	"github.com/SiriusScan/go-api/sirius/module"
	"github.com/SiriusScan/go-api/sirius/store"
	"github.com/SiriusScan/sirius-api/routes"
)

// buildModuleRegistry is the Community compile-time composition seam.
// A private Pro build supplies its own pro-tagged implementation that registers
// this same Community core followed by private modules.
func buildModuleRegistry(kvStore store.KVStore) (*module.Registry, error) {
	adapt := func(id string, setter module.RouteSetter) (module.Module, error) {
		adapted, err := module.AdaptRouteSetter(
			id,
			module.CommunityModuleVersion,
			setter,
		)
		if err != nil {
			return nil, fmt.Errorf("adapt Community module %q: %w", id, err)
		}
		return adapted, nil
	}

	host, err := adapt(module.IDHost, &routes.HostRouteSetter{})
	if err != nil {
		return nil, err
	}
	app, err := adapt(module.IDApp, &routes.AppRouteSetter{})
	if err != nil {
		return nil, err
	}
	vulnerability, err := adapt(module.IDVulnerability, &routes.VulnerabilityRouteSetter{})
	if err != nil {
		return nil, err
	}
	template, err := adapt(module.IDTemplate, &routes.TemplateRouteSetter{})
	if err != nil {
		return nil, err
	}
	script, err := adapt(module.IDScript, &routes.ScriptRouteSetter{})
	if err != nil {
		return nil, err
	}
	agentTemplateRepository, err := adapt(
		module.IDAgentTemplateRepository,
		&routes.AgentTemplateRepositoryRouteSetter{},
	)
	if err != nil {
		return nil, err
	}
	agentTemplate, err := adapt(module.IDAgentTemplate, &routes.AgentTemplateRouteSetter{})
	if err != nil {
		return nil, err
	}
	event, err := adapt(module.IDEvent, &routes.EventRouteSetter{})
	if err != nil {
		return nil, err
	}
	snapshot, err := adapt(module.IDSnapshot, &routes.SnapshotRouteSetter{})
	if err != nil {
		return nil, err
	}
	statistics, err := adapt(module.IDStatistics, &routes.StatisticsRoutes{})
	if err != nil {
		return nil, err
	}
	scan, err := adapt(module.IDScan, &routes.ScanRouteSetter{})
	if err != nil {
		return nil, err
	}
	apiKey, err := adapt(module.IDAPIKey, &routes.APIKeyRouteSetter{Store: kvStore})
	if err != nil {
		return nil, err
	}

	registry := module.NewRegistry()
	if err := module.RegisterCommunity(registry, module.CommunityCore{
		Host:                    host,
		App:                     app,
		Vulnerability:           vulnerability,
		Template:                template,
		Script:                  script,
		AgentTemplateRepository: agentTemplateRepository,
		AgentTemplate:           agentTemplate,
		Event:                   event,
		Snapshot:                snapshot,
		Statistics:              statistics,
		Scan:                    scan,
		APIKey:                  apiKey,
	}); err != nil {
		return nil, fmt.Errorf("register Community modules: %w", err)
	}
	return registry, nil
}
