'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wrench, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'WORKER',
    primaryTrade: 'AC Repair',
    experience: '3',
    address: '',
    isEmergencyAvailable: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

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
    if (!formData.primaryTrade) {
      newErrors.primaryTrade = 'Primary trade is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/workers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push('/login?registered=true');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-xl mx-auto w-full min-h-[calc(100vh-4rem)]">
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
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {serverError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-medium">
                {serverError}
              </div>
            )}
          
            <div>
              <label className="font-semibold block mb-1">Account Type</label>
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
              <label className="font-semibold block mb-1 text-foreground">Full Legal Name *</label>
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
              {errors.name && <p className="text-destructive mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-foreground">Email Address *</label>
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
                {errors.email && <p className="text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-1 text-foreground">Phone Number *</label>
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
                {errors.phone && <p className="text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-foreground">Password *</label>
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
              {errors.password && <p className="text-destructive mt-1">{errors.password}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-foreground">Primary Trade *</label>
                <select
                  value={formData.primaryTrade}
                  onChange={(e) => {
                    setFormData({ ...formData, primaryTrade: e.target.value });
                    if (errors.primaryTrade) setErrors({ ...errors, primaryTrade: '' });
                  }}
                  className={`w-full p-2.5 border rounded-md bg-background text-foreground text-xs h-10 ${errors.primaryTrade ? 'border-destructive' : 'border-input'}`}
                  disabled={loading}
                >
                  <option value="">Select a trade</option>
                  <option value="AC Repair">AC Repair & Servicing</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                  <option value="Cleaner">Home Cleaning</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                </select>
                {errors.primaryTrade && <p className="text-destructive mt-1">{errors.primaryTrade}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-1 text-foreground">Years of Experience</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-foreground">Operational Area in Ahmedabad</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Satellite / Vastrapur / Navrangpura"
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="emergency"
                checked={formData.isEmergencyAvailable}
                onChange={(e) => setFormData({ ...formData, isEmergencyAvailable: e.target.checked })}
                className="rounded border-border"
                disabled={loading}
              />
              <label htmlFor="emergency" className="font-medium text-foreground cursor-pointer">
                Opt-in for 24/7 Emergency Service Dispatch (+25% surcharge bonus)
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-sm font-bold gap-2 mt-4"
              disabled={loading}
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


