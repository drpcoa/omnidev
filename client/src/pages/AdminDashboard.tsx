import React from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminPaymentStats } from "@/hooks/use-payments";
import AdminDashboardPanel from "@/components/admin/Dashboard";
import { Loader2, LayoutDashboard, Users, CreditCard, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const { data, isLoading } = useAdminPaymentStats();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your platform, users, and subscription plans</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-1">
              <button
                className="w-full flex items-center space-x-2 text-white bg-primary-900 hover:bg-primary-800 px-4 py-2 rounded-md"
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
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
              </div>
            ) : (
              <AdminDashboardPanel stats={data || {}} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
