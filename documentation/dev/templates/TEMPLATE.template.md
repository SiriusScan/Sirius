---
title: "Template Documentation Template"
description: "This template defines the standard structure and conventions for template documents within the Sirius project, ensuring consistency and clarity for all template files."
template: "TEMPLATE.template"
version: "1.0.0"
last_updated: "2025-01-03"
author: "AI Assistant"
tags: ["template", "meta-template", "structure", "standards"]
categories: ["project-management", "development"]
difficulty: "beginner"
prerequisites: ["ABOUT.documentation.md"]
related_docs:
  - "ABOUT.documentation.md"
  - "TEMPLATE.documentation-standard.md"
dependencies: []
llm_context: "medium"
search_keywords:
  [
    "template template",
    "meta-template",
    "template structure",
    "documentation template",
  ]
---

# [Template Name] Template

## Purpose

This template defines the standard structure and conventions for [specific type] documents within the Sirius project. Template documents serve as blueprints for creating consistent, high-quality documentation.

## When to Use

- **Creating new templates** - When defining structure for new document types
- **Updating existing templates** - When improving template structure
- **Template maintenance** - When ensuring template consistency
- **Onboarding contributors** - When explaining template structure

## How to Use

### Quick Start

1. **Copy this template** for your new template type
2. **Update the title and description** to match your template's purpose
3. **Define the structure** with clear sections and subsections
4. **Add examples** for each section to guide users
5. **Include placeholders** for common content patterns
6. **Test the template** by creating a sample document

### Template Structure

```markdown
# [Document Title]

## Purpose

[What this document is for]

## When to Use

[When to reference this document]

## How to Use

[How to apply the information]

## What It Is

[Detailed technical content]

## Troubleshooting

[Problem-solving section]

### FAQ

[Frequently asked questions]

### Command Reference

[Common commands]

### Common Issues

[Common problems and solutions]

## Lessons Learned

[Timestamped insights]
```

## What It Is

### Template Components

- **[Component 1]**: [Description and purpose]
- **[Component 2]**: [Description and purpose]
- **[Component 3]**: [Description and purpose]

### Required Sections

1. **Purpose** - Clear explanation of what the template is for
2. **When to Use** - Specific scenarios for using this template
3. **How to Use** - Step-by-step instructions for using the template
4. **What It Is** - Detailed explanation of the template structure
5. **Troubleshooting** - Common issues and solutions

### Optional Sections

- **Examples** - Sample content for each section
- **Best Practices** - Guidelines for effective use
- **Common Patterns** - Recurring content patterns
- **Integration Notes** - How this template works with others

### Placeholder System

Use consistent placeholders throughout the template:

- `[Document Title]` - Replace with actual document title
- `[Section Name]` - Replace with specific section names
- `[Description]` - Replace with detailed descriptions
- `[Example]` - Replace with working examples
- `[Command]` - Replace with actual commands

### YAML Front Matter

Every template must include complete YAML front matter:

```yaml
---
title: "[Template Name] Template"
description: "Brief description of template purpose"
template: "TEMPLATE.template"
version: "1.0.0"
last_updated: "YYYY-MM-DD"
author: "Template Author"
tags: ["template", "specific-type", "structure"]
categories: ["project-management", "development"]
difficulty: "beginner"
prerequisites: ["ABOUT.documentation.md"]
related_docs:
  - "ABOUT.documentation.md"
  - "TEMPLATE.documentation-standard.md"
dependencies: []
llm_context: "medium"
search_keywords: ["template", "specific-type", "structure"]
---
```

## Troubleshooting

### FAQ

**Q: How do I create a new template?**
A: Copy this template, update the title and description, define the structure, and add examples for each section.

**Q: What if I need to deviate from the standard structure?**
A: Document the deviation clearly and consider whether a new template type is needed.

**Q: How detailed should template examples be?**
A: Include enough detail to guide users but keep them concise and focused.

**Q: Should templates include all possible sections?**
A: Include required sections and common optional sections, but don't over-complicate.

### Command Reference

| Command                          | Purpose             | Example                                        |
| -------------------------------- | ------------------- | ---------------------------------------------- |
| `cp template.md new-template.md` | Copy template       | `cp TEMPLATE.template.md TEMPLATE.new-type.md` |
| `grep -r "template:"`            | Find template usage | `grep -r "template:" documentation/`           |
| `grep -r "TEMPLATE\."`           | Find all templates  | `grep -r "TEMPLATE\." documentation/`          |

### Common Issues

| Issue                     | Symptoms                       | Solution                                          |
| ------------------------- | ------------------------------ | ------------------------------------------------- |
| Template too complex      | Users confused                 | Simplify structure and add more examples          |
| Template too simple       | Missing guidance               | Add more detailed instructions and examples       |
| Inconsistent placeholders | Confusion about replacements   | Standardize placeholder format and document usage |
| Missing examples          | Users don't know what to write | Add comprehensive examples for each section       |

## Lessons Learned

### [Date] - [What was learned]

[Description of template lesson learned and how it improved the system]

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
