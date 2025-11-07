import { readFileContent } from '../utils/file-reader.js';

const MIN_LINES = 150;
const MAX_LINES = 2000;
const TARGET_MIN = 800;
const TARGET_MAX = 1500;

export async function validateContent(agentPath: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const content = await readFileContent(agentPath);
    const lines = content.split('\n').length;

    // Check line count
    if (lines < MIN_LINES) {
      errors.push(`File too short (${lines} lines). Minimum: ${MIN_LINES}`);
    } else if (lines > MAX_LINES) {
      errors.push(`File too long (${lines} lines). Maximum: ${MAX_LINES}`);
    } else if (lines < TARGET_MIN || lines > TARGET_MAX) {
      warnings.push(`Line count (${lines}) outside target range (${TARGET_MIN}-${TARGET_MAX})`);
    }

    // Check for required sections
    const requiredSections = [
      '# ', // Title
      '## Key Documentation',
      '## Project Location',
      '## Core Responsibilities',
      '## Technology Stack',
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        errors.push(`Missing required section: ${section}`);
      }
    }

  } catch (error) {
    errors.push(`Failed to read file: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}


