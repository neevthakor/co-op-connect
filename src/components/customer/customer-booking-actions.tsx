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
}

export function CustomerBookingActions({ bookingId, invoice, payment, status }: CustomerBookingActionsProps) {
  const router = useRouter();
  const [loadingPay, setLoadingPay] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('POOR_QUALITY');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [loadingDispute, setLoadingDispute] = useState(false);

  const handlePay = async () => {
    const totalAmount = invoice?.total || 450;
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
    } catch (err: any) {
      toast.error(err.message || 'Payment processing failed');
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
    } catch (err: any) {
      toast.error(err.message || 'Complaint filing failed');
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingBefore(false);
    }
  };

  return (
    <div className="space-y-4">
      {isCompleted && !hasPaid && invoice && (
        <Card className="border-primary bg-primary/5 p-4">
          <CardContent className="p-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-foreground">Pending Payment</h4>
              <p className="text-xs text-muted-foreground">Total due: ₹{invoice.total}. Instant digital invoice settlement via Sandbox UPI.</p>
            </div>
            <Button
              onClick={handlePay}
              disabled={loadingPay}
              className="w-full sm:w-auto bg-primary text-primary-foreground font-bold gap-2"
            >
              {loadingPay ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Processing UPI...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Pay ₹{invoice.total} (Sandbox UPI)
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
      )}
    </div>
  );
}
