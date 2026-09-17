import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, ShieldAlert, UserCheck, Star, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function WorkerVerificationPage({ params }: { params: Promise<{ publicId: string }> | { publicId: string } }) {
  const resolvedParams = await params;
  const worker = await prisma.worker.findUnique({
    where: { publicId: resolvedParams.publicId },
    include: {
      user: { select: { name: true, avatar: true } },
      cooperative: { select: { name: true } },
    }
  });

  if (!worker) {
    // Fallback to internal ID for development purposes if publicId isn't set yet
    const fallbackWorker = await prisma.worker.findUnique({
      where: { id: resolvedParams.publicId },
      include: {
        user: { select: { name: true, avatar: true } },
        cooperative: { select: { name: true } },
      }
    });
    if (!fallbackWorker) {
      notFound();
    }
    Object.assign(worker || {}, fallbackWorker);
  }

  // @ts-ignore (we know worker is assigned now)
  const w = worker!;

  const isVerified = w.verificationStatus === 'VERIFIED';
  const isDigiLocker = w.verificationMethod === 'DIGILOCKER';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <Card className="max-w-md w-full shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold flex flex-col items-center gap-2">
            {isVerified ? (
              <ShieldCheck className="w-16 h-16 text-green-600" />
            ) : w.verificationStatus === 'SUSPENDED' ? (
              <ShieldAlert className="w-16 h-16 text-red-600" />
            ) : (
              <AlertTriangle className="w-16 h-16 text-amber-500" />
            )}
            Co-opConnect Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">{w.user?.name || 'Worker'}</h2>
            <p className="text-muted-foreground font-medium">{w.primaryTrade || 'Professional Service Provider'}</p>
            {w.cooperative && <p className="text-xs text-muted-foreground">{w.cooperative.name}</p>}
          </div>

          <div className="bg-gray-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-bold ${isVerified ? 'text-green-700' : 'text-red-600'}`}>
                {w.verificationStatus}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-muted-foreground">Verification Method</span>
              <span className="font-medium flex items-center gap-1">
                {isDigiLocker ? <UserCheck className="w-4 h-4 text-blue-600" /> : null}
                {w.verificationMethod === 'DIGILOCKER' ? 'Identity Verified (MOCK)' : 
                 w.verificationMethod === 'ADMIN' ? 'Admin Verified' : 'Unverified'}
              </span>
            </div>
            {w.verifiedAt && (
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Verified On</span>
                <span className="font-medium">{new Date(w.verifiedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-3 text-center shadow-sm">
              <p className="text-xs text-muted-foreground">Jobs Completed</p>
              <p className="text-lg font-bold">{w.totalJobs}</p>
            </div>
            <div className="bg-white border rounded-lg p-3 text-center shadow-sm">
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="text-lg font-bold flex items-center justify-center gap-1">
                {w.averageRating.toFixed(1)} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </p>
            </div>
            <div className="bg-white border rounded-lg p-3 text-center shadow-sm">
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <p className="text-lg font-bold">{w.completionRate}%</p>
            </div>
            <div className="bg-white border rounded-lg p-3 text-center shadow-sm">
              <p className="text-xs text-muted-foreground">Punctuality</p>
              <p className="text-lg font-bold">{w.punctualityScore}%</p>
            </div>
          </div>
          
          {w.verificationStatus !== 'VERIFIED' && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-xs flex gap-2 items-start mt-4">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>This worker is currently not permitted to accept jobs on the platform.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
