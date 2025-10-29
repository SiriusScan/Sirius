import { readFile, writeFile } from 'fs/promises';
import matter from 'gray-matter';
import { AgentIdentityConfig, GeneratedSection } from '../types/agent-identity.js';
import { parseYamlFile } from '../utils/yaml-parser.js';
import { logger } from '../utils/logger.js';
import { extractFileStructure } from './file-structure.js';
import { extractPorts } from './ports.js';
import { extractGoDependencies, extractNodeDependencies } from './dependencies.js';
import { extractConfigExamples } from './config-examples.js';
import { extractCodePatterns, extractDocumentationLinks } from './documentation.js';
import { mergeTemplate } from './merge.js';
import { join } from 'path';

async function loadConfig(configPath: string): Promise<AgentIdentityConfig> {
  return await parseYamlFile(configPath);
}

export async function generateAgentIdentity(configPath: string): Promise<void> {
  logger.info(`Loading configuration from ${configPath}`);
  
  // 1. Load configuration
  const config = await loadConfig(configPath);

  // 2. Load template
  logger.info(`Loading template from ${config.template_path}`);
  const templateContent = await readFile(config.template_path, 'utf8');
  const { data: frontMatter, content: templateBody } = matter(templateContent);

  // 3. Extract data from sources
  const generatedSections: GeneratedSection[] = [];

  // 3.1 File structure
  if (config.generation.include_file_structure) {
    logger.info('Extracting file structure...');
    const fileStructure = await extractFileStructure(
      config.product_path,
      config.generation.file_structure_depth || 3,
      config.generation.file_structure_ignore || []
    );
    generatedSections.push({
      name: 'file-structure',
      content: fileStructure,
      source_files: [config.product_path],
      last_generated: new Date(),
    });
  }

  // 3.2 Ports
  if (config.generation.include_ports && config.docker_service_name) {
    logger.info('Extracting ports...');
    const ports = await extractPorts(
      'docker-compose.yaml',
      config.docker_service_name,
      config.generation.ports_config || {}
    );
    generatedSections.push({
      name: 'ports',
      content: ports,
      source_files: ['docker-compose.yaml'],
      last_generated: new Date(),
    });
  }

  // 3.3 Dependencies
  if (config.generation.include_dependencies) {
    logger.info('Extracting dependencies...');
    const dependencySource = config.generation.dependencies_source || 'go.mod';
    let dependencies: string;

    if (dependencySource === 'go.mod') {
      dependencies = await extractGoDependencies(
        config.product_path,
        config.generation.dependencies_grouping || {}
      );
    } else if (dependencySource === 'package.json') {
      dependencies = await extractNodeDependencies(
        config.product_path,
        config.generation.dependencies_grouping || {}
      );
    } else {
      dependencies = `Unknown dependency source: ${dependencySource}`;
    }

    generatedSections.push({
      name: 'dependencies',
      content: dependencies,
      source_files: [join(config.product_path, dependencySource)],
      last_generated: new Date(),
    });
  }

  // 3.4 Config examples
  if (config.generation.include_config_examples && config.generation.config_files) {
    logger.info('Extracting config examples...');
    const configExamples = await extractConfigExamples(
      config.product_path,
      config.generation.config_files
    );
    generatedSections.push({
      name: 'config-examples',
      content: configExamples,
      source_files: config.generation.config_files.map(cf => join(config.product_path, cf.path)),
      last_generated: new Date(),
    });
  }

  // 3.5 Code patterns from documentation
  if (config.generation.extract_code_patterns_from_docs.length > 0) {
    logger.info('Extracting code patterns from documentation...');
    const codePatterns = await extractCodePatterns(
      config.generation.extract_code_patterns_from_docs
    );
    generatedSections.push({
      name: 'code-patterns',
      content: codePatterns,
      source_files: config.generation.extract_code_patterns_from_docs,
      last_generated: new Date(),
    });
  }

  // 3.6 Documentation links
  if (config.metadata.related_docs.length > 0) {
    logger.info('Generating documentation links...');
    const docLinks = await extractDocumentationLinks(config.metadata.related_docs);
    generatedSections.push({
      name: 'documentation-links',
      content: docLinks,
      source_files: [],
      last_generated: new Date(),
    });
  }

  // 4. Merge template with generated sections
  logger.info('Merging template with generated sections...');
  const finalContent = mergeTemplate(templateBody, generatedSections);

  // 5. Update front matter with generation metadata
  const updatedFrontMatter = {
    ...config.metadata,
    last_updated: new Date().toISOString().split('T')[0],
    _generated_at: new Date().toISOString(),
    _source_files: generatedSections.flatMap(s => s.source_files),
  };

  // 6. Write output
  const output = matter.stringify(finalContent, updatedFrontMatter);
  await writeFile(config.output_path, output, 'utf8');

  logger.success(`Generated ${config.output_path}`);
}


