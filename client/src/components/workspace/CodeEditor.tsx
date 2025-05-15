import React, { useEffect, useState } from "react";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ content, language, onChange }) => {
  // Keep a local state of the editor content
  const [localContent, setLocalContent] = useState(content);

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Handle changes to the textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalContent(newValue);
    onChange(newValue);
  };

  return (
    <textarea
      className="w-full h-full p-4 bg-slate-900 text-white font-mono resize-none"
      value={localContent}
      onChange={handleChange}
      placeholder={`Enter your ${language} code here...`}
      spellCheck={false}
    />
  );
};

export default CodeEditor;
