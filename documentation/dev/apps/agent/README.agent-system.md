---
title: "Agent System Architecture"
description: "Comprehensive architecture documentation for the Sirius distributed agent system, including gRPC communication, template synchronization, and vulnerability detection"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Platform Team"
tags:
  [
    "agent",
    "grpc",
    "architecture",
    "distributed-system",
    "template-system",
    "vulnerability-detection",
  ]
categories: ["architecture", "agent-system", "distributed-systems"]
difficulty: "advanced"
prerequisites:
  - "Basic understanding of gRPC and Protocol Buffers"
  - "Familiarity with Go programming language"
  - "Understanding of distributed system concepts"
  - "Knowledge of Docker and containerization"
related_docs:
  - "README.docker-architecture.md"
  - "README.development.md"
  - "../README.developer-guide.md"
  - "../apps/README.agent-template-api.md"
dependencies:
  - "app-agent/"
  - "sirius-api/"
  - "proto/hello/"
llm_context: "high"
search_keywords:
  [
    "agent",
    "grpc",
    "distributed",
    "template",
    "vulnerability",
    "detection",
    "synchronization",
    "bidirectional-stream",
    "protobuf",
  ]
---

# Agent System Architecture

## Overview

The Sirius Agent System is a distributed architecture for managing remote security agents that perform vulnerability detection and system scanning across heterogeneous environments. The system uses gRPC bidirectional streaming for real-time communication, a template-based detection engine, and a sophisticated synchronization mechanism for distributing vulnerability signatures.

### System Components

```
┌──────────────────────────────────────────────────────┐
│                  Sirius Platform                      │
│  ┌────────────────┐      ┌────────────────┐         │
│  │  sirius-api    │◄────►│  sirius-ui     │         │
│  │  (Go/Fiber)    │      │  (Next.js)     │         │
│  └────────┬───────┘      └────────────────┘         │
│           │                                           │
│           │ RabbitMQ (Command Queue)                 │
│           ▼                                           │
│  ┌────────────────┐                                  │
│  │  Agent Server  │◄──────── Valkey/Redis           │
│  │  (gRPC)        │         (Template Storage)       │
│  └────────┬───────┘                                  │
│           │ Bidirectional gRPC Stream                │
│           │                                           │
└───────────┼───────────────────────────────────────────┘
            │
    ┌───────┴───────┬──────────┬──────────┐
    │               │          │          │
    ▼               ▼          ▼          ▼
┌────────┐    ┌────────┐  ┌────────┐  ┌────────┐
│ Agent  │    │ Agent  │  │ Agent  │  │ Agent  │
│ Linux  │    │ Win    │  │ macOS  │  │ Remote │
└────────┘    └────────┘  └────────┘  └────────┘
```

## Core Architecture

### 1. Agent Server

**Location**: `app-agent/cmd/server/` and `app-agent/internal/server/`

**Purpose**: Central hub for agent management, command distribution, and template synchronization.

#### Server Components

```go
type Server struct {
    // Core services
    logger  *zap.Logger
    config  *config.ServerConfig
    server  *grpc.Server

    // Agent management
    agentsMutex sync.RWMutex
    agents      map[string]pb.HelloService_ConnectStreamServer

    // Command tracking
    commandsMutex sync.RWMutex
    commands      map[string]*CommandStatus

    // Template system
    templateManager *ServerTemplateManager
    valkeyClient    valkey.Client

    // Response storage
    responseStore store.ResponseStore

    // Pending command correlation
    pendingCommandsMutex sync.Mutex
    pendingCommands      map[string]string
}
```

#### Key Responsibilities

1. **Agent Connection Management**

   - Accept and maintain bidirectional gRPC streams
   - Track connected agents with unique IDs
   - Handle agent disconnections gracefully
   - Monitor agent health via heartbeats

2. **Command Distribution**

   - Listen to RabbitMQ for commands from UI
   - Route commands to appropriate agents
   - Track command execution status
   - Store results in Valkey for UI retrieval

3. **Template Synchronization**

   - Sync templates from GitHub repository
   - Store templates in Valkey
   - Distribute templates to agents
   - Handle custom template uploads

