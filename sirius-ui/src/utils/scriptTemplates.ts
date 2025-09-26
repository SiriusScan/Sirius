/**
 * Script Templates Utility
 * Provides language-specific script templates for different programming languages
 */

import { ScriptLanguage } from "./types";

/**
 * Get a script template for the specified language
 */
export const getScriptTemplate = (language: ScriptLanguage): string => {
  switch (language) {
    case "bash":
      return BASH_TEMPLATE;
    case "powershell":
      return POWERSHELL_TEMPLATE;
    case "python":
      return PYTHON_TEMPLATE;
    case "javascript":
      return JAVASCRIPT_TEMPLATE;
    case "lua":
      return LUA_TEMPLATE;
    case "perl":
      return PERL_TEMPLATE;
    case "ruby":
      return RUBY_TEMPLATE;
    default:
      return BASH_TEMPLATE;
  }
};

/**
 * Extract metadata from script comments
 */
export const extractScriptMetadata = (
  content: string
): Record<string, string> => {
  const lines = content.split("\n");
  const metadata: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("<!--")
    ) {
      const cleaned = trimmed
        .replace(/^(#|\/\/|<!--)\s*/, "")
        .replace(/-->$/, "")
        .trim();

      const match = cleaned.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key.toLowerCase()] = value.trim();
      }
    } else if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("//")
    ) {
      break;
    }
  }
  return metadata;
};

// Template constants
const BASH_TEMPLATE = `# Name: Example Security Script
# Description: Example script that checks for a common vulnerability
# Platform: linux
# Author: Security Team

#!/bin/bash

# Example vulnerability check script
# This script should output JSON results

# Perform your security checks here
vulnerable=false
confidence=0.0
evidence=""

# Example check: Look for writable /etc/passwd
if [ -w "/etc/passwd" ]; then
    vulnerable=true
    confidence=0.9
    evidence="World-writable /etc/passwd file detected"
fi

# Output results in JSON format
echo "{\\"vulnerable\\": $vulnerable, \\"confidence\\": $confidence, \\"evidence\\": \\"$evidence\\", \\"metadata\\": {}}"
`;

const POWERSHELL_TEMPLATE = `# Name: Example Security Script
# Description: Example PowerShell script for Windows security checks
# Platform: windows
# Author: Security Team

# Example vulnerability check script
# This script should output JSON results

$vulnerable = $false
$confidence = 0.0
$evidence = ""

# Example check: Look for weak registry permissions
try {
    $acl = Get-Acl "HKLM:\\SYSTEM\\CurrentControlSet\\Services"
    if ($acl.Access | Where-Object { $_.IdentityReference -eq "Everyone" -and $_.AccessControlType -eq "Allow" }) {
        $vulnerable = $true
        $confidence = 0.8
        $evidence = "Weak registry permissions detected"
    }
} catch {
    $evidence = "Could not check registry permissions"
}

# Output results in JSON format
$result = @{
    vulnerable = $vulnerable
    confidence = $confidence
    evidence = $evidence
    metadata = @{}
}
$result | ConvertTo-Json -Compress
`;

const PYTHON_TEMPLATE = `# Name: Example Security Script
# Description: Example Python script for security checks
# Platform: cross-platform
# Author: Security Team

import json
import os
import sys

def main():
    """Main function for security check"""
    vulnerable = False
    confidence = 0.0
    evidence = ""
    
    # Example check: Look for common insecure file permissions
    try:
        if os.name == 'posix' and os.path.exists('/etc/passwd'):
            stat_info = os.stat('/etc/passwd')
            if stat_info.st_mode & 0o002:  # World writable
                vulnerable = True
                confidence = 0.9
                evidence = "World-writable /etc/passwd detected"
    except Exception as e:
        evidence = f"Error checking file permissions: {str(e)}"
    
    # Output results in JSON format
    result = {
        "vulnerable": vulnerable,
        "confidence": confidence,
        "evidence": evidence,
        "metadata": {}
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
`;

