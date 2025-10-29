---
title: "Creating Agent Identities"
description: "Step-by-step guide to creating effective agent identities for the Sirius project"
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
tags: ["guide", "agent-identities", "creation", "howto"]
categories: ["ai-tooling", "documentation"]
difficulty: "intermediate"
prerequisites: ["ABOUT.agent-identities.md", "SPECIFICATION.agent-identity.md"]
related_docs:
  - "ABOUT.agent-identities.md"
  - "TEMPLATE.agent-identity.md"
  - "SPECIFICATION.agent-identity.md"
  - "REFERENCE.integration-levels.md"
dependencies: []
llm_context: "medium"
search_keywords:
  ["create agent", "agent howto", "agent guide", "writing agents"]
---

# Creating Agent Identities

Step-by-step guide to creating effective, validated agent identities for the Sirius project.

## Prerequisites

Before creating an agent identity, ensure you:

1. **Understand the system** - Read [ABOUT.agent-identities.md](mdc:.cursor/agents/ABOUT.agent-identities.md)
2. **Know the specification** - Review [SPECIFICATION.agent-identity.md](mdc:.cursor/agents/SPECIFICATION.agent-identity.md)
3. **Study the template** - Examine [TEMPLATE.agent-identity.md](mdc:.cursor/agents/TEMPLATE.agent-identity.md)
4. **Review examples** - Look at existing agents in [INDEX.agent-identities.md](mdc:.cursor/agents/INDEX.agent-identities.md)
5. **Understand integration levels** - Check [REFERENCE.integration-levels.md](mdc:.cursor/agents/REFERENCE.integration-levels.md)

## Step 1: Define the Role

### 1.1 Identify the Need

Ask yourself:

- What role or specialization is missing?
- Would this improve context shaping?
- Is this distinct from existing agents?
- Will it enable better fresh conversations?

**Good Reasons to Create an Agent:**

- New engineering specialization (e.g., "API Security Engineer")
- New technology adoption (e.g., "GraphQL Backend Engineer")
- New process role (e.g., "Release Manager")
- Refined specialization (e.g., splitting "Frontend Engineer" into "UI Engineer" and "State Management Engineer")

**Bad Reasons:**

- Temporary project need (use task files instead)
- One-time task (use conversation context)
- Too narrow (combine with existing agent)
- Duplicate existing agent

### 1.2 Choose Role Type

Select from valid role types:

- `engineering` - Software development, system building
- `design` - UX/UI design, design systems
- `product` - Product management, strategy
- `operations` - DevOps, SRE, infrastructure
- `qa` - Testing, quality assurance
- `documentation` - Technical writing, docs

**Example Decision:**

- **API Security Engineer** → `engineering` (writes code)
- **UX Researcher** → `design` (focuses on user experience)
- **Release Manager** → `operations` (manages deployments)

### 1.3 Determine Integration Level

Choose based on system knowledge needed:

- `none` - No system integration (pure UI design, documentation)
- `low` - Minimal (frontend consuming APIs)
- `medium` - Moderate (backend services, APIs)
- `high` - Deep (infrastructure, distributed systems)

See [REFERENCE.integration-levels.md](mdc:.cursor/agents/REFERENCE.integration-levels.md) for detailed guidelines.

## Step 2: Copy the Template

```bash
cd /Users/oz/Projects/Sirius-Project/Sirius/.cursor/agents
cp TEMPLATE.agent-identity.md your-role-name.agent.md
```

**Filename Rules:**

- Lowercase with hyphens
- Descriptive of role
- Must end with `.agent.md`

**Examples:**

- ✅ `api-security-engineer.agent.md`
- ✅ `release-manager.agent.md`
- ✅ `graphql-backend-engineer.agent.md`
- ❌ `API-Security.agent.md` (wrong case)
- ❌ `security.agent.md` (too vague)

## Step 3: Fill in YAML Front Matter

### 3.1 Required Fields

Open your new file and fill in required fields:

```yaml
---
name: "API Security Engineer"
title: "API Security Engineer (Go/REST/OAuth)"
description: "Implements API security, authentication, authorization, and security best practices"
role_type: "engineering"
version: "1.0.0"
last_updated: "2025-10-25"
llm_context: "high"
context_window_target: 320
```

**Tips:**

- `name`: 2-5 words, title case
- `title`: Include key technologies in parentheses
- `description`: Single sentence, action-oriented
- `role_type`: Must be valid enum
- `version`: Start with "1.0.0"
- `last_updated`: Today's date (ISO format)
- `context_window_target`: Estimate 200-400 range

### 3.2 Optional but Recommended

Add these for better discovery and context:

