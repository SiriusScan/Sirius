import { access } from 'fs/promises';
import { readFileContent } from '../utils/file-reader.js';

function extractFileReferences(content: string): string[] {
  const references: string[] = [];

  // Extract mdc: links
  const mdcPattern = /\(mdc:([^)]+)\)/g;
  let match;
  while ((match = mdcPattern.exec(content)) !== null) {
    references.push(match[1]);
  }

  // Extract code block file paths (comments indicating source)
  // e.g., <!-- Source: app-agent/config/server.yaml -->
  const sourcePattern = /<!--\s*Source:\s*([^-]+?)\s*-->/g;
  while ((match = sourcePattern.exec(content)) !== null) {
    const paths = match[1].split(',').map(p => p.trim());
    references.push(...paths);
  }

  // Extract direct file path references in backticks
  // e.g., `app-agent/cmd/server/main.go`
  const backtickPattern = /`([a-z-]+\/[a-z-/.]+)`/g;
  while ((match = backtickPattern.exec(content)) !== null) {
    if (match[1].includes('/') && match[1].includes('.')) {
      references.push(match[1]);
    }
  }

  return [...new Set(references)]; // Remove duplicates
}

export async function validateFilePaths(agentPath: string): Promise<{
  valid: boolean;
  missingFiles: string[];
}> {
  try {
    // 1. Parse agent identity content
    const content = await readFileContent(agentPath);

    // 2. Extract all file/directory references
    const fileReferences = extractFileReferences(content);

    // 3. Check each file exists
    const missingFiles: string[] = [];

    for (const filePath of fileReferences) {
      try {
        await access(filePath);
      } catch {
        missingFiles.push(filePath);
      }
    }

    return {
      valid: missingFiles.length === 0,
      missingFiles,
    };
  } catch (error) {
    return {
      valid: false,
      missingFiles: [`Error validating file paths: ${error}`],
    };
  }
}


