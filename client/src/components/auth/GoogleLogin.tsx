import React from "react";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";

const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <Button
      className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900"
      onClick={handleGoogleLogin}
    >
      <SiGoogle className="h-5 w-5 mr-2" />
      Continue with Google
    </Button>
  );
};

export default GoogleLogin;
