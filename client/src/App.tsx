import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Subscription from "@/pages/Subscription";
import Projects from "@/pages/Projects";
import ProjectWorkspace from "@/pages/ProjectWorkspace";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPlans from "@/pages/AdminPlans";
import AdminUsers from "@/pages/AdminUsers";
import AdminPayments from "@/pages/AdminPayments";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component, adminRequired = false }: { component: React.ComponentType, adminRequired?: boolean }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  if (adminRequired && !isAdmin) {
    return <NotFound />;
  }
  
  return <Component />;
}

// Landing page redirect component
function LandingPage() {
  const { isAuthenticated } = useAuth();
  
  // If authenticated, go to dashboard, otherwise show landing page
  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }
  
  // For non-authenticated users, redirect to the static landing page
  window.location.href = "/index.html";
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/subscription">
        {() => <ProtectedRoute component={Subscription} />}
      </Route>
      <Route path="/projects">
        {() => <ProtectedRoute component={Projects} />}
      </Route>
      <Route path="/project/:id">
        {(params) => <ProtectedRoute component={() => <ProjectWorkspace id={params.id} />} />}
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} adminRequired={true} />}
      </Route>
      <Route path="/admin/plans">
        {() => <ProtectedRoute component={AdminPlans} adminRequired={true} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} adminRequired={true} />}
      </Route>
      <Route path="/admin/payments">
        {() => <ProtectedRoute component={AdminPayments} adminRequired={true} />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
