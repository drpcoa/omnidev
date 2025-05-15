import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Project, ProjectFile } from "@shared/schema";

// Get all projects for current user
export function useProjects() {
  return useQuery({
    queryKey: ["/api/projects"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get a specific project with its files
export function useProject(id: string | number | null) {
  return useQuery({
    queryKey: ["/api/projects", id],
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Create a new project
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectData: Omit<Project, "id" | "userId" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/projects", projectData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create project",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Update an existing project
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.id] });
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update project",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Delete a project
export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete project",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Create a new file in a project
export function useCreateFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, fileData }: { projectId: number; fileData: Omit<ProjectFile, "id" | "projectId" | "createdAt"> }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/files`, fileData);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.projectId] });
      toast({
        title: "File created",
        description: "Your new file has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create file",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Update an existing file
export function useUpdateFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fileId, projectId, data }: { fileId: number; projectId: number; data: Partial<ProjectFile> }) => {
      const res = await apiRequest("PUT", `/api/files/${fileId}`, data);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.projectId] });
      toast({
        title: "File updated",
        description: "Your file has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update file",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Delete a file
export function useDeleteFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fileId, projectId }: { fileId: number; projectId: number }) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
      return { fileId, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", data.projectId] });
      toast({
        title: "File deleted",
        description: "Your file has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete file",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}
