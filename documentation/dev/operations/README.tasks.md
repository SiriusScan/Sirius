---
title: "Task Management System"
description: "Guidelines for managing development tasks using the JSON-based task system for project tracking and progress monitoring."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["task-management", "project-tracking", "development-workflow"]
categories: ["operations", "development"]
difficulty: "beginner"
prerequisites: ["json", "project-structure"]
related_docs:
  - "README.new-project.md"
  - "README.git-operations.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "task management",
    "tasks.json",
    "project tracking",
    "development workflow",
    "task status",
  ]
---

# Task Management System

> **📚 New Projects**: For project initialization workflow, see [README.new-project.md](README.new-project.md)

## Purpose

This document provides guidelines for managing development tasks using our JSON-based task system. It ensures consistent task tracking, progress monitoring, and project completion across all development efforts.

## When to Use This System

- **Working on any project** with a `tasks/{project-name}.json` file
- **Tracking progress** on development sprints
- **Managing dependencies** between related tasks
- **Planning work** and estimating completion
- **Reporting status** to stakeholders

## Core Principles

### 1. Always Check Your Tasks

- **Start each work session** by reviewing the current task file
- **Understand dependencies** before starting work
- **Check task status** to see what's been completed
- **Identify next steps** based on available tasks

### 2. Mark Tasks Complete

- **Update status immediately** when a task is finished
- **Verify completion** using the test strategy
- **Update dependent tasks** if completion affects them
- **Commit changes** to the task file with your code

### 3. Ask for Support When Needed

- **Request clarification** on unclear requirements
- **Ask for help** when blocked or uncertain
- **Escalate issues** that prevent progress
- **Get approval** for significant scope changes

## Task Status Management

### Status Values

| Status        | Description               | When to Use                          |
| ------------- | ------------------------- | ------------------------------------ |
| `pending`     | Task not started          | Default for new tasks                |
| `in_progress` | Currently being worked on | When actively working                |
| `done`        | Completed successfully    | When task is finished                |
| `blocked`     | Cannot proceed            | When waiting for external dependency |

### Status Updates

```json
{
  "id": "1.2",
  "title": "Implement User Authentication",
  "status": "in_progress", // ← Update this as work progresses
  "priority": "high",
  "dependencies": ["1.1"]
}
```

**Update Pattern:**

1. **Start work**: Change to `in_progress`
2. **Complete work**: Change to `done`
3. **Hit blocker**: Change to `blocked`
4. **Resolve blocker**: Change back to `in_progress`

## Task Dependencies

### Understanding Dependencies

Tasks can depend on other tasks being completed first:

```json
{
  "id": "2.1",
  "title": "Create Database Schema",
  "dependencies": ["1.1", "1.2"] // ← Must complete 1.1 AND 1.2 first
}
```

### Dependency Rules

- **Check dependencies** before starting any task
- **Only work on tasks** with completed dependencies
- **Update dependent tasks** when you complete a task
- **Resolve circular dependencies** immediately

### Dependency Resolution

```bash
# Check what tasks are available to work on
# Look for tasks with status "pending" and no incomplete dependencies

# Example: Task 2.1 depends on 1.1 and 1.2
# - If 1.1 is "done" and 1.2 is "done" → Task 2.1 is available
# - If 1.1 is "pending" or 1.2 is "blocked" → Task 2.1 is not available
```

## Task File Structure

### Main Task Structure

```json
{
  "id": "1",
  "title": "PHASE 1: Core Implementation",
  "description": "Brief description of the phase",
  "details": "Detailed implementation notes and expected outputs",
  "status": "pending",
  "priority": "high",
  "dependencies": [],
  "subtasks": [
    {
      "id": "1.1",
      "title": "Specific Implementation Task",
      "description": "What this task accomplishes",
      "details": "Implementation details, acceptance criteria, and context",
      "status": "pending",
      "priority": "high",
      "dependencies": [],
      "testStrategy": "How to verify this task is complete"
    }
  ]
}
```

### Subtask Structure

```json
{
  "id": "1.2",
  "title": "Implement User Authentication",
  "description": "Add login/logout functionality to the application",
  "details": "Create authentication endpoints, middleware, and UI components. Use JWT tokens for session management. Include password hashing and validation.",
  "status": "pending",
  "priority": "high",
  "dependencies": ["1.1"],
  "testStrategy": "Test login with valid/invalid credentials, verify JWT token generation, confirm logout clears session"
}
```