const JAVASCRIPT_TEMPLATE = `// Name: Example Security Script
// Description: Example Node.js script for security checks
// Platform: cross-platform
// Author: Security Team

const fs = require('fs');
const path = require('path');

function main() {
    let vulnerable = false;
    let confidence = 0.0;
    let evidence = "";
    
    // Example check: Look for package.json with security issues
    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            if (packageData.dependencies && packageData.dependencies['lodash'] && 
                packageData.dependencies['lodash'].startsWith('^3.')) {
                vulnerable = true;
                confidence = 0.7;
                evidence = "Potentially vulnerable lodash version detected";
            }
        }
    } catch (error) {
        evidence = \`Error checking package.json: \${error.message}\`;
    }
    
    // Output results in JSON format
    const result = {
        vulnerable: vulnerable,
        confidence: confidence,
        evidence: evidence,
        metadata: {}
    };
    console.log(JSON.stringify(result));
}

main();
`;

const LUA_TEMPLATE = `-- Name: Example Security Script
-- Description: Example Lua script for security checks
-- Platform: cross-platform
-- Author: Security Team

local json = require("json") -- Assumes json library is available

function main()
    local vulnerable = false
    local confidence = 0.0
    local evidence = ""
    
    -- Example check: Look for common insecure configurations
    local config_file = "/etc/ssh/sshd_config"
    local file = io.open(config_file, "r")
    
    if file then
        for line in file:lines() do
            if line:match("^PermitRootLogin%s+yes") then
                vulnerable = true
                confidence = 0.8
                evidence = "SSH root login is enabled"
                break
            end
        end
        file:close()
    else
        evidence = "Could not read SSH configuration"
    end
    
    -- Output results in JSON format
    local result = {
        vulnerable = vulnerable,
        confidence = confidence,
        evidence = evidence,
        metadata = {}
    }
    print(json.encode(result))
end

main()
`;

const PERL_TEMPLATE = `# Name: Example Security Script
# Description: Example Perl script for security checks
# Platform: cross-platform
# Author: Security Team

use strict;
use warnings;
use JSON;

sub main {
    my $vulnerable = 0;
    my $confidence = 0.0;
    my $evidence = "";
    
    # Example check: Look for world-writable files
    if (-e "/etc/passwd" && -w "/etc/passwd") {
        $vulnerable = 1;
        $confidence = 0.9;
        $evidence = "World-writable /etc/passwd detected";
    }
    
    # Output results in JSON format
    my $result = {
        vulnerable => $vulnerable,
        confidence => $confidence,
        evidence => $evidence,
        metadata => {}
    };
    
    print encode_json($result);
}

main();
`;

const RUBY_TEMPLATE = `# Name: Example Security Script
# Description: Example Ruby script for security checks
# Platform: cross-platform
# Author: Security Team

require 'json'

def main
  vulnerable = false
  confidence = 0.0
  evidence = ""
  
  # Example check: Look for world-writable files
  begin
    if File.exist?("/etc/passwd") && File.world_writable?("/etc/passwd")
      vulnerable = true
      confidence = 0.9
      evidence = "World-writable /etc/passwd detected"
    end
  rescue => e
    evidence = "Error checking file permissions: #{e.message}"
  end
  
  # Output results in JSON format
  result = {
    vulnerable: vulnerable,
    confidence: confidence,
    evidence: evidence,
    metadata: {}
  }
  
  puts JSON.generate(result)
end

main
`;

/**
 * Get file extension for script language
 */
export const getScriptFileExtension = (language: ScriptLanguage): string => {
  switch (language) {
    case "bash":
      return ".sh";
    case "powershell":
      return ".ps1";
    case "python":
      return ".py";
    case "javascript":
      return ".js";
    case "lua":
      return ".lua";
    case "perl":
      return ".pl";
    case "ruby":
      return ".rb";
    default:
      return ".sh";
  }
};
