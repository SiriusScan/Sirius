import { GeneratedSection } from '../types/agent-identity.js';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function mergeTemplate(
  template: string,
  generatedSections: GeneratedSection[]
): string {
  let result = template;

  // Find all <!-- AUTO-GENERATED: section-name --> blocks
  // Replace content between markers with generated content
  // Preserve manual sections

  for (const section of generatedSections) {
    const startMarker = `<!-- AUTO-GENERATED: ${section.name} -->`;
    const endMarker = `<!-- END AUTO-GENERATED -->`;

    const pattern = new RegExp(
      `${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`,
      'g'
    );

    const replacement =
      `${startMarker}\n` +
      `<!-- Generated: ${section.last_generated.toISOString()} -->\n` +
      `<!-- Sources: ${section.source_files.join(', ')} -->\n\n` +
      section.content +
      '\n' +
      endMarker;

    result = result.replace(pattern, replacement);
  }

  return result;
}


