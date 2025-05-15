import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    pendingApprovals: number;
    paymentsByProvider: Record<string, number>;
    recentPayments: any[];
    userCount?: number;
    activeSubscriptions?: number;
  };
}

const AdminDashboard: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Approvals</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Manual payments requiring approval
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.userCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12 new users this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions ? ((stats.activeSubscriptions / (stats.userCount || 1)) * 100).toFixed(1) : 0}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods</CardTitle>
            <CardDescription className="text-gray-400">
              Distribution of payments by provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.paymentsByProvider || {}).map(([provider, count]) => (
                <div key={provider} className="flex items-center">
                  <div className="w-full flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{provider}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full ${
                          provider === 'stripe' ? 'bg-blue-500' :
                          provider === 'paypal' ? 'bg-blue-400' :
                          provider === 'manual' ? 'bg-yellow-500' :
                          'bg-primary-500'
                        }`}
                        style={{
                          width: `${(count / Object.values(stats.paymentsByProvider || {}).reduce((a, b) => a + b, 0)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Payments</CardTitle>
            <CardDescription className="text-gray-400">
              Last {stats.recentPayments?.length || 0} payments processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPayments?.slice(0, 5).map((payment, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      payment.status === 'completed' ? 'bg-green-500' :
                      payment.status === 'pending' ? 'bg-yellow-500' :
                      payment.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm">User #{payment.userId}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm mr-4">{formatCurrency(payment.amount, payment.currency)}</span>
                    <span className="text-xs text-muted-foreground capitalize">{payment.provider}</span>
                  </div>
                </div>
              ))}
              
              {(!stats.recentPayments || stats.recentPayments.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent payments
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
