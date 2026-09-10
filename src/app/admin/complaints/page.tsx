'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/complaints');
      if (res.ok) {
        setComplaints(await res.json());
      }
    } catch (error) {
      toast.error('Error fetching complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'RESOLVED', resolution: 'Resolved by Admin' })
      });
      if (res.ok) {
        toast.success('Complaint resolved');
        fetchComplaints();
      }
    } catch (e) {
      toast.error('Failed to resolve complaint');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Issues / Complaints</h1>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : complaints.length === 0 ? (
        <p className="text-muted-foreground">No complaints found.</p>
      ) : (
        <div className="grid gap-4">
          {complaints.map(c => (
            <Card key={c.id}>
              <CardHeader className="pb-2 flex flex-row justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">{c.type}</Badge>
                  <CardTitle className="text-base">{c.subject}</CardTitle>
                </div>
                <Badge className={c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {c.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{c.description}</p>
                <div className="text-xs text-slate-500 mb-4 flex gap-4">
                  <span>Customer: {c.customer?.user?.name || 'Unknown'}</span>
                  <span>Worker: {c.worker?.user?.name || 'Unknown'}</span>
                </div>
                {c.status !== 'RESOLVED' && (
                  <Button size="sm" onClick={() => handleResolve(c.id)}>Mark as Resolved</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
