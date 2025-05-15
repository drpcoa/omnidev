import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Create a Stripe payment intent
export function useStripePayment() {
  return useMutation({
    mutationFn: async ({ planId }: { planId: number }) => {
      const res = await apiRequest("POST", "/api/payment/stripe", { planId });
      return res.json();
    },
    onError: (error: any) => {
      toast({
        title: "Payment error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });
}

// Create a manual payment record
export function useManualPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      planId, 
      amount, 
      currency = "usd", 
      details 
    }: { 
      planId: number; 
      amount?: number; 
      currency?: string;
      details?: string;
    }) => {
      const res = await apiRequest("POST", "/api/payment/manual", { 
        planId, 
        amount, 
        currency, 
        details 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Payment recorded",
        description: "Your payment has been recorded and is pending approval",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });
}

// For admin: Get payment stats and pending approvals
export function useAdminPaymentStats() {
  return useQuery({
    queryKey: ["/api/admin/payments"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// For admin: Approve a manual payment
export function useApprovePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await apiRequest("POST", `/api/admin/payments/${paymentId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({
        title: "Payment approved",
        description: "The payment has been approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval error",
        description: error.message || "Failed to approve payment",
        variant: "destructive",
      });
    },
  });
}
