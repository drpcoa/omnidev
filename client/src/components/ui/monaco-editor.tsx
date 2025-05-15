import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language = "javascript",
  onChange,
  readOnly = false,
  height = "600px",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      readOnly,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', monospace",
      lineNumbers: "on",
      renderLineHighlight: "all",
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });

    editorInstanceRef.current = editor;

    // Handle content changes
    if (onChange) {
      const disposable = editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      return () => {
        disposable.dispose();
        editor.dispose();
      };
    }

    return () => {
      editor.dispose();
    };
  }, [readOnly]);

  // Update value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (value !== currentValue) {
        editorInstanceRef.current.setValue(value);
      }
    }
  }, [value]);

  // Update language when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  return (
    <div
      ref={editorRef}
      className={`monaco-editor-container border border-slate-700 rounded ${className}`}
      style={{ height }}
    />
  );
};

export default MonacoEditor;
