'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CustomerBookingActionsProps {
  bookingId: string;
  invoice: any;
  payment: any;
  status: string;
  complaints?: any[];
}

export function CustomerBookingActions({ bookingId, invoice, payment, status, complaints = [] }: CustomerBookingActionsProps) {
  const router = useRouter();
  const [loadingPay, setLoadingPay] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('POOR_QUALITY');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [loadingDispute, setLoadingDispute] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setLoadingCancel(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');

      toast.success('Booking cancelled successfully');
      router.refresh();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Cancellation failed');
    } finally {
      setLoadingCancel(false);
    }
  };

  const handlePay = async () => {
    const totalAmount = invoice?.total ? invoice.total + (invoice.total * 0.15) : 450;
    setLoadingPay(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount: totalAmount,
          method: 'UPI',
          provider: 'SANDBOX',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      toast.success(`Payment of ₹${totalAmount} successful! Warranty activated.`);
      router.refresh();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Payment processing failed');
    } finally {
      setLoadingPay(false);
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDesc.trim()) return toast.error('Please enter a description for the complaint');
    setLoadingDispute(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: disputeCategory,
          description: disputeDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to file complaint');

      toast.success('Complaint submitted to Cooperative Dispute Committee');
      setDisputeOpen(false);
      setDisputeDesc('');
      router.refresh();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Complaint filing failed');
    } finally {
      setLoadingDispute(false);
    }
  };

  const isCompleted = status === 'COMPLETED';
  const hasPaid = !!payment || invoice?.status === 'PAID';
  const canUploadBefore = ['ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(status);

  const [uploadingBefore, setUploadingBefore] = useState(false);
  const handleBeforePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBefore(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload?type=public', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      
      const res = await fetch(`/api/bookings/${bookingId}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BEFORE',
          imageUrl: uploadData.url,
          caption: `BEFORE servicing inspection photo by customer`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Photo DB save failed');

      toast.success('Before photo uploaded successfully');
      router.refresh();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Failed to upload photo');
    } finally {
      setUploadingBefore(false);
    }
  };

  return (
    <div className="space-y-4">
      {status === 'REQUESTED' && (
        <Card className="border-destructive bg-destructive/5 p-4">
          <CardContent className="p-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-foreground">Cancel Booking</h4>
              <p className="text-xs text-muted-foreground">You can cancel the booking before the worker accepts it.</p>
            </div>
            <Button
              onClick={handleCancel}
              disabled={loadingCancel}
              variant="destructive"
              className="w-full sm:w-auto font-bold gap-2"
            >
              {loadingCancel ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Cancelling...</>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isCompleted && !hasPaid && invoice && (
        <Card className="border-primary bg-primary/5 p-4">
          <CardContent className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <h4 className="font-bold text-sm text-foreground">Pending Payment</h4>
              <p className="text-xs text-muted-foreground mb-2">Total due: ₹{invoice.total}. Instant digital invoice settlement via Sandbox UPI.</p>
              
              <div className="bg-background/80 border rounded-md p-2.5 space-y-1.5 text-xs w-full max-w-sm">
                <div className="flex justify-between font-medium"><span>Service Cost</span><span>₹{invoice.total}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Platform Commission (15%)</span><span>₹{(invoice.total * 0.15).toFixed(2)}</span></div>
                <div className="pt-1.5 mt-1 border-t border-dashed text-[10px] text-muted-foreground italic leading-tight">
                  Where your commission goes: 40% Worker Welfare Fund, 35% Platform Ops, 15% Federation Overhead, 10% Growth Reserve
                </div>
              </div>
            </div>
            <Button
              onClick={handlePay}
              disabled={loadingPay}
              className="w-full sm:w-auto bg-primary text-primary-foreground font-bold gap-2 shrink-0 mt-2 sm:mt-0"
            >
              {loadingPay ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Processing UPI...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Pay ₹{(invoice.total + invoice.total * 0.15).toFixed(2)} (Sandbox UPI)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {canUploadBefore && (
        <Card className="border-primary/50 bg-primary/5 p-4">
          <CardContent className="p-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-foreground">Service Evidence</h4>
              <p className="text-xs text-muted-foreground">Upload a BEFORE photo of the issue for records.</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleBeforePhoto} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                disabled={uploadingBefore}
              />
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold pointer-events-none"
              >
                {uploadingBefore ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  'Upload Before Photo'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Complaints List */}
      {complaints.length > 0 && (
        <Card className="border-border bg-card p-4">
          <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Submitted Complaints
          </h4>
          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c.id} className="text-xs p-3 rounded-lg border bg-muted/20">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-semibold">{c.category.replace('_', ' ')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                    c.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-muted-foreground">{c.description}</p>
                {c.resolution && (
                  <div className="mt-2 p-2 bg-background rounded border border-green-500/30">
                    <span className="font-semibold text-green-700 block mb-0.5">Resolution:</span>
                    {c.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dispute Modal / Toggle */}
      {disputeOpen ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4">
          <form onSubmit={handleDispute} className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Report Issue to Cooperative
              </h4>
              <button
                type="button"
                onClick={() => setDisputeOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                Cancel
              </button>
            </div>
            <div>
              <label className="font-medium text-foreground block mb-1">Issue Category</label>
              <select
                value={disputeCategory}
                onChange={(e) => setDisputeCategory(e.target.value)}
                className="w-full p-2 border rounded-md bg-background text-foreground text-xs"
              >
                <option value="POOR_QUALITY">Poor Service Quality / Incomplete Work</option>
                <option value="OVERCHARGED">Pricing / Material Discrepancy</option>
                <option value="BEHAVIOUR">Worker Conduct / Delay</option>
                <option value="DAMAGE">Accidental Property Damage</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-foreground block mb-1">Details</label>
              <textarea
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                placeholder="Describe what went wrong..."
                className="w-full p-2 border rounded-md bg-background text-foreground text-xs min-h-[70px]"
              />
            </div>
            <Button
              type="submit"
              disabled={loadingDispute}
              variant="destructive"
              size="sm"
              className="w-full font-semibold"
            >
              {loadingDispute ? 'Submitting to Cooperative...' : 'Submit Dispute Claim'}
            </Button>
          </form>
        </Card>
      ) : (
        isCompleted && (
          <div className="pt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDisputeOpen(true)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Report an Issue / Submit Complaint
            </Button>
          </div>
        )
      )}
    </div>
  );
}
