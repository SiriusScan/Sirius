// ─── Syntax Highlighting in Output (Phase 4.3) ─────────────────────────────
// Detects structured output patterns and applies ANSI color codes.

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  // Colors
  red: "\x1b[38;2;243;139;168m",
  green: "\x1b[38;2;166;227;161m",
  yellow: "\x1b[38;2;249;226;175m",
  blue: "\x1b[38;2;137;180;250m",
  magenta: "\x1b[38;2;203;166;247m",
  cyan: "\x1b[38;2;137;220;235m",
  gray: "\x1b[38;2;108;112;134m",
  white: "\x1b[38;2;205;214;244m",
  orange: "\x1b[38;2;250;179;135m",
};

function isJsonLike(text: string): boolean {
  const trimmed = text.trim();
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  );
}

function highlightJson(text: string): string {
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    return formatted
      .replace(/"([^"]+)":/g, `${ANSI.blue}"$1"${ANSI.reset}:`)
      .replace(/: "([^"]*)"([,\n]?)/g, `: ${ANSI.green}"$1"${ANSI.reset}$2`)
      .replace(/: (\d+\.?\d*)/g, `: ${ANSI.orange}$1${ANSI.reset}`)
      .replace(/: (true|false)/g, `: ${ANSI.yellow}$1${ANSI.reset}`)
      .replace(/: (null)/g, `: ${ANSI.red}$1${ANSI.reset}`);
  } catch {
    return text;
  }
}

function isYamlLike(text: string): boolean {
  const lines = text.split("\n");
  if (lines.length < 2) return false;
  const yamlPattern = /^\s*[\w-]+:\s/;
  const matchCount = lines.filter((l) => yamlPattern.test(l)).length;
  return matchCount >= 2;
}

function highlightYaml(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      // Key: value pattern
      const match = line.match(/^(\s*)([\w-]+)(:)\s*(.*)/);
      if (match) {
        const [, indent, key, colon, value] = match;
        let coloredValue = value ?? "";
        if (coloredValue === "true" || coloredValue === "false") {
          coloredValue = `${ANSI.yellow}${coloredValue}${ANSI.reset}`;
        } else if (/^\d+$/.test(coloredValue)) {
          coloredValue = `${ANSI.orange}${coloredValue}${ANSI.reset}`;
        } else if (coloredValue.startsWith('"') || coloredValue.startsWith("'")) {
          coloredValue = `${ANSI.green}${coloredValue}${ANSI.reset}`;
        }
        return `${indent}${ANSI.blue}${key}${ANSI.reset}${colon} ${coloredValue}`;
      }
      // Comment
      if (line.trim().startsWith("#")) {
        return `${ANSI.gray}${line}${ANSI.reset}`;
      }
      // List item
      if (line.match(/^\s*-\s/)) {
        return `${ANSI.cyan}${line}${ANSI.reset}`;
      }
      return line;
    })
    .join("\n");
}

/**
 * Apply syntax highlighting to command output.
 * Returns the original text with ANSI codes for structured formats.
 */
export function highlightOutput(text: string, enabled: boolean): string {
  if (!enabled || !text.trim()) return text;

  // Try JSON first
  if (isJsonLike(text)) {
    return highlightJson(text);
  }

  // Try YAML
  if (isYamlLike(text)) {
    return highlightYaml(text);
  }

  // Return as-is for unrecognized formats
  return text;
}

/**
 * Add a timestamp prefix to each line.
 */
export function addTimestamp(line: string): string {
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  return `${ANSI.gray}[${ts}]${ANSI.reset} ${line}`;
}
