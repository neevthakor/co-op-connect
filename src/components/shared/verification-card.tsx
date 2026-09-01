"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationField {
  label: string;
  value: string;
  status: "VERIFIED" | "REJECTED" | "PENDING";
  documentUrl?: string;
  documentType?: "IMAGE" | "PDF";
}

interface VerificationData {
  id: string;
  workerName: string;
  submittedAt: string | Date;
  fields: VerificationField[];
}

interface VerificationCardProps {
  data: VerificationData;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestInfo: (id: string) => void;
  className?: string;
}

export function VerificationCard({ data, onApprove, onReject, onRequestInfo, className }: VerificationCardProps) {
  const allVerified = data.fields.every(f => f.status === "VERIFIED");
  const anyRejected = data.fields.some(f => f.status === "REJECTED");

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">KYC Verification: {data.workerName}</CardTitle>
          <Badge variant={allVerified ? "default" : anyRejected ? "destructive" : "secondary"}>
            {allVerified ? "Ready to Approve" : "Pending Review"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-md border divide-y">
          {data.fields.map((field, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">{field.label}</p>
                <p className="font-semibold">{field.value}</p>
              </div>
              
              <div className="flex items-center gap-4">
                {field.documentUrl && (
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    {field.documentType === "IMAGE" ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    View Doc
                  </Button>
                )}
                
                <div className="flex gap-1 border rounded p-1 bg-muted/30">
                  <Button 
                    variant={field.status === "VERIFIED" ? "default" : "ghost"} 
                    size="icon" 
                    className={cn("h-7 w-7", field.status === "VERIFIED" && "bg-green-600 hover:bg-green-700")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={field.status === "REJECTED" ? "destructive" : "ghost"} 
                    size="icon" 
                    className="h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
        <Button variant="outline" onClick={() => onRequestInfo(data.id)} className="gap-2">
          <Info className="h-4 w-4" /> Request Info
        </Button>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => onReject(data.id)}>Reject Application</Button>
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={() => onApprove(data.id)}
            disabled={!allVerified}
          >
            Approve Profile
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
