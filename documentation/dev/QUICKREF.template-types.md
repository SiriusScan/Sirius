---
title: "Template System Type Reference"
description: "Quick reference for template types and module configurations"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Platform Team"
tags: ["templates", "types", "reference", "quick-guide"]
categories: ["reference", "templates"]
difficulty: "beginner"
related_docs:
  - "architecture/README.template-ui-integration.md"
  - "architecture/README.agent-system.md"
llm_context: "high"
search_keywords: ["template", "types", "config", "module", "reference"]
---

# Template System Type Reference

Quick reference guide for template types, module configurations, and validation rules.

## Detection Step Types

| Type           | Module               | Config Required        | Platforms |
| -------------- | -------------------- | ---------------------- | --------- |
| `file-hash`    | FileHashModule       | path, hash             | All       |
| `file-content` | FileContentModule    | path, patterns         | All       |
| `version-cmd`  | CommandVersionModule | command, version_regex | All       |

## Module Configurations

### file-hash

```yaml
type: file-hash
platforms: [linux, darwin, windows]
weight: 1.0
config:
  path: "/etc/passwd" # REQUIRED: Absolute path
  hash: "sha256:abc123..." # REQUIRED: Hash with prefix
  algorithm: "sha256" # OPTIONAL: Algorithm
```

**Hash Formats**:

- SHA256: `sha256:` + 64 hex chars
- SHA1: `sha1:` + 40 hex chars
- MD5: `md5:` + 32 hex chars
- SHA512: `sha512:` + 128 hex chars

---

### file-content

```yaml
type: file-content
platforms: [linux, darwin]
weight: 0.8
config:
  path: "/etc/apache2/apache2.conf" # REQUIRED: File to search
  patterns: # REQUIRED: Regex patterns
    - "ServerTokens.*Full"
    - "ServerSignature.*On"
```

**Pattern Notes**:

- Go regex (RE2 syntax)
- Case-sensitive by default
- No lookahead/lookbehind support
- Array required (even for single pattern)

---

### version-cmd

```yaml
type: version-cmd
platforms: [linux, darwin]
weight: 1.0
config:
  command: "httpd -v" # REQUIRED: Shell command
  version_regex: "Apache/(\\d+\\.\\d+)" # REQUIRED: Version capture
  vulnerable_versions: # OPTIONAL: Constraints
    - "< 2.4.52"
    - ">= 2.2.0, < 2.2.34"
  expected_exit_code: 0 # OPTIONAL: Exit code
```

**Version Operators**:

- `<`, `<=`, `>`, `>=`, `=`, `!=`
- Combine with comma: `>= 2.0, < 3.0`

## Platform Values

```yaml
platforms: [linux]           # Linux only
platforms: [darwin]          # macOS only
platforms: [windows]         # Windows only
platforms: [linux, darwin]   # Unix-like systems
platforms: []                # All platforms (default)
```

## Severity Values

```yaml
severity: critical  # Highest priority
severity: high
severity: medium
severity: low
severity: info      # Lowest priority
```

## Detection Logic

```yaml
detection:
  logic: all  # AND - All steps must match
  logic: any  # OR - At least one step must match
```

## Complete Template Example

```yaml
id: apache-outdated
info:
  name: Outdated Apache HTTP Server
  author: security-team
  severity: high
  description: Detects Apache versions vulnerable to known CVEs
  references:
    - https://nvd.nist.gov/vuln/detail/CVE-2021-44228
  cve:
    - CVE-2021-44228
  tags:
    - apache
    - web-server
    - cve
  version: "1.0"

detection:
  logic: all
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
        patterns:
          - "ServerTokens.*Full"
```

## TypeScript Interfaces

```typescript
// Detection step
interface DetectionStep {
  type: "file-hash" | "file-content" | "version-cmd";
  platforms?: ("linux" | "darwin" | "windows")[];
  weight?: number; // 0.0 to 1.0
  config: FileHashConfig | FileContentConfig | CommandVersionConfig;
}

// File hash config
interface FileHashConfig {
  path: string;
  hash: string;
  algorithm?: "sha256" | "sha1" | "md5" | "sha512";
}

// File content config
interface FileContentConfig {
  path: string;
  patterns: string[];
}

// Version command config
interface CommandVersionConfig {
  command: string;
  version_regex: string;
  vulnerable_versions?: string[];
  expected_exit_code?: number;
}

// Template info
interface TemplateInfo {
  name: string;
  author: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  references?: string[];
  cve?: string[];
  tags?: string[];
  version?: string;
}

// Detection config
interface DetectionConfig {
  logic?: "all" | "any"; // defaults to "all"
  steps: DetectionStep[];
}

// Complete template
interface TemplateContent {
  id: string;
  info: TemplateInfo;
  detection: DetectionConfig;
}
```

## Validation Rules

### Template ID

- Format: `^[a-z0-9-]+$`
- Length: 3-50 characters
- Cannot start/end with dash
- Cannot be reserved keyword (new, create, edit, delete, standard, custom)

### CVE Format

- Pattern: `^CVE-\d{4}-\d{4,}$`
- Example: `CVE-2021-44228`

### File Paths

- Must be absolute
- Unix: Starts with `/`
- Windows: Starts with drive letter (e.g., `C:\`)

### Regex Patterns

- Use Go RE2 syntax
- No backreferences
- No lookahead/lookbehind
- Named groups: `(?P<name>pattern)`

### Weight Values

- Range: 0.0 to 1.0
- Default: 1.0
- Affects confidence calculation

## Common Errors

| Error                    | Cause              | Fix                        |
| ------------------------ | ------------------ | -------------------------- |
| "unknown module type"    | Wrong type name    | Use dashes not underscores |
| "missing required field" | Config incomplete  | Check module requirements  |
| "invalid regex"          | Bad pattern syntax | Test with Go regex tester  |
| "template not found"     | Wrong ID           | Check exact ID in library  |

## Quick Tips

✅ **DO**:

- Use lowercase IDs with dashes
- Test regex patterns before submission
- Specify platforms when not all apply
- Include CVE references when available
- Add meaningful descriptions

❌ **DON'T**:

- Use underscores in type names
- Forget algorithm prefix in hashes
- Use single string for patterns (must be array)
- Use JavaScript regex features (Go RE2 only)
- Create IDs with spaces or special chars

## Resources

- Full guide: [README.template-ui-integration.md](architecture/README.template-ui-integration.md)
- Agent system: [README.agent-system.md](architecture/README.agent-system.md)
- Module code: `app-agent/internal/modules/`

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: October 25, 2025
