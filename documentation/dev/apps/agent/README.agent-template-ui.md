---
title: "Agent Template UI Documentation"
description: "User interface workflows for managing agent vulnerability detection templates"
template: "TEMPLATE.documentation-standard"
llm_context: "high"
categories: ["ui", "agent", "templates"]
tags: ["ui", "agent", "templates", "vulnerability", "detection", "scanner"]
related_docs:
  - "README.agent-template-api.md"
  - "ABOUT.documentation.md"
search_keywords: ["agent template ui", "template management", "scanner ui"]
---

# Agent Template UI Documentation

## Overview

The Agent Template UI provides a comprehensive interface for managing vulnerability detection templates within the Sirius Scanner. Users can browse, upload, test, and analyze templates through an intuitive web interface.

## Accessing Template Management

**Navigation:** Scanner → Advanced → Agent → Templates Tab

The Agent Templates interface is located within the Scanner's Advanced configuration section, under the Agent settings.

---

## Interface Components

### 1. Template Browser

The main view for browsing and managing templates.

#### Features

- **Search**: Search templates by name, ID, description, or author
- **Filters**: Filter by type, severity, platform, and source
- **Template Cards**: Visual cards displaying template metadata
- **Actions**: View, edit (custom only), delete (custom only), test, and deploy

#### Template Card Information

Each template card displays:

- Template name and ID
- Description (truncated to 2 lines)
- Severity badge (color-coded)
- Type badge (standard/custom)
- Source information
- Supported platforms
- Author and version

#### Action Buttons

- **View**: Display full template details and YAML content
- **Edit**: Modify custom templates (not available for standard templates)
- **Delete**: Remove custom templates (not available for standard templates)
- **Test**: Execute template on a selected agent

---

### 2. Template Uploader

Upload custom vulnerability detection templates.

#### Upload Process

1. Click "Create Template" or "Upload Template" button
2. Drag and drop a YAML file or click to browse
3. File is automatically validated
4. Review validation results (errors and warnings)
5. Preview template content
6. Optionally override author field
7. Click "Upload Template" to save

#### File Requirements

- File format: `.yaml` or `.yml`
- Maximum size: 1MB
- Must include required YAML fields
- Must pass validation checks

#### Validation

**Required Fields:**

- `id`: Unique template identifier
- `info.name`: Human-readable template name
- `info.severity`: Severity level (critical/high/medium/low/info)
- `info.description`: Description of what the template detects

**Optional but Recommended:**

- `info.author`: Template author
- `info.tags`: Tags for organization
- `info.version`: Template version
- `info.references`: Links to vulnerability information
- `info.cve`: CVE identifiers

**Validation Feedback:**

- ✓ **Errors** (red): Must be fixed before upload
- ⚠ **Warnings** (yellow): Recommended improvements, not blocking

---

### 3. Template Tester

Test templates on live agents to verify detection logic.

#### Testing Process

1. Select a template to test
2. Choose a target agent from the list
3. Click "Run Test" button
4. View real-time execution progress
5. Review detailed test results

#### Agent Selection

**Filters:**

- Status: Online/Offline (only online agents can be selected)
- Platform: Filter by operating system
- Search: Find agents by hostname or IP

**Agent Information Displayed:**

- Hostname
- IP address
- Platform (Linux/macOS/Windows)
- Status (online/offline)
- Last seen timestamp
- Agent version

#### Test Results

**Summary Metrics:**

- **Vulnerability Status**: Vulnerable or Not Vulnerable
- **Confidence Score**: 0-100% (color-coded: green/yellow/orange/red)
- **Execution Time**: Template execution duration in milliseconds
- **Steps Completed**: Number of detection steps executed

**Detailed Results:**

- Evidence collected during detection
- Step-by-step execution results
- Individual step confidence scores
- Error messages (if any)

**Step Details (expandable):**

- Step type (file_hash, file_content, command_version, script)
- Match status (matched/not matched)
- Evidence data
- Error information

---

### 4. Template Analytics

View template effectiveness and execution statistics.

#### Summary Cards

- **Total Executions**: Total number of template runs across all agents
- **Vulnerabilities Found**: Total detections
- **Success Rate**: Percentage of successful executions
- **Average Execution Time**: Mean template execution time

#### Top Performing Templates

Ranked list of templates by detection count, showing:

- Template rank (top 5)
- Template name and ID
- Detection count
- Execution count
- Success rate percentage
- Average execution time
- Visual performance bar

#### Platform Distribution

Breakdown of template executions by platform:

- Linux
- macOS (Darwin)
- Windows

Displayed as:

- Platform icon
- Execution count
- Percentage of total
- Visual progress bar

---

## User Workflows

### Workflow 1: Uploading a Custom Template

1. Navigate to Scanner → Advanced → Agent → Templates
2. Ensure "Enable Agent Templates" is toggled ON
3. Click "Upload Template" button
4. Drag and drop your YAML file or click to browse
5. Wait for automatic validation
6. Review validation results:
   - If errors exist, fix your template and re-upload
   - Warnings are optional improvements
7. Review the template preview
8. (Optional) Override the author field
9. Click "Upload Template"
10. Template is saved and automatically distributed to all agents
11. Return to template browser to see your new template

**Success Indicators:**

- Green checkmark in validation
- Template appears in browser with "custom" badge
- Confirmation message displayed

---

### Workflow 2: Testing a Template

1. From the template browser, click the test icon on any template
2. Or click "Test Template" and select a template from dropdown
3. Review template information (description, platforms, etc.)
4. Scroll to "Select Target Agent" section
5. Use filters to find appropriate agents:
   - Filter by platform if template is platform-specific
   - Ensure agent is online (green status badge)
