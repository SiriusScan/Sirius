---
title: "Playwright Browser Testing Guide"
description: "Guide for using Playwright MCP for browser testing, troubleshooting, and validation"
template: "TEMPLATE.guide"
version: "1.0.0"
last_updated: "2025-10-18"
author: "Sirius Development Team"
tags: ["testing", "playwright", "browser", "e2e", "validation"]
categories: ["testing", "development", "troubleshooting"]
difficulty: "intermediate"
prerequisites: ["Docker", "MCP Server"]
related_docs:
  - "README.container-testing.md"
  - "CHECKLIST.testing-by-type.md"
llm_context: "high"
search_keywords: ["playwright", "browser testing", "e2e", "automation", "mcp"]
---

# Playwright Browser Testing Guide

## Overview

This guide covers using the Playwright MCP (Model Context Protocol) server for automated browser testing, troubleshooting, and implementation validation in the Sirius project.

## Docker Network Access

### Critical: Host Access from Docker

The Playwright MCP server runs inside Docker and cannot access `localhost` directly. Use Docker's special DNS name:

```
✅ CORRECT:   http://host.docker.internal:3000
❌ INCORRECT: http://localhost:3000
❌ INCORRECT: http://127.0.0.1:3000
```

### Service URLs

| Service             | Docker URL                          | Description         |
| ------------------- | ----------------------------------- | ------------------- |
| UI                  | `http://host.docker.internal:3000`  | Next.js frontend    |
| API                 | `http://host.docker.internal:9001`  | Go Fiber backend    |
| RabbitMQ Management | `http://host.docker.internal:15672` | Queue management UI |
| PostgreSQL          | `host.docker.internal:5432`         | Database (not HTTP) |

## When to Use Playwright

### ✅ Use Playwright For:

1. **Implementation Validation**

   - Verify new features work end-to-end
   - Test user flows after major changes
   - Confirm UI components render correctly

2. **Bug Troubleshooting**

   - Reproduce user-reported issues
   - Capture screenshots of error states
   - Inspect console logs and network requests
   - Debug form submissions and interactions

3. **Design Verification**

   - Check responsive layouts
   - Verify component positioning
   - Test accessibility features
   - Validate user experience flows

4. **Integration Testing**

   - Test API integration points
   - Verify data flow between UI and backend
   - Check authentication flows
   - Validate form submissions

5. **Regression Testing**
   - Verify existing functionality still works
   - Test critical user paths
   - Check for breaking changes

### ❌ Don't Use Playwright For:

1. **Unit Testing** - Use Jest/Vitest instead
2. **Backend API Testing** - Use curl/API testing tools
3. **Performance Testing** - Use dedicated tools
4. **Load Testing** - Use k6 or similar tools

## Common Testing Scenarios

### 1. Testing Authentication Flow

```yaml
Example:
  - Navigate to login page
  - Fill in credentials
  - Click submit
  - Verify redirect to dashboard
  - Check session state
```

### 2. Testing Form Submission

```yaml
Example:
  - Navigate to scanner page
  - Fill in target IP address
  - Select template from dropdown
  - Click "Start Scan"
  - Verify API requests made
  - Check UI updates
```

### 3. Testing API Integration

```yaml
Example:
  - Navigate to page that loads data
  - Wait for API calls to complete
  - Check network requests
  - Verify data displays correctly
  - Test error handling
```

### 4. Debugging UI Issues

```yaml
Example:
  - Navigate to problematic page
  - Take screenshot of current state
  - Check console for errors
  - Inspect element states
  - Verify network requests
```

## Playwright MCP Tools Reference

### Navigation

**`browser_navigate`** - Navigate to a URL

```
Use: Load a page
URL: http://host.docker.internal:3000/scanner
```

**`browser_navigate_back`** - Go to previous page

```
Use: Test back button functionality
```

### Interaction

**`browser_click`** - Click an element

```
Parameters:
  - element: Human-readable description
  - ref: Element reference from snapshot
Example: Click "Start Scan" button
```

**`browser_type`** - Type text into input

