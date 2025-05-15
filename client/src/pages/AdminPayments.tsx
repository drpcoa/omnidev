import React, { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
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
import { Loader2, LayoutDashboard, Users, CreditCard, Settings, Search, SlidersHorizontal, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminPaymentStats, useApprovePayment } from "@/hooks/use-payments";
import { formatDate, formatCurrency } from "@/lib/utils";
import PaymentList from "@/components/admin/PaymentList";
import { Badge } from "@/components/ui/badge";

export default function AdminPayments() {
  const [location, navigate] = useLocation();
  const { data, isLoading } = useAdminPaymentStats();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  const approveMutation = useApprovePayment();
  
  const payments = data?.recentPayments || [];
  const paymentsByProvider = data?.paymentsByProvider || {};
  
  // Filter payments based on filters and search
  const filteredPayments = payments.filter((payment: any) => {
    // Filter by status
    if (statusFilter !== "all" && payment.status !== statusFilter) {
      return false;
    }
    
    // Filter by provider
    if (providerFilter !== "all" && payment.provider !== providerFilter) {
      return false;
    }
    
    // Search by payment ID or user ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.id.toString().includes(query) ||
        payment.userId.toString().includes(query) ||
        (payment.paymentIntentId && payment.paymentIntentId.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Handle payment approval
  const handleApprovePayment = async (paymentId: number) => {
    try {
      await approveMutation.mutateAsync(paymentId);
    } catch (error) {
      console.error("Failed to approve payment:", error);
    }
  };
  
  // Handle view payment details
  const handleViewPaymentDetails = (paymentId: number) => {
    const payment = payments.find((p: any) => p.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
      setIsPaymentDetailsOpen(true);
    }
  };
  
  const availablePaymentStatuses = ["pending", "completed", "failed", "refunded"];
  const availablePaymentProviders = Object.keys(paymentsByProvider);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
          <p className="text-gray-400">Monitor and manage payment transactions</p>
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
                className="w-full flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-slate-700 px-4 py-2 rounded-md"
                onClick={() => navigate("/admin/plans")}
              >
                <Settings className="h-5 w-5" />
                <span>Plans</span>
              </button>
              
              <button
                className="w-full flex items-center space-x-2 text-white bg-primary-900 hover:bg-primary-800 px-4 py-2 rounded-md"
                onClick={() => navigate("/admin/payments")}
              >
                <CreditCard className="h-5 w-5" />
                <span>Payments</span>
              </button>
            </div>
            
            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Payment Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Total Revenue</h4>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(data?.totalRevenue || 0)}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Pending Approvals</h4>
                  <div className="text-xl font-bold text-white">
                    {data?.pendingApprovals || 0}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Payment Methods</h4>
                  <div className="space-y-1 mt-2">
                    {Object.entries(paymentsByProvider).map(([provider, count]) => (
                      <div key={provider} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{provider}</span>
                        <Badge variant="outline" className="bg-slate-900">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-5">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Transactions</CardTitle>
                    <CardDescription className="text-gray-400">
                      View and manage payment transactions
                    </CardDescription>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search payments..."
                        className="pl-10 bg-slate-900 border-slate-700 w-full md:w-48"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      className="border-slate-700 text-gray-300 hover:bg-slate-700"
                      onClick={() => setIsFilterOpen(true)}
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="mb-6">
                  <TabsList className="bg-slate-900">
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                    <TabsTrigger value="manual">Manual Payments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="pt-6">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                      </div>
                    ) : filteredPayments.length > 0 ? (
                      <PaymentList 
                        payments={filteredPayments}
                        onApprove={handleApprovePayment}
                        onViewDetails={handleViewPaymentDetails}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No payments found</h3>
                        <p className="text-gray-400">
                          {searchQuery || statusFilter !== "all" || providerFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "There are no payment transactions yet"}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="pt-6">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                      </div>
                    ) : (
                      <PaymentList 
                        payments={payments.filter((p: any) => p.status === "pending")}
                        onApprove={handleApprovePayment}
                        onViewDetails={handleViewPaymentDetails}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="manual" className="pt-6">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                      </div>
                    ) : (
                      <PaymentList 
                        payments={payments.filter((p: any) => p.provider === "manual")}
                        onApprove={handleApprovePayment}
                        onViewDetails={handleViewPaymentDetails}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Payments</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="filter-status">Payment Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="filter-status" className="bg-slate-900 border-slate-700">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {availablePaymentStatuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filter-provider">Payment Provider</Label>
              <Select
                value={providerFilter}
                onValueChange={setProviderFilter}
              >
                <SelectTrigger id="filter-provider" className="bg-slate-900 border-slate-700">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Providers</SelectItem>
                  {availablePaymentProviders.map(provider => (
                    <SelectItem key={provider} value={provider} className="capitalize">{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter("all");
                setProviderFilter("all");
              }}
              className="border-slate-700 text-gray-300 hover:bg-slate-700 mr-auto"
            >
              Reset
            </Button>
            <Button 
              onClick={() => setIsFilterOpen(false)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDetailsOpen} onOpenChange={setIsPaymentDetailsOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Payment Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Payment ID</Label>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-gray-400">User ID</Label>
                  <p className="font-medium">{selectedPayment.userId}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-400">Amount</Label>
                <p className="font-medium">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="mt-1">
                    <Badge className={
                      selectedPayment.status === 'completed' ? 'bg-green-900 text-green-300 border-green-700' :
                      selectedPayment.status === 'pending' ? 'bg-yellow-900 text-yellow-300 border-yellow-700' :
                      selectedPayment.status === 'failed' ? 'bg-red-900 text-red-300 border-red-700' :
                      'bg-gray-900 text-gray-300 border-gray-700'
                    }>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Provider</Label>
                  <p className="font-medium capitalize">{selectedPayment.provider}</p>
                </div>
              </div>
              
              {selectedPayment.paymentIntentId && (
                <div>
                  <Label className="text-gray-400">Payment Intent ID</Label>
                  <p className="font-medium text-sm break-all">{selectedPayment.paymentIntentId}</p>
                </div>
              )}
              
              <div>
                <Label className="text-gray-400">Date</Label>
                <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
              </div>
              
              {selectedPayment.manuallyApproved && (
                <div>
                  <Label className="text-gray-400">Approved</Label>
                  <div className="flex items-center mt-1">
                    <Badge className="bg-green-900 text-green-300 border-green-700 mr-2">
                      Approved
                    </Badge>
                    <span className="text-sm text-gray-400">
                      by Admin #{selectedPayment.approvedById} on {formatDate(selectedPayment.approvedAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {selectedPayment && selectedPayment.status === 'pending' && selectedPayment.provider === 'manual' && (
              <Button 
                onClick={() => {
                  handleApprovePayment(selectedPayment.id);
                  setIsPaymentDetailsOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700 mr-auto"
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving...
                  </>
                ) : "Approve Payment"}
              </Button>
            )}
            <Button 
              onClick={() => setIsPaymentDetailsOpen(false)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