6. Click on an agent card to select it
7. Click "Run Test" button
8. Wait for test execution (typically 1-5 seconds)
9. Review results:
   - Check vulnerability status
   - Review confidence score
   - Examine evidence
   - Expand steps for detailed information
10. Test additional agents or return to browser

**Best Practices:**

- Test on multiple agents to verify detection logic
- Test on different platforms if template supports multiple
- Review confidence scores to validate template accuracy

---

### Workflow 3: Managing Templates

#### Viewing Template Details

1. Click "View" button on any template card
2. Review full template information:
   - Complete metadata
   - Full YAML content (with syntax highlighting)
3. Use "Test Template" to verify functionality
4. Use "Back to Templates" to return

#### Deleting Custom Templates

1. Locate the custom template in browser
2. Click the trash icon (red)
3. Confirm deletion in dialog
4. Template is removed from all agents immediately

**Note:** Standard templates cannot be deleted.

---

### Workflow 4: Monitoring Template Effectiveness

1. Click "Analytics" button in template browser
2. Review summary metrics at the top
3. Check "Top Performing Templates":
   - Identify which templates find the most vulnerabilities
   - Review success rates
   - Identify slow-running templates
4. Review "Platform Distribution":
   - Understand which platforms are scanned most
   - Identify coverage gaps
5. Use insights to:
   - Prioritize template improvements
   - Add templates for underrepresented platforms
   - Remove ineffective templates

---

## Settings

### Enable Agent Templates

Toggle agent template scanning on or off for all scans.

**Location:** Templates tab → Settings card

**Effect:** When disabled, agents will not execute vulnerability detection templates during scans.

### Template Priority

Control which templates are used based on severity level.

**Options:**

- **High**: Only critical and high severity templates
- **Medium**: Include medium severity templates
- **All**: Use all templates regardless of severity

**Use Cases:**

- **High**: Fast scans focusing on critical vulnerabilities
- **Medium**: Balanced scan coverage
- **All**: Comprehensive vulnerability assessment

---

## Template Card Color Coding

### Severity Colors

- **Critical**: Red (bg-red-500/20, text-red-400)
- **High**: Orange (bg-orange-500/20, text-orange-400)
- **Medium**: Yellow (bg-yellow-500/20, text-yellow-400)
- **Low**: Blue (bg-blue-500/20, text-blue-400)
- **Info**: Gray (bg-gray-500/20, text-gray-400)

### Type Colors

- **Standard**: Green (bg-green-500/20, text-green-400)
- **Custom**: Violet (bg-violet-500/20, text-violet-400)
- **Repository**: Blue (bg-blue-500/20, text-blue-400)

### Status Colors (Agents)

- **Online**: Green
- **Offline**: Gray

---

## Keyboard Shortcuts

Currently, no keyboard shortcuts are implemented. This may be added in a future version.

---

## Troubleshooting

### Template Upload Fails

**Symptoms:** Validation errors prevent upload

**Solutions:**

1. Review error messages carefully
2. Check required fields are present
3. Verify severity value is valid (critical/high/medium/low/info)
4. Ensure YAML syntax is correct
5. Check file size is under 1MB
6. Verify file extension is .yaml or .yml

### Template Test Hangs

**Symptoms:** Test never completes or times out

**Possible Causes:**

- Agent is offline or unreachable
- Template contains infinite loop or long-running command
- Network connectivity issues

**Solutions:**

1. Verify agent is online in agent list
2. Test a different template on the same agent
3. Test the same template on a different agent
4. Check agent logs for errors
5. Review template detection logic for long-running operations

### Template Not Appearing

**Symptoms:** Uploaded template doesn't appear in browser

**Solutions:**

1. Refresh the page
2. Clear any active filters
3. Check template was successfully uploaded (confirmation message)
4. Verify template wasn't deleted by another user
5. Check browser console for JavaScript errors

### Agents Not Listed in Test View

**Symptoms:** No agents available for testing

**Possible Causes:**

- No agents are currently online
- Platform filter is too restrictive
- Agents haven't registered yet

**Solutions:**

1. Check agent status in Terminal or Dashboard
2. Clear platform filter to see all agents
3. Wait for agents to come online
4. Verify agent connectivity

---

## Performance Considerations

### Template Browser

- Displays up to 1000 templates efficiently
- Filtering and search are client-side (instant)
- Template cards use lazy loading for large lists

### Template Testing

- Test results are displayed in real-time
- Step-by-step results are lazy-loaded
- Large evidence data is formatted for readability

### Analytics

- Analytics data is cached for 5 minutes
- Refresh manually to get latest statistics
- Chart rendering is optimized for large datasets

---

## Security Notes

### Template Upload

- All templates are validated before upload
- Malicious YAML is rejected
- File size limits prevent DoS attacks
- Templates are sandboxed during execution

### Template Testing

- Tests only execute on selected agents
- Test results are not persisted
- Agent permissions are enforced

### Template Deletion

- Only custom templates can be deleted
- Deletion is immediate and cannot be undone
- All agents are notified of deletion

---

## Future Enhancements

Planned features for future releases:

1. **Template Editor**: Visual form-based template builder
2. **Template Versioning**: Track and rollback template changes
3. **Template Collections**: Bundle related templates
4. **Template Marketplace**: Share templates with community
5. **Scheduled Scans**: Automatic periodic template execution
6. **Advanced Analytics**: Detection trends over time
7. **Role-Based Access**: Control who can upload/edit templates
8. **Bulk Operations**: Deploy/test multiple templates at once

---

## See Also

- [Agent Template API Documentation](README.agent-template-api.md)
- [Template System Notes](../../app-agent/project/BRAINSTORM.template-system-notes.md)
- [Scanner Advanced Configuration](../ui/README.scanner-advanced.md)

