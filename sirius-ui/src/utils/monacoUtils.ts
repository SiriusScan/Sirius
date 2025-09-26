/**
 * Monaco Editor Utilities
 * Shared functions for Monaco editor language mappings and configurations
 */

import { MonacoLanguage, ScriptLanguage } from "./types";

/**
 * Map script language to Monaco editor language
 */
export const getMonacoLanguage = (
  scriptLanguage: ScriptLanguage
): MonacoLanguage => {
  switch (scriptLanguage.toLowerCase() as ScriptLanguage) {
    case "bash":
      return "shell";
    case "powershell":
      return "powershell";
    case "python":
      return "python";
    case "javascript":
      return "javascript";
    case "lua":
      return "lua";
    case "perl":
      return "perl";
    case "ruby":
      return "ruby";
    default:
      return "shell";
  }
};

/**
 * Monaco editor default configuration
 */
export const getDefaultMonacoConfig = () => ({
  theme: "catppuccin-mocha",
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on" as const,
  lineNumbers: "on" as const,
  folding: true,
  bracketMatching: "always" as const,
});

/**
 * Monaco editor configuration for readonly mode
 */
export const getReadonlyMonacoConfig = () => ({
  ...getDefaultMonacoConfig(),
  readOnly: true,
  contextmenu: false,
  lineNumbers: "off" as const,
});

/**
 * Monaco editor height configurations
 */
export const MONACO_HEIGHTS = {
  preview: "300px",
  editor: "500px",
  viewer: "400px",
  compact: "200px",
} as const;
