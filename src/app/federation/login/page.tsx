"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2 } from "lucide-react";
import { getRoleRedirect } from "@/lib/rbac";

function FederationLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      
      if (role !== 'FEDERATION_ADMIN' && role !== 'ADMIN') {
         setError("Unauthorized. You are not a Federation Admin.");
         setLoading(false);
         // Optionally log them out if they aren't federation admin
         return;
      }

      const redirectPath = getRoleRedirect(role);
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError("An error occurred during sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 justify-center">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Federation Portal</h1>
          <p className="text-xs text-muted-foreground">Admin Sign In</p>
        </div>
      </div>

      {isRegistered && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium">
          Registration successful! Please sign in.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="admin@federation.org"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </form>

    </div>
  );
}

export default function FederationLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <FederationLoginForm />
      </Suspense>
    </div>
  );
}
