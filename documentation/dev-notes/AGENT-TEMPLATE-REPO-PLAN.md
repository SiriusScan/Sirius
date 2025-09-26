# Sirius Agent Modules Repository Management System

## Overview

This document outlines the implementation plan for Phase 4 of the Sirius Agent Enhancements project: Repository Management and Update System. The goal is to create a centralized repository system for vulnerability detection templates and scripts that allows for easy community contributions and automated updates.

**Repository Name**: `sirius-agent-modules` (existing repository)
**Location**: `../minor-projects/sirius-agent-modules`

## Current Repository Structure

### Completed Structure ✅

```
sirius-agent-modules/
├── README.md ✅
├── repository-manifest.json ✅
├── docs/
│   ├── template-development.md ✅
│   ├── script-development.md ✅
│   └── contribution-guidelines.md ✅
├── templates/
│   ├── manifest.json ✅
│   ├── hash-based/
│   │   └── apache-vulnerabilities.yaml ✅
│   ├── registry-based/ ✅
│   │   └── windows-services.yaml ✅
│   └── config-based/
│       └── ssh-weak-config.yaml ✅
└── scripts/
    ├── manifest.json ✅
    ├── windows/ ✅
    │   └── check-service-permissions.ps1 ✅
    ├── linux/ ✅
    │   └── check-suid-binaries.sh ✅
    └── cross-platform/
        ├── find-password-files.sh ✅
        └── certificate-validation.py ✅
```

### Repository Statistics ✅

- **Total Templates**: 3 (hash-based: 1, registry-based: 1, config-based: 1)
- **Total Scripts**: 4 (Windows: 1, Linux: 1, Cross-platform: 2)
- **Platform Coverage**: Windows (3), Linux (4), macOS (3)
- **Severity Distribution**: High (4), Medium (3)

## Repository Architecture

### Repository-Level Versioning ✅

- **Semantic Versioning**: Repository uses semantic versioning (e.g., v1.0.0, v1.1.0)
- **Manifest-Based**: All version information stored in `repository-manifest.json`
- **Atomic Updates**: Entire repository updated as a single unit
- **Rollback Support**: Previous versions can be restored

### Top-Level Repository Manifest ✅

```json
{
  "version": "1.0.0",
  "updated": "2024-01-15T10:30:00Z",
  "metadata": {
    "name": "sirius-agent-modules",
    "description": "Official Sirius vulnerability detection templates and scripts",
    "publisher": "Sirius Security",
    "license": "MIT",
    "url": "https://github.com/sirius-security/sirius-agent-modules",
    "min_agent_version": "1.0.0"
  },
  "components": {
    "templates": {
      "version": "1.0.0",
      "path": "templates/",
      "manifest": "templates/manifest.json",
      "updated": "2024-01-15T10:30:00Z"
    },
    "scripts": {
      "version": "1.0.0",
      "path": "scripts/",
      "manifest": "scripts/manifest.json",
      "updated": "2024-01-15T10:30:00Z"
    }
  },
  "statistics": {
    "total_templates": 3,
    "total_scripts": 4,
    "by_type": {
      "hash-based": 1,
      "registry-based": 1,
      "config-based": 1
    },
    "by_platform": {
      "windows": 3,
      "linux": 4,
      "macos": 3
    }
  }
}
```

## Implementation Plan

### Phase 4.1: Complete Repository Structure ✅

- **Status**: COMPLETED
- **Tasks**:
  - ✅ Add missing directories (registry-based, windows scripts, linux scripts)
  - ✅ Create top-level repository-manifest.json
  - ✅ Update README.md with proper description
  - ✅ Add contribution guidelines
  - ✅ Update existing documentation

#### 4.1.1 Repository Manager Implementation ✅

- **File**: `app-agent/internal/repository/github_manager.go`
- **Status**: ✅ **COMPLETED**
- **Features**:
  - GitHub repository synchronization
  - Manifest-based version tracking
  - Incremental update detection
  - Atomic update application
  - Checksum validation
  - Backup and rollback support

### Phase 4.2: Repository Integration (Week 1-2)

#### 4.2.1 Agent Repository Integration

- **File**: `app-agent/internal/repository/integration.go`
- **Features**:
  - Repository initialization with `sirius-agent-modules`
  - Template loading from repository
  - Script loading from repository
  - Update coordination
  - Error handling and recovery

#### 4.2.2 Scan Command Integration

- **File**: `app-agent/internal/commands/scan/scan_command.go`
- **Integration Points**:
  - Load templates from `sirius-agent-modules` repository
  - Execute templates with repository context
  - Cache templates for performance
  - Handle template updates

#### 4.2.3 Script Executor Integration

- **File**: `app-agent/internal/detect/script/executor.go`
- **Integration Points**:
  - Load scripts from `sirius-agent-modules` repository
  - Execute scripts with security controls
  - Cache scripts for performance
  - Handle script updates

### Phase 4.3: CLI Commands (Week 2)

#### 4.3.1 Repository Management Commands

