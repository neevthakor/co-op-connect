import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Users, MapPin } from 'lucide-react';

export default async function AnalyticsPage() {
  const session = await auth();
  const userRole = session?.user?.role;
  if (!session?.user || !['ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'].includes(userRole || '')) {
    redirect('/login');
  }

  const cooperativeId = session.user.cooperativeId;
  const whereClause = userRole === 'COOPERATIVE_ADMIN' && cooperativeId ? { cooperativeId } : {};

  const [cityStats, stateStats, verificationStats] = await Promise.all([
    prisma.worker.groupBy({
      by: ['city'],
      _count: { city: true },
      where: whereClause,
      orderBy: { _count: { city: 'desc' } }
    }),
    prisma.worker.groupBy({
      by: ['state'],
      _count: { state: true },
      where: whereClause,
      orderBy: { _count: { state: 'desc' } }
    }),
    prisma.worker.groupBy({
      by: ['verificationStatus'],
      _count: { verificationStatus: true },
      where: whereClause,
    })
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        Geographic Workforce Analytics
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-blue-500" />
              Workforce by City
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityStats.length === 0 ? (
              <p className="text-muted-foreground">No data available.</p>
            ) : (
              <ul className="space-y-3">
                {cityStats.map(stat => (
                  <li key={stat.city || 'Unknown'} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="font-medium">{stat.city || 'Unknown City'}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">{stat._count.city} workers</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-indigo-500" />
              Workforce by State
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stateStats.length === 0 ? (
              <p className="text-muted-foreground">No data available.</p>
            ) : (
              <ul className="space-y-3">
                {stateStats.map(stat => (
                  <li key={stat.state || 'Unknown'} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="font-medium">{stat.state || 'Unknown State'}</span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-bold">{stat._count.state} workers</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-green-500" />
            Verification Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {verificationStats.map(stat => (
                <div key={stat.verificationStatus} className="p-4 border rounded-xl text-center">
                  <div className="text-2xl font-black mb-1">{stat._count.verificationStatus}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.verificationStatus}</div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