4. **State Management**
   - Maintain agent connection state
   - Track command execution lifecycle
   - Coordinate template versioning
   - Manage concurrent access safely

### 2. Agent Client

**Location**: `app-agent/cmd/agent/` and `app-agent/internal/agent/`

**Purpose**: Remote endpoint that executes commands and performs vulnerability scans.

#### Agent Components

```go
type Agent struct {
    // gRPC communication
    logger    *zap.Logger
    config    *config.AgentConfig
    conn      *grpc.ClientConn
    client    pb.HelloServiceClient
    stream    pb.HelloService_ConnectStreamClient

    // Agent information
    startTime time.Time
    agentInfo commands.AgentInfo

    // Scripting support
    powerShellPath   string
    scriptingEnabled bool

    // Template management
    syncManager *templateagent.AgentSyncManager
}
```

#### Key Responsibilities

1. **Server Communication**

   - Establish bidirectional gRPC stream
   - Send periodic heartbeats with system metrics
   - Receive and process server messages
   - Handle connection failures and reconnection

2. **Command Execution**

   - Process internal commands (status, help, scan)
   - Execute shell commands via PowerShell/bash
   - Capture command output and errors
   - Report execution results to server

3. **Template Synchronization**

   - Request template updates from server
   - Receive and cache templates locally
   - Validate template checksums
   - Maintain local template manifest

4. **Vulnerability Scanning**
   - Load and parse cached templates
   - Execute template detection steps
   - Evaluate detection logic
   - Report scan results

## Communication Protocol

### gRPC Service Definition

```protobuf
service HelloService {
  // Health check
  rpc Ping(PingRequest) returns (PingResponse) {}

  // Bidirectional streaming for real-time communication
  rpc ConnectStream(stream AgentMessage) returns (stream ServerMessage) {}
}

enum MessageType {
  UNKNOWN = 0;
  HEARTBEAT = 1;              // Agent → Server: Health status
  COMMAND = 2;                // Server → Agent: Execute command
  RESULT = 3;                 // Agent → Server: Command result
  ACKNOWLEDGMENT = 4;         // Server → Agent: Confirm receipt
  TEMPLATE_UPDATE = 5;        // Server → Agent: Template data
  TEMPLATE_SYNC_REQUEST = 6;  // Agent → Server: Request templates
}
```

### Message Flow Patterns

#### Command Execution Flow

```
1. UI/API → RabbitMQ
   └─ Queue: agent_commands
   └─ Message: {action, command, agentId, userId, timestamp}

2. Server consumes from RabbitMQ
   └─ Validates agent is connected
   └─ Sends ACK to agent_response queue
   └─ Generates commandId = "agentId:timestamp"
   └─ Stores in pendingCommands map
   └─ Forwards to agent via gRPC stream

3. Agent receives COMMAND message
   └─ Checks internal command registry
   └─ If not found, executes as shell command
   └─ Captures stdout, stderr, exit code
   └─ Sends RESULT message to server

4. Server receives RESULT message
   └─ Looks up commandId from pendingCommands
   └─ Creates CommandResponse object
   └─ Stores in Valkey: key = "cmd:result:{commandId}"
   └─ Logs to file
   └─ Sends ACKNOWLEDGMENT to agent

5. UI/API polls Valkey
   └─ Retrieves result using commandId
   └─ Displays to user
```

#### Template Sync Flow

```
1. Agent sends TEMPLATE_SYNC_REQUEST
   └─ Includes lastSync timestamp
   └─ Sent via gRPC stream

2. Server processes sync request
   └─ Queries Valkey for templates updated after lastSync
   └─ Builds TemplateManifest (metadata only)
   └─ Sends manifest as first message

3. Server streams templates
   └─ For each template:
       ├─ Retrieves content from Valkey
       ├─ Calculates checksum
       ├─ Creates TEMPLATE_UPDATE message
       └─ Sends via stream

4. Agent receives templates
   └─ For each TEMPLATE_UPDATE:
       ├─ Writes to cache directory (atomic)
       ├─ Verifies checksum
       ├─ Updates local manifest
       └─ Ready for scanning

5. Agent completes sync
   └─ Updates lastSync timestamp
   └─ Templates available for execution
```