```
Parameters:
  - element: Input field description
  - ref: Element reference
  - text: Text to type
  - slowly: Type one character at a time (optional)
  - submit: Press Enter after typing (optional)
```

**`browser_fill_form`** - Fill multiple form fields

```
Use: Fill entire forms efficiently
Fields: Array of {name, type, ref, value}
```

**`browser_select_option`** - Select dropdown option

```
Use: Choose from select/combobox
Values: Array of option values
```

### Inspection

**`browser_snapshot`** - Capture page state

```
Use: Get current page structure
Returns: Accessibility tree with element refs
```

**`browser_take_screenshot`** - Take visual screenshot

```
Use: Capture visual state
Options: fullPage, element, filename
Note: Cannot interact based on screenshot
```

**`browser_console_messages`** - Get console logs

```
Use: Debug JavaScript errors
Options: onlyErrors to filter
```

**`browser_network_requests`** - View network activity

```
Use: Verify API calls
Returns: All requests since page load
```

### Waiting

**`browser_wait_for`** - Wait for condition

```
Options:
  - text: Wait for text to appear
  - textGone: Wait for text to disappear
  - time: Wait N seconds
```

### Advanced

**`browser_hover`** - Hover over element

```
Use: Test hover states, tooltips
```

**`browser_drag`** - Drag and drop

```
Use: Test drag interactions
```

**`browser_evaluate`** - Execute JavaScript

```
Use: Complex DOM manipulation or queries
```

**`browser_tabs`** - Manage browser tabs

```
Actions: list, new, close, select
```

## Testing Workflow Examples

### Example 1: Test Scanner Page

```yaml
Step 1: Navigate
  - URL: http://host.docker.internal:3000/scanner
  - Wait for: Page load

Step 2: Login (if needed)
  - Fill username: admin
  - Fill password: password
  - Click: "Join the Pack"
  - Wait for: Dashboard redirect

Step 3: Navigate to Scanner
  - Click: Scanner link
  - Wait for: Page load

Step 4: Add Target
  - Type in IP field: 192.168.1.100
  - Click: Add button
  - Verify: Target appears in list

Step 5: Start Scan
  - Select template: "High Risk Scan"
  - Click: "Start Scan"
  - Check network: queue.sendMsg called
  - Check network: store.setValue called
  - Verify: UI updates with scan details
```

### Example 2: Debug Form Not Submitting

```yaml
Step 1: Navigate to Form
  - URL: http://host.docker.internal:3000/form-page

Step 2: Fill Form
  - Fill all required fields
  - Take screenshot: "before-submit.png"

Step 3: Submit
  - Click: Submit button
  - Get console messages
  - Get network requests

Step 4: Analyze
  - Check console for errors
  - Verify API request was made
  - Check API response status
  - Take screenshot: "after-submit.png"
```

### Example 3: Verify Component Rendering

```yaml
Step 1: Navigate
  - URL: http://host.docker.internal:3000/component-page

Step 2: Wait for Load
  - Wait for: Expected text
  - Wait: 2 seconds for async data

Step 3: Capture State
  - Take snapshot
  - Check for: Expected elements
  - Verify: Element text content

Step 4: Test Interaction
  - Click: Interactive element
  - Verify: State change
  - Take screenshot: Show result
```

## Best Practices

### 1. Always Use host.docker.internal

```yaml
✅ GOOD:
  - http://host.docker.internal:3000/scanner

❌ BAD:
  - http://localhost:3000/scanner
  - http://127.0.0.1:3000/scanner
```

### 2. Wait for Async Operations

```yaml
✅ GOOD:
  - Navigate to page
  - Wait 2-3 seconds
  - Check for loaded content
  - Interact with elements

❌ BAD:
  - Navigate to page
  - Immediately interact (might not be ready)
```

### 3. Use Snapshots for Element Refs

```yaml
✅ GOOD:
  - Take snapshot
  - Get element ref (e.g., e187)
  - Use ref for interaction

❌ BAD:
  - Guess element selectors
  - Use outdated refs
```

