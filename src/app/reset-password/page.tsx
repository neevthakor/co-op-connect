'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, Lock, ArrowLeft, Shield, EyeOff, Eye } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="text-center bg-secondary/50 p-8 rounded-2xl border border-border/80 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-foreground mb-2">Invalid Link</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This password reset link is missing or invalid. It may have expired.
        </p>
        <Link
          href="/forgot-password"
          className="w-full flex justify-center py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mt-8 text-center bg-secondary/50 p-8 rounded-2xl border border-border/80 shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">Password reset successfully</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Your account is secure. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="w-full flex justify-center py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground mb-8 text-sm">Please enter your new password below.</p>
      
      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-1.5">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              placeholder="Min. 8 characters"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              placeholder="Confirm new password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
        
        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to login
          </Link>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card via-[#0b1329] to-[#091638] border-r border-border/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Co-opConnect</h1>
              <p className="text-sm text-primary">Cooperative Services Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-black text-foreground leading-tight mb-4 tracking-tight">
            Secure your account.
          </h2>
          <p className="text-muted-foreground text-base max-w-md">
            Create a strong, new password that you haven't used before to keep your account safe.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl text-foreground">Co-opConnect</span>
          </div>

          <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Create New Password</h2>
          
          <Suspense fallback={
            <div className="flex justify-center items-center h-48 mt-8 bg-secondary/50 rounded-2xl border border-border/80">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