#### Heartbeat Flow

```
Agent (every 30 seconds):
  └─ Collects system metrics (CPU, memory)
  └─ Sends HEARTBEAT message
  └─ Includes timestamp, metrics

Server receives HEARTBEAT:
  └─ Updates agent last-seen time
  └─ Logs metrics (debug level)
  └─ No response needed (fire-and-forget)
```

## Template System Architecture

### Template Structure

The template system uses YAML-based vulnerability definitions that are platform-agnostic and module-driven.

#### Template Definition

```yaml
id: apache-outdated
info:
  name: Outdated Apache HTTP Server
  author: security-team
  severity: high
  description: Detects Apache versions with known CVEs
  cve:
    - CVE-2021-44228
  tags: [apache, web-server, cve]
  version: "1.0"

detection:
  logic: all # all (AND) or any (OR)
  steps:
    - type: version-cmd
      platforms: [linux, darwin]
      weight: 1.0
      config:
        command: "httpd -v"
        version_regex: "Apache/(\\d+\\.\\d+\\.\\d+)"
        vulnerable_versions:
          - "< 2.4.52"

    - type: file-content
      platforms: [linux, darwin]
      weight: 0.8
      config:
        path: "/etc/apache2/apache2.conf"
        patterns: ["ServerTokens.*Full"]
```

### Template Execution Engine

**Location**: `app-agent/internal/template/executor/`

```
┌─────────────────────────────────────────────┐
│         Template Executor                    │
├─────────────────────────────────────────────┤
│                                              │
│  1. Filter Steps by Platform                │
│     └─ Current OS: linux/darwin/windows     │
│                                              │
│  2. Execute Steps Sequentially              │
│     ├─ Get module from registry             │
│     ├─ Create timeout context               │
│     ├─ Execute module                       │
│     └─ Collect results                      │
│                                              │
│  3. Evaluate Detection Logic                │
│     ├─ logic: all → All steps match (AND)   │
│     └─ logic: any → Any step matches (OR)   │
│                                              │
│  4. Calculate Confidence                    │
│     ├─ logic: all → Min(weights)            │
│     └─ logic: any → Max(weights)            │
│                                              │
│  5. Build Result                            │
│     └─ {matched, confidence, steps, errors} │
│                                              │
└─────────────────────────────────────────────┘
```

### Detection Modules

Detection modules are pluggable components that implement specific detection mechanisms.

#### Module Interface

```go
type Module interface {
    Name() string
    Execute(ctx context.Context, config map[string]interface{}) (*ModuleResult, error)
}

type ModuleResult struct {
    Matched  bool
    Evidence map[string]interface{}
    Error    string
}
```

#### Available Modules

| Module        | Type          | Purpose                    | Platforms         |
| ------------- | ------------- | -------------------------- | ----------------- |
| version-cmd   | Command       | Parse version from command | All               |
| file-hash     | File System   | Check file SHA256 hash     | All               |
| file-content  | File System   | Search file for patterns   | All               |
| registry-key  | Windows       | Check registry keys/values | Windows only      |
| service-check | System        | Verify service exists/runs | All               |
| config-check  | Configuration | Parse and validate configs | All               |
| script-exec   | Custom        | Execute custom detection   | Platform-specific |

#### Module Registration

```go
// Module implementation
type FileHashModule struct{}

func (m *FileHashModule) Name() string {
    return "file-hash"
}

func (m *FileHashModule) Execute(ctx context.Context, config map[string]interface{}) (*ModuleResult, error) {
    // Implementation
}

// Registration (in init())
func init() {
    registry.Register(&FileHashModule{})
}
```

### Template Storage and Distribution

#### Server-Side Storage (Valkey)

```
Template Keys Structure:

  template:manifest
    └─ Global manifest JSON with all template metadata

  template:meta:<template-id>
    └─ Individual template metadata JSON
    └─ {id, version, checksum, size, severity, platforms, etc.}

  template:standard:<template-id>
    └─ Standard template YAML content
    └─ From sirius-agent-modules GitHub repository

  template:custom:<template-id>
    └─ Custom template YAML content
    └─ User-uploaded via UI
```

