import React from "react";
import { Link, useLocation } from "wouter";
import LoginForm from "@/components/auth/LoginForm";
import GitHubLogin from "@/components/auth/GitHubLogin";
import GoogleLogin from "@/components/auth/GoogleLogin";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login: React.FC = () => {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Star className="h-12 w-12 text-primary-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-white">Sign in to OmniDev</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{" "}
          <Link href="/signup">
            <a className="font-medium text-primary-500 hover:text-primary-400">
              create a new account
            </a>
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              <GitHubLogin />
              <GoogleLogin />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
