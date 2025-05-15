import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, FolderClosed, MoreVertical } from "lucide-react";
import { Project } from "@shared/schema";
import { timeAgo } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";

interface SidebarProps {
  activeProjectId?: number;
  onSelectProject: (id: number) => void;
  onCreateProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeProjectId,
  onSelectProject,
  onCreateProject,
}) => {
  const [location, navigate] = useLocation();
  const { data, isLoading } = useProjects();
  const projects = data?.projects || [];

  // Render skeleton loaders during loading state
  const renderProjectSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="bg-slate-800 rounded-lg p-3 mb-3 border-l-4 border-slate-800 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-gray-600 rounded-full mr-2"></div>
              <div className="h-4 w-32 bg-gray-600 rounded"></div>
            </div>
            <div className="h-3 w-12 bg-gray-600 rounded"></div>
          </div>
          <div className="mt-2 h-3 w-40 bg-gray-600 rounded"></div>
        </div>
      ));
  };

  const projectItems = !isLoading ? (
    projects.map((project: Project) => (
      <div
        key={project.id}
        className={`bg-slate-800 rounded-lg p-3 mb-3 border-l-4 cursor-pointer ${
          activeProjectId === project.id
            ? "border-primary-500"
            : "border-slate-800 hover:border-primary-500 hover:bg-slate-700"
        }`}
        onClick={() => onSelectProject(project.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderClosed className={`h-5 w-5 ${activeProjectId === project.id ? "text-primary-500" : "text-gray-400"} mr-2`} />
            <span className="font-medium">{project.name}</span>
          </div>
          <span className="text-xs text-gray-400">{timeAgo(project.lastOpened || project.createdAt)}</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {Array.isArray(project.technologies) && project.technologies.length > 0
            ? project.technologies.join(", ")
            : "No technologies specified"}
        </div>
      </div>
    ))
  ) : (
    renderProjectSkeletons()
  );

  // Models section
  const modelItems = [
    { name: "StarCoder", active: true },
    { name: "CodeLlama", active: true },
    { name: "CodeT5", active: false },
    { name: "Stable Diffusion", active: true },
    { name: "SAM", active: false },
  ];

  return (
    <div className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Projects</h2>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {projectItems}

        <Button
          className="w-full mt-4 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-900"
          onClick={onCreateProject}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </Button>
      </div>

      <div className="p-4 border-t border-slate-800">
        <h3 className="text-md font-medium mb-3">AI Models</h3>

        <div className="space-y-2">
          {modelItems.map((model, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full ${
                    model.active ? "bg-green-500" : "bg-gray-500"
                  } mr-2`}
                ></div>
                <span className="text-sm">{model.name}</span>
              </div>
              <span className={`text-xs ${model.active ? "text-green-500" : "text-gray-400"}`}>
                {model.active ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-4 flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900"
          onClick={() => navigate("/models")}
        >
          Manage Models
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
