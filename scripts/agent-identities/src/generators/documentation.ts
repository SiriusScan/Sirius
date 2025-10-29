import { readFileContent } from '../utils/file-reader.js';

const PATTERN_SECTION_TITLES = [
  'Code Patterns',
  'Best Practices',
  'Common Patterns',
  'Development Workflow',
  'Common Tasks',
  'Troubleshooting',
];

function extractSection(content: string, sectionTitle: string): string | null {
  // Try to find the section with various heading levels
  const patterns = [
    new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n# |$)`, 'i'),
    new RegExp(`### ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n### |\\n## |\\n# |$)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export async function extractCodePatterns(docPaths: string[]): Promise<string> {
  let result = '';

  for (const docPath of docPaths) {
    try {
      const content = await readFileContent(docPath);
      
      // Try to extract each pattern section
      for (const sectionTitle of PATTERN_SECTION_TITLES) {
        const section = extractSection(content, sectionTitle);
        if (section) {
          result += `### ${sectionTitle}\n\n${section}\n\n`;
        }
      }
    } catch (error) {
      console.error(`Error reading doc ${docPath}:`, error);
    }
  }

  return result.trim() || 'No code patterns found in documentation';
}

export async function extractDocumentationLinks(
  relatedDocs: string[]
): Promise<string> {
  let result = '';
  
  for (const doc of relatedDocs) {
    const docName = doc.replace(/^.*\//, '').replace(/\.md$/, '');
    result += `- [${docName}](mdc:documentation/dev/${doc})\n`;
  }
  
  return result.trim();
}


