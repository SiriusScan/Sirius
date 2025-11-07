---
title: "Agent Template API Documentation"
description: "API endpoints for managing agent vulnerability detection templates"
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["api", "agent", "templates"]
tags: ["api", "agent", "templates", "vulnerability", "detection"]
related_docs:
  - "README.agent-template-ui.md"
  - "ABOUT.documentation.md"
search_keywords:
  ["agent template api", "template endpoints", "vulnerability detection"]
---

# Agent Template API Documentation

## Overview

The Agent Template API provides endpoints for managing vulnerability detection templates used by Sirius agents. These templates define detection logic for identifying vulnerabilities on target systems.

## Base URL

```
http://localhost:9001/api
```

## Endpoints

### List All Templates

Get all agent templates (standard + custom).

**Endpoint:** `GET /agent-templates`

**Response:**

```json
[
  {
    "id": "CVE-2021-44228",
    "name": "Log4Shell Detection",
    "description": "Detects Log4j RCE vulnerability",
    "type": "standard",
    "severity": "critical",
    "author": "Sirius Security Team",
    "platforms": ["linux", "darwin", "windows"],
    "version": "1.0.0",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "source": {
      "type": "standard",
      "name": "sirius-templates",
      "priority": 1
    }
  }
]
```

---

### Get Single Template

Get a specific template by ID, including its full YAML content.

**Endpoint:** `GET /agent-templates/:id`

**Parameters:**

- `id` (path): Template ID

**Response:**

```json
{
  "id": "CVE-2021-44228",
  "name": "Log4Shell Detection",
  "description": "Detects Log4j RCE vulnerability",
  "type": "standard",
  "severity": "critical",
  "author": "Sirius Security Team",
  "platforms": ["linux"],
  "version": "1.0.0",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "content": "id: CVE-2021-44228\ninfo:\n  name: Log4Shell Detection\n..."
}
```

**Error Responses:**

- `404 Not Found`: Template not found

---

### Upload Custom Template

Upload a new custom template from a YAML file.

**Endpoint:** `POST /agent-templates`

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `file` (file, required): YAML template file (.yaml or .yml)
- `author` (string, optional): Override author name

**Response:**

```json
{
  "id": "custom-template-123",
  "message": "Template uploaded successfully and pushed to agents",
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": ["Author field is recommended"]
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid file or validation failed
  ```json
  {
    "error": "Template validation failed",
    "validation": {
      "valid": false,
      "errors": ["Missing required field: info.severity"],
      "warnings": []
    }
  }
  ```

**Validation Rules:**

- File must be .yaml or .yml extension
- File size must be under 1MB
- Must include required fields: `id`, `info.name`, `info.severity`, `info.description`
- Severity must be one of: `critical`, `high`, `medium`, `low`, `info`

---

### Validate Template

Validate a template without saving it.

**Endpoint:** `POST /agent-templates/validate`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "content": "id: test-template\ninfo:\n  name: Test Template\n..."
}
```

**Response:**

```json
{
  "valid": true,
  "errors": [],
  "warnings": ["Tags are recommended for better organization"]
}
```

---

### Update Custom Template

Update an existing custom template.

**Endpoint:** `PUT /agent-templates/:id`

**Parameters:**

- `id` (path): Template ID

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "content": "id: test-template\ninfo:\n  name: Updated Test Template\n..."
}
```

**Response:**

```json
{
  "message": "Template updated and pushed to agents"
}
```

**Error Responses:**

- `400 Bad Request`: Validation failed
- `404 Not Found`: Template not found
- `403 Forbidden`: Cannot update standard templates

---

### Delete Custom Template

Delete a custom template.

**Endpoint:** `DELETE /agent-templates/:id`

**Parameters:**

- `id` (path): Template ID

**Response:**

```json
{
  "message": "Template deleted from agents"
}
```

**Error Responses:**

- `404 Not Found`: Template not found
- `403 Forbidden`: Cannot delete standard templates

---

### Test Template on Agent

Execute a template on a specific agent and get results.

**Endpoint:** `POST /agent-templates/:id/test`

**Parameters:**

- `id` (path): Template ID

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "agent_id": "agent-123"
}
```

**Response:**

```json
{
  "message": "Template test initiated on agent",
  "agent_id": "agent-123",
  "template_id": "CVE-2021-44228"
}
```

**Note:** This endpoint initiates the test. Results are retrieved asynchronously via agent event logs or response queues.

---

### Deploy Template to Agents

Deploy a template to specific agents or all agents.

