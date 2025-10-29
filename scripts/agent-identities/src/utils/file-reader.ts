import { readFile } from 'fs/promises';
import { resolve } from 'path';

export async function readFileContent(filePath: string): Promise<string> {
  try {
    const absolutePath = resolve(filePath);
    return await readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
}

export async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await readFileContent(filePath);
  } catch {
    return null;
  }
}


