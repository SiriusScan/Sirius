---
title: "NSE Repository Management Architecture"
description: "Comprehensive architectural documentation for the NSE (Nmap Scripting Engine) repository management system, explaining how the scanner manages repositories dynamically and syncs to ValKey as the source of truth"
template: "TEMPLATE.architecture"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags:
  [
    "architecture",
    "nse",
    "repository-management",
    "scanner",
    "valkey",
    "system-design",
  ]
categories: ["development", "architecture", "security"]
difficulty: "advanced"
prerequisites:
  - "README.architecture.md"
  - "README.scanner.md"
related_docs:
  - "README.architecture.md"
  - "../apps/scanner/README.scanner.md"
  - "../README.development.md"
dependencies:
  - "../../minor-projects/app-scanner/internal/nse/"
  - "../../minor-projects/sirius-nse/"
llm_context: "high"
search_keywords:
  [
    "nse repository management",
    "scanner architecture",
    "valkey integration",
    "dynamic repository",
    "nmap scripts",
    "runtime cloning",
  ]
---

# NSE Repository Management Architecture

## Purpose

This document defines the architectural design for NSE (Nmap Scripting Engine) repository management in Sirius Scanner. It clarifies component responsibilities, data flow, and integration boundaries to prevent architectural misunderstandings.

**Critical**: The scanner is the SOLE owner of NSE repository management. No other components should manage repositories via Dockerfile or file system mounts.

## When to Use

- **System Design**: When integrating with NSE scripts or scanner
- **Component Development**: When building UI/API features that consume NSE scripts
- **Code Review**: When reviewing scanner or UI/API integration code
- **Troubleshooting**: When diagnosing NSE script synchronization issues
- **Refactoring**: When making changes to repository management or script storage

## How to Use

### Quick Overview

1. **Start with System Overview** to understand the runtime repository management model
2. **Review Component Architecture** to understand scanner vs UI vs ValKey responsibilities
3. **Check Integration Points** to see how components access scripts
4. **Reference Design Decisions** for rationale on ValKey as source of truth
5. **Follow Anti-Patterns** to avoid common architectural violations

## What It Is

### System Overview

The NSE Repository Management system provides **dynamic, runtime management** of Nmap script repositories. The scanner clones and updates Git repositories at startup, synchronizes content to ValKey, and provides a read-only interface for UI and API components.

**Key Characteristics:**

- **Runtime Management**: Repositories cloned/updated at container startup
- **Multiple Repositories**: Supports arbitrary number of configured repositories
- **Single Source of Truth**: ValKey contains authoritative script data
- **Clean Boundaries**: Clear ownership prevents conflicts

### Architectural Principles

- **Separation of Concerns**: Scanner manages repos, ValKey stores data, UI/API read data
- **Single Source of Truth**: ValKey is the canonical source for all script data
- **Dynamic Configuration**: Add/remove repositories without rebuilding containers
- **Production Ready**: No host file system dependencies

### Component Architecture

#### Scanner (app-scanner)

- **Purpose**: Manages NSE script repositories and synchronizes to ValKey
- **Responsibilities**:
  - Clone Git repositories at runtime
  - Update repositories on startup
  - Parse repository manifests
  - Sync script metadata and content to ValKey
- **Dependencies**: ValKey (write), Git repositories (read)
- **Interfaces**: ValKey keys (`nse:*`)
- **Location**: `../minor-projects/app-scanner/internal/nse/`

**Key Components:**

```
internal/nse/
├── repo.go      # RepoManager - Git clone/update operations
├── sync.go      # SyncManager - ValKey synchronization
├── types.go     # Data structures and ValKey keys
└── README.md    # Implementation documentation
```

#### ValKey

- **Purpose**: Source of truth for NSE script data
- **Responsibilities**:
  - Store repository manifest
  - Store script manifest
  - Store script content
  - Provide read access to UI/API