- **Commands**:
  - `internal:repo-status` - Show repository status and version
  - `internal:repo-update` - Manual repository update
  - `internal:repo-list` - List available templates/scripts
  - `internal:repo-validate` - Validate repository integrity

### Phase 4.4: Community Collaboration (Week 2-3)

#### 4.4.1 Basic Pull Request Workflow

- **Repository**: `sirius-agent-modules` (existing)
- **Contribution**: Standard GitHub pull request workflow
- **Review Process**: Manual review by maintainers
- **Quality Gates**: Automated validation and testing

#### 4.4.2 Template Development Guidelines ✅

- **File**: `docs/template-development.md` ✅
- **Content**:
  - Template structure and syntax
  - Best practices for detection logic
  - Testing requirements
  - Submission guidelines

#### 4.4.3 Script Development Guidelines ✅

- **File**: `docs/script-development.md` ✅
- **Content**:
  - Script structure and output format
  - Security best practices
  - Platform compatibility requirements
  - Testing and validation

## Technical Implementation Details

### Repository Manager Interface

```go
type RepositoryManager interface {
    Initialize(ctx context.Context) error
    UpdateRepository(ctx context.Context) (*UpdateResult, error)
    LoadManifest() (*Manifest, error)
    SaveManifest(manifest *Manifest) error
    GetRepositoryInfo() (*RepositoryInfo, error)
    ValidateRepository(ctx context.Context) (*ValidationResult, error)
}
```

### Update Process Flow

1. **Check for Updates**: Download remote manifest and compare with local
2. **Download Changes**: Download new/updated files only
3. **Validate Content**: Verify checksums and file integrity
4. **Apply Updates**: Atomic update with backup
5. **Update Manifest**: Save new manifest locally
6. **Notify Agent**: Trigger template/script reload

### Security Considerations

- **Checksum Validation**: SHA256 checksums for all files
- **HTTPS Only**: Secure communication with repository
- **Sandboxed Execution**: Script execution in controlled environment
- **Content Validation**: Template and script format validation

### Performance Optimizations

- **Incremental Updates**: Download only changed files
- **Caching**: Cache templates and scripts in memory
- **Concurrent Downloads**: Parallel file downloads
- **Compression**: Gzip compression for downloads

## Task Breakdown

### Updated Task List for Phase 4

#### 4.1: Complete Repository Structure ✅

- **Status**: COMPLETED
- **Tasks**:
  - ✅ Add missing directories (registry-based, windows scripts, linux scripts)
  - ✅ Create top-level repository-manifest.json
  - ✅ Update README.md with proper description
  - ✅ Add contribution guidelines
  - ✅ Update existing documentation

#### 4.2: Repository Integration

- **Status**: PENDING
- **Files**: `integration.go`, `scan_command.go` (updates)
- **Tasks**:
  - [ ] Integrate repository with scan command
  - [ ] Add template loading from repository
  - [ ] Add script loading from repository
  - [ ] Implement update coordination

#### 4.3: CLI Commands

- **Status**: PENDING
- **Files**: `cmd/repository/` (new package)
- **Tasks**:
  - [ ] Implement repo-status command
  - [ ] Implement repo-update command
  - [ ] Implement repo-list command
  - [ ] Add command registration

#### 4.4: Testing and Documentation

- **Status**: PENDING
- **Tasks**:
  - [ ] Comprehensive unit tests
  - [ ] Integration tests
  - [ ] Documentation updates
  - [ ] Deployment guide

## Success Criteria

### Functional Requirements

- [ ] Agents can download and update templates/scripts from `sirius-agent-modules`
- [ ] Repository updates are atomic and safe
- [ ] Templates and scripts load correctly from repository
- [ ] CLI commands provide repository management functionality
- [ ] Community contributions work via pull requests

### Performance Requirements

- [ ] Repository updates complete within 30 seconds
- [ ] Template/script loading adds <1 second to scan time
- [ ] Memory usage remains reasonable (<100MB for repository)
- [ ] Network usage is optimized (incremental updates)

### Quality Requirements

- [ ] 90%+ test coverage for repository code
- [ ] All security validations pass
- [ ] Error handling is comprehensive
- [ ] Documentation is complete and accurate

## Timeline

- **Week 1**: Repository integration and CLI commands
- **Week 2**: Testing and documentation
- **Week 3**: Final testing and deployment

## Risk Mitigation

### Technical Risks

- **Network Failures**: Implement retry logic and offline mode
- **Corruption**: Atomic updates with rollback capability
- **Performance**: Caching and incremental updates
- **Security**: Content validation and sandboxing

### Community Risks

- **Quality Control**: Automated validation and manual review
- **Compatibility**: Version checking and backward compatibility
- **Maintenance**: Clear guidelines and documentation
- **Adoption**: Easy contribution workflow and recognition

## Next Steps

1. **Repository Integration**: Connect `sirius-agent-modules` to agent scan command
2. **Implement CLI Commands**: Add repository management commands
3. **Testing and Documentation**: Comprehensive testing and documentation

This implementation plan leverages the existing `sirius-agent-modules` repository structure while adding the missing components needed for a complete repository management system.
