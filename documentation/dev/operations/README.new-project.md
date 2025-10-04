---
title: "New Project Development Workflow"
description: "Structured approach for starting new development sprints with consistent project organization, task management, and Git workflows."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["project-management", "workflow", "git", "tasks", "development"]
categories: ["operations", "development"]
difficulty: "beginner"
prerequisites: ["git", "cursor", "project-structure"]
related_docs:
  - "README.tasks.md"
  - "README.git-operations.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "new project",
    "development sprint",
    "task management",
    "git workflow",
    "project structure",
  ]
---

# New Project Development Workflow

> **📚 Task Management**: For detailed task system usage, see [README.tasks.md](README.tasks.md)

## Purpose

This document defines the standardized workflow for starting new development sprints, ensuring consistent project organization, task tracking, and Git practices across all development efforts.

## When to Use This Workflow

- **Starting any new development sprint** - Follow this process for every new project
- **Major feature development** - Use for significant new features or enhancements
- **Bug fix campaigns** - Apply for systematic bug fixing efforts
- **Infrastructure changes** - Use for deployment, CI/CD, or architectural work
- **Research and prototyping** - Apply for exploratory development work

## Project Structure Requirements

### Required Files for Every Project

Every new development sprint must create these files in the specified locations:

#### 1. Task Definition File

- **Location**: `tasks/{sprint-name}.json`
- **Purpose**: Detailed task breakdown and tracking
- **Format**: JSON array following established schema
- **Example**: `tasks/cicd.json` (see template below)

#### 2. Project Plan Document

- **Location**: `documentation/dev-notes/{sprint-name}-plan.md`
- **Purpose**: High-level project overview and context
- **Format**: Markdown with YAML front matter
- **Content**: Project goals, scope, timeline, and key decisions

#### 3. Cleanup Task

- **Requirement**: Every project must include a final cleanup task
- **Purpose**: Remove temporary files, update documentation, merge branches
- **ID Pattern**: `{last-id + 1}` (e.g., if last task is 5, cleanup is 6)

## Task File Template

Use this template structure for all `tasks/{sprint-name}.json` files:

```json
[
  {
    "id": "0",
    "title": "PHASE 0: Project Foundation",
    "description": "Brief description of the phase",
    "details": "Detailed implementation notes and expected outputs",
    "status": "pending",
    "priority": "high",
    "dependencies": [],
    "subtasks": [
      {
        "id": "0.1",
        "title": "Specific Task Title",
        "description": "What this task accomplishes",
        "details": "Implementation details, acceptance criteria, and context",
        "status": "pending",
        "priority": "high",
        "dependencies": [],
        "testStrategy": "How to verify this task is complete"
      }
    ]
  },
  {
    "id": "1",
    "title": "PHASE 1: Core Implementation",
    "description": "Main development work",
    "details": "Key deliverables and technical approach",
    "status": "pending",
    "priority": "high",
    "dependencies": ["0"],
    "subtasks": [
      {
        "id": "1.1",
        "title": "Implementation Task",
        "description": "Specific implementation work",
        "details": "Technical details and requirements",
        "status": "pending",
        "priority": "high",
        "dependencies": ["0.1"],
        "testStrategy": "Verification approach"
      }
    ]
  },
  {
    "id": "2",
    "title": "PHASE 2: Cleanup & Documentation",
    "description": "Project completion and cleanup",
    "details": "Final tasks to close out the project",
    "status": "pending",
    "priority": "medium",
    "dependencies": ["1"],
    "subtasks": [
      {
        "id": "2.1",
        "title": "Clean Up Project Files",
        "description": "Remove temporary files and update documentation",
        "details": "Delete temporary files, update README if needed, ensure all documentation is current",
        "status": "pending",
        "priority": "medium",
        "dependencies": ["1.1"],
        "testStrategy": "Verify no temporary files remain and documentation is up to date"
      }
    ]
  }
]
```

### Task Schema Requirements

- **id**: Unique identifier (string, e.g., "0", "1.1", "2.3")
- **title**: Clear, descriptive task name
- **description**: Brief summary of what the task accomplishes
- **details**: Comprehensive implementation notes and context
- **status**: "pending", "in_progress", "done", "blocked"
- **priority**: "high", "medium", "low"
- **dependencies**: Array of task IDs this task depends on
- **subtasks**: Array of subtask objects (for main tasks)
- **testStrategy**: How to verify task completion (for subtasks)

## Git Workflow for New Projects

### Standard Branching Strategy

For every new development sprint:

#### 1. Create Feature Branch

```bash
# Start from main branch
git checkout main
git pull origin main

# Create new branch for the sprint
git checkout -b feature/{sprint-name}

# Example: git checkout -b feature/agent-enhancements
```

#### 2. Branch Naming Convention

- **Format**: `feature/{sprint-name}`
- **Examples**:
  - `feature/agent-enhancements`
  - `feature/ci-cd-pipeline`
  - `feature/ui-redesign`
  - `feature/database-optimization`

#### 3. Work on Branch

