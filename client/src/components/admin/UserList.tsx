import React from "react";
import { User } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserListProps {
  users: User[];
  onEdit?: (userId: number) => void;
  onToggleAdmin?: (userId: number, isAdmin: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ 
  users,
  onEdit,
  onToggleAdmin,
}) => {
  return (
    <div className="rounded-md border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow className="hover:bg-slate-800/50">
            <TableHead className="text-white">User</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Created</TableHead>
            <TableHead className="text-white">Last Login</TableHead>
            <TableHead className="text-white w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-800/50 border-slate-700">
              <TableCell className="font-medium flex items-center gap-2">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username} 
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <UserCog className="h-6 w-6 text-gray-500" />
                )}
                <span>{user.username}</span>
                {user.isAdmin && (
                  <Badge variant="outline" className="bg-primary-900 text-primary-300 border-primary-700 ml-2">
                    Admin
                  </Badge>
                )}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge 
                  className={user.subscriptionStatus === 'active' 
                    ? 'bg-green-900 text-green-300 hover:bg-green-900 border-green-700' 
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-900 border-gray-700'
                  }
                >
                  {user.subscriptionStatus === 'active' ? 'Subscribed' : 'Free Tier'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : "Never"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onEdit && onEdit(user.id)}
                    >
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onToggleAdmin && onToggleAdmin(user.id, !user.isAdmin)}
                    >
                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
