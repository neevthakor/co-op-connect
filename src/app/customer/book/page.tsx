'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MatchScore } from '@/components/shared/match-score';
import { PriceEstimate } from '@/components/shared/price-estimate';
import { VoiceInput } from '@/components/shared/voice-input';
import { ArrowLeft, Check, Upload, Calendar as CalendarIcon, Clock, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function BookServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    description: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    workerId: null as string | null,
    categoryId: 'cat-ac',
    categoryName: 'AC Repair',
    estimatedPrice: 450,
    isEmergency: false,
    imageUrls: [] as string[],
  });

  useEffect(() => {
    const q = searchParams.get('query');
    if (q) {
      setBookingData((prev) => ({ ...prev, description: q }));
    }
  }, [searchParams]);

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [matchedWorkers, setMatchedWorkers] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  const stepTitles = [
    'Describe Problem',
    'AI Concierge',
    'Service Location',
    'Select Worker',
    'Schedule Time',
    'Fair Price',
    'Confirm Booking',
  ];

  const totalSteps = 7;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading photo...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload?type=public', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      
      setBookingData((prev) => ({ ...prev, imageUrls: [...(prev.imageUrls || []), uploadData.url] }));
      toast.success('Photo attached!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Photo upload failed', { id: toastId });
    } finally {
      e.target.value = ''; // reset
    }
  };

  const handleAnalyze = async () => {
    if (!bookingData.description.trim()) return toast.error('Please describe what you need');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bookingData.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI analysis failed');

      setAiAnalysis(data.analysis);
      setBookingData((prev) => ({
        ...prev,
        categoryId: data.analysis.categoryId,
        categoryName: data.analysis.category,
        isEmergency: data.analysis.urgency === 'EMERGENCY',
        estimatedPrice: data.category?.basePrice || 450,
      }));
      nextStep();
    } catch (err: any) {
      toast.error(err.message || 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchWorkers = async () => {
    if (!bookingData.address.trim()) return toast.error('Please enter an address');
    setLoading(true);

    let lat = bookingData.latitude;
    let lng = bookingData.longitude;

    if (!lat || !lng) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
          } else {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          }
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (geoError) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(bookingData.address)}&format=json&limit=1`);
          const geoData = await res.json();
          if (geoData && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          } else {
            throw new Error('Address not found');
          }
        } catch (apiError) {
          setLoading(false);
          return toast.error('Could not find location. Please enter a valid address.');
        }
      }
    }

    try {
      const res = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: bookingData.categoryId,
          urgency: bookingData.isEmergency ? 'EMERGENCY' : 'NORMAL',
          latitude: lat,
          longitude: lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Matching failed');

      const matches = Array.isArray(data) ? data : [];
      setMatchedWorkers(matches);
      if (matches.length > 0) {
        setSelectedWorker(matches[0]);
        setBookingData((prev) => ({
          ...prev,
          workerId: matches[0].worker?.id || matches[0].id,
          estimatedPrice: matches[0].estimatedPrice || prev.estimatedPrice,
          latitude: lat,
          longitude: lng,
        }));
      } else {
        setBookingData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      }
      nextStep();
    } catch (err: any) {
      toast.error(err.message || 'Failed to match workers');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!bookingData.workerId || !bookingData.date || !bookingData.time) {
      return toast.error('Please complete all booking steps');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: bookingData.workerId,
          categoryId: bookingData.categoryId,
          description: bookingData.description,
          scheduledDate: bookingData.date,
          scheduledTime: bookingData.time,
          estimatedPrice: bookingData.estimatedPrice,
          address: bookingData.address,
          latitude: bookingData.latitude,
          longitude: bookingData.longitude,
          isEmergency: bookingData.isEmergency,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Booking failed');
      }

      toast.success(`Booking Confirmed! Security PIN: ${data.booking.servicePin}`);
      router.push(`/customer/bookings/${data.booking.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-28 md:p-8 max-w-2xl mx-auto w-full min-h-[calc(100vh-4rem)]">
      <header className="flex items-center gap-4 mb-2">
        {step > 1 && (
          <Button variant="ghost" size="icon" onClick={prevStep} className="shrink-0 h-10 w-10 rounded-xl hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Step {step} of {totalSteps}: <span className="text-primary">{stepTitles[step - 1]}</span>
            </span>
            <span className="text-primary font-bold">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold">What do you need help with?</h1>
            <p className="text-muted-foreground">Describe your problem in detail, or use voice input in English, Hindi, or Gujarati.</p>

            <div className="relative">
              <Textarea
                value={bookingData.description}
                onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                placeholder="E.g., My AC cooling is very low and making a strange buzzing sound. Need urgent checkup..."
                className="min-h-[150px] text-base p-4"
              />
              <div className="absolute right-4 bottom-4">
                <VoiceInput onTranscription={(text) => setBookingData({ ...bookingData, description: text })} />
              </div>
            </div>

            <input type="file" accept="image/*" id="booking-photo" className="hidden" onChange={handlePhotoUpload} />
            <Button
              variant="outline"
              className="w-full gap-2 h-12 border-dashed"
              onClick={() => document.getElementById('booking-photo')?.click()}
            >
              <Upload className="h-4 w-4" />
              Attach Photos {bookingData.imageUrls?.length > 0 ? `(${bookingData.imageUrls.length})` : '(Optional)'}
            </Button>

            <Button className="w-full h-12 mt-8" onClick={handleAnalyze} disabled={loading || !bookingData.description}>
              {loading ? 'Analyzing with AI Concierge...' : 'Next: AI Analysis'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">AI Concierge Analysis</h1>
            </div>

            {aiAnalysis && (
              <Card className="border-primary/30 bg-card shadow-md shadow-primary/5">
                <CardContent className="p-5 md:p-6 space-y-4">
                  {['EMERGENCY', 'MEDICAL_EMERGENCY'].includes(aiAnalysis.intent) && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4">
                      <p className="font-bold text-lg mb-2">Emergency Detected</p>
                      <p>This sounds like an emergency. Co-opConnect's home-service workers are not emergency responders. Please contact the appropriate emergency service.</p>
                    </div>
                  )}

                  {aiAnalysis.intent === 'OUT_OF_SCOPE' && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg p-4">
                      <p className="font-bold text-lg mb-2">Service Not Available</p>
                      <p>This request isn't a service currently supported by Co-opConnect. We currently support household skilled trades like plumbing, electrical, and AC repair.</p>
                    </div>
                  )}

                  {aiAnalysis.intent === 'CLARIFICATION_REQUIRED' && (
                    <div className="bg-primary/10 border border-primary/20 text-primary-foreground rounded-lg p-4">
                      <p className="font-bold text-lg mb-2 text-primary">Clarification Required</p>
                      <p className="text-foreground mb-4">We are not quite sure what specific service you need. Could you please answer the following to help us:</p>
                      <ul className="list-disc pl-5 text-foreground space-y-1">
                        {aiAnalysis.clarificationQuestions?.map((q: string, i: number) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                      <Button className="mt-4" onClick={prevStep} variant="outline">Modify Request</Button>
                    </div>
                  )}

                  {aiAnalysis.intent === 'SERVICE_REQUEST' && aiAnalysis.categoryId && (
                    <>
                      <p className="text-muted-foreground mb-4">Our cooperative AI parsed your requirements:</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Category</p>
                          <p className="text-lg font-bold text-primary">{aiAnalysis.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Urgency</p>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            aiAnalysis.urgency === 'URGENT' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {aiAnalysis.urgency}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Est. Duration</p>
                          <p className="font-semibold text-foreground">{aiAnalysis.estimatedDuration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Base Rate</p>
                          <p className="font-semibold text-foreground">₹{bookingData.estimatedPrice}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Required Tools for Technician</p>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.toolsNeeded?.map((t: string) => (
                            <span key={t} className="bg-secondary border border-border px-2.5 py-1 rounded-md text-xs font-medium text-foreground">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {aiAnalysis?.intent === 'SERVICE_REQUEST' && aiAnalysis?.categoryId && (
              <Button className="w-full h-12 mt-8" onClick={nextStep}>
                Looks Good, Proceed to Location
              </Button>
            )}
            {aiAnalysis?.intent !== 'SERVICE_REQUEST' && (
              <Button variant="outline" className="w-full h-12 mt-8" onClick={prevStep}>
                Go Back
              </Button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold">Where is the service needed?</h1>
            <p className="text-muted-foreground">Confirm your service address.</p>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={bookingData.address}
                onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                placeholder="Full address (e.g., Flat 402, Vastrapur, Ahmedabad)"
                className="pl-10 h-12 text-base"
              />
            </div>
            
            <Button
              variant="outline"
              className="w-full h-12 gap-2"
              onClick={async () => {
                try {
                  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                  });
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                  const data = await res.json();
                  if (data && data.display_name) {
                    setBookingData({ ...bookingData, address: data.display_name, latitude: lat, longitude: lng });
                    toast.success("Location updated!");
                  } else {
                    setBookingData({ ...bookingData, latitude: lat, longitude: lng });
                    toast.error("Got location but couldn't reverse geocode address.");
                  }
                } catch (e) {
                  toast.error("Could not get your location");
                }
              }}
            >
              <MapPin className="h-4 w-4" /> Use My Location
            </Button>

            <Button className="w-full h-12 mt-8" onClick={handleMatchWorkers} disabled={loading || !bookingData.address}>
              {loading ? 'Finding Verified Cooperative Workers...' : 'Find Verified Workers'}
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold">Top Matched Workers</h1>
            <p className="text-muted-foreground">
              FairMatch composite scoring based on skills, punctuality, distance & fairness.
            </p>

            <div className="flex flex-col gap-4">
              {matchedWorkers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No available workers found for this criteria.</div>
              ) : (
                matchedWorkers.map((match) => {
                  const workerObj = match.worker || match;
                  const userObj = workerObj.user || {};
                  const isSelected = bookingData.workerId === workerObj.id;

                  return (
                    <Card
                      key={workerObj.id}
                      className={`cursor-pointer transition-all bg-card ${
                        isSelected ? 'border-primary ring-2 ring-primary/30 bg-primary/10' : 'border-border/80 hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedWorker(match);
                        setBookingData({
                          ...bookingData,
                          workerId: workerObj.id,
                          estimatedPrice: match.estimatedPrice || bookingData.estimatedPrice,
                        });
                        nextStep();
                      }}
                    >
                      <CardContent className="p-4 flex gap-4 items-center">
                        <div className="w-14 h-14 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                          {userObj.name?.[0] || 'W'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-base flex items-center gap-1.5">
                                {userObj.name || 'Cooperative Worker'}
                                <ShieldCheck className="h-4 w-4 text-primary" />
                              </h3>
                              <p className="text-xs text-muted-foreground">{workerObj.primaryTrade || 'Technician'} • {workerObj.experience ? `${workerObj.experience} yrs exp` : 'Verified Member'}</p>
                            </div>
                            <span className="font-bold text-primary">₹{match.estimatedPrice || bookingData.estimatedPrice || 450}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{workerObj.averageRating > 0 ? `⭐ ${workerObj.averageRating.toFixed(1)}` : '⭐ New'}</span>
                            <span>•</span>
                            <span>{match.distanceKm !== undefined ? `${match.distanceKm} km away` : 'Nearby'}</span>
                            <span>•</span>
                            <span>{workerObj.totalJobs || 0} jobs</span>
                          </div>
                          <div className="mt-2">
                            <MatchScore
                              score={match.compositeScore || match.match_score || 90}
                              reasons={[
                                workerObj.punctualityScore ? `Punctuality: ${workerObj.punctualityScore}%` : `Cooperative FairMatch`,
                                `Fair wage certified`,
                              ]}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold">Schedule Appointment</h1>
            <p className="text-muted-foreground">Choose your preferred date and time slot.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="pl-9 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    placeholder="e.g. 11:00 AM"
                    className="pl-9 h-12"
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full h-12 mt-8"
              onClick={nextStep}
              disabled={!bookingData.date || !bookingData.time}
            >
              Continue to Price Breakdown
            </Button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold">Transparent Price Breakdown</h1>
            <PriceEstimate
              basePrice={bookingData.estimatedPrice}
              taxes={Math.round(bookingData.estimatedPrice * 0.05)}
              platformFee={Math.round(bookingData.estimatedPrice * 0.05)}
              total={Math.round(bookingData.estimatedPrice * 1.1)}
            />
            <div className="bg-secondary/50 p-4 rounded-xl text-xs space-y-1.5 text-muted-foreground border border-border/80">
              <p className="font-bold text-foreground">Cooperative Guarantee:</p>
              <p>• 100% transparent fee structure (5% cooperative fund, 2% worker welfare fund, 5% GST).</p>
              <p>• 30-day service warranty activated automatically upon job completion.</p>
              <p>• Secure 4-digit PIN verification before work begins.</p>
            </div>
            <Button className="w-full h-12 mt-8" onClick={nextStep}>
              Review & Confirm
            </Button>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold">Review Booking Details</h1>

            <Card className="bg-card border-border/80">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Service Request</p>
                  <p className="font-bold text-base mt-1 text-foreground">{bookingData.categoryName}</p>
                  <p className="text-sm text-muted-foreground">{bookingData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Date & Time</p>
                    <p className="font-medium mt-1">{bookingData.date} at {bookingData.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Address</p>
                    <p className="font-medium mt-1">{bookingData.address}</p>
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Estimated Total</p>
                    <p className="text-2xl font-black text-primary">₹{Math.round(bookingData.estimatedPrice * 1.1)}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Includes GST & 30-day warranty
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full h-14 text-lg mt-8 gap-2 font-bold"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Confirming with Cooperative...' : (
                <>
                  CONFIRM BOOKING <Check className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground min-h-[60vh] flex items-center justify-center">Loading booking service...</div>}>
      <BookServiceContent />
    </Suspense>
  );
}