#### Agent-Side Cache

```
Cache Directory Structure:

Windows:  C:\ProgramData\Sirius\templates\
Linux:    /var/lib/sirius/templates/
macOS:    /Library/Application Support/Sirius/templates/

Contents:
  ├── cache-manifest.json          # Local cache metadata
  │   └─ {version, lastSync, templates{}, statistics{}}
  │
  ├── standard/                    # Standard templates
  │   ├── apache-outdated.yaml
  │   ├── nginx-vuln.yaml
  │   └── ssh-weak-ciphers.yaml
  │
  └── custom/                      # Custom templates
      └── org-policy-check.yaml
```

#### Template Synchronization Manager

**Server Side** (`internal/server/template_manager.go`):

```go
type ServerTemplateManager struct {
    valkeyClient valkey.Client
    storage      *templatevalkey.ValKeyTemplateStorage
    githubSync   *templatevalkey.GitHubSyncManager
    logger       *zap.Logger
    config       *TemplateConfig
    server       *Server
}

// Key Methods:
// - SyncFromGitHub() → Pull from sirius-agent-modules
// - GetTemplatesForSync() → Prepare templates for agent
// - StoreCustomTemplate() → Handle user uploads
// - ValidateTemplate() → Security and syntax checks
```

**Agent Side** (`internal/template/agent/sync_manager.go`):

```go
type AgentSyncManager struct {
    cacheDir   string
    logger     *zap.Logger
    serverURL  string
    agentID    string
    grpcStream pb.HelloService_ConnectStreamClient
}

// Key Methods:
// - SyncFromServer() → Request template sync
// - HandleTemplateUpdate() → Process incoming templates
// - LoadTemplates() → Load cached templates for scanning
// - ValidateCache() → Verify template checksums
```

## Command System

### Command Architecture

The agent supports both internal commands (built into the agent) and shell commands (executed via PowerShell/bash).

```
┌─────────────────────────────────────────────┐
│         Command Dispatcher                   │
├─────────────────────────────────────────────┤
│                                              │
│  1. Receive Command String                  │
│     └─ From server via gRPC stream          │
│                                              │
│  2. Parse Command                           │
│     ├─ Extract command name                 │
│     └─ Parse arguments                      │
│                                              │
│  3. Check Command Registry                  │
│     ├─ Internal command? → Execute handler  │
│     └─ Not found? → Fall back to shell      │
│                                              │
│  4. Execute                                 │
│     ├─ Internal: Call Go function           │
│     └─ Shell: Execute via PowerShell/bash   │
│                                              │
│  5. Capture Result                          │
│     ├─ stdout, stderr                       │
│     ├─ exit code                            │
│     └─ execution time                       │
│                                              │
│  6. Send Result to Server                   │
│     └─ RESULT message via gRPC stream       │
│                                              │
└─────────────────────────────────────────────┘
```

### Internal Commands

| Command         | Purpose                          | Example                              |
| --------------- | -------------------------------- | ------------------------------------ |
| `help`          | List available commands          | `help`                               |
| `status`        | Agent status and capabilities    | `status`                             |
| `scan`          | Execute vulnerability scan       | `scan --targets=192.168.1.0/24`      |
| `template list` | List cached templates            | `template list`                      |
| `template sync` | Trigger template synchronization | `template sync`                      |
| `templatescan`  | Run specific template            | `templatescan --template=apache-001` |

### Command Registration

```go
// Command handler signature
type CommandHandler func(ctx context.Context, info AgentInfo, args []string) (string, error)

// Registration
func Register(name string, handler CommandHandler) {
    commandsMutex.Lock()
    defer commandsMutex.Unlock()
    commands[name] = handler
}

// Dispatch
func Dispatch(ctx context.Context, info AgentInfo, commandString string) (string, error) {
    cmdName, args := parseCommandLine(commandString)

    handler, exists := commands[cmdName]
    if !exists {
        return "", ErrUnknownCommand
    }

    return handler(ctx, info, args)
}
```

### Shell Command Execution

When a command is not found in the internal registry, the agent attempts to execute it as a shell command.

