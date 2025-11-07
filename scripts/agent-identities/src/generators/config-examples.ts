import { readFileContent } from '../utils/file-reader.js';
import { join } from 'path';
import { codeBlock } from '../utils/markdown-builder.js';

export async function extractConfigExamples(
  productPath: string,
  configFiles: Array<{ path: string; title: string }>
): Promise<string> {
  let result = '';

  for (const configFile of configFiles) {
    try {
      const fullPath = join(productPath, configFile.path);
      const content = await readFileContent(fullPath);
      
      // Determine language from file extension
      const ext = configFile.path.split('.').pop();
      const language = ext === 'yaml' || ext === 'yml' ? 'yaml' : ext === 'json' ? 'json' : '';
      
      result += `**${configFile.title}** (\`${configFile.path}\`):\n\n`;
      result += codeBlock(content, language);
      result += '\n\n';
    } catch (error) {
      result += `**${configFile.title}:** Error reading file - ${error}\n\n`;
    }
  }

  return result.trim();
}


