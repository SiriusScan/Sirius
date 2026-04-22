# Sirius developer Makefile.
#
# This file lives at the repo root and contains short, ergonomic targets
# for the inner-loop dev workflow. The container-testing Makefile in
# testing/container-testing/ remains the authoritative test runner; do
# not duplicate test targets here.
#
# Conventions:
#   - All targets are phony unless documented.
#   - Targets that touch a running container assume `docker compose -f
#     docker-compose.yaml -f docker-compose.dev.yaml up -d` has been run.
#   - HOST_GOARCH is detected from `uname -m`; override on the command
#     line for cross-arch dev (e.g. building amd64 binaries on an arm64
#     mac that talks to an amd64 container).
#
# See documentation/dev/README.development.md for the full dev workflow
# and documentation/dev/architecture/README.engine-component-pinning.md
# for the pin policy that bounds these targets.

SHELL := /bin/bash

# Where each minor-project lives on disk relative to the repo root.
SIRIUS_ROOT      := $(abspath $(CURDIR))
PROJECTS_ROOT    := $(abspath $(SIRIUS_ROOT)/../minor-projects)
APP_AGENT_DIR    := $(PROJECTS_ROOT)/app-agent
APP_TERMINAL_DIR := $(PROJECTS_ROOT)/app-terminal
APP_SCANNER_DIR  := $(PROJECTS_ROOT)/app-scanner

# Container that hosts the agent / terminal / scanner Go binaries.
ENGINE_CONTAINER ?= sirius-engine

# Cross-compile target arch. Override with HOST_GOARCH=amd64 if needed.
UNAME_M := $(shell uname -m)
ifeq ($(UNAME_M),arm64)
HOST_GOARCH ?= arm64
else ifeq ($(UNAME_M),aarch64)
HOST_GOARCH ?= arm64
else
HOST_GOARCH ?= amd64
endif

# Where each binary lives inside the container.
#
# In production-mode images (target: runtime), start-enhanced.sh resolves
# AGENT_PATH to /app-agent-src (because /app-agent has no go.mod in that
# image) and runs $AGENT_PATH/server. Writing to /app-agent-src/server is
# therefore the right destination for production hot-swaps.
#
# In dev-mode (target: development) the engine bind-mounts the host's
# local repo over /app-agent and runs Air; the Air output (/app-agent/
# tmp/main) is the live binary, not /app-agent-src/server. Use the
# `make engine-mode` target to detect which mode the running container
# is in before invoking these.
AGENT_CONTAINER_BIN    := /app-agent-src/server
TERMINAL_CONTAINER_BIN := /app-terminal/terminal
SCANNER_CONTAINER_BIN  := /app-scanner/scanner

.PHONY: help \
        engine-mode \
        engine-rebuild-from-local \
        agent-hot-swap-from-local \
        terminal-hot-swap-from-local \
        scanner-hot-swap-from-local \
        engine-restart \
        engine-logs \
        _require-production-mode

# ─────────────────────────────────────────────────────────────────────
# Internal guard: hot-swap targets only meaningfully replace the live
# binary when the engine is in production mode. In dev mode:
#   - /app-terminal and /app-scanner are bind-mounted, so a docker-cp
#     into them writes through to the host repo (polluting it with a
#     compiled artifact).
#   - The live binary in dev is Air's ./tmp/main, not the production
#     binary path, so the swap is functionally a no-op anyway.
# Bypass with FORCE_HOT_SWAP=1 if you really know what you want.
# ─────────────────────────────────────────────────────────────────────
_require-production-mode:
	@if ! docker ps --format '{{.Names}}' | grep -qx '$(ENGINE_CONTAINER)'; then \
		echo "Error: $(ENGINE_CONTAINER) is not running. Start it with 'docker compose up -d'."; \
		exit 1; \
	fi
	@mode=$$(docker exec $(ENGINE_CONTAINER) printenv GO_ENV 2>/dev/null); \
	mode=$${mode:-production}; \
	if [ "$$mode" = "development" ] && [ -z "$$FORCE_HOT_SWAP" ]; then \
		echo "Refusing to hot-swap: $(ENGINE_CONTAINER) is in dev mode (GO_ENV=development)."; \
		echo ""; \
		echo "  In dev mode Air rebuilds from source on every save; the hot-swap"; \
		echo "  targets would (a) write a binary into your bind-mounted host repo,"; \
		echo "  and (b) be ignored at runtime (Air runs ./tmp/main, not the prod"; \
		echo "  binary path). Edit source and let Air handle it."; \
		echo ""; \
		echo "  If you really want to run anyway, set FORCE_HOT_SWAP=1."; \
		exit 1; \
	fi

