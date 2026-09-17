'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, School, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InstitutionRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SCHOOL',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.email.trim() || !formData.password || !formData.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    const isPhoneValid = (cleanedPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanedPhone)) || 
                         (cleanedPhone.length === 12 && cleanedPhone.startsWith('91') && /^[6-9]\d{9}$/.test(cleanedPhone.substring(2)));
                         
    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-institution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          address: formData.address.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Institution registered successfully! Please sign in.');
      router.push('/login?registered=true');
    } catch (err) {
      setError((err instanceof Error ? err.message : "Unknown error") || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground">Co-opConnect</span>
        </div>

        <Card className="border border-border/80 shadow-lg bg-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-foreground tracking-tight">Register Institution</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Create an account for your school, hospital, or office
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Institution Name *</label>
                <Input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ahmedabad International School"
                  className="h-10 text-xs bg-secondary/50 border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-2">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Type</label>
                  <select 
                    className="w-full h-10 px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="SCHOOL">School/College</option>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="OFFICE">Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Contact Person Name *</label>
                  <Input
                    required
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Dr. Anand Patel"
                    className="h-10 text-xs bg-secondary/50 border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Admin Email Address *</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="h-10 text-xs bg-secondary/50 border-border text-foreground"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Contact Phone Number *</label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-10 text-xs bg-secondary/50 border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Password *</label>
                  <Input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="h-10 text-xs bg-secondary/50 border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Confirm Password *</label>
                  <Input
                    required
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="h-10 text-xs bg-secondary/50 border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Institution Address"
                  className="h-10 text-xs bg-secondary/50 border-border text-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-xs font-bold mt-3 bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/20 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Registering Institution...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <School className="h-4 w-4" /> Register Institution
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-border/80 text-center space-y-2 text-xs">
              <p className="text-muted-foreground">
                Already registered?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign In
                </Link>
              </p>
              <p className="text-muted-foreground">
                Looking for other options?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  View all registration options
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
