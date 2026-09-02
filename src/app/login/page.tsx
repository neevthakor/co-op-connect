"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, Loader2, UserPlus, Wrench, ChevronDown, ChevronUp } from "lucide-react";
import { getRoleRedirect } from "@/lib/rbac";

const DEMO_ACCOUNTS = [
  { email: "customer1@gmail.com", role: "Customer", color: "bg-blue-500" },
  { email: "worker1@coopconnect.in", role: "Worker", color: "bg-green-500" },
  { email: "admin1@coopconnect.in", role: "Cooperative Admin", color: "bg-slate-700" },
  { email: "federation@coopconnect.in", role: "Federation Admin", color: "bg-purple-500" },
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
    setPassword("[REDACTED]");
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: devEmail,
        password: "[REDACTED]",
        redirect: false,
      });

      if (result?.error) {
        setError("Sign in failed for this account. Ensure database is seeded.");
        setLoading(false);
        return;
      }

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

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">CC</span>
        </div>
        <span className="font-bold text-xl text-gray-900">Co-opConnect</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In to Your Account</h2>
      <p className="text-gray-500 mb-6 text-sm">Enter your registered email and password</p>

      {isRegistered && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 font-medium">
          Registration successful! Please sign in with your credentials.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors pr-10 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-xs">
        <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-lg border border-blue-100">
          <div>
            <p className="font-semibold text-gray-900">New Customer?</p>
            <p className="text-gray-500 text-[11px]">Book domestic services from verified workers</p>
          </div>
          <Link
            href="/register"
            className="px-3 py-1.5 bg-primary text-white rounded-md font-semibold text-xs hover:bg-primary/90 flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" /> Register
          </Link>
        </div>

        <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
          <div>
            <p className="font-semibold text-gray-900">Skilled Technician or Helper?</p>
            <p className="text-gray-500 text-[11px]">Join the cooperative with fair wages & 0% fees</p>
          </div>
          <Link
            href="/worker/register"
            className="px-3 py-1.5 bg-emerald-700 text-white rounded-md font-semibold text-xs hover:bg-emerald-800 flex items-center gap-1"
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
          className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          <span>Development / Test Profiles</span>
          {showDevAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDevAccounts && (
          <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-[11px] text-gray-500 mb-2">
              Click any role to load seeded local test profile:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDevAccountLogin(account.email)}
                  disabled={loading}
                  className="flex items-center gap-1.5 p-2 bg-white border border-gray-200 rounded text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className={`w-2 h-2 rounded-full ${account.color}`} />
                  <span className="text-[11px] font-medium text-gray-700 truncate">{account.role}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        <Link href="/" className="text-primary hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-700" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Co-opConnect</h1>
              <p className="text-sm text-white/70">Cooperative Services Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Trusted Workers.
            <br />
            Fair Opportunities.
            <br />
            Stronger Cooperatives.
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Connect with verified cooperative workers for reliable household
            and community services across Ahmedabad.
          </p>
          <div className="mt-12 space-y-3">
            {["Identity-verified workers", "Fair & transparent pricing", "Cooperative-backed social security"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-white/90 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