help:
	@echo "Sirius dev-loop targets (run from the repo root)"
	@echo "================================================"
	@echo ""
	@echo "Hot-swap (cross-compile locally, copy into running container, restart):"
	@echo "  agent-hot-swap-from-local     Rebuild app-agent from $(APP_AGENT_DIR)"
	@echo "  terminal-hot-swap-from-local  Rebuild app-terminal from $(APP_TERMINAL_DIR)"
	@echo "  scanner-hot-swap-from-local   Rebuild app-scanner from $(APP_SCANNER_DIR)"
	@echo "  engine-rebuild-from-local     Hot-swap all three at once"
	@echo ""
	@echo "Container management:"
	@echo "  engine-mode                   Show whether $(ENGINE_CONTAINER) is in dev or production mode"
	@echo "  engine-restart                Restart $(ENGINE_CONTAINER)"
	@echo "  engine-logs                   Tail $(ENGINE_CONTAINER) logs"
	@echo ""
	@echo "Override HOST_GOARCH=amd64 to cross-compile for an amd64 container."
	@echo "Cross-compiling app-scanner currently falls back to a CGO-disabled"
	@echo "build because libpcap headers may not be available locally; the"
	@echo "scanner target prints a clear warning if CGO is required."
	@echo ""
	@echo "These targets are an inner-loop convenience. The authoritative"
	@echo "build path is sirius-engine/Dockerfile + GitHub-hosted minor-"
	@echo "projects. Once your local change is good, push it and bump the"
	@echo "Dockerfile/CI pin per documentation/dev/architecture/README.engine-component-pinning.md."

# ─────────────────────────────────────────────────────────────────────
# Agent: cross-compile cmd/server, copy into container, restart engine.
# ─────────────────────────────────────────────────────────────────────
agent-hot-swap-from-local: _require-production-mode
	@test -d "$(APP_AGENT_DIR)" || { echo "Error: $(APP_AGENT_DIR) not found"; exit 1; }
	@echo ">> Cross-compiling app-agent for linux/$(HOST_GOARCH)"
	cd "$(APP_AGENT_DIR)" && \
		CGO_ENABLED=0 GOOS=linux GOARCH=$(HOST_GOARCH) \
		go build -ldflags="-w -s" -o /tmp/sirius-agent-server-local ./cmd/server/main.go
	@echo ">> Copying binary into $(ENGINE_CONTAINER):$(AGENT_CONTAINER_BIN)"
	docker cp /tmp/sirius-agent-server-local $(ENGINE_CONTAINER):$(AGENT_CONTAINER_BIN)
	@rm -f /tmp/sirius-agent-server-local
	@echo ">> Restarting $(ENGINE_CONTAINER) so the new binary takes effect"
	docker restart $(ENGINE_CONTAINER) >/dev/null
	@echo ">> Done. Tail logs with: make engine-logs"

# ─────────────────────────────────────────────────────────────────────
# Terminal: cross-compile cmd, copy into container, restart engine.
# ─────────────────────────────────────────────────────────────────────
terminal-hot-swap-from-local: _require-production-mode
	@test -d "$(APP_TERMINAL_DIR)" || { echo "Error: $(APP_TERMINAL_DIR) not found"; exit 1; }
	@echo ">> Cross-compiling app-terminal for linux/$(HOST_GOARCH)"
	cd "$(APP_TERMINAL_DIR)" && \
		CGO_ENABLED=0 GOOS=linux GOARCH=$(HOST_GOARCH) \
		go build -ldflags="-w -s" -o /tmp/sirius-terminal-local ./cmd/main.go
	@echo ">> Copying binary into $(ENGINE_CONTAINER):$(TERMINAL_CONTAINER_BIN)"
	docker cp /tmp/sirius-terminal-local $(ENGINE_CONTAINER):$(TERMINAL_CONTAINER_BIN)
	@rm -f /tmp/sirius-terminal-local
	@echo ">> Restarting $(ENGINE_CONTAINER) so the new binary takes effect"
	docker restart $(ENGINE_CONTAINER) >/dev/null
	@echo ">> Done. Tail logs with: make engine-logs"

