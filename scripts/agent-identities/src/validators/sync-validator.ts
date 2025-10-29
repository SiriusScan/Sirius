import { stat } from 'fs/promises';
import { readFileContent } from '../utils/file-reader.js';
import matter from 'gray-matter';

export async function checkIfStale(agentPath: string): Promise<{
  isStale: boolean;
  reason?: string;
  staleFiles?: string[];
}> {
  try {
    // 1. Parse agent identity
    const content = await readFileContent(agentPath);
    const { data: frontMatter } = matter(content);

    // 2. Get source files from metadata
    const sourceFiles: string[] = frontMatter._source_files || [];
    const generatedAt = frontMatter._generated_at
      ? new Date(frontMatter._generated_at)
      : new Date(0); // If no generation date, consider it stale

    if (sourceFiles.length === 0) {
      return {
        isStale: true,
        reason: 'No source files tracked (not generated or old format)',
      };
    }

    // 3. Check if any source file is newer than generation time
    const staleFiles: string[] = [];

    for (const sourceFile of sourceFiles) {
      try {
        const stats = await stat(sourceFile);
        if (stats.mtime > generatedAt) {
          staleFiles.push(sourceFile);
        }
      } catch (err) {
        // File doesn't exist or can't be read
        staleFiles.push(`${sourceFile} (missing)`);
      }
    }

    if (staleFiles.length > 0) {
      return {
        isStale: true,
        reason: 'Source files modified since last generation',
        staleFiles,
      };
    }

    return { isStale: false };
  } catch (error) {
    return {
      isStale: true,
      reason: `Error checking staleness: ${error}`,
    };
  }
}


