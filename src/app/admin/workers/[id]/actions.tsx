'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function AdminWorkerActions({ workerId, currentStatus }: { workerId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: string, reason?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/workers/${workerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to update status: ${errorData.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {currentStatus !== 'VERIFIED' && (
        <Button 
          onClick={() => handleUpdate('VERIFIED')} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Verify Worker
        </Button>
      )}
      {currentStatus !== 'REJECTED' && (
        <Button 
          onClick={() => {
            const reason = prompt('Enter rejection reason:');
            if (reason !== null) handleUpdate('REJECTED', reason);
          }} 
          disabled={loading}
          variant="destructive"
          className="gap-2"
        >
          <XCircle className="w-4 h-4" /> Reject
        </Button>
      )}
      {currentStatus !== 'SUSPENDED' && (
        <Button 
          onClick={() => {
            const reason = prompt('Enter suspension reason:');
            if (reason !== null) handleUpdate('SUSPENDED', reason);
          }} 
          disabled={loading}
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
        >
          <AlertCircle className="w-4 h-4" /> Suspend
        </Button>
      )}
      {currentStatus === 'SUSPENDED' && (
        <Button 
          onClick={() => handleUpdate('VERIFIED', 'Suspension lifted')} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Reactivate
        </Button>
      )}
    </div>
  );
}
