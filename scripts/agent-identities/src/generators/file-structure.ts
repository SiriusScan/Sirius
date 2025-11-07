import { readdir, stat } from 'fs/promises';
import { join, relative, basename } from 'path';
import { FileNode } from '../types/extraction.js';

const FILE_COMMENTS: Record<string, string> = {
  'main.go': 'Main application entry point',
  'server.go': 'Server implementation',
  'agent.go': 'Agent client implementation',
  'types.go': 'Type definitions',
  'config.yaml': 'Configuration file',
  'docker-compose.yaml': 'Docker Compose configuration',
  'package.json': 'Node.js package manifest',
  'go.mod': 'Go module definition',
  'README.md': 'Project documentation',
  'Makefile': 'Build automation',
};

const DIRECTORY_COMMENTS: Record<string, string> = {
  'cmd': 'Main applications',
  'internal': 'Private application code',
  'pkg': 'Public library code',
  'src': 'Source code',
  'proto': 'Protocol buffer definitions',
  'config': 'Configuration files',
  'templates': 'Template files',
  'testing': 'Test files',
  'scripts': 'Utility scripts',
  'docs': 'Documentation',
};

async function buildTree(
  rootPath: string,
  currentDepth: number,
  maxDepth: number,
  ignorePatterns: string[],
  basePath: string = rootPath
): Promise<FileNode[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const entries = await readdir(rootPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      const fullPath = join(rootPath, entry.name);
      
      // Skip ignored patterns
      if (ignorePatterns.some(pattern => entry.name.includes(pattern))) {
        continue;
      }

      // Skip hidden files/directories
      if (entry.name.startsWith('.') && entry.name !== '.cursor') {
        continue;
      }

      const node: FileNode = {
        name: entry.name,
        path: relative(basePath, fullPath),
        type: entry.isDirectory() ? 'directory' : 'file',
      };

      // Add comment if available
      if (entry.isDirectory()) {
        node.comment = DIRECTORY_COMMENTS[entry.name];
      } else {
        node.comment = FILE_COMMENTS[entry.name];
      }

      // Recursively build children for directories
      if (entry.isDirectory()) {
        node.children = await buildTree(
          fullPath,
          currentDepth + 1,
          maxDepth,
          ignorePatterns,
          basePath
        );
      }

      nodes.push(node);
    }

    // Sort: directories first, then files, alphabetically
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return nodes;
  } catch (error) {
    console.error(`Error reading directory ${rootPath}:`, error);
    return [];
  }
}

function formatTreeNode(node: FileNode, indent: string = '', isLast: boolean = true): string {
  const prefix = isLast ? '└── ' : '├── ';
  const name = node.type === 'directory' ? `${node.name}/` : node.name;
  const comment = node.comment ? `  # ${node.comment}` : '';
  
  let result = `${indent}${prefix}${name}${comment}\n`;

  if (node.children && node.children.length > 0) {
    const childIndent = indent + (isLast ? '    ' : '│   ');
    node.children.forEach((child, index) => {
      const isLastChild = index === node.children!.length - 1;
      result += formatTreeNode(child, childIndent, isLastChild);
    });
  }

  return result;
}

function formatAsMarkdown(nodes: FileNode[], rootName: string): string {
  let result = '```\n';
  result += `${rootName}/\n`;
  
  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    result += formatTreeNode(node, '', isLast);
  });
  
  result += '```';
  return result;
}

export async function extractFileStructure(
  rootPath: string,
  maxDepth: number = 3,
  ignorePatterns: string[] = ['node_modules', 'dist', '.git', 'bin', '__pycache__']
): Promise<string> {
  const tree = await buildTree(rootPath, 0, maxDepth, ignorePatterns);
  const rootName = basename(rootPath);
  return formatAsMarkdown(tree, rootName);
}


