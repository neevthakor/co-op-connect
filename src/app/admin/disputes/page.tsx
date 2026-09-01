import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { AlertCircle, BrainCircuit, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DisputesPage() {
  const complaints = await prisma.complaint.findMany({
    include: {
      booking: {
        include: {
          customer: { include: { user: true } },
          worker: { include: { user: true } },
          category: true,
        },
      },
      customer: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Dispute Resolution & Complaints</h1>
        <p className="text-sm text-gray-500">Neutral cooperative dispute mediation, complaint resolution, and rework tracking</p>
      </div>

      {complaints.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-gray-800">No open disputes</p>
          <p className="text-xs text-gray-400 mt-1">All customer complaints and rework requests have been resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="p-5 border rounded-xl bg-white shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-semibold">{c.category.replace(/_/g, ' ')}</Badge>
                    <span className="font-mono text-xs text-gray-400">#{c.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Customer: <strong className="text-gray-800">{c.customer.user.name}</strong> • 
                    Worker: <strong className="text-gray-800">{c.booking.worker?.user?.name || 'Unassigned'}</strong> • 
                    Filed on {formatDate(c.createdAt)}
                  </p>
                </div>
                <Badge className={
                  c.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                  c.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }>
                  {c.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border">
                "{c.description}"
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button size="sm" variant="default" className="bg-primary text-white text-xs gap-1">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  AI Dispute Assistant
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Inspect Evidence Photos
                </Button>
                <Button size="sm" variant="outline" className="text-xs text-green-700 hover:bg-green-50">
                  Resolve & Issue Warranty
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
