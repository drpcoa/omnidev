import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectFile } from "@shared/schema";
import { getFileExtensionIcon } from "@/lib/utils";
import { SiJavascript, SiCss3, SiHtml5, SiPython, SiTypescript, SiJson, SiReact } from "react-icons/si";

interface EditorTabsProps {
  files: ProjectFile[];
  activeFileId?: number;
  onSelectFile: (id: number) => void;
  onCloseFile?: (id: number) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
}) => {
  if (!files || files.length === 0) {
    return (
      <div className="bg-slate-950 p-2 flex items-center border-b border-slate-800 overflow-x-auto">
        <div className="text-sm text-gray-500 italic">No files open</div>
      </div>
    );
  }

  // Function to get the appropriate icon for a file
  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    
    switch (ext) {
      case "js":
        return <SiJavascript className="h-4 w-4 mr-1.5 text-yellow-400" />;
      case "jsx":
        return <SiReact className="h-4 w-4 mr-1.5 text-blue-400" />;
      case "ts":
        return <SiTypescript className="h-4 w-4 mr-1.5 text-blue-400" />;
      case "tsx":
        return <SiReact className="h-4 w-4 mr-1.5 text-blue-400" />;
      case "css":
        return <SiCss3 className="h-4 w-4 mr-1.5 text-blue-400" />;
      case "html":
        return <SiHtml5 className="h-4 w-4 mr-1.5 text-orange-400" />;
      case "py":
        return <SiPython className="h-4 w-4 mr-1.5 text-green-400" />;
      case "json":
        return <SiJson className="h-4 w-4 mr-1.5 text-yellow-400" />;
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-slate-950 p-2 flex items-center border-b border-slate-800 overflow-x-auto">
      <div className="flex space-x-1">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const fileName = file.path.split("/").pop() || "Untitled";
          
          return (
            <button
              key={file.id}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-gray-400 hover:bg-slate-800 hover:text-white"
              } flex items-center group`}
              onClick={() => onSelectFile(file.id)}
            >
              {getFileIcon(file.path)}
              <span>{fileName}</span>
              
              {onCloseFile && (
                <span 
                  className="ml-2 opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EditorTabs;
