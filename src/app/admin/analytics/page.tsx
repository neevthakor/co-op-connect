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

  const [cityAvailabilityStats, stateStats, verificationStats] = await Promise.all([
    prisma.worker.groupBy({
      by: ['city', 'availabilityStatus'],
      _count: { _all: true },
      where: whereClause,
    }),
    prisma.worker.groupBy({
      by: ['state'],
      _count: { _all: true },
      where: whereClause,
      orderBy: { _count: { state: 'desc' } }
    }),
    prisma.worker.groupBy({
      by: ['verificationStatus'],
      _count: { _all: true },
      where: whereClause,
    })
  ]);

  const cityMap = new Map<string, { total: number, available: number, busy: number, offline: number }>();
  for (const stat of cityAvailabilityStats) {
    const city = stat.city || 'Unspecified';
    if (!cityMap.has(city)) cityMap.set(city, { total: 0, available: 0, busy: 0, offline: 0 });
    const data = cityMap.get(city)!;
    data.total += stat._count._all;
    if (stat.availabilityStatus === 'AVAILABLE') data.available += stat._count._all;
    else if (stat.availabilityStatus === 'BUSY') data.busy += stat._count._all;
    else if (stat.availabilityStatus === 'OFFLINE') data.offline += stat._count._all;
  }
  
  const cityData = Array.from(cityMap.entries()).map(([city, data]) => ({ city, ...data })).sort((a, b) => b.total - a.total);

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
            {cityData.length === 0 ? (
              <p className="text-muted-foreground">No data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 rounded-tl-lg">City</th>
                      <th className="px-4 py-2 text-center">Total</th>
                      <th className="px-4 py-2 text-center text-green-600">Available</th>
                      <th className="px-4 py-2 text-center text-amber-600">Busy</th>
                      <th className="px-4 py-2 text-center text-gray-400 rounded-tr-lg">Offline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityData.map(stat => (
                      <tr key={stat.city} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">{stat.city}</td>
                        <td className="px-4 py-3 text-center font-bold">{stat.total}</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-600">{stat.available > 0 ? stat.available : '-'}</td>
                        <td className="px-4 py-3 text-center font-semibold text-amber-600">{stat.busy > 0 ? stat.busy : '-'}</td>
                        <td className="px-4 py-3 text-center font-medium text-gray-400">{stat.offline > 0 ? stat.offline : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-bold">{stat._count._all} workers</span>
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
                  <div className="text-2xl font-black mb-1">{stat._count._all}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.verificationStatus}</div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
