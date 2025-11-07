import { readFileContent } from '../utils/file-reader.js';
import matter from 'gray-matter';

const REQUIRED_FIELDS = [
  'name',
  'title',
  'description',
  'role_type',
  'version',
  'last_updated',
  'llm_context',
  'context_window_target',
];

const ENUM_FIELDS: Record<string, string[]> = {
  role_type: ['engineering', 'design', 'product', 'operations', 'qa', 'documentation'],
  system_integration_level: ['high', 'medium', 'low', 'none'],
  llm_context: ['high', 'medium', 'low'],
};

export async function validateYaml(agentPath: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const content = await readFileContent(agentPath);
    const { data: frontMatter } = matter(content);

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!(field in frontMatter)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check enum fields
    for (const [field, validValues] of Object.entries(ENUM_FIELDS)) {
      if (field in frontMatter && !validValues.includes(frontMatter[field])) {
        errors.push(`Invalid value for ${field}: ${frontMatter[field]}. Must be one of: ${validValues.join(', ')}`);
      }
    }

    // Check version format (semver)
    if (frontMatter.version && !/^\d+\.\d+\.\d+$/.test(frontMatter.version)) {
      errors.push(`Invalid version format: ${frontMatter.version}. Must be semver (e.g., 1.0.0)`);
    }

    // Check date format (YYYY-MM-DD)
    if (frontMatter.last_updated && !/^\d{4}-\d{2}-\d{2}$/.test(frontMatter.last_updated)) {
      errors.push(`Invalid date format: ${frontMatter.last_updated}. Must be YYYY-MM-DD`);
    }

  } catch (error) {
    errors.push(`Failed to parse YAML: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