**Endpoint:** `POST /agent-templates/:id/deploy`

**Parameters:**

- `id` (path): Template ID

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "agent_ids": ["agent-123", "agent-456"]
}
```

**Note:** Empty `agent_ids` array deploys to all agents.

**Response:**

```json
{
  "message": "Template deployed to agents",
  "agent_count": 2
}
```

---

### Get Template Analytics

Get template effectiveness statistics.

**Endpoint:** `GET /agent-templates/analytics`

**Response:**

```json
{
  "top_templates": [
    {
      "template_id": "CVE-2021-44228",
      "template_name": "Log4Shell Detection",
      "detection_count": 42,
      "execution_count": 150,
      "success_rate": 0.95,
      "average_execution_time_ms": 245
    }
  ],
  "execution_stats": {
    "total_executions": 1250,
    "total_detections": 105,
    "average_execution_time_ms": 195,
    "success_rate": 0.91
  },
  "platform_distribution": {
    "linux": 850,
    "darwin": 250,
    "windows": 150
  }
}
```

**Note:** Analytics are aggregated from agent event logs.

---

### Get Template Results History

Get historical execution results for a template.

**Endpoint:** `GET /agent-templates/:id/results`

**Parameters:**

- `id` (path): Template ID

**Response:**

```json
{
  "template_id": "CVE-2021-44228",
  "results": [
    {
      "agent_id": "agent-123",
      "timestamp": "2024-01-15T10:30:00Z",
      "vulnerable": true,
      "confidence": 0.95,
      "execution_time_ms": 245
    }
  ]
}
```

---

## Template YAML Schema

### Required Fields

```yaml
id: unique-template-id
info:
  name: Human-readable template name
  severity: critical|high|medium|low|info
  description: What this template detects
detection:
  steps:
    - type: file_hash|file_content|command_version|script
      config: {}
```

### Optional Fields

```yaml
info:
  author: Author name
  version: Template version (e.g., 1.0.0)
  references:
    - https://example.com/vuln-info
  cve:
    - CVE-2021-XXXXX
  tags:
    - apache
    - rce
detection:
  logic: all|any # Default: all
  steps:
    - platforms:
        - linux
        - darwin
      weight: 0.8 # 0.0-1.0, affects confidence
```

### Detection Step Types

#### File Hash

```yaml
- type: file_hash
  config:
    path: /usr/bin/vulnerable-binary
    hash: abc123def456...
    algorithm: sha256 # sha256, sha1, md5, sha512
```

#### File Content

```yaml
- type: file_content
  config:
    path: /etc/apache2/apache2.conf
    regex: "ServerTokens\\s+Full"
```

#### Command Version

```yaml
- type: command_version
  config:
    command: ["dpkg-query", "-W", "-f='${Version}'", "openssh-server"]
    regex: "^6\\.5\\.1"
    exit_code: 0 # optional
```

#### Script

```yaml
- type: script
  config:
    interpreter: bash|python|powershell
    script: |
      #!/bin/bash
      dpkg-query -W -f='${Version}' openssh-server
    regex: "^6\\.5\\.1"
    exit_code: 0 # optional
```

---

## Error Codes

| Code | Description                                                            |
| ---- | ---------------------------------------------------------------------- |
| 400  | Bad Request - Invalid input or validation failed                       |
| 403  | Forbidden - Operation not allowed (e.g., modifying standard templates) |
| 404  | Not Found - Template does not exist                                    |
| 500  | Internal Server Error - Server-side error occurred                     |

---

## Rate Limiting

Currently, no rate limiting is applied. This may change in future versions.

---

## Authentication

Currently, no authentication is required. All authenticated users can manage templates. Role-based access control will be added in a future version.

---

## Examples

### Upload a Custom Template

```bash
curl -X POST http://localhost:9001/api/agent-templates \
  -F "file=@my-template.yaml" \
  -F "author=Security Team"
```

### Get All Templates

```bash
curl http://localhost:9001/api/agent-templates
```

### Delete a Custom Template

```bash
curl -X DELETE http://localhost:9001/api/agent-templates/my-custom-template
```

### Test Template on Agent

```bash
curl -X POST http://localhost:9001/api/agent-templates/CVE-2021-44228/test \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "agent-123"}'
```

---

## See Also

- [Agent Template UI Documentation](README.agent-template-ui.md)
- [Agent Template Types Definition](../../app-agent/internal/template/types/types.go)
- [Template System Notes](../../app-agent/project/BRAINSTORM.template-system-notes.md)

