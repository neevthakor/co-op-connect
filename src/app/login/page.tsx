"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, Loader2, UserPlus, Wrench, ChevronDown, ChevronUp } from "lucide-react";
import { getRoleRedirect } from "@/lib/rbac";
import { ThemeToggle } from "@/components/theme-toggle";

const DEMO_ACCOUNTS = [
  { email: "customer1@gmail.com", role: "Customer", color: "bg-blue-500" },
  { email: "worker1@coopconnect.in", role: "Worker", color: "bg-green-500" },
  { email: "society1@coopconnect.in", role: "Housing Society", color: "bg-amber-500" },
  { email: "school@ahmedabad.edu", role: "Institution", color: "bg-teal-500" },
];

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDevAccounts, setShowDevAccounts] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isRegistered = searchParams?.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Fetch session to obtain authenticated role and redirect correctly
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      const redirectPath = getRoleRedirect(role);
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError("An error occurred during sign in. Please try again.");
      setLoading(false);
    }
  };

  const handleDevAccountLogin = async (devEmail: string) => {
    setEmail(devEmail);
    setPassword("");
    setError("Enter the seeded profile password to continue.");
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
          <span className="text-white font-bold">CC</span>
        </div>
        <span className="font-bold text-xl text-foreground">Co-opConnect</span>
      </div>

      <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">Sign In to Your Account</h2>
      <p className="text-muted-foreground mb-6 text-sm">Enter your registered email and password</p>

      {isRegistered && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium">
          Registration successful! Please sign in with your credentials.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full px-3.5 py-2.5 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-secondary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-foreground">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3.5 py-2.5 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-10 bg-secondary/50 text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Registration Options */}
      <div className="mt-6 pt-6 border-t border-border/80 space-y-3 text-xs">
        <div className="flex items-center justify-between p-3.5 bg-primary/5 rounded-xl border border-primary/20">
          <div>
            <p className="font-semibold text-foreground">New Customer?</p>
            <p className="text-muted-foreground text-[11px]">Book domestic services from verified workers</p>
          </div>
          <Link
            href="/register"
            className="px-3 py-1.5 bg-primary text-white rounded-lg font-semibold text-xs hover:bg-primary/90 flex items-center gap-1 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" /> Register
          </Link>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
          <div>
            <p className="font-semibold text-foreground">Skilled Technician or Helper?</p>
            <p className="text-muted-foreground text-[11px]">Join the cooperative with fair wages & 0% fees</p>
          </div>
          <Link
            href="/worker/register"
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 flex items-center gap-1 shadow-xs"
          >
            <Wrench className="w-3.5 h-3.5" /> Join
          </Link>
        </div>
      </div>

      {/* Collapsible Development Profiles */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowDevAccounts(!showDevAccounts)}
          className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
        >
          <span>Development / Test Profiles</span>
          {showDevAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDevAccounts && (
          <div className="mt-3 p-3 bg-secondary/50 rounded-xl border border-border/80">
            <p className="text-[11px] text-muted-foreground mb-2">
              Click any role to load seeded local test profile:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDevAccountLogin(account.email)}
                  disabled={loading}
                  className="flex items-center gap-2 p-2 bg-card border border-border/80 rounded-lg text-left hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full ${account.color}`} />
                  <span className="text-[11px] font-medium text-foreground truncate">{account.role}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
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
            Trusted Workers.
            <br />
            Fair Opportunities.
            <br />
            Stronger Cooperatives.
          </h2>
          <p className="text-muted-foreground text-base max-w-md">
            Connect with verified cooperative workers for reliable household
            and community services across Ahmedabad.
          </p>
          <div className="mt-12 space-y-3">
            {["Identity-verified workers", "Fair & transparent pricing", "Cooperative-backed social security"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-foreground/90 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="relative flex-1 flex items-center justify-center p-6 bg-background">
        <ThemeToggle compact className="absolute right-4 top-4" />
        <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
