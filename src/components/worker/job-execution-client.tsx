'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProofGallery } from '@/components/shared/proof-gallery';
import { MaterialApproval } from '@/components/shared/material-approval';
import { InvoiceView } from '@/components/shared/invoice-view';
import {
  Navigation,
  MapPin,
  KeyRound,
  Camera,
  PlusCircle,
  Users,
  CheckCircle2,
  Phone,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { LiveMap } from '@/components/shared/live-map';
import { useWorkerLocationSync } from '@/hooks/use-worker-location-sync';
import { toast } from 'sonner';

export function JobExecutionClient({ initialJob }: { initialJob: any }) {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(initialJob);
  const [actionLoading, setActionLoading] = useState(false);

  // Live Location Sync
  const isTrackingActive = job && ['ACCEPTED', 'TRAVELLING', 'IN_PROGRESS'].includes(job.status);
  useWorkerLocationSync(job?.workerId, isTrackingActive);

  // Modal / Input states
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Material state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [matItem, setMatItem] = useState('');
  const [matQty, setMatQty] = useState('1');
  const [matPrice, setMatPrice] = useState('');

  // Helper state
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [availableHelpers, setAvailableHelpers] = useState<any[]>([]);
  const [helperLoading, setHelperLoading] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`);
      if (!res.ok) throw new Error('Job not found');
      const data = await res.json();
      setJob(data);
    } catch (err) {
      toast.error('Failed to load job details');
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchJob();
    
    // Subscribe to realtime updates for this specific booking
    let channelInstance: any = null;
    import('@/lib/supabase').then(({ supabase }) => {
      if (cancelled) return;
      channelInstance = supabase
        .channel(`worker-booking-${params.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'Booking', filter: `id=eq.${params.id}` },
          () => {
            if (!cancelled) {
              console.log('Realtime update received for job, refetching...');
              fetchJob();
            }
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channelInstance) {
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.removeChannel(channelInstance);
        });
      }
    };
  }, [params.id]);

  const updateStatus = async (status: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      toast.success(`Job updated to ${status}`);
      if (data.booking) {
        setJob((prev: any) => ({ ...prev, ...data.booking }));
      } else {
        await fetchJob();
      }
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return toast.error('Please enter the customer PIN');
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid PIN');

      toast.success('PIN Verified! Job is now IN_PROGRESS.');
      setShowPinModal(false);
      if (data.booking) {
        setJob((prev: any) => ({ ...prev, ...data.booking }));
      } else {
        await fetchJob();
      }
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'PIN verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadClick = (type: 'BEFORE' | 'AFTER') => {
    const el = document.getElementById(`${type.toLowerCase()}-photo`) as HTMLInputElement;
    if (el) el.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'BEFORE' | 'AFTER') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload?type=public', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      
      const res = await fetch(`/api/bookings/${params.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          imageUrl: uploadData.url,
          caption: `${type} servicing inspection photo by technician`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Photo DB save failed');

      toast.success(`${type} photo uploaded successfully`);
      await fetchJob();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Photo upload failed');
    } finally {
      setActionLoading(false);
      e.target.value = ''; // reset input
    }
  };

  const handleRequestMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matItem || !matPrice) return toast.error('Item name and price are required');
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: matItem,
          quantity: parseInt(matQty) || 1,
          unitPrice: parseFloat(matPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Material request failed');

      toast.success('Material request sent to customer for approval');
      setShowMaterialModal(false);
      setMatItem('');
      setMatPrice('');
      await fetchJob();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Material request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const loadHelpers = async () => {
    setShowHelperModal(true);
    setHelperLoading(true);
    try {
      // Use booking's latitude/longitude if available, otherwise fallback, but require something
      const lat = job.latitude || 23.0225;
      const lng = job.longitude || 72.5714;
      const res = await fetch(`/api/matching/helpers?bookingId=${params.id}&latitude=${lat}&longitude=${lng}`);
      const data = await res.json();
      setAvailableHelpers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to search helpers');
    } finally {
      setHelperLoading(false);
    }
  };

  const handleRequestHelper = async (helperId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_HELPER',
          bookingId: params.id,
          helperId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Helper request failed');

      toast.success('Helper request dispatched (70% Lead / 30% Helper revenue split)');
      setShowHelperModal(false);
      await fetchJob();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Unknown error") || 'Helper request failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Removed loading check
  if (!job) {
    return (
      <div className="p-8 text-center text-destructive">
        Job not found.
      </div>
    );
  }

  const beforePhotos = job.jobProofs?.filter((p: any) => p.type === 'BEFORE') || [];
  const afterPhotos = job.jobProofs?.filter((p: any) => p.type === 'AFTER') || [];

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Job Console #{job.id.slice(0, 8)}</h1>
            <Badge className="bg-primary/10 text-primary font-bold">{job.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {job.category?.name} • Customer: {job.customer?.user?.name || 'Customer'} 
            {job.status !== 'REQUESTED' && ` (${job.customer?.user?.phone || '+91 98765 43210'})`}
          </p>
        </div>
        {job.status !== 'REQUESTED' && (
          <a href={`tel:${job.customer?.user?.phone || '+919876543210'}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Phone className="h-4 w-4" /> Call Customer
            </Button>
          </a>
        )}
      </header>

      {/* Address & Service Details */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Service Location</p>
              <p className="font-medium text-sm text-foreground">{job.address || 'Vastrapur, Ahmedabad, Gujarat'}</p>
            </div>
          </div>
          
          {(job.latitude && job.longitude) && (
            <div className="mt-2">
              <LiveMap 
                height="150px"
                center={[job.latitude, job.longitude]}
                markers={[
                  {
                    lat: job.latitude,
                    lng: job.longitude,
                    label: "Customer Location",
                  }
                ]}
              />
              <div className="mt-2">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`}
                  target="_blank" 
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Navigation className="h-4 w-4" /> Get Directions
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div className="pt-3 border-t grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground font-semibold">Scheduled Date & Time</p>
              <p className="font-medium text-foreground mt-0.5">
                {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime || '10:00 AM'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Estimated Payout</p>
              <p className="font-bold text-primary text-sm mt-0.5">₹{job.estimatedPrice || 450}</p>
            </div>
          </div>
          <div className="pt-3 border-t text-xs">
            <p className="text-muted-foreground font-semibold">Customer Problem Description</p>
            <p className="mt-1 bg-muted/40 p-2.5 rounded text-foreground">{job.description || 'General maintenance'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Primary Action Button Based on State Machine */}
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          {job.status === 'REQUESTED' && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">New Incoming Job Request</h3>
              <p className="text-xs text-muted-foreground">Accept this job to confirm dispatch to the customer location.</p>
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-14 text-base font-bold text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                  onClick={() => updateStatus('CANCELLED', 'Worker declined the job request')}
                  disabled={actionLoading}
                >
                  DECLINE
                </Button>
                <Button
                  size="lg"
                  className="flex-[2] h-14 text-base font-bold gap-2"
                  onClick={() => updateStatus('ACCEPTED')}
                  disabled={actionLoading}
                >
                  ACCEPT JOB <CheckCircle2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {job.status === 'ACCEPTED' && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Job Accepted</h3>
              <p className="text-xs text-muted-foreground">Start travelling to notify the customer that you are en route.</p>
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold gap-2"
                onClick={() => updateStatus('TRAVELLING')}
                disabled={actionLoading}
              >
                <Navigation className="h-5 w-5" /> START TRAVELLING / NAVIGATE
              </Button>
            </div>
          )}

          {job.status === 'TRAVELLING' && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">En Route to Customer</h3>
              <p className="text-xs text-muted-foreground">Click below once you have arrived at the customer doorstep.</p>
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold gap-2"
                onClick={() => updateStatus('ARRIVED')}
                disabled={actionLoading}
              >
                <MapPin className="h-5 w-5" /> MARK ARRIVED ON SITE
              </Button>
            </div>
          )}

          {job.status === 'ARRIVED' && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Arrived at Customer Doorstep</h3>
              <p className="text-xs text-muted-foreground">
                Ask the customer for their 4-digit Security PIN to verify your arrival and begin work.
              </p>
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold gap-2"
                onClick={() => setShowPinModal(true)}
                disabled={actionLoading}
              >
                <KeyRound className="h-5 w-5" /> ENTER 4-DIGIT CUSTOMER PIN
              </Button>
            </div>
          )}

          {job.status === 'IN_PROGRESS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
                <ShieldCheck className="h-5 w-5" /> PIN Verified • Service In Progress
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-11"
                  onClick={() => setShowMaterialModal(true)}
                  disabled={actionLoading}
                >
                  <PlusCircle className="h-4 w-4" /> Request Material
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-11"
                  onClick={loadHelpers}
                  disabled={actionLoading}
                >
                  <Users className="h-4 w-4" /> Need Helper (Team)
                </Button>

                <input type="file" accept="image/*" id="after-photo" className="hidden" onChange={(e) => handleFileSelect(e, 'AFTER')} />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-11"
                  onClick={() => handleUploadClick('AFTER')}
                  disabled={actionLoading}
                >
                  <Camera className="h-4 w-4" /> After Photo ({afterPhotos.length})
                </Button>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-base font-bold gap-2 bg-green-600 hover:bg-green-700 text-white mt-4"
                onClick={() => updateStatus('COMPLETED')}
                disabled={actionLoading}
              >
                COMPLETE JOB & ISSUE INVOICE <CheckCircle2 className="h-5 w-5" />
              </Button>
            </div>
          )}

          {job.status === 'COMPLETED' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" /> Service Completed Successfully!
              </div>
              <p className="text-xs text-muted-foreground">
                Digital tax invoice generated. Net earnings will be credited upon customer payment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team / Helper info if active */}
      {job.team && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Active Job Team (Split Revenue)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {job.team.members?.map((member: any) => (
              <div key={member.id} className="flex justify-between items-center text-xs p-2 bg-muted/40 rounded">
                <div>
                  <span className="font-bold">{member.worker?.user?.name || 'Worker'}</span>
                  <span className="text-muted-foreground ml-1.5">({member.role})</span>
                </div>
                <Badge variant="outline">{member.revenueShare}% Share</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      {job.materialRequests && job.materialRequests.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-bold text-sm text-foreground">Requested Materials / Spare Parts</h3>
          <div className="flex flex-col gap-2">
            {job.materialRequests.map((mat: any) => (
              <MaterialApproval key={mat.id} material={mat} bookingId={job.id} readOnly={true} />
            ))}
          </div>
        </section>
      )}

      {/* Job Proofs */}
      {job.jobProofs && job.jobProofs.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-bold text-sm text-foreground">Uploaded Proof Photos</h3>
          <ProofGallery proofs={job.jobProofs} />
        </section>
      )}

      {/* Invoice & Payout on completion */}
      {job.status === 'COMPLETED' && job.invoice && (
        <section className="space-y-3">
          <h3 className="font-bold text-sm text-foreground">Generated Invoice & Payout Breakdown</h3>
          <InvoiceView invoice={job.invoice} />
        </section>
      )}

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> Enter Customer PIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  The customer has a 4-digit PIN on their booking screen. Enter it below to begin:
                </p>
                <Input
                  type="text"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="e.g. 4827"
                  className="text-center text-2xl tracking-widest font-mono font-bold h-14"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 font-bold"
                    disabled={actionLoading || pinInput.length < 4}
                  >
                    {actionLoading ? 'Verifying...' : 'Verify PIN'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Material Request Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" /> Request Spare Part Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestMaterial} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Part / Item Name</label>
                  <Input
                    value={matItem}
                    onChange={(e) => setMatItem(e.target.value)}
                    placeholder="e.g. AC Capacitor 45uF / Gas Refill 1kg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block mb-1">Quantity</label>
                    <Input
                      type="number"
                      min={1}
                      value={matQty}
                      onChange={(e) => setMatQty(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Unit Price (₹)</label>
                    <Input
                      type="number"
                      value={matPrice}
                      onChange={(e) => setMatPrice(e.target.value)}
                      placeholder="e.g. 350"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Total: ₹{(parseInt(matQty) || 1) * (parseFloat(matPrice) || 0)}. Sent to customer phone for instant approval.
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowMaterialModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 font-bold"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Sending...' : 'Request Approval'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Helper Matching Modal */}
      {showHelperModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card max-h-[80vh] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Request Cooperative Helper
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              <p className="text-xs text-muted-foreground">
                Helper receives 30% of labour revenue; you retain 70% as lead technician.
              </p>

              {helperLoading ? (
                <p className="text-center py-6 text-muted-foreground text-xs">Finding available nearby helpers...</p>
              ) : availableHelpers.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground text-xs">No active helpers nearby at this moment.</p>
              ) : (
                availableHelpers.map((match: any) => {
                  const helperObj = match.helper || match;
                  const userObj = helperObj.user || {};
                  return (
                    <div
                      key={helperObj.id}
                      className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/40 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{userObj.name || 'Helper Technician'}</p>
                        <p className="text-muted-foreground">{helperObj.primaryTrade || 'Apprentice'} • {match.distanceKm || 1.5} km away</p>
                        <p className="text-primary font-semibold mt-0.5">Match Score: {match.matchScore || 92}%</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRequestHelper(helperObj.id)}
                        disabled={actionLoading}
                      >
                        Request Helper
                      </Button>
                    </div>
                  );
                })
              )}

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setShowHelperModal(false)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

