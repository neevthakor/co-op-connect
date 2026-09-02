'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle2, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions
    setError('');
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Forgot your password?
            <br />
            No problem.
          </h2>
          <p className="text-muted-foreground text-base max-w-md">
            Enter your registered email address and we'll send you instructions to securely reset your password.
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

          <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Reset Password</h2>
          
          {isSuccess ? (
            <div className="mt-8 text-center bg-secondary/50 p-8 rounded-2xl border border-border/80 shadow-sm">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Check your email</h3>
              <p className="text-sm text-muted-foreground mb-6">
                If an account exists for <span className="font-semibold text-foreground">{email}</span>, we have sent password reset instructions.
              </p>
              <Link
                href="/login"
                className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-8 text-sm">Enter the email associated with your account.</p>

              {error && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-medium">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                      placeholder="name@example.com"
                      disabled={isLoading}
                    />
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
                      Sending Instructions...
                    </>
                  ) : (
                    'Send Reset Link'
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
          )}
        </div>
      </div>
    </div>
  );
}