- **Dependencies**: None (data store)
- **Interfaces**: Redis protocol
- **Keys**:
  - `nse:repo-manifest` - Repository list configuration
  - `nse:manifest` - Complete script manifest (612+ scripts)
  - `nse:script:<id>` - Individual script content

#### UI (sirius-ui)

- **Purpose**: Display scripts and manage scan profiles
- **Responsibilities**:
  - Read scripts from ValKey
  - Display script information to users
  - Allow script selection for scan profiles
- **Dependencies**: ValKey (read-only)
- **Interfaces**: tRPC procedures reading from ValKey
- **Location**: `sirius-ui/src/server/api/routers/store.ts`

**❌ NEVER**:

- Read from file system (`/sirius-nse/`)
- Clone or manage repositories
- Populate ValKey with script data

#### API (sirius-api)

- **Purpose**: Serve script data to external consumers
- **Responsibilities**:
  - Read scripts from ValKey
  - Provide REST endpoints for script data
- **Dependencies**: ValKey (read-only)
- **Interfaces**: REST API

**❌ NEVER**:

- Read from file system
- Manage repositories

### Data Flow

#### Repository Synchronization Flow

1. **Scanner Startup**: `main.go` creates `ScanManager`
2. **Initialize Managers**: Creates `RepoManager` and `SyncManager`
3. **Start Listening**: Calls `ListenForScans()`
4. **Sync Repositories**: `nseSync.Sync(ctx)` executes:
   - Loads repository list from manifest or ValKey
   - Clones repositories to `/opt/sirius/nse/<repo-name>`
   - Reads local manifests from each repository
   - Syncs to ValKey keys
5. **Ready**: Scripts available to UI/API via ValKey

#### UI Script Access Flow

1. **User Action**: Navigates to Scanner → Profiles
2. **UI Request**: Calls `getNseScripts` tRPC procedure
3. **ValKey Read**: Reads `nse:manifest` key
4. **Parse Manifest**: Extracts script list
5. **Display**: Shows 612 scripts to user

#### Scan Execution Flow

1. **User Action**: Creates scan with selected scripts
2. **Scanner Receives**: Gets scan request via RabbitMQ
3. **Script Selection**: Uses scripts from local repository
4. **Nmap Execution**: Runs Nmap with selected NSE scripts
5. **Results Storage**: Stores results in PostgreSQL

### Integration Points

#### Scanner → ValKey

- **Type**: Redis protocol (write)
- **Purpose**: Sync repository data to source of truth
- **Protocol**: Redis SET commands
- **Data Format**: JSON-serialized manifests and script content
- **Keys Written**:
  - `nse:repo-manifest` - Repository configuration
  - `nse:manifest` - Script manifest
  - `nse:script:<id>` - Script content

#### UI → ValKey

- **Type**: Redis protocol (read-only)
- **Purpose**: Display scripts to users
- **Protocol**: Redis GET commands
- **Data Format**: JSON-serialized data
- **Keys Read**:
  - `nse:manifest` - Script list
  - `nse:script:<id>` - Script details

#### Scanner → Git Repositories

- **Type**: Git protocol
- **Purpose**: Clone and update script repositories
- **Protocol**: `git clone`, `git fetch`, `git reset --hard`
- **Data Format**: Git repository
- **Locations**: `/opt/sirius/nse/<repo-name>`

### Technology Stack

#### Backend

- **Go**: Scanner implementation language
- **Git**: Repository version control
- **ValKey/Redis**: Data storage and source of truth

#### Frontend

- **Next.js**: UI framework
- **tRPC**: Type-safe API layer
- **Valkey Client**: Redis client for script access

#### Infrastructure

- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration
- **Volume Mounts**: Development-only, not for repositories

### Design Decisions

#### Decision 1: ValKey as Source of Truth

