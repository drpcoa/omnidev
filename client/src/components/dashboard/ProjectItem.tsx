import React from "react";
import { Project } from "@shared/schema";
import { FolderClosed } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface ProjectItemProps {
  project: Project;
  onClick?: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onClick }) => {
  return (
    <div
      className="bg-slate-800 rounded-lg p-3 border-l-4 border-slate-800 hover:border-primary-500 hover:bg-slate-700 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FolderClosed className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{project.name}</span>
        </div>
        <span className="text-xs text-gray-400">{timeAgo(project.lastOpened || project.createdAt)}</span>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {project.description || "No description"}
      </div>
      {Array.isArray(project.technologies) && project.technologies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {project.technologies.map((tech, index) => (
            <span key={index} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-gray-300">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectItem;
