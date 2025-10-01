---
description: CRITICAL - GitHub comment posting requires explicit user approval before mcp_github_add_issue_comment execution
globs: **/*
alwaysApply: true
---

# GitHub MCP Usage Guidelines

## Repository Information

- **Repository**: https://github.com/SiriusScan/Sirius
- **Owner**: SiriusScan
- **Repository Name**: Sirius

## 🚨 CRITICAL RULE: COMMENT APPROVAL REQUIRED

### **NEVER POST COMMENTS WITHOUT EXPLICIT APPROVAL**

- **🛑 ABSOLUTE REQUIREMENT**: Every GitHub comment MUST be approved by the user before posting
- **❌ NEVER** use `mcp_github_add_issue_comment` without explicit user confirmation
- **✅ ALWAYS** draft, present, and wait for approval

### **Mandatory Comment Approval Workflow**

```
🔒 REQUIRED STEPS - NO EXCEPTIONS:

1. 📝 Draft the complete comment content
2. 🎯 Present to user with clear context:
   "I want to post this comment on Issue #X: [content]"
3. ⏳ WAIT for explicit approval keywords:
   - "approved" / "post it" / "go ahead" / "yes, post it"
4. ✅ Only THEN execute mcp_github_add_issue_comment
5. 🚫 If no approval received, DO NOT POST
```

### **Required Approval Format**

```
I want to post this comment on Issue #[NUMBER]:

---
[FULL COMMENT CONTENT HERE]
---

Should I post this comment? (I need explicit approval)
```

### **Approval Keywords**

- ✅ "approved"
- ✅ "post it"
- ✅ "go ahead"
- ✅ "yes, post it"
- ✅ "publish it"
- ❌ Anything else = DO NOT POST

## Comment Approval Workflow

- **🚨 CRITICAL REQUIREMENT: ALL GitHub comments must be approved before posting**

  - Always draft comment content and present it to the user for review
  - Never use `mcp_github_add_issue_comment` without explicit user approval
  - Format proposed comments clearly with context about which issue/PR they target
  - Wait for explicit "approved" or "post it" confirmation before executing

- **Comment Review Process**
  ```
  1. Draft comment content with clear context
  2. Show user: "I propose this comment for Issue #X:"
  3. Present formatted comment content
  4. Wait for approval: "approved", "post it", or similar
  5. Only then execute mcp_github_add_issue_comment
  ```

## Issue Management Best Practices

- **Reading Issues**

  - Use `mcp_github_get_issue` to fetch full issue details
  - Use `mcp_github_get_issue_comments` to read existing conversation
  - Always understand context before proposing responses

- **Issue Analysis**

  - Identify root cause from issue description and attachments
  - Check for existing solutions in comments
  - Reference relevant code files when applicable
  - Provide actionable solutions with specific steps

- **Comment Content Standards**
  - Be professional and helpful
  - Include specific technical details and file references
  - Provide step-by-step solutions when possible
  - Reference relevant documentation or code
  - Use proper markdown formatting for code blocks

## Pull Request Workflow

- **PR Review Process**

  - Use `mcp_github_get_pull_request` for PR details
  - Use `mcp_github_get_pull_request_files` to see changes
  - Use `mcp_github_get_pull_request_diff` for detailed review
  - Always seek approval before creating reviews

- **Review Standards**
  - Focus on code quality, security, and project standards
  - Reference cursor rules when applicable
  - Provide constructive feedback with specific suggestions
  - Use appropriate review status (APPROVE, REQUEST_CHANGES, COMMENT)

## Repository Operations

- **Branch Management**

  - Use descriptive branch names following project conventions
  - Check existing branches with `mcp_github_list_branches`
  - Create branches for specific issues/features only

- **File Operations**
  - Always check existing file content before modifications
  - Use appropriate commit messages referencing issues
  - Ensure file changes align with project structure

## Notification Management

- **Notification Workflow**
  - Use `mcp_github_list_notifications` to check for actionable items
  - Prioritize notifications by type (mentions, review requests, assignments)
  - Mark notifications as read/done after addressing them
  - Use notification details to understand context

## Error Handling

- **Common Issues**

  - Check repository permissions before operations
  - Verify issue/PR numbers exist before referencing
  - Handle rate limiting gracefully
  - Provide clear error messages to user

- **Troubleshooting Steps**
  1. Verify repository access and permissions
  2. Check if referenced items (issues, PRs) exist
  3. Ensure proper authentication
  4. Retry with appropriate delays if rate limited

## Security Considerations

- **Sensitive Information**

  - Never include API keys, passwords, or secrets in comments
  - Avoid exposing internal system details unnecessarily
  - Be cautious with error messages that might reveal system info

- **Access Control**
  - Respect repository permissions and visibility
  - Only perform operations the user is authorized for
  - Verify user intent before executing destructive operations

## Project-Specific Guidelines

- **Sirius Project Context**

  - Understand the project structure (sirius-ui, sirius-api, sirius-engine)
  - Reference Docker compose issues and solutions appropriately
  - Consider multi-service architecture in recommendations
  - Reference existing documentation and setup guides

- **Issue Categories**
  - Docker/containerization issues
  - Service configuration problems
  - Installation and setup difficulties
  - Network and port configuration
  - Volume mounting and permissions

## Examples

### Good Comment Approval Request

```
I want to post this comment on Issue #49:

---
Hi @declan727! I can see the issue you're experiencing. The problem is with the installation instructions in the README.

**Root Cause**: The README tells users to clone the website.git repository, but the docker-compose.yaml expects local directories.

**Solution**:
1. Clone the correct repository: `git clone https://github.com/SiriusScan/Sirius.git`
2. Navigate to the directory: `cd Sirius`
3. Run: `docker compose up -d`

The volume mounts to `../minor-projects/` directories are for development and need to be adjusted for end users.
---

Should I post this comment? (I need explicit approval)
```

### Good Commit Message Format

```
"Fix Docker compose volume mounts for end users

- Remove development-specific volume mounts
- Update README to reference correct repository
- Add user-friendly docker-compose.override.yaml

Fixes #49"
```

## Tools Reference

### Essential GitHub MCP Functions

- `mcp_github_get_issue` - Get issue details
- `mcp_github_add_issue_comment` - Add comment (🚨 REQUIRES APPROVAL)
- `mcp_github_get_issue_comments` - Read existing comments
- `mcp_github_list_notifications` - Check for actionable items
- `mcp_github_get_pull_request` - Get PR details
- `mcp_github_create_pull_request` - Create new PR
- `mcp_github_create_or_update_file` - Modify repository files

### Workflow Commands

- `mcp_github_list_issues` - Browse open issues
- `mcp_github_search_issues` - Find specific issues
- `mcp_github_get_file_contents` - Read repository files
- `mcp_github_list_branches` - Check available branches
