import React, { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import ProjectItem from "@/components/dashboard/ProjectItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Projects() {
  const [location, navigate] = useLocation();
  const { data, isLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const projects = data?.projects || [];
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Available technologies
  const technologies = [
    "JavaScript", "TypeScript", "React", "Vue", "Angular", 
    "Node.js", "Express", "MongoDB", "PostgreSQL", 
    "Python", "Django", "Flask", "Ruby", "Rails",
    "Java", "Spring", "PHP", "Laravel", "Go",
    "HTML", "CSS", "Tailwind", "SASS"
  ];
  
  // Handle technology selection
  const handleTechnologyChange = (tech: string) => {
    if (selectedTechnologies.includes(tech)) {
      setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech));
    } else {
      setSelectedTechnologies([...selectedTechnologies, tech]);
    }
  };
  
  // Handle project creation
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const result = await createProjectMutation.mutateAsync({
        name: newProjectName,
        description: newProjectDescription,
        technologies: selectedTechnologies,
        lastOpened: new Date(),
      });
      
      // Close dialog and redirect to the new project
      setNewProjectOpen(false);
      navigate(`/project/${result.project.id}`);
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header onCreateProject={() => setNewProjectOpen(true)} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-gray-400">Manage and organize your development projects</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-slate-800 border-slate-700 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => setNewProjectOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onClick={() => navigate(`/project/${project.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "No projects found matching your search"
                    : "No projects yet. Create your first project to get started."}
                </p>
                {!searchQuery && (
                  <Button
                    className="bg-primary-600 hover:bg-primary-700"
                    onClick={() => setNewProjectOpen(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects
                  .sort((a, b) => {
                    const dateA = new Date(a.lastOpened || a.createdAt).getTime();
                    const dateB = new Date(b.lastOpened || b.createdAt).getTime();
                    return dateB - dateA;
                  })
                  .slice(0, 6)
                  .map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onClick={() => navigate(`/project/${project.id}`)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="archived" className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">No archived projects</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* New Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Start a new development project with AI assistance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input 
                id="project-name" 
                placeholder="My Awesome Project" 
                className="bg-slate-900 border-slate-700" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (optional)</Label>
              <Input 
                id="project-description" 
                placeholder="A brief description of your project" 
                className="bg-slate-900 border-slate-700" 
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-tech">Technologies</Label>
              <Select>
                <SelectTrigger className="bg-slate-900 border-slate-700 w-full">
                  <SelectValue placeholder="Select technologies" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {technologies.map((tech) => (
                    <SelectItem key={tech} value={tech} className="cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`tech-${tech}`}
                          checked={selectedTechnologies.includes(tech)}
                          onChange={() => handleTechnologyChange(tech)}
                          className="mr-2"
                        />
                        {tech}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTechnologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTechnologies.map((tech) => (
                    <div key={tech} className="bg-primary-900 text-primary-100 px-2 py-1 rounded-md text-xs flex items-center">
                      {tech}
                      <button
                        onClick={() => handleTechnologyChange(tech)}
                        className="ml-1 text-primary-200 hover:text-primary-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewProjectOpen(false)}
              className="border-slate-700 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