# ─────────────────────────────────────────────────────────────────────
# Scanner: cross-compile main.go, copy into container, restart engine.
# Scanner needs CGO + libpcap. We try CGO_ENABLED=1 first; if libpcap
# is missing on the host, the user must do an in-container build
# (see Phase 6c of SHA-AUDIT-2026-04.md).
# ─────────────────────────────────────────────────────────────────────
scanner-hot-swap-from-local: _require-production-mode
	@test -d "$(APP_SCANNER_DIR)" || { echo "Error: $(APP_SCANNER_DIR) not found"; exit 1; }
	@echo ">> Cross-compiling app-scanner for linux/$(HOST_GOARCH) (CGO required)"
	@# NOTE: the "( ... )" subshell grouping is required. `if ! cd X && go build`
	@# is parsed by bash as `if (! cd X) && go build`, which silently skips the
	@# build when cd succeeds — exactly the wrong behavior for a build pipeline.
	@if ! ( cd "$(APP_SCANNER_DIR)" && \
		CGO_ENABLED=1 GOOS=linux GOARCH=$(HOST_GOARCH) \
		go build -ldflags="-w -s" -o /tmp/sirius-scanner-local ./main.go ) 2>/tmp/sirius-scanner-build.err; then \
		echo ""; \
		echo "ERROR: Local cross-compile failed. The scanner needs libpcap headers"; \
		echo "       and a working linux/$(HOST_GOARCH) C cross-toolchain."; \
		echo "       (On macOS, the system clang cannot satisfy linux cgo deps;"; \
		echo "       this is expected — see workaround below.)"; \
		echo ""; \
		head -20 /tmp/sirius-scanner-build.err; \
		echo ""; \
		echo "Workaround: build inside the container instead, e.g."; \
		echo "  docker exec $(ENGINE_CONTAINER) bash -c \\"; \
		echo "    'cd /app-scanner && CGO_ENABLED=1 GOOS=linux go build -o /app-scanner/scanner main.go'"; \
		echo "Then: docker restart $(ENGINE_CONTAINER)"; \
		rm -f /tmp/sirius-scanner-build.err /tmp/sirius-scanner-local; \
		exit 1; \
	fi
	@rm -f /tmp/sirius-scanner-build.err
	@echo ">> Copying binary into $(ENGINE_CONTAINER):$(SCANNER_CONTAINER_BIN)"
	docker cp /tmp/sirius-scanner-local $(ENGINE_CONTAINER):$(SCANNER_CONTAINER_BIN)
	@rm -f /tmp/sirius-scanner-local
	@echo ">> Restarting $(ENGINE_CONTAINER) so the new binary takes effect"
	docker restart $(ENGINE_CONTAINER) >/dev/null
	@echo ">> Done. Tail logs with: make engine-logs"

# ─────────────────────────────────────────────────────────────────────
# Convenience: hot-swap all three. Best effort; failures don't abort
# the whole sequence so a partial dev run still completes.
# ─────────────────────────────────────────────────────────────────────
engine-rebuild-from-local:
	@echo "==> agent-hot-swap-from-local"
	-$(MAKE) -s agent-hot-swap-from-local
	@echo ""
	@echo "==> terminal-hot-swap-from-local"
	-$(MAKE) -s terminal-hot-swap-from-local
	@echo ""
	@echo "==> scanner-hot-swap-from-local"
	-$(MAKE) -s scanner-hot-swap-from-local

engine-restart:
	docker restart $(ENGINE_CONTAINER)

engine-logs:
	docker logs -f --tail 100 $(ENGINE_CONTAINER)

# ─────────────────────────────────────────────────────────────────────
# Diagnostic: which mode is the engine running in? Hot-swap targets
# only meaningfully replace the live binary in production mode; in dev
# mode Air owns the binary, so use plain file edits instead.
# ─────────────────────────────────────────────────────────────────────
engine-mode:
	@if ! docker ps --format '{{.Names}}' | grep -qx '$(ENGINE_CONTAINER)'; then \
		echo "$(ENGINE_CONTAINER) is not running."; \
		exit 1; \
	fi
	@mode=$$(docker exec $(ENGINE_CONTAINER) printenv GO_ENV 2>/dev/null); \
	mode=$${mode:-production}; \
	echo "$(ENGINE_CONTAINER) GO_ENV=$$mode"; \
	if [ "$$mode" = "development" ]; then \
		echo ""; \
		echo "  Dev mode is active. Air rebuilds on save from your local repos:"; \
		echo "    $(APP_AGENT_DIR)"; \
		echo "    $(APP_TERMINAL_DIR)"; \
		echo "    $(APP_SCANNER_DIR)"; \
		echo "  *-hot-swap-from-local targets will copy a binary in but Air"; \
		echo "  will rebuild from source after the engine restart, so the"; \
		echo "  swap is non-persistent. Edit source files instead."; \
	else \
		echo ""; \
		echo "  Production mode. Hot-swap targets are appropriate here."; \
	fi
