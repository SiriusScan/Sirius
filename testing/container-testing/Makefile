# SiriusScan Docker Testing Makefile
# Provides easy commands for testing and development

.PHONY: help build test test-build test-health test-integration test-all test-security clean logs lint-docs lint-docs-quick lint-agents lint-agents-quick lint-agent-index regenerate-agents regenerate-agent check-agent-sync

# Default target
help:
	@echo "SiriusScan Docker Testing Commands"
	@echo "=================================="
	@echo ""
	@echo "Build Commands:"
	@echo "  build-base     Build base configuration"
	@echo "  build-dev      Build development configuration"
	@echo "  build-prod     Build production configuration"
	@echo "  build-all      Build all configurations"
	@echo ""
	@echo "Test Commands:"
	@echo "  test-build     Test individual container builds"
	@echo "  test-health    Test service health checks"
	@echo "  test-integration Test service integration"
	@echo "  test-security  Run security/auth penetration tests"
	@echo "  test-all       Run all tests"
	@echo ""
	@echo "Development Commands:"
	@echo "  dev            Start development environment"
	@echo "  prod           Start production environment"
	@echo "  stop           Stop all services"
	@echo "  restart        Restart all services"
	@echo ""
	@echo "Utility Commands:"
	@echo "  clean          Clean up containers and images"
	@echo "  logs           Show logs for all services"
	@echo "  status         Show status of all services"
	@echo ""
	@echo "Documentation Commands:"
	@echo "  lint-docs      Run full documentation linting"
	@echo "  lint-docs-quick Run quick documentation checks"
	@echo "  lint-index     Check documentation index completeness"
	@echo ""
	@echo "Agent Identity Commands:"
	@echo "  regenerate-agents   Regenerate all agent identities"
	@echo "  regenerate-agent    Regenerate specific agent (PRODUCT=name)"
	@echo "  check-agent-sync    Check if agent identities need regeneration"
	@echo "  lint-agents         Run full agent identity linting"
	@echo "  lint-agents-quick   Run quick agent checks"
	@echo "  lint-agent-index    Check agent identity index completeness"

# Build commands
build-base:
	@echo "🔨 Building base configuration..."
	docker compose config --quiet
	@echo "✅ Base configuration is valid"

build-dev:
	@echo "🔨 Building development configuration..."
	docker compose -f docker-compose.yaml -f docker-compose.dev.yaml config --quiet
	@echo "✅ Development configuration is valid"

build-prod:
	@echo "🔨 Building production configuration..."
	docker compose config --quiet
	@echo "✅ Production configuration is valid (base docker-compose.yaml)"

build-all: build-base build-dev build-prod
	@echo "🎉 All configurations are valid!"

# Test commands
test-build:
	@echo "🧪 Running build tests..."
	./test-build.sh

test-health:
	@echo "🏥 Running health tests..."
	./test-health.sh

test-integration:
	@echo "🔗 Running integration tests..."
	./test-integration.sh

test-security:
	@echo "🔒 Running security penetration tests..."
	cd ../security && go run .
	@echo "✅ Security tests completed!"

test-all: test-build test-health test-integration
	@echo "🎉 All tests completed!"

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
	@echo "✅ Development environment started"
	@echo "🌐 UI: http://localhost:3000"
	@echo "🔌 API: http://localhost:9001"
	@echo "⚙️  Engine: http://localhost:5174"

prod:
	@echo "🚀 Starting production environment..."
	docker compose up -d
	@echo "✅ Production environment started (base docker-compose.yaml is production-ready)"
	@echo "🌐 UI: http://localhost:3000"
	@echo "🔌 API: http://localhost:9001"
	@echo "⚙️  Engine: http://localhost:5174"

stop:
	@echo "🛑 Stopping all services..."
	docker compose down
	@echo "✅ All services stopped"

restart: stop dev
	@echo "🔄 Services restarted"

# Utility commands
clean:
	@echo "🧹 Cleaning up containers and images..."
	docker compose down --volumes --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed"

logs:
	@echo "📋 Showing logs for all services..."
	docker compose logs -f

status:
	@echo "📊 Service Status:"
	docker compose ps

# Quick test for CI/CD
ci-test: build-all test-build
	@echo "✅ CI/CD tests passed!"

# Full validation
validate: build-all test-all
	@echo "🎉 Full validation completed successfully!"

# Documentation linting commands
lint-docs:
	@echo "📚 Running full documentation linting..."
	../../scripts/documentation/lint-docs.sh
	@echo "✅ Documentation linting completed!"

lint-docs-quick:
	@echo "📚 Running quick documentation checks..."
	../../scripts/documentation/lint-quick.sh
	@echo "✅ Quick documentation checks completed!"

lint-index:
	@echo "📚 Running index completeness linting..."
	../../scripts/documentation/lint-index.sh
	@echo "✅ Index linting completed!"

# Agent identity linting commands
lint-agents:
	@echo "🤖 Running full agent identity linting..."
	cd ../../scripts/agent-identities && npm run validate
	@echo "✅ Agent identity linting completed!"

lint-agents-quick:
	@echo "🤖 Running quick agent checks..."
	cd ../../scripts/agent-identities && npm run validate
	@echo "✅ Quick agent checks completed!"

lint-agent-index:
	@echo "🤖 Checking agent identity index..."
	cd ../../scripts/agent-identities && npm run check-sync
	@echo "✅ Agent index linting completed!"

# Agent identity generation commands
regenerate-agents:
	@echo "🔄 Regenerating agent identities..."
	cd ../../scripts/agent-identities && npm run generate -- --all
	@echo "✅ Agent identities regenerated!"

regenerate-agent:
	@echo "🔄 Regenerating $(PRODUCT) agent identity..."
	cd ../../scripts/agent-identities && npm run generate -- --product=$(PRODUCT)
	@echo "✅ $(PRODUCT) agent identity regenerated!"

check-agent-sync:
	@echo "🔍 Checking agent identity sync status..."
	cd ../../scripts/agent-identities && npm run check-sync

# Full validation including documentation and agents
validate-all: build-all test-all lint-docs lint-agents
	@echo "🎉 Complete validation including documentation and agent identities completed successfully!"
