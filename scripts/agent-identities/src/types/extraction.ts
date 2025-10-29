export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  comment?: string;
}

export interface PortMapping {
  service: string;
  ports: Array<{ host: number; container: number; description: string }>;
}

export interface DependencyInfo {
  name: string;
  version?: string;
  category?: string;
  description?: string;
}


