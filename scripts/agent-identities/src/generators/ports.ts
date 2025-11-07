import { parseYamlFile } from '../utils/yaml-parser.js';

interface DockerComposeService {
  ports?: string[];
  [key: string]: any;
}

interface DockerCompose {
  services: Record<string, DockerComposeService>;
}

export async function extractPorts(
  dockerComposePath: string,
  serviceName: string,
  portsConfig: Record<string, string> = {}
): Promise<string> {
  try {
    const compose = await parseYamlFile(dockerComposePath) as DockerCompose;
    
    if (!compose.services || !compose.services[serviceName]) {
      return `Service "${serviceName}" not found in docker-compose.yaml`;
    }

    const service = compose.services[serviceName];
    
    if (!service.ports || service.ports.length === 0) {
      return 'No ports configured for this service';
    }

    // Format ports section
    let result = '**Server Ports:**\n\n';
    
    for (const portMapping of service.ports) {
      // Parse port mapping (e.g., "50051:50051" or "8080:80")
      const match = portMapping.match(/(\d+):(\d+)/);
      if (match) {
        const [, hostPort, containerPort] = match;
        const description = portsConfig[hostPort] || portsConfig[containerPort] || '';
        result += `- \`${hostPort}\` - ${description || `Maps to container port ${containerPort}`}\n`;
      }
    }

    return result.trim();
  } catch (error) {
    return `Error extracting ports: ${error}`;
  }
}


