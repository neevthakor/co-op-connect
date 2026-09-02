import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldCheck, Clock, CheckCircle2, AlertTriangle, AlertCircle, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) redirect('/login');

  const [
    totalCustomers,
    totalWorkers,
    pendingWorkers,
    verifiedWorkers,
    activeBookings,
    completedBookings,
    openComplaints
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.worker.count(),
    prisma.worker.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.worker.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.booking.count({ where: { status: { in: ['REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'] } } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.complaint.count({ where: { status: 'OPEN' } }),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers + totalWorkers}</div>
            <p className="text-xs text-gray-500 mt-1">{totalCustomers} Customers, {totalWorkers} Workers</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Pending Verification</CardTitle>
            <Clock className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{pendingWorkers}</div>
            <p className="text-xs text-orange-600/80 mt-1">Workers awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Verified Workers</CardTitle>
            <ShieldCheck className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedWorkers}</div>
            <p className="text-xs text-gray-500 mt-1">Active professionals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Bookings</CardTitle>
            <Activity className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-gray-500 mt-1">{completedBookings} completed historically</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingWorkers > 0 && (
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-orange-900">{pendingWorkers} Workers Awaiting Verification</h3>
                    <p className="text-sm text-orange-700">Review and approve new worker registrations.</p>
                  </div>
                </div>
                <Link href="/admin/workers" className="px-4 py-2 bg-white text-orange-600 border border-orange-200 rounded-lg text-sm font-semibold hover:bg-orange-100">
                  Review
                </Link>
              </div>
            )}
            
            {openComplaints > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-900">{openComplaints} Open Complaints</h3>
                    <p className="text-sm text-red-700">Requires admin mediation.</p>
                  </div>
                </div>
                <Link href="/admin/complaints" className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100">
                  Resolve
                </Link>
              </div>
            )}

            {pendingWorkers === 0 && openComplaints === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <p className="font-semibold text-gray-700">All caught up!</p>
                <p className="text-sm text-gray-500">No pending actions required.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

