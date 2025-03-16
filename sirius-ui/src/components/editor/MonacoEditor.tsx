import React, { useEffect, useState } from "react";
import Editor, { OnMount, useMonaco } from "@monaco-editor/react";

interface MonacoEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string | undefined) => void;
  height?: string;
  theme?: "vs-dark" | "light" | "catppuccin-mocha";
  onMount?: OnMount;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language = "lua",
  readOnly = false,
  onChange,
  height = "100%",
  theme = "catppuccin-mocha",
  onMount,
}) => {
  const monaco = useMonaco();
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [editorMounted, setEditorMounted] = useState(false);

  // Define the theme when Monaco is loaded
  useEffect(() => {
    if (monaco) {
      // Define the Catppuccin Mocha theme
      monaco.editor.defineTheme("catppuccin-mocha", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "9399b2" }, // Overlay2
          { token: "keyword", foreground: "cba6f7" }, // Mauve
          { token: "string", foreground: "a6e3a1" }, // Green
          { token: "number", foreground: "fab387" }, // Peach
          { token: "regexp", foreground: "f38ba8" }, // Red
          { token: "operator", foreground: "89dceb" }, // Sky
          { token: "namespace", foreground: "89b4fa" }, // Blue
          { token: "type.identifier", foreground: "f5c2e7" }, // Pink
          { token: "variable", foreground: "cdd6f4" }, // Text
          { token: "variable.predefined", foreground: "f5c2e7" }, // Pink
          { token: "variable.parameter", foreground: "f5e0dc" }, // Rosewater
          { token: "function", foreground: "89b4fa" }, // Blue
          { token: "method", foreground: "b4befe" }, // Lavender
          { token: "class", foreground: "f9e2af" }, // Yellow
          { token: "interface", foreground: "94e2d5" }, // Teal
          { token: "enum", foreground: "fab387" }, // Peach
          { token: "instance", foreground: "eba0ac" }, // Maroon
          { token: "tag", foreground: "cba6f7" }, // Mauve
          { token: "attribute", foreground: "f9e2af" }, // Yellow
          { token: "property", foreground: "74c7ec" }, // Sapphire
          { token: "constant", foreground: "fab387" }, // Peach
        ],
        colors: {
          // Base colors
          "editor.background": "#1e1e2e", // Base
          "editor.foreground": "#cdd6f4", // Text
          "editorLineNumber.foreground": "#6c7086", // Overlay0
          "editorLineNumber.activeForeground": "#bac2de", // Subtext1

          // Cursor and selection
          "editorCursor.foreground": "#f5e0dc", // Rosewater
          "editor.selectionBackground": "#585b7066", // Surface2 with opacity
          "editor.inactiveSelectionBackground": "#45475a4d", // Surface1 with opacity
          "editor.selectionHighlightBackground": "#575268", // Overlay0 with opacity

          // Line highlight
          "editor.lineHighlightBackground": "#313244", // Surface0
          
          // Error and warnings
          "editorError.foreground": "#f38ba8", // Red
          "editorWarning.foreground": "#f9e2af", // Yellow
          "editorInfo.foreground": "#89b4fa", // Blue
          "editorHint.foreground": "#a6e3a1", // Green
          
          // Bracket matching
          "editorBracketMatch.background": "#6c70863d", // Overlay0 with opacity
          "editorBracketMatch.border": "#89b4fa", // Blue
        },
      });
      
      setIsThemeReady(true);
    }
  }, [monaco]);
  
  // Apply theme or reapply when needed
  useEffect(() => {
    if (monaco && editorMounted && isThemeReady) {
      // Force theme update by setting it again
      monaco.editor.setTheme(theme);
    }
  }, [monaco, editorMounted, isThemeReady, theme]);

  // Handle editor value changes
  const handleEditorChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value);
    }
  };
  
  // Custom onMount handler to track editor mounting
  const handleEditorMount: OnMount = (editor, monaco) => {
    setEditorMounted(true);
    
    // Apply theme immediately after mount
    monaco.editor.setTheme(theme);
    
    // Call the original onMount if provided
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  return (
    <div className="monaco-container h-full w-full overflow-hidden rounded-md border border-gray-700 bg-[#1e1e2e]">
      {/* If theme is not ready or editor not mounted, show a pre-styled placeholder */}
      {!isThemeReady && (
        <div className="flex h-full w-full items-center justify-center bg-[#1e1e2e] text-gray-400">
          Loading editor...
        </div>
      )}
      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly,
          fontSize: 14,
          lineNumbers: "on",
          renderLineHighlight: "all",
          automaticLayout: true,
          folding: true,
          foldingStrategy: "indentation",
          wordWrap: "on",
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: {
            enabled: true,
          },
          padding: {
            top: 12,
            bottom: 12,
          },
        }}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        className={isThemeReady ? "visible" : "invisible"}
      />
    </div>
  );
};

export default MonacoEditor;
