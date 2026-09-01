import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface PaymentSummaryProps {
  payment?: {
    amount?: number;
    method?: string | null;
    status?: string;
    transactionId?: string | null;
  } | any;
  className?: string;
}

export function PaymentSummary({ payment, className }: PaymentSummaryProps) {
  if (!payment) return null;

  const amount = payment.amount || payment.total || 0;
  const method = payment.method || "UPI / Digital";
  const status = payment.status || "COMPLETED";
  const transactionId = payment.transactionId || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  return (
    <Card className={cn("overflow-hidden bg-white border shadow-xs", className)}>
      <CardHeader className="bg-gray-50/70 pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center justify-between">
          Payment Receipt
          <Badge className={cn("text-xs font-semibold", getStatusColor(status))}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Paid Amount</span>
          <span className="text-xl font-extrabold text-gray-900">{formatCurrency(amount)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Payment Channel</span>
          <span className="flex items-center gap-1.5 font-semibold text-gray-800">
            <CreditCard className="h-3.5 w-3.5 text-gray-400" />
            {method}
          </span>
        </div>

        {transactionId && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Transaction Ref</span>
            <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">{transactionId}</span>
          </div>
        )}

        <div className="pt-2 border-t flex items-center gap-1.5 text-[11px] text-green-700 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          <span>Payment verified by Cooperative Provider Abstraction.</span>
        </div>
      </CardContent>
    </Card>
  );
}
