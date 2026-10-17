"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, ArrowUpRight, ArrowDownRight, ShieldAlert, HeartHandshake } from "lucide-react";
import { processWelfareTransaction } from "./actions";

export default function WelfareClient({ federationId, welfareSummary }: { federationId: string, welfareSummary: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txType, setTxType] = useState<"CONTRIBUTION" | "PAYOUT">("CONTRIBUTION");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  async function handleTransactionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await processWelfareTransaction(formData);
      if (res.error) {
        alert(res.error);
      } else {
        (e.target as HTMLFormElement).reset();
        alert("Transaction processed successfully");
      }
    } catch (err) {
      alert("Failed to process transaction");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welfare Fund</h2>
          <p className="text-muted-foreground">Manage contributions and disbursements for your workers.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary-foreground/80">
              <IndianRupee className="w-4 h-4" /> Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{formatCurrency(welfareSummary.balance)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <ShieldAlert className="w-4 h-4" /> Workers Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{welfareSummary.workersCovered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <HeartHandshake className="w-4 h-4" /> Payouts This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{formatCurrency(welfareSummary.payoutsThisPeriod)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Process Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button 
                type="button" 
                variant={txType === "CONTRIBUTION" ? "default" : "outline"}
                onClick={() => setTxType("CONTRIBUTION")}
                className="w-full"
              >
                Contribution
              </Button>
              <Button 
                type="button" 
                variant={txType === "PAYOUT" ? "destructive" : "outline"}
                onClick={() => setTxType("PAYOUT")}
                className="w-full"
              >
                Payout
              </Button>
            </div>
            
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <input type="hidden" name="federationId" value={federationId} />
              
              {txType === "PAYOUT" ? (
                <div>
                  <label className="text-xs font-semibold mb-1 block">Payout Type</label>
                  <select name="type" required className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                    <option value="INSURANCE_PREMIUM">Insurance Premium</option>
                    <option value="EMERGENCY_ADVANCE">Emergency Advance</option>
                    <option value="TRAINING_VOUCHER">Training Voucher</option>
                  </select>
                </div>
              ) : (
                <input type="hidden" name="type" value="CONTRIBUTION" />
              )}
              
              <div>
                <label className="text-xs font-semibold mb-1 block">Amount (₹)</label>
                <input type="number" name="amount" min="1" step="0.01" required className="w-full px-3 py-2 border rounded-md text-sm bg-background" />
              </div>
              
              <div>
                <label className="text-xs font-semibold mb-1 block">Description</label>
                <input type="text" name="description" placeholder="e.g. Monthly top-up or Medical emergency" className="w-full px-3 py-2 border rounded-md text-sm bg-background" />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Processing..." : `Process ${txType === "CONTRIBUTION" ? "Contribution" : "Payout"}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {welfareSummary.transactions.slice(0, 10).map((t: any) => (
              <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border bg-secondary/30">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'CONTRIBUTION' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'CONTRIBUTION' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.type.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{t.description || "No description"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'CONTRIBUTION' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'CONTRIBUTION' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(t.createdAt), 'dd MMM, HH:mm')}</p>
                </div>
              </div>
            ))}
            {welfareSummary.transactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