```yaml
author: "Security Team"
specialization: ["API security", "OAuth/JWT", "threat modeling"]
technology_stack: ["Go", "OAuth2", "JWT", "OpenAPI"]
system_integration_level: "medium"
categories: ["backend", "security"]
tags: ["security", "authentication", "authorization", "go"]
related_docs:
  - "README.architecture.md"
  - "README.api-security.md"
dependencies: ["sirius-api/"]
---
```

## Step 4: Write Role Summary

Replace the template's role summary with 2-3 sentences:

```markdown
# API Security Engineer (Go/REST/OAuth)

Implements and maintains security for Sirius REST APIs, focusing on authentication, authorization, and API security best practices. Works with Go/Fiber backend to integrate OAuth2, JWT, and secure API design patterns. Ensures compliance with security standards and performs threat modeling for API endpoints.
```

**Formula:**

1. **Sentence 1:** What they do and primary focus
2. **Sentence 2:** Technologies and integration points
3. **Sentence 3:** Additional responsibilities or scope

## Step 5: Link Key Documentation

Select 5-10 most critical documentation files for this role:

### Engineering Roles

**Always include:**

- System architecture
- Development workflow
- Container testing
- Role-specific technical docs

**Example:**

```markdown
## Key Documentation

### Architecture & Design

- [System Architecture](mdc:documentation/dev/architecture/README.architecture.md) - Overall system design
- [Docker Architecture](mdc:documentation/dev/architecture/README.docker-architecture.md) - Container infrastructure
- [API Design](mdc:documentation/dev/api/README.api-design.md) - API standards

### Development & Workflow

- [Development Workflow](mdc:documentation/dev/README.development.md) - Development standards
- [Container Testing](mdc:documentation/dev/test/README.container-testing.md) - Testing requirements

### Security-Specific

- [API Security Standards](mdc:documentation/dev/security/README.api-security.md) - Security requirements
- [OAuth Implementation](mdc:documentation/dev/security/README.oauth.md) - Authentication
- [Threat Modeling](mdc:documentation/dev/security/README.threat-modeling.md) - Security analysis
```

## Step 6: Define Project Location

Show where this role works in the codebase:

````markdown
## Project Location

\```
sirius-api/
├── internal/
│ ├── auth/ # Authentication middleware
│ │ ├── jwt.go # JWT handling
│ │ ├── oauth.go # OAuth2 integration
│ │ └── middleware.go # Auth middleware
│ ├── security/ # Security utilities
│ │ ├── rate_limit.go # Rate limiting
│ │ ├── cors.go # CORS configuration
│ │ └── validation.go # Input validation
│ └── api/ # API routes
│ └── middleware/ # API middleware
└── config/
└── security.yaml # Security configuration
\```
````

## Step 7: List Core Responsibilities

### Engineering Role Example

```markdown
## Core Responsibilities

### Primary Responsibilities

- **API Authentication** - Implement OAuth2, JWT, API key authentication
- **Authorization** - Role-based access control, permission systems
- **Security Middleware** - Rate limiting, input validation, CORS
- **Threat Modeling** - Identify and mitigate API security risks

### Secondary Responsibilities

- **Security Testing** - Automated security tests, vulnerability scanning
- **Security Documentation** - API security guides, best practices
- **Code Review** - Security-focused code reviews

### Collaboration Points

- **Backend API Engineer** - Security middleware integration, API design
- **Frontend Engineer** - OAuth flow, authentication UX
- **DevOps Engineer** - Secrets management, secure deployments
- **QA Engineer** - Security testing strategies
```

## Step 8: Document Technology Stack

```markdown
## Technology Stack

### Programming Languages

- **Go** - Primary language, version 1.21+
- **SQL** - Database security policies

### Frameworks & Libraries

- **Fiber** - v2.x, web framework with security middleware
- **golang-jwt** - v5.x, JWT implementation
- **oauth2** - Go OAuth2 library
- **bcrypt** - Password hashing

### Tools & Services

- **OAuth2 Providers** - Google, GitHub, custom
- **Secrets Management** - Environment variables, vaults
- **Security Scanners** - gosec, trivy

### Development Environment

