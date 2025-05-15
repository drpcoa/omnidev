import React from "react";
import { Button } from "@/components/ui/button";
import { SiGithub } from "react-icons/si";

const GitHubLogin = () => {
  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <Button
      className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900"
      onClick={handleGitHubLogin}
    >
      <SiGithub className="h-5 w-5 mr-2" />
      Continue with GitHub
    </Button>
  );
};

export default GitHubLogin;
