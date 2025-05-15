import React, { useState } from "react";
import EditorTabs from "@/components/workspace/EditorTabs";
import CodeEditor from "@/components/workspace/CodeEditor";
import AiAssistant from "@/components/layout/AiAssistant";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectFile } from "@shared/schema";
import { useModels } from "@/hooks/use-models";

interface WorkspaceProps {
  projectName: string;
  files: ProjectFile[];
  activeFileId?: number;
  onSelectFile: (id: number) => void;
  onUpdateFile: (id: number, content: string) => void;
  loading?: boolean;
}

const Workspace: React.FC<WorkspaceProps> = ({
  projectName,
  files,
  activeFileId,
  onSelectFile,
  onUpdateFile,
  loading = false,
}) => {
  const [aiModel, setAiModel] = useState("StarCoder");
  const [saving, setSaving] = useState(false);
  const { data: modelsData } = useModels();
  
  const activeFile = files.find((f) => f.id === activeFileId);
  
  const handleSave = async () => {
    if (!activeFile) return;
    
    setSaving(true);
    try {
      await onUpdateFile(activeFile.id, activeFile.content || "");
      // Success handled by the update hook
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleAiModelChange = (value: string) => {
    setAiModel(value);
  };
  
  // Extract available models from the API response
  const availableModels = modelsData?.models || [];
  const codeGenerationModels = availableModels.filter(
    (model) => model.category === "code-generation" && model.active
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Workspace Tabs */}
      <EditorTabs files={files} activeFileId={activeFileId} onSelectFile={onSelectFile} />
      
      {/* Split Panel View (Code Editor and AI Assistant) */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Code Editor */}
        <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-slate-900 p-2 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="p-1.5 rounded hover:bg-slate-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>

              <Button variant="ghost" size="icon" className="p-1.5 rounded hover:bg-slate-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>

              <div className="h-4 border-r border-slate-700 mx-1"></div>

              <Button variant="ghost" size="icon" className="p-1.5 rounded hover:bg-slate-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="p-1.5 rounded hover:bg-slate-800"
                onClick={handleSave}
                disabled={saving || !activeFile}
              >
                <Save className="h-4 w-4 text-gray-400" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={aiModel} onValueChange={handleAiModelChange}>
                <SelectTrigger className="bg-slate-800 text-sm text-gray-300 py-1 border border-slate-700 w-32">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {codeGenerationModels.map((model) => (
                    <SelectItem key={model.id} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="bg-primary-600 text-white py-1 px-3 rounded text-sm font-medium hover:bg-primary-700 flex items-center"
                disabled={!activeFile}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Suggest Code
              </Button>
            </div>
          </div>

          {/* Code Editor Content */}
          {activeFile ? (
            <CodeEditor
              content={activeFile.content || ""}
              language={activeFile.language || "javascript"}
              onChange={(content) => {
                onUpdateFile(activeFile.id, content);
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
              {files.length === 0 ? (
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No files yet</h3>
                  <p className="mb-4">Create a new file to get started</p>
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    Create File
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-medium">Select a file to edit</h3>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        <AiAssistant 
          modelName={aiModel}
          projectName={projectName}
          activeFile={activeFile}
        />
      </div>
    </div>
  );
};

export default Workspace;