- **Context**: Multiple components need access to NSE script data
- **Decision**: Use ValKey as canonical source instead of shared file system
- **Rationale**:
  - Clean separation of concerns
  - No file system dependencies
  - Easy to scale (ValKey cluster)
  - Supports production deployments
  - UI/API don't need repository knowledge
- **Consequences**:
  - Scanner must sync on startup
  - ValKey becomes critical dependency
  - All components read from ValKey

#### Decision 2: Runtime Repository Management

- **Context**: Need to support multiple repositories and dynamic updates
- **Decision**: Clone repositories at runtime instead of Dockerfile
- **Rationale**:
  - Add/remove repositories without rebuilds
  - Support arbitrary number of repositories
  - Update repositories on restart
  - Clean container images
- **Consequences**:
  - Startup time includes git clone
  - Network required for cloning
  - Scanner owns repository lifecycle

#### Decision 3: UI Read-Only Access

- **Context**: UI needs to display scripts for profile management
- **Decision**: UI only reads from ValKey, never manages repositories
- **Rationale**:
  - Clear ownership (scanner manages, UI displays)
  - No duplicate repository logic
  - UI can't corrupt scanner state
  - Simpler UI implementation
- **Consequences**:
  - UI depends on scanner having run
  - No offline UI script management
  - Scanner must be healthy

### Security Considerations

- **Repository Trust**: Only clone from trusted Git repositories
- **ValKey Access**: ValKey should not be publicly accessible
- **Script Validation**: Scripts are trusted (from official Nmap repository)
- **File System Permissions**: Scanner runs with minimal permissions

### Performance Characteristics

- **Startup Time**: ~5-10 seconds for git clone + sync (612 scripts)
- **Sync Performance**: ~1 second to sync manifest to ValKey
- **UI Query Performance**: <100ms to read from ValKey
- **Memory Usage**: ~50MB for repository storage

### Scalability Considerations

- **Multiple Repositories**: Linear scaling with repository count
- **Script Count**: ValKey handles thousands of scripts efficiently
- **Concurrent Access**: ValKey supports multiple readers
- **Container Replicas**: Each scanner manages own repository copy

## Troubleshooting

### FAQ

**Q: Why doesn't the UI show any scripts?**
A: The scanner may not have started yet. The scanner syncs scripts to ValKey at startup via `ListenForScans()` → `Sync()`. Check scanner logs for sync messages.

**Q: Can I add a volume mount for sirius-nse to the UI?**
A: **No**. This violates the architecture. The UI should ONLY read from ValKey. Adding a volume mount creates unnecessary coupling and doesn't work in production.

**Q: How do I add a new NSE script repository?**
A: Update `app-scanner/internal/nse/manifest.json` or the `nse:repo-manifest` key in ValKey, then restart the scanner. It will automatically clone and sync the new repository.

### Command Reference

| Command                                                 | Purpose                  | Example                                                                         | Notes                           |
| ------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------- | ------------------------------- |
| `docker exec sirius-valkey valkey-cli GET nse:manifest` | Check script manifest    | `docker exec sirius-valkey valkey-cli GET nse:manifest \| jq '.scripts.length'` | Returns 612 if synced correctly |
| `docker logs sirius-engine \| grep -i nse`              | Check scanner sync logs  | `docker logs sirius-engine \| grep -i "sync\|nse"`                              | Shows sync progress             |
| `docker exec sirius-engine ls /opt/sirius/nse/`         | List cloned repositories | `docker exec sirius-engine ls -la /opt/sirius/nse/sirius-nse`                   | Verifies repository exists      |
| `docker restart sirius-engine`                          | Force repository re-sync | `docker restart sirius-engine`                                                  | Re-clones and syncs all repos   |
| `docker exec sirius-engine rm -rf /opt/sirius/nse/`     | Clear repository cache   | `docker exec sirius-engine rm -rf /opt/sirius/nse/sirius-nse`                   | Forces fresh clone on restart   |

### Common Issues

