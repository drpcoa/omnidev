import React, { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/use-projects";
import { useModels } from "@/hooks/use-models";
import ProjectItem from "@/components/dashboard/ProjectItem";
import ModelItem from "@/components/dashboard/ModelItem";
import { Loader2, Plus, LayoutDashboard, Code, Settings, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: modelsData, isLoading: modelsLoading } = useModels();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const projects = projectsData?.projects || [];
  const models = modelsData?.models || [];

  // Get recent projects (last 3)
  const recentProjects = [...projects].sort((a, b) => {
    const dateA = new Date(a.lastOpened || a.createdAt).getTime();
    const dateB = new Date(b.lastOpened || b.createdAt).getTime();
    return dateB - dateA;
  }).slice(0, 3);

  // Filter active models
  const activeModels = models.filter(model => model.active).slice(0, 5);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      // Would use the createProject mutation here
      // For now, just close the dialog and redirect to projects page
      setNewProjectOpen(false);
      navigate("/projects");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header onCreateProject={() => setNewProjectOpen(true)} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.username}</h1>
          <p className="text-gray-400">Let's start building with AI</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dashboard Cards */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Recent Projects</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary-500 border-slate-700 hover:bg-slate-700"
                    onClick={() => navigate("/projects")}
                  >
                    View All
                  </Button>
                </div>
                <CardDescription className="text-gray-400">Your recently worked on projects</CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <ProjectItem 
                        key={project.id} 
                        project={project} 
                        onClick={() => navigate(`/project/${project.id}`)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No projects yet</p>
                    <Button 
                      onClick={() => setNewProjectOpen(true)}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center">
                    <LayoutDashboard className="h-5 w-5 mr-2 text-primary-500" />
                    Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">Manage your projects and view stats</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Code className="h-5 w-5 mr-2 text-secondary-500" />
                    Code Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">Create, edit, and collaborate on code</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-accent-500" />
                    AI Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">Configure and use AI models</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Activity</CardTitle>
                <CardDescription className="text-gray-400">Recent development activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Activity className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-white">Project created</p>
                      <p className="text-xs text-gray-400">You created a new project "E-commerce API"</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Activity className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-white">Code generated</p>
                      <p className="text-xs text-gray-400">StarCoder generated code for "routes.js"</p>
                      <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Activity className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-white">Project synced</p>
                      <p className="text-xs text-gray-400">Synced "React Dashboard" with GitHub</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar Cards */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Subscription Status</CardTitle>
                <CardDescription className="text-gray-400">
                  {user?.subscriptionStatus === "active" ? "Your active subscription plan" : "Upgrade to access more features"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.subscriptionStatus === "active" ? (
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">Professional</span>
                      <span className="text-sm bg-green-500 text-white px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">Access to all features and models</p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate("/subscription")}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-4">You're currently on the Free plan</p>
                    <Button
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      onClick={() => navigate("/subscription")}
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">AI Models</CardTitle>
                <CardDescription className="text-gray-400">Your available AI models</CardDescription>
              </CardHeader>
              <CardContent>
                {modelsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeModels.map((model) => (
                      <ModelItem key={model.id} model={model} />
                    ))}
                  </div>
                )}
                <Button
                  className="w-full mt-4 border border-gray-600 text-gray-300 bg-slate-800 hover:bg-slate-700"
                  variant="outline"
                  onClick={() => navigate("/models")}
                >
                  Manage Models
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Quick Links</CardTitle>
                <CardDescription className="text-gray-400">Helpful resources</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a href="/documentation" className="text-primary-500 hover:text-primary-400 text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="/marketplace" className="text-primary-500 hover:text-primary-400 text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Marketplace
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/OmniDev/support" className="text-primary-500 hover:text-primary-400 text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Support
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
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
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
