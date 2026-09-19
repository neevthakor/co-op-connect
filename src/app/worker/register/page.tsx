'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wrench, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';

import { INDIA_STATES, INDIA_UNION_TERRITORIES, INDIA_CITIES } from '@/lib/locations/india';

const LEARNING_METHODS = [
  'ITI / Vocational training',
  'Government training program',
  'Private training institute',
  'Apprenticeship',
  'Learned from family / experienced worker',
  'Self-taught',
  'Other'
];

interface Question {
  id: string;
  question: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [services, setServices] = useState<{name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'WORKER',
    photo: null as File | null,
    primaryTrade: '',
    experience: '',
    address: '',
    city: '',
    state: '',
    latitude: null as number | null,
    longitude: null as number | null,
    learningMethod: '',
    trainingInstitute: '',
    learningDetails: '',
    isEmergencyAvailable: false,
    declarationAccepted: false,
    verificationAnswers: {} as Record<string, string>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [locationMsg, setLocationMsg] = useState('');

  const [servicesError, setServicesError] = useState('');

  const fetchServices = () => {
    setServicesError('');
    fetch('/api/services')
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data.filter((s: any) => !s.isEmergency));
        } else {
          throw new Error('Unexpected response format');
        }
      })
      .catch(err => {
        console.error("Failed to load services:", err);
        setServicesError('Could not load service list. Please check your connection and try again.');
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.primaryTrade) {
      fetch(`/api/workers/questions?trade=${encodeURIComponent(formData.primaryTrade)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setQuestions(data);
          }
        })
        .catch(err => console.error("Failed to load questions:", err));
    } else {
      setQuestions([]);
    }
  }, [formData.primaryTrade]);

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setLocationMsg('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationMsg('Location successfully obtained!');
        setLocationLoading(false);
      },
      (error) => {
        setLocationMsg('Failed to get location. Please manually select City and State.');
        setLocationLoading(false);
      }
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full legal name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    const phoneClean = formData.phone.replace(/\s+/g, '');
    if (!/^(\+91)?[6-9]\d{9}$/.test(phoneClean)) {
      newErrors.phone = 'Valid 10-digit Indian phone number required';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.photo) {
      newErrors.photo = 'Profile photo is required';
    } else if (formData.photo.size > 5 * 1024 * 1024) {
      newErrors.photo = 'Photo size must be less than 5MB';
    } else if (!formData.photo.type.startsWith('image/')) {
      newErrors.photo = 'File must be an image';
    }

    if (!formData.primaryTrade) {
      newErrors.primaryTrade = 'Primary trade is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.learningMethod) {
      newErrors.learningMethod = 'Please specify how you learned this skill';
    }
    
    questions.forEach(q => {
      if (!formData.verificationAnswers[q.id]?.trim()) {
        newErrors[`q_${q.id}`] = 'Please answer this verification question';
      }
    });

    if (!formData.declarationAccepted) {
      newErrors.declaration = 'You must accept the accuracy declaration';
    }
    
    setErrors(newErrors);
    
    // Focus the first error
    if (Object.keys(newErrors).length > 0) {
      const firstError = document.getElementById(`error_${Object.keys(newErrors)[0]}`);
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      
      const jsonData = { ...formData };
      // Remove File object from json
      delete (jsonData as any).photo;
      submitData.append('data', JSON.stringify(jsonData));
      
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      const res = await fetch('/api/workers/register', {
        method: 'POST',
        body: submitData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push('/login?registered=true');
    } catch (err) {
      setServerError((err instanceof Error ? err.message : "Unknown error") || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-2xl mx-auto w-full min-h-[calc(100vh-4rem)]">
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Join Cooperative Connect</h1>
        <p className="text-xs text-muted-foreground">
          Join Gujarat's leading worker-owned service cooperative. Fair wages, 0% middleman fees & social security.
        </p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> Worker & Helper Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {serverError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-medium">
                {serverError}
              </div>
            )}
          
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Personal Information</h3>
              
              <div>
                <label className="font-medium block mb-1">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.role === 'WORKER' ? 'default' : 'outline'}
                    className="h-10 text-xs font-semibold"
                    onClick={() => setFormData({ ...formData, role: 'WORKER' })}
                  >
                    Lead Technician (70% Split)
                  </Button>
                  <Button
                    type="button"
                    variant={formData.role === 'HELPER' ? 'default' : 'outline'}
                    className="h-10 text-xs font-semibold"
                    onClick={() => setFormData({ ...formData, role: 'HELPER' })}
                  >
                    Apprentice / Helper (30% Split)
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1 text-foreground">Full Legal Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g. Ramesh Patel"
                  className={errors.name ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.name && <p id="error_name" className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium block mb-1 text-foreground">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="name@example.com"
                    className={errors.email ? 'border-destructive' : ''}
                    disabled={loading}
                  />
                  {errors.email && <p id="error_email" className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="font-medium block mb-1 text-foreground">Phone Number *</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="+91 98765 43210"
                    className={errors.phone ? 'border-destructive' : ''}
                    disabled={loading}
                  />
                  {errors.phone && <p id="error_phone" className="text-destructive text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1 text-foreground">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="Min 6 characters"
                  className={errors.password ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.password && <p id="error_password" className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="font-medium block mb-1 text-foreground">Profile Photo *</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload a clear recent photo of yourself. This photo may be reviewed by Co-opConnect administrators during worker verification and may be shown to a customer after you accept their booking.
                </p>
                <div className="flex flex-col gap-3">
                  {formData.photo && (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border">
                      <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, photo: file });
                        if (errors.photo) setErrors({ ...errors, photo: '' });
                      }
                    }}
                    className={errors.photo ? 'border-destructive' : ''}
                    disabled={loading}
                  />
                  {errors.photo && <p id="error_photo" className="text-destructive text-xs">{errors.photo}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Trade & Experience */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Trade & Experience</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium block mb-1 text-foreground">Primary Service / Trade *</label>
                  <select
                    value={formData.primaryTrade}
                    onChange={(e) => {
                      setFormData({ ...formData, primaryTrade: e.target.value, verificationAnswers: {} });
                      if (errors.primaryTrade) setErrors({ ...errors, primaryTrade: '' });
                    }}
                    className={`w-full p-2.5 border rounded-md bg-background text-foreground text-sm h-10 ${errors.primaryTrade ? 'border-destructive' : 'border-input'}`}
                    disabled={loading || services.length === 0}
                  >
                    <option value="">{services.length === 0 ? 'Loading services...' : 'Select a service'}</option>
                    {services.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  {servicesError && (
                    <div className="mt-1 space-y-1">
                      <p className="text-destructive text-xs">{servicesError}</p>
                      <button type="button" onClick={fetchServices} className="text-primary text-xs font-semibold underline">
                        Retry loading services
                      </button>
                    </div>
                  )}
                  {errors.primaryTrade && <p id="error_primaryTrade" className="text-destructive text-xs mt-1">{errors.primaryTrade}</p>}
                </div>
                <div>
                  <label className="font-medium block mb-1 text-foreground">Years of Experience</label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    disabled={loading}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Skill-Learning Information */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Skill & Training Information</h3>
              <div>
                <label className="font-medium block mb-1 text-foreground">How did you learn this skill? *</label>
                <select
                  value={formData.learningMethod}
                  onChange={(e) => {
                    setFormData({ ...formData, learningMethod: e.target.value });
                    if (errors.learningMethod) setErrors({ ...errors, learningMethod: '' });
                  }}
                  className={`w-full p-2.5 border rounded-md bg-background text-foreground text-sm h-10 ${errors.learningMethod ? 'border-destructive' : 'border-input'}`}
                  disabled={loading}
                >
                  <option value="">Select learning method</option>
                  {LEARNING_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                {errors.learningMethod && <p id="error_learningMethod" className="text-destructive text-xs mt-1">{errors.learningMethod}</p>}
              </div>

              <div>
                <label className="font-medium block mb-1 text-foreground">Training/Institute Name (Optional)</label>
                <Input
                  value={formData.trainingInstitute}
                  onChange={(e) => setFormData({ ...formData, trainingInstitute: e.target.value })}
                  placeholder="e.g. Govt ITI Ahmedabad"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="font-medium block mb-1 text-foreground">Additional Training Details (Optional)</label>
                <Input
                  value={formData.learningDetails}
                  onChange={(e) => setFormData({ ...formData, learningDetails: e.target.value })}
                  placeholder="Any other details about your training..."
                  disabled={loading}
                />
              </div>
            </div>

            {/* Section 4: Trade-Specific Verification Questions */}
            {questions.length > 0 && (
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border">
                <h3 className="font-semibold border-b pb-2">Skill Verification</h3>
                <p className="text-xs text-muted-foreground mb-3">Please answer the following questions to help us verify your expertise in {formData.primaryTrade}.</p>
                {questions.map((q, idx) => (
                  <div key={q.id} className="mb-4">
                    <label className="font-medium block mb-1 text-foreground text-sm">
                      {idx + 1}. {q.question} *
                    </label>
                    <textarea
                      value={formData.verificationAnswers[q.id] || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          verificationAnswers: {
                            ...formData.verificationAnswers,
                            [q.id]: e.target.value
                          }
                        });
                        if (errors[`q_${q.id}`]) {
                          const newErrors = { ...errors };
                          delete newErrors[`q_${q.id}`];
                          setErrors(newErrors);
                        }
                      }}
                      className={`w-full p-2.5 border rounded-md bg-background text-foreground text-sm min-h-[80px] ${errors[`q_${q.id}`] ? 'border-destructive' : 'border-input'}`}
                      disabled={loading}
                      placeholder="Your answer..."
                    />
                    {errors[`q_${q.id}`] && <p id={`error_q_${q.id}`} className="text-destructive text-xs mt-1">{errors[`q_${q.id}`]}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Section 5: Service Location */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Service Area Location</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium block mb-1 text-foreground">State / Union Territory *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value, city: '' });
                      if (errors.state) setErrors({ ...errors, state: '' });
                    }}
                    className={`w-full p-2.5 border rounded-md bg-background text-foreground text-sm h-10 ${errors.state ? 'border-destructive' : 'border-input'}`}
                    disabled={loading}
                  >
                    <option value="">Select State or Union Territory</option>
                    <optgroup label="States">
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="Union Territories">
                      {INDIA_UNION_TERRITORIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  </select>
                  {errors.state && <p id="error_state" className="text-destructive text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="font-medium block mb-1 text-foreground">City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    className={`w-full p-2.5 border rounded-md bg-background text-foreground text-sm h-10 ${errors.city ? 'border-destructive' : 'border-input'}`}
                    disabled={loading || !formData.state}
                  >
                    <option value="">Select a city</option>
                    {formData.state && INDIA_CITIES[formData.state]?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.city && <p id="error_city" className="text-destructive text-xs mt-1">{errors.city}</p>}
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1 text-foreground">Operational Area Details</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Satellite / Vastrapur / Navrangpura"
                  disabled={loading}
                />
              </div>
              
              <div className="pt-2 border-t mt-2">
                <label className="font-medium block mb-2 text-foreground">Current GPS Location (Optional)</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Providing your GPS location helps us match you with nearby customers for urgent jobs.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocation}
                    disabled={locationLoading || loading}
                    className="flex gap-2 items-center text-xs h-9"
                  >
                    {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    Use my current location
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">
                    {locationMsg}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 pb-2">
              <input
                type="checkbox"
                id="emergency"
                checked={formData.isEmergencyAvailable}
                onChange={(e) => setFormData({ ...formData, isEmergencyAvailable: e.target.checked })}
                className="rounded border-border"
                disabled={loading}
              />
              <label htmlFor="emergency" className="font-medium text-foreground cursor-pointer text-xs">
                Opt-in for 24/7 Emergency Service Dispatch (+25% surcharge bonus)
              </label>
            </div>

            {/* Section 6: Accuracy Declaration */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border mt-4">
              <h4 className="font-bold mb-2">Accuracy & Verification Declaration</h4>
              <p className="text-xs text-muted-foreground mb-4">
                I confirm that the information provided about my skills, experience, training, qualifications and service area is true and accurate to the best of my knowledge. I understand that Co-opConnect may review and verify the information provided and may request additional information or evidence. Providing false or misleading information may result in verification failure, account restrictions, suspension, or other consequences where applicable.
              </p>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={formData.declarationAccepted}
                  onChange={(e) => {
                    setFormData({ ...formData, declarationAccepted: e.target.checked });
                    if (errors.declaration) setErrors({ ...errors, declaration: '' });
                  }}
                  className="rounded border-border mt-1"
                  disabled={loading}
                />
                <label htmlFor="declaration" className="font-medium text-foreground cursor-pointer text-sm">
                  I confirm that the information provided is accurate. *
                </label>
              </div>
              {errors.declaration && <p id="error_declaration" className="text-destructive text-xs mt-1 font-medium">{errors.declaration}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-sm font-bold gap-2 mt-4"
              disabled={loading || !formData.declarationAccepted}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : 'Complete Registration'}
            </Button>

            <p className="text-center text-muted-foreground pt-2">
              Already a cooperative member?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