| Issue                         | Symptoms                              | Root Cause                                     | Solution                                                                  |
| ----------------------------- | ------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| UI shows no scripts           | Empty script list                     | Scanner hasn't synced or ValKey empty          | Check scanner logs, restart scanner, verify ValKey keys                   |
| UI shows only 1 script        | Fallback script displayed             | UI tried to read file system instead of ValKey | Update UI code to read from ValKey (see `store.ts`)                       |
| Scanner fails to clone        | "git clone failed" errors             | Network issues or invalid repository URL       | Check network, verify repository URL in manifest                          |
| Scripts not updating          | Old scripts persist after repo update | Scanner cache not cleared                      | Restart scanner or manually delete `/opt/sirius/nse/` and restart         |
| Production deployment failing | Container can't find scripts          | Missing volume mount (wrong approach)          | Remove volume mount, ensure scanner syncs to ValKey, UI reads from ValKey |

### Debugging Steps

1. **Check ValKey has scripts**:

   ```bash
   docker exec sirius-valkey valkey-cli GET nse:manifest | jq '.scripts | length'
   # Should return: 612
   ```

2. **Verify scanner synced**:

   ```bash
   docker logs sirius-engine | grep -i "sync\|nse\|manifest"
   # Should see: "Successfully initialized 612 NSE scripts"
   ```

3. **Test UI reading from ValKey**:

   - Navigate to Scanner → Profiles
   - Click "Initialize NSE Scripts"
   - Should show: "Found 612 NSE scripts (synced by scanner)"

4. **Review scanner startup**:
   ```bash
   docker logs sirius-engine --tail 100
   # Check for sync errors during startup
   ```

## Anti-Patterns

### ❌ NEVER DO THESE

1. **Clone repositories in Dockerfile**:

   ```dockerfile
   # ❌ WRONG - Breaks dynamic management
   RUN git clone https://github.com/SiriusScan/sirius-nse.git /sirius-nse
   ```

2. **Add volume mount for UI to read repositories**:

   ```yaml
   # ❌ WRONG - Violates architecture boundaries
   sirius-ui:
     volumes:
       - ../minor-projects/sirius-nse:/sirius-nse
   ```

3. **Have UI read from file system**:

   ```typescript
   // ❌ WRONG - UI should only read from ValKey
   const manifestPath = "/sirius-nse/manifest.json";
   const data = fs.readFileSync(manifestPath);
   ```

4. **Have UI populate ValKey**:
   ```typescript
   // ❌ WRONG - Scanner owns ValKey population
   await valkey.set("nse:manifest", JSON.stringify(manifest));
   ```

### ✅ ALWAYS DO THESE

1. **Let scanner manage repositories**:

   ```go
   // ✅ CORRECT - Scanner manages at runtime
   repoManager := nse.NewRepoManager("/opt/sirius/nse/sirius-nse", nse.NSERepoURL)
   syncManager := nse.NewSyncManager(repoManager, kvStore)
   ```

2. **Have UI read from ValKey**:

   ```typescript
   // ✅ CORRECT - UI reads from ValKey
   const manifestData = await valkey.get("nse:manifest");
   const manifest = JSON.parse(manifestData);
   ```

3. **Use ValKey as integration point**:
   ```
   Scanner (File System) → ValKey → UI/API (Read-Only)
   ```

## Lessons Learned

### 2025-10-25 - UI Should Never Manage Repositories

**What happened**: UI was trying to read from file system (`/sirius-nse/manifest.json`) and populate ValKey, resulting in only 1 script being shown instead of 612.

**Root cause**: Misunderstanding of architecture - assumed UI should manage repositories.

**What we learned**: The scanner ALREADY populates ValKey with 612 scripts at startup. The UI should ONLY read from ValKey. This maintains clean separation of concerns and prevents duplication of repository management logic.

**Impact**:

- Removed unnecessary volume mount from UI
- Updated UI to read from ValKey only
- Added comprehensive architecture documentation
- Updated bot identity with clear integration boundaries

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