- **Local Setup** - Go 1.21+, OAuth2 test apps
- **Container Environment** - `sirius-api` container
- **Dependencies** - PostgreSQL for user/session storage
```

## Step 9: System Integration (Conditional)

**Include only if `system_integration_level` is "medium" or "high".**

For our API Security Engineer (medium level):

````markdown
## System Integration

### Integration Architecture

API Security layer sits between external requests and application logic, protecting all API endpoints.

\```
┌─────────────────────────────────────────┐
│ External Clients │
└────────────────┬────────────────────────┘
│
│ HTTPS
▼
┌───────────────┐
│ API Gateway │
│ (Security) │
└───────┬───────┘
│
┌────────────┼────────────┐
│ │ │
▼ ▼ ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Auth │ │ Rate │ │ CORS │
│ Middle │ │ Limit │ │ Middle │
└────┬───┘ └────┬───┘ └────┬───┘
│ │ │
└───────────┼───────────┘
│
▼
┌───────────────┐
│ Application │
│ Logic │
└───────────────┘
\```

### Communication Protocols

- **OAuth2** - Authorization code flow, client credentials
- **JWT** - Token-based authentication, RS256 signing
- **HTTPS** - TLS 1.2+ for all communications

### Key Integration Points

- **Authentication Middleware** - All API routes protected
- **Session Storage** - PostgreSQL for session management
- **Token Validation** - JWT verification on each request
````

## Step 10: Development Workflow

````markdown
## Development Workflow

### Setup & Initialization

\```bash

# Navigate to API directory

cd sirius-api

# Install dependencies

go mod download

# Configure security settings

cp config/security.example.yaml config/security.yaml

# Edit with OAuth2 credentials, JWT secrets

# Start development environment

docker compose -f docker-compose.dev.yaml up -d sirius-api
\```

### Daily Development Tasks

\```bash

# Run with live reload

air

# View security logs

docker compose logs -f sirius-api | grep -i "auth\|security"

# Test authentication

curl -H "Authorization: Bearer \$TOKEN" http://localhost:9001/api/protected
\```

### Testing & Validation

\```bash

# Run security tests

go test ./internal/auth/... ./internal/security/...

# Run static security analysis

gosec ./...

# Scan for vulnerabilities

trivy fs .

# Test OAuth flow

go test ./internal/auth/oauth_test.go -v
\```
````

## Step 11: Code Patterns (Engineering Roles Only)

Include 2-5 key patterns with good/bad examples:

````markdown
## Code Patterns & Best Practices

### Pattern 1: JWT Middleware

Always validate JWT tokens before processing requests:

\```go
// ✅ GOOD: Proper JWT validation with error handling
func JWTMiddleware(secret string) fiber.Handler {
return func(c \*fiber.Ctx) error {
authHeader := c.Get("Authorization")
if authHeader == "" {
return c.Status(401).JSON(fiber.Map{"error": "missing authorization"})
}

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            // Validate signing method
            if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
                return nil, fmt.Errorf("unexpected signing method")
            }
            return publicKey, nil
        })

        if err != nil || !token.Valid {
            return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
        }

        c.Locals("user", token.Claims)
        return c.Next()
    }

}

// ❌ BAD: No validation, security vulnerabilities
func BadJWTMiddleware() fiber.Handler {
return func(c \*fiber.Ctx) error {
token := c.Get("Authorization")
// Skipping validation - NEVER DO THIS
c.Locals("user", token)
return c.Next()
}
}
\```

### Pattern 2: Rate Limiting

\```go
// ✅ GOOD: Proper rate limiting with sliding window
func RateLimitMiddleware(limit int, window time.Duration) fiber.Handler {
store := NewInMemoryStore()

    return func(c *fiber.Ctx) error {
        clientID := c.IP() // Or use user ID for authenticated requests

        count, err := store.Increment(clientID, window)
        if err != nil {
            return c.Status(500).SendString("rate limit error")
        }

        if count > limit {
            return c.Status(429).JSON(fiber.Map{
                "error": "rate limit exceeded",
                "retry_after": window.Seconds(),
            })
        }

        return c.Next()
    }

}
\```
````

## Step 12: Common Tasks

````markdown
## Common Tasks

### Authentication Tasks

#### Task 1: Generate JWT Token

\```bash

# For testing, generate a JWT token

go run ./cmd/generate-token/main.go --user-id=123 --email=test@example.com
\```

#### Task 2: Test OAuth Flow

\```bash

# Start OAuth test server

go run ./cmd/oauth-test/main.go

# Navigate to: http://localhost:8080/auth/google

# Complete OAuth flow and verify token

\```

### Security Tasks

#### Task 3: Run Security Scan

\```bash

# Static analysis

gosec ./...

# Dependency scan

trivy fs . --severity HIGH,CRITICAL

# Check for secrets in code

gitleaks detect --source . --verbose
\```

#### Task 4: Update Security Configuration

\```bash

# Rotate JWT signing keys

./scripts/rotate-jwt-keys.sh

# Update OAuth credentials

vi config/security.yaml

# Restart API service

docker compose restart sirius-api
\```
````

## Step 13: Troubleshooting Section

````markdown
## Troubleshooting Quick Reference

### Common Issues

| Issue                          | Symptoms                           | Solution                                       |
| ------------------------------ | ---------------------------------- | ---------------------------------------------- |
| **Invalid JWT**                | 401 errors on authenticated routes | Check token expiration, verify signing key     |
| **OAuth callback fails**       | Redirect errors after login        | Verify callback URL in OAuth provider settings |
| **Rate limit false positives** | 429 errors for legitimate requests | Adjust rate limits in config/security.yaml     |
| **CORS errors**                | Preflight failures in browser      | Update CORS configuration for allowed origins  |

### Debugging Commands

\```bash

# Check JWT token validity

echo "$TOKEN" | jwt decode -

# View security logs

docker compose logs sirius-api | grep -i "auth\|jwt\|oauth"

# Test API authentication

curl -v -H "Authorization: Bearer $TOKEN" http://localhost:9001/api/test

# Check rate limit status

redis-cli get "ratelimit:$CLIENT_IP"
\```

### Quick Fixes

**Problem:** JWT token expired

**Solution:**

\```bash

# Generate new token

TOKEN=$(go run ./cmd/generate-token/main.go --user-id=123)
export TOKEN
\```

### When to Escalate

- **OAuth provider issues** - Contact provider support, check service status
- **Suspected security breach** - Immediately notify security team, rotate credentials
- **Performance degradation** - Check rate limits, review security middleware performance
````

## Step 14: Validate Your Agent

Before committing, run validation:

```bash
cd /Users/oz/Projects/Sirius-Project/Sirius/testing/container-testing