#### PowerShell Execution (Windows)

```go
func ExecuteScript(ctx context.Context, psPath string, scriptContent string) (stdout, stderr string, exitCode int, err error) {
    // Create temp script file
    tempFile := filepath.Join(os.TempDir(), fmt.Sprintf("sirius-script-%d.ps1", time.Now().UnixNano()))
    os.WriteFile(tempFile, []byte(scriptContent), 0600)
    defer os.Remove(tempFile)

    // Execute via PowerShell
    cmd := exec.CommandContext(ctx, psPath, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", tempFile)

    // Capture output
    var stdoutBuf, stderrBuf bytes.Buffer
    cmd.Stdout = &stdoutBuf
    cmd.Stderr = &stderrBuf

    err = cmd.Run()

    return stdoutBuf.String(), stderrBuf.String(), cmd.ProcessState.ExitCode(), err
}
```

#### Bash Execution (Linux/macOS)

```go
func ExecuteCommand(ctx context.Context, command string) (stdout, stderr string, exitCode int, err error) {
    cmd := exec.CommandContext(ctx, "/bin/bash", "-c", command)

    var stdoutBuf, stderrBuf bytes.Buffer
    cmd.Stdout = &stdoutBuf
    cmd.Stderr = &stderrBuf

    err = cmd.Run()

    return stdoutBuf.String(), stderrBuf.String(), cmd.ProcessState.ExitCode(), err
}
```

## Data Storage Architecture

### Valkey (Redis) Schema

The system uses Valkey for distributed state management and caching.

#### Key Patterns

```
Command Results:
  cmd:result:{agentId}:{timestamp}
    └─ CommandResponse JSON
    └─ TTL: 1 hour
    └─ Fields: {commandId, agentId, command, status, output, error, exitCode}

Template Storage:
  template:manifest
    └─ Global manifest with statistics

  template:meta:{templateId}
    └─ Template metadata

  template:standard:{templateId}
    └─ Standard template YAML

  template:custom:{templateId}
    └─ Custom template YAML

Agent Metadata (future):
  agent:meta:{agentId}
    └─ Agent information
    └─ {id, hostname, platform, version, capabilities, lastSeen}
```

### RabbitMQ Message Queues

#### Queue Definitions

```
agent_commands
  └─ Purpose: Commands from UI/API to agents
  └─ Format: JSON
  └─ Schema: {action, command, agentId, userId, timestamp, target}
  └─ Consumers: Agent Server

agent_response
  └─ Purpose: Acknowledgments and responses to UI/API
  └─ Format: JSON
  └─ Schema: {success, message, output, error}
  └─ Consumers: sirius-api
```

#### Message Examples

**Command Message**:

```json
{
  "action": "",
  "command": "systeminfo",
  "agentId": "",
  "userId": "user-123",
  "timestamp": "1698765432000",
  "target": {
    "type": "agent",
    "id": "agent-001"
  }
}
```

**Response Message**:

```json
{
  "success": true,
  "message": "Command received, forwarding to agent",
  "output": "",
  "error": ""
}
```

## Security Architecture

### Authentication and Authorization

#### Agent Authentication

```
1. Agent Registration:
   ├─ Agent ID generated on first startup
   ├─ ID stored in agent config
   └─ Server validates agent ID on connection

2. gRPC Metadata:
   ├─ agent_id: Unique identifier
   ├─ scripting_enabled: Capability flag
   └─ Future: JWT tokens, TLS certificates

3. Stream Authorization:
   ├─ Server maintains whitelist of allowed agent IDs
   ├─ Validates agent ID on ConnectStream
   └─ Rejects unauthorized connections
```

#### Command Authorization

```
1. Command Source Validation:
   ├─ Commands only accepted from RabbitMQ
   ├─ Server validates target agent exists
   └─ Server checks agent is connected

2. Agent-Side Validation:
   ├─ Only processes commands from established stream
   ├─ Validates command format
   └─ Rejects malformed commands

3. Future Enhancements:
   ├─ Role-based access control (RBAC)
   ├─ Command whitelisting per agent
   └─ Audit logging of all commands
```

### Template Security

#### Template Validation

