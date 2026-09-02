import { auth } from '@/lib/auth';
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
          <Link href="?status=PENDING" className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusFilter === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-white border text-gray-600'}`}>Pending</Link>
          <Link href="?status=VERIFIED" className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusFilter === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-white border text-gray-600'}`}>Verified</Link>
          <Link href="?status=ALL" className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusFilter === 'ALL' ? 'bg-blue-100 text-blue-700' : 'bg-white border text-gray-600'}`}>All</Link>
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
                  <Link href={`/admin/workers/${w.id}`} className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
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