### 4. Check Network Requests

```yaml
✅ GOOD:
  - Perform action
  - Get network requests
  - Verify expected API calls

❌ BAD:
  - Assume API was called
  - Skip verification
```

### 5. Capture Console Logs

```yaml
✅ GOOD:
  - Check console after actions
  - Look for errors or warnings
  - Verify debug logs

❌ BAD:
  - Ignore console output
  - Miss JavaScript errors
```

## Troubleshooting

### Issue: Cannot Connect to Page

```
Error: net::ERR_CONNECTION_REFUSED
Solution: Use host.docker.internal instead of localhost
```

### Issue: Element Not Found

```
Problem: Element ref is stale
Solution: Take fresh snapshot before interaction
```

### Issue: Timeout Errors

```
Problem: Page loads slowly
Solution: Increase wait time or wait for specific condition
```

### Issue: Network Requests Not Visible

```
Problem: Requests made before navigation
Solution: Navigate first, then check requests
```

## Testing Checklist

### Pre-Test Setup

- [ ] Ensure Docker containers are running
- [ ] Verify services are healthy
- [ ] Check that UI is accessible at host.docker.internal:3000

### During Testing

- [ ] Use host.docker.internal URLs
- [ ] Wait for page loads
- [ ] Take snapshots before interactions
- [ ] Check console for errors
- [ ] Verify network requests
- [ ] Capture screenshots for visual issues

### Post-Test Analysis

- [ ] Review console messages
- [ ] Check network request logs
- [ ] Verify expected API calls
- [ ] Document any issues found
- [ ] Take final screenshots

## Common Test Scenarios

### Authentication

```
1. Navigate to login page
2. Fill credentials
3. Submit form
4. Verify session cookie
5. Check redirect
```

### Form Validation

```
1. Navigate to form
2. Submit without required fields
3. Verify error messages
4. Fill fields correctly
5. Submit and verify success
```

### Data Loading

```
1. Navigate to data page
2. Wait for loading state
3. Verify API calls made
4. Check data displays
5. Test error states
```

### Navigation

```
1. Test all nav links
2. Verify correct pages load
3. Check active states
4. Test back/forward
5. Verify breadcrumbs
```

## Integration with Development

### When to Run Tests

1. **After UI Changes**

   - Verify components still render
   - Check interactions work
   - Test user flows

2. **Before Commits**

   - Quick smoke test
   - Verify critical paths
   - Check for console errors

3. **During Debugging**

   - Reproduce reported issues
   - Capture error states
   - Verify fixes

4. **During Code Review**
   - Validate new features
   - Check edge cases
   - Verify error handling

## LLM Context for Testing

When the AI should use Playwright:

1. **User reports UI bug** → Use Playwright to reproduce
2. **Testing new feature** → Use Playwright to validate
3. **Verifying implementation** → Use Playwright to check
4. **Debugging form issues** → Use Playwright to inspect
5. **Checking API integration** → Use Playwright to verify network calls

When the AI should NOT use Playwright:

1. **Backend-only changes** → Use curl or API testing
2. **Unit test failures** → Check test files directly
3. **Build issues** → Check logs and configuration
4. **Database queries** → Use database tools

## Quick Reference

### Login Sequence

```
1. navigate → http://host.docker.internal:3000
2. wait 3 seconds
3. type username → "admin"
4. type password → "password"
5. click → "Join the Pack"
6. wait for redirect
```

### Scan Flow

```
1. navigate → http://host.docker.internal:3000/scanner
2. type target → "192.168.1.100"
3. click → Add button
4. select template → "High Risk Scan"
5. click → "Start Scan"
6. check network → verify queue.sendMsg
```

### Debug Flow

```
1. navigate → problematic page
2. wait for load
3. take snapshot → see structure
4. get console messages → check errors
5. get network requests → verify API
6. take screenshot → capture visual state
```

---

_For more testing information, see [README.container-testing.md](../test/README.container-testing.md) and [CHECKLIST.testing-by-type.md](../test/CHECKLIST.testing-by-type.md)._

