import React from "react";
import { Payment } from "@shared/schema";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MoreHorizontal, User, FileText } from "lucide-react";
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

interface PaymentListProps {
  payments: Payment[];
  onApprove?: (paymentId: number) => void;
  onViewDetails?: (paymentId: number) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ 
  payments,
  onApprove,
  onViewDetails,
}) => {
  // Function to determine badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-900 text-green-300 hover:bg-green-900 border-green-700">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-900 text-yellow-300 hover:bg-yellow-900 border-yellow-700">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-900 text-red-300 hover:bg-red-900 border-red-700">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-900 text-blue-300 hover:bg-blue-900 border-blue-700">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-300 hover:bg-gray-900 border-gray-700">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow className="hover:bg-slate-800/50">
            <TableHead className="text-white">ID</TableHead>
            <TableHead className="text-white">User</TableHead>
            <TableHead className="text-white">Amount</TableHead>
            <TableHead className="text-white">Provider</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="hover:bg-slate-800/50 border-slate-700">
              <TableCell>{payment.id}</TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>User #{payment.userId}</span>
                </div>
              </TableCell>
              <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {payment.provider}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
              <TableCell>{formatDate(payment.createdAt)}</TableCell>
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
                      onClick={() => onViewDetails && onViewDetails(payment.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    
                    {payment.status === 'pending' && payment.provider === 'manual' && (
                      <DropdownMenuItem
                        className="cursor-pointer text-green-400 hover:text-green-300"
                        onClick={() => onApprove && onApprove(payment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Payment
                      </DropdownMenuItem>
                    )}
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

export default PaymentList;
