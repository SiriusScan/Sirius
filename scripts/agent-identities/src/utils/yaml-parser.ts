import yaml from 'js-yaml';
import { readFileContent } from './file-reader.js';

export async function parseYamlFile(filePath: string): Promise<any> {
  const content = await readFileContent(filePath);
  return yaml.load(content);
}

export function parseYamlString(content: string): any {
  return yaml.load(content);
}

export function stringifyYaml(data: any): string {
  return yaml.dump(data, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
}


