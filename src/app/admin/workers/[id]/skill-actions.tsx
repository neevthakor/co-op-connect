'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SkillAssessmentActions({ workerId, skillId, currentStatus }: { workerId: string, skillId: string, currentStatus: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: string) => {
    let notes = '';
    if (status === 'REJECTED' || status === 'SKILL_ASSESSED') {
      const input = prompt(`Enter notes for ${status} (optional):`);
      if (input === null) return;
      notes = input;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workerId,
          action: 'ASSESS_SKILL',
          skillId, 
          status,
          notes 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Skill status updated to ${status}`);
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to update skill status');
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {currentStatus !== 'SKILL_ASSESSED' && (
        <Button 
          size="sm"
          onClick={() => handleUpdate('SKILL_ASSESSED')} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-2"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
        </Button>
      )}
      {currentStatus !== 'ASSESSMENT_PENDING' && currentStatus !== 'SKILL_ASSESSED' && (
        <Button 
          size="sm"
          onClick={() => handleUpdate('ASSESSMENT_PENDING')} 
          disabled={loading}
          variant="outline"
          className="text-amber-600 border-amber-200 hover:bg-amber-50 h-7 text-xs px-2"
        >
          <AlertCircle className="w-3.5 h-3.5 mr-1" /> Mark Pending
        </Button>
      )}
      {currentStatus !== 'REJECTED' && (
        <Button 
          size="sm"
          onClick={() => handleUpdate('REJECTED')} 
          disabled={loading}
          variant="destructive"
          className="h-7 text-xs px-2"
        >
          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
        </Button>
      )}
    </div>
  );
}
