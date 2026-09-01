"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function InvoiceView({ invoice, className }: { invoice: any; className?: string }) {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = invoice.invoiceNumber || invoice.id || "INV-001";
  const date = invoice.issuedAt || invoice.createdAt || new Date();
  const labour = invoice.labourCharge || 0;
  const travel = invoice.travelCharge || 0;
  const materials = invoice.materialCharge || 0;
  const coopFund = invoice.cooperativeContribution || 0;
  const welfareFund = invoice.welfareContribution || 0;
  const tax = invoice.tax || 0;
  const total = invoice.total || (labour + travel + materials + tax);
  const items = invoice.items || [];

  return (
    <Card className={cn("w-full max-w-3xl mx-auto bg-white text-gray-900 border shadow-sm", className)}>
      <CardHeader className="flex flex-row justify-between items-start border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold uppercase tracking-wider text-primary">TAX INVOICE</CardTitle>
            <Badge className="bg-green-100 text-green-800 font-semibold">{invoice.status || "PAID"}</Badge>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-1">Invoice No: {invoiceNo}</p>
          <p className="text-xs text-gray-500">Issued: {formatDate(date)}</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase text-[10px]">
                <th className="text-left py-2">Item Description</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length > 0 ? (
                items.map((item: any, idx: number) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2 text-gray-800 font-medium">{item.description}</td>
                    <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td className="py-2 text-gray-800 font-medium">Labour & Diagnostic Charges</td>
                    <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(labour)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-800 font-medium">Travel Allowance</td>
                    <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(travel)}</td>
                  </tr>
                  {materials > 0 && (
                    <tr>
                      <td className="py-2 text-gray-800 font-medium">Approved Materials / Parts</td>
                      <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(materials)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 text-gray-500">Cooperative Society Development (5%)</td>
                    <td className="py-2 text-right text-gray-600">{formatCurrency(coopFund)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Worker Welfare Fund (2%)</td>
                    <td className="py-2 text-right text-gray-600">{formatCurrency(welfareFund)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">GST (5%)</td>
                    <td className="py-2 text-right text-gray-600">{formatCurrency(tax)}</td>
                  </tr>
                </>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-900 text-sm">
                <th className="text-left pt-3 font-bold text-gray-900">Total Payable Amount</th>
                <th className="text-right pt-3 font-extrabold text-primary text-base">{formatCurrency(total)}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span>Payment is recorded on the Cooperative Ledger with transparent worker welfare contributions.</span>
        </div>
      </CardContent>
    </Card>
  );
}