```go
// Server-side validation before storage
func (tm *ServerTemplateManager) ValidateTemplate(template *types.Template, content []byte) error {
    // 1. Syntax validation
    if err := parser.ParseTemplate(template); err != nil {
        return fmt.Errorf("syntax error: %w", err)
    }

    // 2. Security scan - dangerous patterns
    dangerousPatterns := []string{
        "eval(", "exec(", "system(",
        "shell_exec(", "passthru(",
    }
    for _, pattern := range dangerousPatterns {
        if strings.Contains(string(content), pattern) {
            return fmt.Errorf("dangerous pattern detected: %s", pattern)
        }
    }

    // 3. Script injection check
    scriptPatterns := []string{
        "<script", "javascript:", "vbscript:",
        "onload=", "onerror=",
    }
    for _, pattern := range scriptPatterns {
        if strings.Contains(strings.ToLower(string(content)), pattern) {
            return fmt.Errorf("script injection pattern: %s", pattern)
        }
    }

    // 4. Size limit
    if len(content) > MaxTemplateSize {
        return fmt.Errorf("template exceeds size limit")
    }

    return nil
}
```

#### Checksum Verification

```
1. Server calculates SHA256 on storage:
   └─ checksum = sha256(templateContent)

2. Checksum included in TEMPLATE_UPDATE:
   └─ {templateId, version, checksum, content}

3. Agent verifies on receipt:
   ├─ Calculate sha256(received content)
   ├─ Compare with provided checksum
   └─ Reject if mismatch
```

### Network Security

```
1. gRPC Transport Security:
   ├─ TLS encryption (configurable)
   ├─ Certificate validation
   └─ Mutual TLS support (future)

2. RabbitMQ Security:
   ├─ Authentication required
   ├─ Per-queue permissions
   └─ TLS connections

3. Valkey Security:
   ├─ Password authentication
   ├─ Network isolation
   └─ Redis ACLs (future)
```

## Deployment Architecture

### Container Architecture

```
┌─────────────────────────────────────────────────────┐
│                Docker Network: sirius                │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   sirius-ui  │  │  sirius-api  │  │  postgres │ │
│  │  (Next.js)   │  │  (Go/Fiber)  │  │           │ │
│  │  Port: 3000  │  │  Port: 8080  │  │ Port:5432 │ │
│  └──────────────┘  └──────┬───────┘  └───────────┘ │
│                            │                         │
│  ┌──────────────┐  ┌──────▼───────┐  ┌───────────┐ │
│  │   valkey     │  │  rabbitmq    │  │ sirius-   │ │
│  │  (Redis)     │  │              │  │ engine    │ │
│  │  Port: 6379  │  │ Port: 5672   │  │ (agent)   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐│
│  │         Agent Server (gRPC)                      ││
│  │         Port: 50051                              ││
│  │  Mounts: app-agent/ → /app-agent                ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
                            │
                            │ gRPC (external)
                            │
            ┌───────────────┴────────────────┐
            │                                 │
            ▼                                 ▼
    ┌──────────────┐                 ┌──────────────┐
    │ Remote Agent │                 │ Remote Agent │
    │  (Linux)     │                 │  (Windows)   │
    │              │                 │              │
    │ External IP  │                 │ External IP  │
    └──────────────┘                 └──────────────┘
```

### Agent Server Deployment

**Development Mode** (`sirius-engine` container):

```yaml
services:
  sirius-engine:
    build:
      context: sirius-engine
      dockerfile: Dockerfile
    volumes:
      - ./app-agent:/app-agent # Dev mode hot-reload
    ports:
      - "50051:50051" # gRPC port
    environment:
      - VALKEY_ADDRESS=valkey:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
    depends_on:
      - valkey
      - rabbitmq
```

**Production Mode**:

```yaml
services:
  agent-server:
    image: sirius-agent-server:latest
    ports:
      - "50051:50051"
    environment:
      - SERVER_ADDRESS=0.0.0.0:50051
      - VALKEY_ADDRESS=valkey:6379
      - RABBITMQ_URL=amqp://user:pass@rabbitmq:5672/
      - LOG_LEVEL=info
    restart: unless-stopped
```

