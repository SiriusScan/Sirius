import { readFileContent } from '../utils/file-reader.js';
import { join } from 'path';

export async function extractGoDependencies(
  productPath: string,
  grouping: Record<string, string[]> = {}
): Promise<string> {
  try {
    const goModPath = join(productPath, 'go.mod');
    const content = await readFileContent(goModPath);
    
    // Parse go.mod file
    const requireRegex = /require\s+\(([^)]+)\)/s;
    const match = content.match(requireRegex);
    
    if (!match) {
      return 'No dependencies found in go.mod';
    }

    const requireBlock = match[1];
    const dependencies: Array<{ name: string; version: string }> = [];
    
    // Parse each dependency line
    const lines = requireBlock.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;
      
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        dependencies.push({
          name: parts[0],
          version: parts[1],
        });
      }
    }

    // Group dependencies if grouping is provided
    if (Object.keys(grouping).length > 0) {
      let result = '';
      
      for (const [category, patterns] of Object.entries(grouping)) {
        result += `**${category}:**\n\n`;
        
        const categoryDeps = dependencies.filter(dep =>
          patterns.some(pattern => dep.name.includes(pattern))
        );
        
        for (const dep of categoryDeps) {
          result += `- \`${dep.name}\`\n`;
        }
        
        result += '\n';
      }
      
      return result.trim();
    }

    // No grouping - return all dependencies
    let result = '**Dependencies:**\n\n';
    for (const dep of dependencies) {
      result += `- \`${dep.name}\` (${dep.version})\n`;
    }
    
    return result.trim();
  } catch (error) {
    return `Error extracting Go dependencies: ${error}`;
  }
}

export async function extractNodeDependencies(
  productPath: string,
  grouping: Record<string, string[]> = {}
): Promise<string> {
  try {
    const packageJsonPath = join(productPath, 'package.json');
    const content = await readFileContent(packageJsonPath);
    const packageJson = JSON.parse(content);
    
    const deps = packageJson.dependencies || {};
    
    if (Object.keys(deps).length === 0) {
      return 'No dependencies found in package.json';
    }

    // Group dependencies if grouping is provided
    if (Object.keys(grouping).length > 0) {
      let result = '';
      
      for (const [category, patterns] of Object.entries(grouping)) {
        result += `**${category}:**\n\n`;
        
        const categoryDeps = Object.entries(deps).filter(([name]) =>
          patterns.some(pattern => name.includes(pattern))
        );
        
        for (const [name, version] of categoryDeps) {
          result += `- \`${name}\` (${version})\n`;
        }
        
        result += '\n';
      }
      
      return result.trim();
    }

    // No grouping - return all dependencies
    let result = '**Dependencies:**\n\n';
    for (const [name, version] of Object.entries(deps)) {
      result += `- \`${name}\` (${version})\n`;
    }
    
    return result.trim();
  } catch (error) {
    return `Error extracting Node dependencies: ${error}`;
  }
}


