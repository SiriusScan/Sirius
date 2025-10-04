---
title: "About AI Rules"
description: "Documentation for AI/LLM interaction rules and guidelines within the Sirius project, including cursor rules and context shaping strategies."
template: "TEMPLATE.about"
version: "1.0.0"
last_updated: "2025-01-03"
author: "AI Assistant"
tags: ["ai", "llm", "rules", "cursor", "context"]
categories: ["project-management", "development"]
difficulty: "intermediate"
prerequisites: ["ABOUT.documentation.md"]
related_docs:
  - "ABOUT.documentation.md"
  - "README.documentation-index.md"
dependencies: []
llm_context: "high"
search_keywords:
  ["ai rules", "llm context", "cursor rules", "documentation rules"]
---

# About AI Rules

## Purpose

This document explains how AI/LLM interaction rules and guidelines work within the Sirius project. These rules help shape how Large Language Models interact with our codebase and documentation system.

## When to Use

- **Setting up AI development environment** - Understanding how AI tools should interact with our project
- **Creating new AI rules** - When adding new guidelines for AI interaction
- **Troubleshooting AI context issues** - When AI tools aren't providing the right context
- **Optimizing AI performance** - When improving how AI systems understand our project

## How to Use

1. **Read the cursor rules** to understand current AI interaction guidelines
2. **Check the documentation system** for how AI should consume our docs
3. **Follow the context shaping strategies** for optimal AI performance
4. **Update rules as needed** when project structure changes

## What It Is

### Cursor Rules Integration

Our project uses cursor rules to guide AI interactions:

- **Code understanding** - How AI should interpret our codebase
- **Documentation consumption** - How AI should use our documentation system
- **Context building** - How AI should build comprehensive project context
- **Best practices** - Guidelines for AI-assisted development

### AI Context Optimization

Our documentation system is designed for optimal AI consumption:

- **YAML front matter** - Machine-readable metadata
- **Structured relationships** - Clear document connections
- **LLM context levels** - Prioritized information for AI
- **Search keywords** - Optimized for AI discovery

### Integration Points

- **Cursor IDE** - Primary AI development environment
- **Documentation system** - AI context source
- **Codebase structure** - AI understanding target
- **Development workflows** - AI assistance scope

## Troubleshooting

### FAQ

**Q: How do I update cursor rules for new documentation?**
A: Update the cursor rules file to include new documentation patterns and relationships.

**Q: Why isn't AI understanding our documentation structure?**
A: Check that YAML front matter is complete and relationships are properly defined.

**Q: How do I optimize AI context for specific tasks?**
A: Use the LLM context levels and search keywords in documentation front matter.

### Command Reference

| Command                       | Purpose                        | Example                                      |
| ----------------------------- | ------------------------------ | -------------------------------------------- |
| `grep -r "llm_context: high"` | Find high-priority docs for AI | `grep -r "llm_context: high" documentation/` |
| `grep -r "template:"`         | Check template usage           | `grep -r "template:" documentation/`         |
| `grep -r "related_docs:"`     | Find document relationships    | `grep -r "related_docs:" documentation/`     |

### Common Issues

| Issue                         | Symptoms                 | Solution                                     |
| ----------------------------- | ------------------------ | -------------------------------------------- |
| AI not finding relevant docs  | Poor context building    | Check LLM context levels and search keywords |
| AI misunderstanding structure | Incorrect template usage | Verify template compliance and relationships |
| AI missing dependencies       | Broken document links    | Validate related_docs and dependencies       |

## Lessons Learned

### [Date] - [What was learned]

[Description of AI rules lesson learned and how it improved the system]

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
