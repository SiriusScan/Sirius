---
description: MCP server configurations and tool references
globs: **/*
alwaysApply: true
---

# MCP Server Instructions

## GitHub MCP

**Repository**: https://github.com/SiriusScan/Sirius
**Owner**: SiriusScan
**Repository Name**: Sirius

⚠️ **IMPORTANT**: See [github-mcp.mdc](mdc:.cursor/rules/github-mcp.mdc) for comprehensive GitHub MCP usage guidelines including mandatory comment approval workflow.

## Browser Tools MCP

**Description**: Provides access to in-browser debugging features such as console logs.

**Available Functions**:

- `getConsoleLogs` - Retrieve console log entries
- `getConsoleErrors` - Get console error messages
- `getNetworkErrorLogs` - Fetch network error logs
- `getNetworkSuccessLogs` - Get successful network requests
- `takeScreenshot` - Capture browser screenshots
- `getSelectedElement` - Get currently selected DOM element
- `wipeLogs` - Clear all browser logs

## Usage Guidelines

- **GitHub Operations**: Always follow approval workflow in [github-mcp.mdc](mdc:.cursor/rules/github-mcp.mdc)
- **Browser Tools**: Use for debugging UI issues and network problems
- **Security**: Never expose sensitive information through MCP tools