### Remote Agent Deployment

#### Linux Agent (systemd)

```ini
[Unit]
Description=Sirius Security Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=sirius-agent
Group=sirius-agent
Environment="AGENT_ID=agent-linux-001"
Environment="SERVER_ADDRESS=server.example.com:50051"
Environment="ENABLE_SCRIPTING=true"
ExecStart=/usr/local/bin/sirius-agent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Windows Agent (Service)

```powershell
# Install as Windows Service
New-Service -Name "SiriusAgent" `
    -BinaryPathName "C:\Program Files\Sirius\sirius-agent.exe" `
    -DisplayName "Sirius Security Agent" `
    -StartupType Automatic `
    -Description "Sirius distributed security agent"

# Set environment variables
[Environment]::SetEnvironmentVariable("AGENT_ID", "agent-win-001", "Machine")
[Environment]::SetEnvironmentVariable("SERVER_ADDRESS", "server.example.com:50051", "Machine")
[Environment]::SetEnvironmentVariable("ENABLE_SCRIPTING", "true", "Machine")

# Start service
Start-Service -Name "SiriusAgent"
```

#### macOS Agent (launchd)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.sirius.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/sirius-agent</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>AGENT_ID</key>
        <string>agent-mac-001</string>
        <key>SERVER_ADDRESS</key>
        <string>server.example.com:50051</string>
        <key>ENABLE_SCRIPTING</key>
        <string>true</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

## Performance Considerations

### Scalability

#### Horizontal Scaling

```
Server Scaling:
  ├─ Multiple agent server instances behind load balancer
  ├─ gRPC load balancing strategies
  ├─ Shared state in Valkey
  └─ RabbitMQ message distribution

Agent Scaling:
  ├─ Thousands of agents per server instance
  ├─ Efficient stream multiplexing
  ├─ Minimal memory footprint per agent
  └─ Connection pooling
```

#### Vertical Scaling

```
Server Resources:
  ├─ CPU: Moderate (gRPC is efficient)
  ├─ Memory: 2GB base + 5MB per 1000 agents
  ├─ Network: High bandwidth for template distribution
  └─ Storage: Minimal (state in Valkey)

Agent Resources:
  ├─ CPU: Low (idle), High (scanning)
  ├─ Memory: 50-100MB base
  ├─ Disk: 100MB for template cache
  └─ Network: Low (heartbeats), High (template sync)
```

### Optimization Strategies

#### Template Caching

```
Agent-Side:
  ├─ Templates cached on disk
  ├─ Only sync changed templates
  ├─ Checksum-based validation
  └─ Last-sync timestamp tracking

Server-Side:
  ├─ Templates stored in Valkey
  ├─ Manifest cached in memory
  ├─ Incremental sync support
  └─ Compression for transfer (future)
```

#### Connection Management

```
gRPC Streams:
  ├─ Single bidirectional stream per agent
  ├─ Stream multiplexing (HTTP/2)
  ├─ Automatic reconnection with backoff
  └─ Heartbeat-based connection validation

Command Execution:
  ├─ Async command processing
  ├─ Non-blocking stream operations
  ├─ Context-based cancellation
  └─ Timeout enforcement
```

## Monitoring and Observability

### Metrics

```
Server Metrics:
  ├─ agent.connections.total (gauge)
  ├─ agent.connections.active (gauge)
  ├─ commands.executed.total (counter)
  ├─ commands.duration (histogram)
  ├─ templates.synced.total (counter)
  └─ grpc.stream.errors (counter)

Agent Metrics:
  ├─ agent.uptime (gauge)
  ├─ agent.heartbeat.sent (counter)
  ├─ commands.received (counter)
  ├─ scans.executed (counter)
  ├─ templates.cached (gauge)
  └─ memory.usage (gauge)
```

### Logging

```
Structured Logging (zap):

  Server:
    ├─ agent.connected: {agentId, timestamp}
    ├─ command.sent: {commandId, agentId, command}
    ├─ command.completed: {commandId, exitCode, duration}
    └─ template.synced: {templateId, agentId}

  Agent:
    ├─ connection.established: {serverId, timestamp}
    ├─ command.received: {command, timestamp}
    ├─ command.executed: {command, exitCode, duration}
    └─ template.updated: {templateId, checksum}
