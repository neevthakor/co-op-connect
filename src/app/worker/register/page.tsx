'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, UserCheck, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
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
    address: 'Vastrapur, Ahmedabad',
    isEmergencyAvailable: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Please fill in all required fields');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/workers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      toast.success('Registration successful! Profile submitted for cooperative KYC verification.');
      router.push('/login?registered=true');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> Worker & Helper Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              <label className="font-semibold block mb-1">Full Legal Name *</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Patel"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Email Address *</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number *</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Password *</label>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Primary Trade</label>
                <select
                  value={formData.primaryTrade}
                  onChange={(e) => setFormData({ ...formData, primaryTrade: e.target.value })}
                  className="w-full p-2.5 border rounded-md bg-background text-foreground text-xs"
                >
                  <option value="AC Repair">AC Repair & Servicing</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                  <option value="Cleaner">Home Cleaning</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Years of Experience</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Operational Area in Ahmedabad</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Satellite / Vastrapur / Navrangpura"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="emergency"
                checked={formData.isEmergencyAvailable}
                onChange={(e) => setFormData({ ...formData, isEmergencyAvailable: e.target.checked })}
                className="rounded border-border"
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
              {loading ? 'Submitting to Cooperative...' : 'Complete Registration'}
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