# Full validation
make lint-agents

# Quick check
make lint-agents-quick
```

**Fix any errors reported by the linter.**

## Step 15: Update the Index

Add your agent to [INDEX.agent-identities.md](mdc:.cursor/agents/INDEX.agent-identities.md):

1. **Quick Reference table** - Add row with agent info
2. **By Role Type section** - Add under appropriate role type
3. **Complete List** - Add alphabetically
4. **Agent Relationships** - Document integration points
5. **Statistics** - Update counts

Then validate the index:

```bash
make lint-agent-index
```

## Step 16: Test with AI

Create a test conversation using your new agent identity:

1. Start a new AI conversation
2. Reference your agent identity file
3. Give it a task appropriate for the role
4. Verify the AI:
   - Understands the role boundaries
   - References correct documentation
   - Follows appropriate patterns
   - Provides accurate guidance

If the agent is ineffective:

- **Too vague?** Add more specific patterns and examples
- **Too detailed?** Reduce to essential information, link to docs
- **Wrong focus?** Refine role summary and responsibilities
- **Missing context?** Add relevant documentation links

## Best Practices

### Do

- ✅ Study existing agents before creating new ones
- ✅ Keep within 200-400 line target
- ✅ Include concrete examples for engineering roles
- ✅ Link to comprehensive documentation
- ✅ Use appropriate integration level
- ✅ Validate before committing
- ✅ Test with actual AI conversations

### Don't

- ❌ Create agents for temporary needs
- ❌ Duplicate existing agent functionality
- ❌ Include implementation details (link to docs instead)
- ❌ Exceed 500 lines (maximum limit)
- ❌ Skip YAML validation
- ❌ Forget to update the index
- ❌ Commit without testing

## Common Pitfalls

### Too Broad

**Problem:** Agent tries to cover too much

**Example:** "Full Stack Engineer" covering frontend, backend, database, DevOps

**Solution:** Split into focused agents (Frontend Engineer, Backend Engineer, etc.)

### Too Narrow

**Problem:** Agent is too specific

**Example:** "Button Component Engineer" only handling button components

**Solution:** Broaden to "UI Component Engineer" covering all UI components

### Too Long

**Problem:** Agent exceeds 500 lines

**Solution:**

- Remove implementation details (link to docs)
- Reduce code examples (2-5 key patterns only)
- Condense workflow sections
- Use tables for common issues

### Missing Context

**Problem:** Agent lacks key information

**Solution:**

- Add essential documentation links
- Include critical patterns
- Document integration points
- Provide troubleshooting info

## Quick Start Checklist

- [ ] Read ABOUT, SPECIFICATION, and TEMPLATE
- [ ] Define role and determine role_type
- [ ] Choose appropriate integration level
- [ ] Copy template with correct filename
- [ ] Fill in complete YAML front matter
- [ ] Write clear 2-3 sentence role summary
- [ ] Link 5-10 key documentation files
- [ ] Define project location
- [ ] List core responsibilities
- [ ] Document technology stack
- [ ] Add system integration (if applicable)
- [ ] Document development workflow
- [ ] Include code patterns (engineering only)
- [ ] Provide common tasks
- [ ] Add troubleshooting section
- [ ] Run validation scripts
- [ ] Update INDEX.agent-identities.md
- [ ] Validate index
- [ ] Test with AI conversation
- [ ] Commit and push

---

_Follow this guide to create consistent, validated, effective agent identities. For questions, see [ABOUT.agent-identities.md](mdc:.cursor/agents/ABOUT.agent-identities.md)._
