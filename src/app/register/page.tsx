'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: 'Vastrapur, Ahmedabad',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
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

      toast.success('Account created successfully! Please sign in.');
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Co-opConnect</span>
        </div>

        <Card className="border shadow-sm bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Create Customer Account</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Book verified cooperative domestic trade services in Ahmedabad
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-gray-700 block mb-1">Full Name *</label>
                <Input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amit Patel"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Email Address *</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Phone Number (Optional)</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Password *</label>
                  <Input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Confirm Password *</label>
                  <Input
                    required
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Address / Neighborhood</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Vastrapur, Ahmedabad"
                  className="h-9 text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-xs font-bold mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Create Account
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center space-y-2 text-xs">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign In
                </Link>
              </p>
              <p className="text-gray-500">
                Are you a skilled technician or helper?{' '}
                <Link href="/worker/register" className="text-green-700 font-semibold hover:underline">
                  Register as Worker →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
