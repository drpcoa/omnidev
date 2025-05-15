import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { AiModel } from "@shared/schema";

// Get all available models for current user
export function useModels() {
  return useQuery({
    queryKey: ["/api/models"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// For admin: Get all models
export function useAllModels() {
  return useQuery({
    queryKey: ["/api/admin/models"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create a new model (admin only)
export function useCreateModel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (modelData: Omit<AiModel, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/admin/models", modelData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      toast({
        title: "Model created",
        description: "The AI model has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create model",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Update an existing model (admin only)
export function useUpdateModel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AiModel> }) => {
      const res = await apiRequest("PUT", `/api/admin/models/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      toast({
        title: "Model updated",
        description: "The AI model has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update model",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Toggle model active status (admin only)
export function useToggleModelStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/models/${id}/toggle`, { active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Model status updated",
        description: "The AI model status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update model status",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}
