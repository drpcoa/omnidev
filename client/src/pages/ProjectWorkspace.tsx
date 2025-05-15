import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/layout/Workspace";
import { useProject, useUpdateFile, useCreateFile } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface ProjectWorkspaceProps {
  id: string;
}

export default function ProjectWorkspace({ id }: ProjectWorkspaceProps) {
  const [location, navigate] = useLocation();
  const { data, isLoading, error } = useProject(id);
  const updateFileMutation = useUpdateFile();
  const createFileMutation = useCreateFile();
  
  const [activeFileId, setActiveFileId] = useState<number | undefined>(undefined);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  
  const project = data?.project;
  const files = data?.files || [];
  
  // Set the first file as active when data loads
  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);
  
  // Handle file selection
  const handleSelectFile = (fileId: number) => {
    setActiveFileId(fileId);
  };
  
  // Handle file content update
  const handleUpdateFile = async (fileId: number, content: string) => {
    try {
      await updateFileMutation.mutateAsync({
        fileId,
        projectId: parseInt(id),
        data: { content, lastModified: new Date() }
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };
  
  // Handle new file creation
  const handleCreateFile = async () => {
    if (!newFilePath.trim()) {
      toast({
        title: "File path required",
        description: "Please enter a valid file path",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await createFileMutation.mutateAsync({
        projectId: parseInt(id),
        fileData: {
          path: newFilePath,
          content: newFileContent,
          language: getLanguageFromPath(newFilePath),
          lastModified: new Date()
        }
      });
      
      // Close dialog and set the new file as active
      setNewFileOpen(false);
      setActiveFileId(result.file.id);
      
      // Reset form
      setNewFilePath("");
      setNewFileContent("");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };
  
  // Helper to determine file language from path
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      py: 'python',
      rb: 'ruby',
      go: 'go',
      java: 'java',
      php: 'php',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp'
    };
    
    return languageMap[ext] || 'plaintext';
  };
  
  // Handle errors
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Project</h2>
            <p className="text-gray-400 mb-4">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => navigate("/projects")}
            >
              Return to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
        </div>
      ) : project ? (
        <main className="flex-1 flex flex-col lg:flex-row">
          <Sidebar
            activeProjectId={parseInt(id)}
            onSelectProject={(id) => navigate(`/project/${id}`)}
            onCreateProject={() => navigate("/projects")}
          />
          
          <Workspace
            projectName={project.name}
            files={files}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onUpdateFile={handleUpdateFile}
          />
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
            <p className="text-gray-400 mb-4">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => navigate("/projects")}
            >
              Return to Projects
            </Button>
          </div>
        </div>
      )}
      
      {/* New File Dialog */}
      <Dialog open={newFileOpen} onOpenChange={setNewFileOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="file-path">File Path</Label>
              <Input 
                id="file-path" 
                placeholder="src/components/MyComponent.jsx" 
                className="bg-slate-900 border-slate-700" 
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
              />
              <p className="text-xs text-gray-500">Specify the full path including directories</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file-content">Initial Content (optional)</Label>
              <textarea
                id="file-content"
                className="w-full h-32 rounded-md bg-slate-900 border border-slate-700 p-2 text-sm font-mono"
                placeholder="// Write your code here"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewFileOpen(false)}
              className="border-slate-700 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={handleCreateFile}
              disabled={!newFilePath.trim()}
            >
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