- Make all commits on the feature branch
- Use descriptive commit messages
- Commit frequently with atomic changes
- Push branch regularly to backup work

#### 4. Merge Back to Main

```bash
# When sprint is complete
git checkout main
git pull origin main
git merge feature/{sprint-name}
git push origin main

# Clean up feature branch
git branch -d feature/{sprint-name}
git push origin --delete feature/{sprint-name}
```

### Exception Cases

**When NOT to create a feature branch:**

- Hotfixes requiring immediate deployment
- Documentation-only changes
- Minor configuration updates
- Emergency security patches

**Alternative approaches:**

- **Hotfixes**: Use `hotfix/{issue-description}` branch
- **Documentation**: Can be committed directly to main
- **Config changes**: Use `config/{change-description}` branch

## Project Plan Document Template

Create `documentation/dev-notes/{sprint-name}-plan.md` with this structure:

```markdown
---
title: "{Sprint Name} - Project Plan"
description: "High-level project overview and implementation strategy"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["project-plan", "sprint", "{sprint-name}"]
categories: ["development", "planning"]
difficulty: "intermediate"
prerequisites: []
related_docs:
  - "README.tasks.md"
dependencies: []
llm_context: "medium"
search_keywords: ["{sprint-name}", "project-plan", "development"]
---

# {Sprint Name} - Project Plan

## Project Overview

**Goal**: [Primary objective of this sprint]
**Timeline**: [Expected duration]
**Scope**: [What's included and excluded]

## Key Deliverables

1. [Primary deliverable 1]
2. [Primary deliverable 2]
3. [Primary deliverable 3]

## Technical Approach

[High-level technical strategy and key decisions]

## Success Criteria

- [ ] [Measurable success criterion 1]
- [ ] [Measurable success criterion 2]
- [ ] [Measurable success criterion 3]

## Risk Assessment

**High Risk Items:**

- [Risk 1]: [Mitigation strategy]
- [Risk 2]: [Mitigation strategy]

**Dependencies:**

- [External dependency 1]
- [External dependency 2]

## Notes

[Any additional context, decisions, or considerations]
```

## Development Workflow Steps

### 1. Project Initialization

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/{sprint-name}

# 2. Create task file
touch tasks/{sprint-name}.json
# [Fill in task structure using template]

# 3. Create project plan
touch documentation/dev-notes/{sprint-name}-plan.md
# [Fill in project plan using template]

# 4. Initial commit
git add tasks/{sprint-name}.json documentation/dev-notes/{sprint-name}-plan.md
git commit -m "feat: initialize {sprint-name} project

- Add task breakdown in tasks/{sprint-name}.json
- Add project plan in documentation/dev-notes/{sprint-name}-plan.md
- Create feature branch for development"

git push origin feature/{sprint-name}
```

### 2. Development Process

- **Start each work session** by reviewing current tasks
- **Update task status** as work progresses
- **Commit frequently** with descriptive messages
- **Reference task IDs** in commit messages when relevant
- **Ask for help** when blocked or uncertain

### 3. Project Completion

```bash
# 1. Complete all tasks (including cleanup)
# 2. Update project plan with final status
# 3. Merge to main
git checkout main
git pull origin main
git merge feature/{sprint-name}
git push origin main

# 4. Clean up
git branch -d feature/{sprint-name}
git push origin --delete feature/{sprint-name}
```

## Best Practices

### Task Management

- **Keep tasks small** - Each subtask should be completable in 1-4 hours
- **Be specific** - Clear acceptance criteria and test strategies
- **Update status** - Mark tasks as done immediately when completed
- **Use dependencies** - Properly sequence related tasks

### Git Practices

- **Atomic commits** - Each commit should represent one logical change
- **Descriptive messages** - Use conventional commit format
- **Regular pushes** - Backup work frequently
- **Clean history** - Squash commits if needed before merging

### Documentation

- **Keep plans current** - Update project plans as scope changes
- **Document decisions** - Record important technical decisions
- **Include context** - Help future developers understand choices

## Troubleshooting

### Common Issues

**Task file not found:**

- Verify file is in `tasks/` directory
- Check filename matches sprint name
- Ensure JSON syntax is valid

**Branch conflicts:**

- Pull latest main before creating feature branch
- Rebase feature branch if main has moved significantly
- Resolve conflicts before merging

**Missing project plan:**

- Create plan document in `documentation/dev-notes/`
- Use template structure provided
- Include all required sections

### Getting Help

- **Task questions**: Reference [README.tasks.md](README.tasks.md)
- **Git issues**: Reference [README.git-operations.md](README.git-operations.md)
- **General help**: Ask for clarification on requirements or approach

## Integration with Cursor Rules

This workflow integrates with our Cursor rules system:

- **Task context**: Cursor will include task files in context when working on projects
- **Git operations**: Cursor will follow branching and commit conventions
- **Documentation**: Cursor will maintain project plan and task documentation
- **Code quality**: Cursor will follow established coding standards

---

_This workflow ensures consistent, organized development practices across all projects. For questions about specific aspects, see the related documentation files._