```

### Health Checks

```
Server Health Endpoint:
  GET /health
  └─ {
      "status": "healthy",
      "agents": {
        "total": 42,
        "connected": 40
      },
      "services": {
        "valkey": "healthy",
        "rabbitmq": "healthy"
      }
    }

Agent Health Check:
  ├─ Heartbeat interval: 30 seconds
  ├─ Server considers agent unhealthy after: 90 seconds
  └─ Agent reconnects automatically
```

## Error Handling and Resilience

### Connection Failures

```
Agent Reconnection Strategy:
  1. Detect connection loss (stream error)
  2. Wait with exponential backoff:
     ├─ 1st retry: 1 second
     ├─ 2nd retry: 2 seconds
     ├─ 3rd retry: 4 seconds
     └─ Max: 60 seconds
  3. Attempt reconnection
  4. Resume from last sync point
  5. Resend pending commands
```

### Command Failures

```
Server Handling:
  ├─ Command timeout: 5 minutes
  ├─ Store error in CommandResponse
  ├─ Mark command as failed
  └─ Notify UI via Valkey

Agent Handling:
  ├─ Capture all errors
  ├─ Include stderr in result
  ├─ Return non-zero exit code
  └─ Continue processing other commands
```

### Template Sync Failures

```
Graceful Degradation:
  ├─ Agent continues using cached templates
  ├─ Retry sync on next request
  ├─ Log sync errors for investigation
  └─ Alert on repeated failures
```

## Future Enhancements

### Planned Features

1. **Enhanced Security**

   - Mutual TLS authentication
   - JWT-based authorization
   - Command RBAC system
   - Encrypted template storage

2. **Advanced Template Features**

   - Template versioning system
   - Template dependency resolution
   - Conditional step execution
   - Dynamic module loading

3. **Scalability Improvements**

   - Agent clustering support
   - Multi-region deployment
   - Template CDN distribution
   - Result streaming for large scans

4. **Monitoring & Analytics**
   - Real-time dashboards
   - Agent performance metrics
   - Template effectiveness tracking
   - Automated alerting system

## LLM Context

### High-Level Architecture Understanding

This document provides a comprehensive overview of the Sirius Agent System architecture. Key areas for AI assistants to understand:

1. **Bidirectional gRPC Communication**: The system uses persistent streams for real-time agent communication, not request-response patterns.

2. **Template-Based Detection**: Vulnerability detection is driven by YAML templates with pluggable modules, not hardcoded logic.

3. **Distributed State Management**: Valkey stores templates and results; RabbitMQ handles command distribution; gRPC handles real-time communication.

4. **Agent Autonomy**: Agents cache templates locally and can operate semi-independently, syncing periodically with the server.

5. **Security-First Design**: Multiple validation layers for templates, commands, and connections ensure system integrity.

### Code Navigation

When working with this system:

- **Server code**: `app-agent/internal/server/`
- **Agent code**: `app-agent/internal/agent/`
- **Template system**: `app-agent/internal/template/`
- **Detection modules**: `app-agent/internal/detect/`
- **Protocol definitions**: `app-agent/proto/hello/`

### Common Development Tasks

- Adding detection modules: Implement `Module` interface, register in `internal/modules/registry`
- Creating templates: Follow YAML structure, test with `templatescan` command
- Extending protocol: Update `.proto` file, regenerate with `./scripts/generate_proto.sh`
- Debugging communication: Enable gRPC logging, check server/agent logs, inspect Valkey keys

---

**Related Documentation**:

- [Docker Architecture](mdc:README.docker-architecture.md) - Container deployment details
- [Developer Guide](mdc:../README.developer-guide.md) - Development workflow
- [Agent Template API](mdc:../apps/README.agent-template-api.md) - API integration

**For Developers**: See [Remote Agent Engineer Role](@mdc:../../.cursor/agents/remote-agent-engineer.agent.md) for detailed implementation guidance.

**Last Updated**: October 25, 2025
**Version**: 1.0.0
**Maintained By**: Sirius Platform Team
