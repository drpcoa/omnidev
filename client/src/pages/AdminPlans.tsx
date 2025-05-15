import React, { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Loader2, PlusCircle, LayoutDashboard, Users, CreditCard, Settings } from "lucide-react";
import { 
  useSubscriptionPlans, 
  useCreateSubscriptionPlan, 
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan 
} from "@/hooks/use-subscription";
import PlanForm from "@/components/admin/PlanForm";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@shared/schema";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";

export default function AdminPlans() {
  const [location, navigate] = useLocation();
  const { data, isLoading } = useAllSubscriptionPlans();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const deletePlanMutation = useDeleteSubscriptionPlan();
  
  const plans = data?.plans || [];

  // Open edit dialog with selected plan
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeletePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  // Create new plan
  const handleCreatePlan = async (data: any) => {
    try {
      await createPlanMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create plan:", error);
    }
  };

  // Update existing plan
  const handleUpdatePlan = async (data: any) => {
    if (!selectedPlan) return;
    
    try {
      await updatePlanMutation.mutateAsync({
        id: selectedPlan.id,
        data
      });
      setIsEditDialogOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Failed to update plan:", error);
    }
  };

  // Delete plan
  const handleConfirmDelete = async () => {
    if (!selectedPlan) return;
    
    try {
      await deletePlanMutation.mutateAsync(selectedPlan.id);
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
      toast({
        title: "Plan deleted",
        description: "The subscription plan has been deleted successfully"
      });
    } catch (error) {
      console.error("Failed to delete plan:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete subscription plan",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Plans</h1>
          <p className="text-gray-400">Manage your subscription plans and features</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-1">
              <button
                className="w-full flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-md"
                onClick={() => navigate("/admin")}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              
              <button
                className="w-full flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-md"
                onClick={() => navigate("/admin/users")}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </button>
              
              <button
                className="w-full flex items-center space-x-2 text-white bg-primary-900 hover:bg-primary-800 px-4 py-2 rounded-md"
                onClick={() => navigate("/admin/plans")}
              >
                <Settings className="h-5 w-5" />
                <span>Plans</span>
              </button>
              
              <button
                className="w-full flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-md"
                onClick={() => navigate("/admin/payments")}
              >
                <CreditCard className="h-5 w-5" />
                <span>Payments</span>
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Available Plans</h2>
              <Button
                className="bg-primary-600 hover:bg-primary-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                New Plan
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
              </div>
            ) : plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`bg-slate-800 border-slate-700 ${!plan.active && 'opacity-70'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{plan.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {plan.active ? "Active" : "Inactive"}
                          </CardDescription>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(plan.price)}
                          <span className="text-sm font-normal text-gray-400">/{plan.interval}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300 mb-4">{plan.description}</p>
                      
                      <h4 className="text-sm font-medium mb-2">Features:</h4>
                      <ul className="text-sm text-gray-400 space-y-1 mb-6">
                        {typeof plan.features === 'string' 
                          ? JSON.parse(plan.features).slice(0, 4).map((feature: any, idx: number) => (
                              <li key={idx} className="flex items-center">
                                <span className={`h-2 w-2 rounded-full mr-2 ${feature.included ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                                <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                                  {feature.name}
                                </span>
                              </li>
                            ))
                          : Array.isArray(plan.features) && plan.features.slice(0, 4).map((feature, idx) => (
                              <li key={idx} className="flex items-center">
                                <span className={`h-2 w-2 rounded-full mr-2 ${feature.included ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                                <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                                  {feature.name}
                                </span>
                              </li>
                            ))
                        }
                      </ul>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-slate-700 text-white hover:bg-slate-700"
                          onClick={() => handleEditPlan(plan)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDeletePlan(plan)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-white mb-2">No subscription plans yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first subscription plan to start offering premium features
                </p>
                <Button
                  className="bg-primary-600 hover:bg-primary-700"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Plan
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
          </DialogHeader>
          
          <PlanForm 
            onSubmit={handleCreatePlan} 
            isSubmitting={createPlanMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <PlanForm 
              initialData={selectedPlan}
              onSubmit={handleUpdatePlan} 
              isSubmitting={updatePlanMutation.isPending} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete the "{selectedPlan?.name}" subscription plan.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              {deletePlanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper to get all subscription plans for admin
function useAllSubscriptionPlans() {
  return useSubscriptionPlans();
}
