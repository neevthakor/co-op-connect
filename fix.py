import codecs
def w(path, content):
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)

w('src/app/api/admin/workers/[id]/route.ts', '''import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/services/notification';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const workerId = resolvedParams.id;
    const body = await req.json();
    const { status, reason } = body;

    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'MORE_INFO_REQUIRED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { user: true }
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: { verificationStatus: status }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_WORKER_VERIFICATION',
        entityType: 'WORKER',
        entityId: workerId,
        details: JSON.stringify({ oldStatus: worker.verificationStatus, newStatus: status, reason })
      }
    });

    let title = 'Verification Update';
    let msg = \Your profile verification status has been updated to \.\;
    if (status === 'VERIFIED') {
      title = 'Profile Verified!';
      msg = 'Congratulations! Your profile has been verified and you can now receive jobs.';
    } else if (status === 'REJECTED') {
      title = 'Profile Rejected';
      msg = \Your profile application was rejected. Reason: \\;
    }

    await sendNotification(worker.user.id, 'WORKER', title, msg, { workerId, status });

    return NextResponse.json({ success: true, worker: updatedWorker });
  } catch (error: any) {
    console.error('Admin Worker Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
''')

w('src/app/admin/workers/page.tsx', '''import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AdminWorkersPage({ searchParams }: { searchParams: Promise<{ status?: string }> | { status?: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  const resolvedParams = await Promise.resolve(searchParams);
  const statusFilter = resolvedParams.status || 'PENDING';

  const workers = await prisma.worker.findMany({
    where: statusFilter !== 'ALL' ? { verificationStatus: statusFilter } : {},
    include: {
      user: { select: { name: true, email: true, phone: true } },
      cooperative: { select: { name: true } }
    },
    orderBy: { joinedAt: 'desc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worker Verification</h1>
          <p className="text-gray-500 text-sm">Review and manage worker accounts.</p>
        </div>
        <div className="flex gap-2">
          <Link href="?status=PENDING" className={\px-4 py-2 rounded-lg text-sm font-semibold \\}>Pending</Link>
          <Link href="?status=VERIFIED" className={\px-4 py-2 rounded-lg text-sm font-semibold \\}>Verified</Link>
          <Link href="?status=ALL" className={\px-4 py-2 rounded-lg text-sm font-semibold \\}>All</Link>
        </div>
      </div>

      <div className="grid gap-4">
        {workers.length === 0 ? (
          <div className="p-8 text-center bg-white border rounded-xl">
            <p className="text-gray-500">No workers found with status {statusFilter}.</p>
          </div>
        ) : (
          workers.map(w => (
            <Card key={w.id}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{w.user.name}</h3>
                    <Badge variant="outline" className={
                      w.verificationStatus === 'VERIFIED' ? "text-green-600 border-green-600" :
                      w.verificationStatus === 'PENDING' ? "text-orange-600 border-orange-600" :
                      "text-red-600 border-red-600"
                    }>
                      {w.verificationStatus}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{w.user.email} • {w.user.phone}</p>
                    <p>Trade: {w.primaryTrade || 'Not specified'} • {w.cooperative?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link href={\/admin/workers/\\} className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
                    Review Profile
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
''')

w('src/app/admin/workers/[id]/actions.tsx', '''"use client";

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
      const res = await fetch(\/api/admin/workers/\\, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to update status');
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
''')
