import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, ChevronDown, Plus } from "lucide-react";

interface HeaderProps {
  onCreateProject?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateProject }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <header className="bg-slate-950 border-b border-slate-800">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <Star className="h-8 w-8 text-primary-500" />
            <Link href="/">
              <a className="ml-2 text-xl font-bold">OmniDev</a>
            </Link>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex space-x-4">
              <Link href="/projects">
                <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white">
                  Projects
                </a>
              </Link>
              <Link href="/models">
                <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white">
                  Models
                </a>
              </Link>
              <Link href="/marketplace">
                <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white">
                  Marketplace
                </a>
              </Link>
              <Link href="/documentation">
                <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white">
                  Documentation
                </a>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {onCreateProject && (
                <Button className="rounded-full bg-primary-500 p-1" onClick={onCreateProject}>
                  <Plus className="h-6 w-6" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={
                          user?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.username || "User"
                          )}&background=1e293b&color=fff`
                        }
                        alt={`${user?.username}'s profile`}
                      />
                      <span className="hidden md:inline-block ml-2 text-sm font-medium">
                        {user?.username}
                      </span>
                      <ChevronDown className="h-5 w-5 text-gray-400 ml-1" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <a className="w-full cursor-pointer">Profile</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <a className="w-full cursor-pointer">Settings</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/subscription">
                      <a className="w-full cursor-pointer">Subscription</a>
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <a className="w-full cursor-pointer">Admin Dashboard</a>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={() => logout()}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-gray-300">
                <Link href="/login">
                  <a>Sign in</a>
                </Link>
              </Button>
              <Button asChild className="bg-primary-600 hover:bg-primary-700">
                <Link href="/signup">
                  <a>Sign up</a>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
