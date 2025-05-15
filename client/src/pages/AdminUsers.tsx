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
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Loader2, LayoutDashboard, Users, CreditCard, Settings, Search, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import UserList from "@/components/admin/UserList";
import { User } from "@shared/schema";

export default function AdminUsers() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editSubscriptionStatus, setEditSubscriptionStatus] = useState("");
  
  // Get all users
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "User updated",
        description: "The user has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Toggle admin status mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: number; isAdmin: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/toggle-admin`, { isAdmin });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Admin status updated",
        description: "User admin status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update admin status",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  const users = data?.users || [];
  
  // Filter users based on search query
  const filteredUsers = users.filter((user: User) => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Open edit dialog with selected user
  const handleEditUser = (userId: number) => {
    const user = users.find((u: User) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditUsername(user.username);
      setEditEmail(user.email);
      setEditIsAdmin(user.isAdmin);
      setEditSubscriptionStatus(user.subscriptionStatus || "inactive");
      setIsEditDialogOpen(true);
    }
  };
  
  // Toggle admin status
  const handleToggleAdmin = async (userId: number, isAdmin: boolean) => {
    try {
      await toggleAdminMutation.mutateAsync({ id: userId, isAdmin });
    } catch (error) {
      console.error("Failed to toggle admin status:", error);
    }
  };
  
  // Save user changes
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data: {
          username: editUsername,
          email: editEmail,
          isAdmin: editIsAdmin,
          subscriptionStatus: editSubscriptionStatus
        }
      });
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage users, permissions and subscription status</p>
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
                className="w-full flex items-center space-x-2 text-white bg-primary-900 hover:bg-primary-800 px-4 py-2 rounded-md"
                onClick={() => navigate("/admin/users")}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </button>
              
              <button
                className="w-full flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-md"
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
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Users</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 bg-slate-900 border-slate-700 w-full md:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <UserList 
                    users={filteredUsers}
                    onEdit={handleEditUser}
                    onToggleAdmin={handleToggleAdmin}
                  />
                ) : (
                  <div className="text-center py-12">
                    <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
                    <p className="text-gray-400">
                      {searchQuery 
                        ? "Try a different search term" 
                        : "There are no users in the system yet"}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-400">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input 
                  id="edit-username" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="bg-slate-900 border-slate-700" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-slate-900 border-slate-700" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subscription">Subscription Status</Label>
                <Select
                  value={editSubscriptionStatus}
                  onValueChange={setEditSubscriptionStatus}
                >
                  <SelectTrigger id="edit-subscription" className="bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editIsAdmin}
                  onCheckedChange={setEditIsAdmin}
                  id="edit-admin"
                />
                <Label htmlFor="edit-admin">Admin privileges</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="border-slate-700 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUser}
              className="bg-primary-600 hover:bg-primary-700"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
