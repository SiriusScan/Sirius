export interface AgentIdentityMetadata {
  name: string;
  title: string;
  description: string;
  role_type: 'engineering' | 'design' | 'product' | 'operations' | 'qa' | 'documentation';
  version: string;
  last_updated: string;
  author: string;
  specialization: string[];
  technology_stack: string[];
  system_integration_level: 'high' | 'medium' | 'low' | 'none';
  categories: string[];
  tags: string[];
  related_docs: string[];
  dependencies: string[];
  llm_context: 'high' | 'medium' | 'low';
  context_window_target: number;
}

export interface AgentIdentityConfig {
  product: string;
  product_path: string;
  docker_service_name?: string;
  metadata: AgentIdentityMetadata;
  generation: {
    include_file_structure: boolean;
    file_structure_depth?: number;
    file_structure_ignore?: string[];
    include_ports: boolean;
    ports_config?: Record<string, string>;
    include_dependencies: boolean;
    dependencies_source?: string;
    dependencies_grouping?: Record<string, string[]>;
    include_config_examples: boolean;
    config_files?: Array<{ path: string; title: string }>;
    extract_code_patterns_from_docs: string[];
  };
  template_path: string;
  output_path: string;
}

export interface GeneratedSection {
  name: string;
  content: string;
  source_files: string[];
  last_generated: Date;
}


