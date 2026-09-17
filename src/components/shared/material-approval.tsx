"use client";

import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Receipt, FileText } from "lucide-react";
import { formatCurrency, cn, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

interface Material {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receiptUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface MaterialApprovalProps {
  material: Material;
  bookingId?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
  readOnly?: boolean;
}

export function MaterialApproval({ material, bookingId, onApprove, onReject, className, readOnly }: MaterialApprovalProps) {
  const [currentStatus, setCurrentStatus] = useState(material.status);
  const [isHandling, setIsHandling] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setIsHandling(true);
    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    try {
      if (onApprove && action === "approve") {
        onApprove(material.id);
      } else if (onReject && action === "reject") {
        onReject(material.id);
      } else if (bookingId) {
        const res = await fetch(`/api/bookings/${bookingId}/materials`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ materialId: material.id, status: newStatus }),
        });
        if (!res.ok) throw new Error("Failed to update material request");
      }
      setCurrentStatus(newStatus);
      toast.success(`Material request ${action === "approve" ? "Approved" : "Rejected"}`);
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || "Action failed");
    } finally {
      setIsHandling(false);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium leading-none">{material.item}</h4>
          </div>
          <Badge className={getStatusColor(currentStatus)}>
            {currentStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm mt-4 p-3 bg-muted/50 rounded-md">
          <div>
            <p className="text-muted-foreground text-xs">Qty</p>
            <p className="font-medium">{material.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Unit</p>
            <p className="font-medium">{formatCurrency(material.unitPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Total</p>
            <p className="font-bold text-primary">{formatCurrency(material.totalPrice)}</p>
          </div>
        </div>

        {material.receiptUrl && (
          <Button variant="link" size="sm" className="px-0 mt-2 h-auto text-muted-foreground hover:text-primary">
            <Receipt className="h-3 w-3 mr-1" /> View Receipt
          </Button>
        )}

        {currentStatus === "APPROVED" && (
          <p className="text-xs text-green-700 font-semibold mt-3 bg-green-50 p-2 rounded border border-green-100 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            {formatCurrency(material.totalPrice)} added to final bill
          </p>
        )}
      </CardContent>

      {currentStatus === "PENDING" && !readOnly && (
        <CardFooter className="p-0 border-t flex divide-x bg-muted/20">
          <Button
            variant="ghost"
            className="flex-1 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isHandling}
            onClick={() => handleAction("reject")}
          >
            <X className="h-4 w-4 mr-2" /> Reject
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-none text-green-600 hover:text-green-700 hover:bg-green-50"
            disabled={isHandling}
            onClick={() => handleAction("approve")}
          >
            <Check className="h-4 w-4 mr-2" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

