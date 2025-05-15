import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@shared/schema";

// Get all available subscription plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["/api/subscription/plans"],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// For admin: Get all subscription plans
export function useAllSubscriptionPlans() {
  return useQuery({
    queryKey: ["/api/admin/plans"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create a new subscription plan (admin only)
export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planData: Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/admin/plans", planData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/plans"] });
      toast({
        title: "Plan created",
        description: "The subscription plan has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create plan",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Update an existing subscription plan (admin only)
export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SubscriptionPlan> }) => {
      const res = await apiRequest("PUT", `/api/admin/plans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/plans"] });
      toast({
        title: "Plan updated",
        description: "The subscription plan has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update plan",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

// Delete a subscription plan (admin only)
export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/plans/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/plans"] });
      toast({
        title: "Plan deleted",
        description: "The subscription plan has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete plan",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}
