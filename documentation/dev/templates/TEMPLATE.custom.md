---
title: "Custom Documentation Template"
description: "This template defines the structure for custom documents that don't need to follow standard templates, providing flexibility for meta-documents and special cases."
template: "TEMPLATE.template"
version: "1.0.0"
last_updated: "2025-01-03"
author: "AI Assistant"
tags: ["template", "custom", "flexible", "meta-document"]
categories: ["project-management", "development"]
difficulty: "beginner"
prerequisites: ["ABOUT.documentation.md"]
related_docs:
  - "ABOUT.documentation.md"
  - "TEMPLATE.documentation-standard.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "custom template",
    "flexible template",
    "meta-document",
    "non-standard template",
  ]
---

# Custom Documentation Template

## Purpose

This template provides a flexible structure for custom documents that don't need to follow standard templates. Use this for meta-documents, special cases, or documents that require unique structure.

## When to Use

- **Meta-documents** - Documents about the documentation system itself
- **Special cases** - Documents that don't fit standard templates
- **Flexible content** - When you need custom structure
- **Experimental docs** - When testing new documentation approaches

## How to Use

1. **Copy this template** for your custom document
2. **Modify the structure** as needed for your specific use case
3. **Keep YAML front matter** for consistency and LLM optimization
4. **Maintain basic standards** even with custom structure
5. **Document deviations** if they're significant

## What It Is

### Flexible Structure

Custom documents can have any structure that makes sense for their purpose, but should include:

- **YAML Front Matter** - For consistency and LLM optimization
- **Clear Purpose** - What the document is for
- **Logical Organization** - Information should be well-structured
- **Appropriate Sections** - Based on the document's purpose

### Custom Sections

Unlike standard templates, custom documents can include:

- **Any section structure** that makes sense
- **Unique formatting** for specific needs
- **Specialized content** for specific audiences
- **Experimental approaches** to documentation

### YAML Front Matter

Even custom documents should include complete YAML front matter:

```yaml
---
title: "Document Title"
description: "Brief description of purpose"
template: "TEMPLATE.custom"
version: "1.0.0"
last_updated: "YYYY-MM-DD"
author: "Document Author"
tags: ["relevant", "tags"]
categories: ["appropriate", "categories"]
difficulty: "beginner|intermediate|advanced"
prerequisites: ["any", "prerequisites"]
related_docs:
  - "related-doc1.md"
  - "related-doc2.md"
dependencies: ["any", "dependencies"]
llm_context: "high|medium|low"
search_keywords: ["relevant", "keywords"]
---
```

## Troubleshooting

### FAQ

**Q: When should I use a custom template instead of a standard one?**
A: Use custom when the document doesn't fit standard patterns, is a meta-document, or requires unique structure.

**Q: Do custom documents still need YAML front matter?**
A: Yes, for consistency, LLM optimization, and integration with our documentation system.

**Q: How much can I deviate from standard structure?**
A: As much as needed for your specific use case, but maintain basic organization and clarity.

**Q: Should custom documents still be linted?**
A: Yes, but with relaxed template compliance rules for custom documents.

### Command Reference

| Command                            | Purpose                | Example                                             |
| ---------------------------------- | ---------------------- | --------------------------------------------------- |
| `cp TEMPLATE.custom.md new-doc.md` | Create custom document | `cp TEMPLATE.custom.md documentation/custom-doc.md` |
| `grep -r "template: custom"`       | Find custom documents  | `grep -r "template: custom" documentation/`         |

### Common Issues

| Issue                | Symptoms                 | Solution                                   |
| -------------------- | ------------------------ | ------------------------------------------ |
| Too much deviation   | Hard to maintain         | Consider if a standard template would work |
| Missing front matter | Poor LLM integration     | Add complete YAML front matter             |
| Poor organization    | Hard to find information | Improve structure and add clear headings   |

## Lessons Learned

### [Date] - [What was learned]

[Description of custom template lesson learned and how it improved the system]

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