## Working with Tasks

### Daily Workflow

1. **Review task file** at start of work session
2. **Identify available tasks** (pending status, dependencies met)
3. **Select highest priority** available task
4. **Update status** to `in_progress`
5. **Work on task** following details and test strategy
6. **Mark complete** when finished
7. **Commit changes** to both code and task file

### Task Selection Guidelines

**Priority Order:**

1. **High priority** tasks first
2. **Medium priority** tasks second
3. **Low priority** tasks last

**Dependency Order:**

1. **No dependencies** first
2. **Fewer dependencies** before more complex ones
3. **Blocking tasks** before dependent tasks

### Example Work Session

```bash
# 1. Check current tasks
cat tasks/feature-development.json | jq '.[] | select(.status == "pending")'

# 2. Find available tasks (no incomplete dependencies)
# Look for tasks with status "pending" and all dependencies "done"

# 3. Start work on selected task
# Update status to "in_progress" in task file

# 4. Complete work
# Update status to "done" in task file
# Commit both code and task file changes

git add .
git commit -m "feat: implement user authentication

- Add JWT-based authentication system
- Create login/logout endpoints
- Update task 1.2 to done status"
```

## Task File Maintenance

### Regular Updates

- **Update status** as work progresses
- **Add details** if requirements change
- **Update dependencies** if new relationships discovered
- **Refine test strategies** based on implementation

### File Validation

Ensure task files maintain proper structure:

```json
// Valid task structure
{
  "id": "string", // Required: Unique identifier
  "title": "string", // Required: Clear task name
  "description": "string", // Required: Brief summary
  "details": "string", // Required: Implementation notes
  "status": "string", // Required: pending|in_progress|done|blocked
  "priority": "string", // Required: high|medium|low
  "dependencies": ["array"], // Required: Array of task IDs
  "subtasks": [
    // Optional: For main tasks only
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "details": "string",
      "status": "string",
      "priority": "string",
      "dependencies": ["array"],
      "testStrategy": "string" // Required for subtasks
    }
  ]
}
```

## Integration with Development Tools

### Cursor Integration

When working with tasks, Cursor will:

- **Include task files** in context for relevant projects
- **Reference task details** when discussing implementation
- **Update task status** when completing work
- **Check dependencies** before suggesting work

### Git Integration

- **Commit task changes** with code changes
- **Reference task IDs** in commit messages
- **Track progress** through commit history
- **Maintain task history** across branches

## Common Patterns

### Task Completion Pattern

```bash
# 1. Complete the work
# 2. Test using testStrategy
# 3. Update task status
# 4. Check dependent tasks
# 5. Commit changes

git add .
git commit -m "feat: complete task 1.2 - user authentication

- Implemented JWT-based auth system
- Added login/logout endpoints
- Updated task status to done
- Ready for dependent tasks"
```

### Dependency Resolution Pattern

```bash
# When completing a task that others depend on:
# 1. Mark current task as done
# 2. Check what tasks depend on this one
# 3. Update dependent tasks if needed
# 4. Notify team of newly available tasks
```

### Blocked Task Pattern

```bash
# When encountering a blocker:
# 1. Update task status to "blocked"
# 2. Add details about the blocker
# 3. Identify resolution steps
# 4. Work on other available tasks
# 5. Return when blocker is resolved
```

## Troubleshooting

### Common Issues

**Task file not found:**

- Verify file exists in `tasks/` directory
- Check filename matches project name
- Ensure JSON syntax is valid

**Invalid task status:**

- Use only: `pending`, `in_progress`, `done`, `blocked`
- Check for typos in status values
- Validate JSON structure

**Circular dependencies:**

- Review dependency chains
- Break circular references
- Restructure task dependencies

**Missing test strategy:**

- Add testStrategy field to subtasks
- Include specific verification steps
- Make tests measurable and clear

### Getting Help

- **Task questions**: Ask for clarification on requirements
- **Dependency issues**: Request help resolving conflicts
- **Status updates**: Confirm completion criteria
- **File problems**: Verify JSON syntax and structure

## Future Enhancements

This task management system will evolve based on team needs:

- **Automated status tracking** based on commit messages
- **Dependency visualization** tools
- **Progress reporting** dashboards
- **Integration** with project management tools
- **Notification system** for task updates

---

_This task management system ensures consistent progress tracking and project completion. Always check your tasks, mark them complete, and ask for support when needed._
