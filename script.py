import os

content = '''import Link from "next/link";
import { Shield, Target, Users, Sparkles, Building, ArrowRight, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Co-opConnect",
  description: "Learn about Co-opConnect, our cooperative mission, and how we empower local workers and communities.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <div>
              <span className="font-bold text-foreground text-lg tracking-tight">Co-opConnect</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              About Us
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-xs font-semibold mb-6">
            <Target className="w-3.5 h-3.5" />
            Our Mission & Vision
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight tracking-tight max-w-4xl mx-auto">
            Empowering Workers. <br className="hidden sm:block" />
            <span className="text-primary">Strengthening Communities.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Co-opConnect is built on the belief that everyday services should be fair, transparent, and driven by community trust. We bring the power of the cooperative model to the modern gig economy.
          </p>
        </div>
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-primary/10 via-transparent to-transparent -z-10 pointer-events-none rounded-full" />
      </section>

      {/* The Problem & Solution */}
      <section className="py-20 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">The Problem We Solve</h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Traditional gig platforms extract high commissions, leaving workers underpaid and customers overcharged. Workers lack a safety net, face unpredictable incomes, and are often treated as disposable algorithms rather than human professionals. Meanwhile, customers struggle to find trusted, verified workers for their homes.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">The Cooperative Solution</h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                By partnering with local worker cooperatives, Co-opConnect eliminates the exploitative middleman. Workers own their labor, share in the platform's success, and receive welfare benefits. Customers get transparent pricing and services from identity-verified, highly skilled professionals who take pride in their craft.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-20 border-t border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Our Core Pillars</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
              The foundational principles that guide every feature we build and every service we facilitate.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Trust & Safety",
                description: "Rigorous background checks, skill verification, and secure PIN-based job starts ensure complete peace of mind for both customers and workers."
              },
              {
                icon: Sparkles,
                title: "AI-Powered Matching",
                description: "Our advanced matching engine considers skill level, proximity, and equitable job distribution to find the perfect worker for every task."
              },
              {
                icon: Heart,
                title: "Worker Welfare",
                description: "Built-in tracking for fair working hours, transparent earnings without hidden cuts, and access to insurance and training programs."
              },
              {
                icon: Building,
                title: "Cooperative Strength",
                description: "By digitizing local cooperative societies, we give them the tools to compete in the modern economy while maintaining their democratic values."
              }
            ].map((pillar, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for Everyone */}
      <section className="py-20 bg-card/60 border-t border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-16 tracking-tight">How Everyone Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl border border-border/80">
              <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                <Users className="w-5 h-5" /> For Customers
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> Verified, trustworthy professionals in your home.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> No hidden fees or arbitrary surge pricing.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> Effortless booking with our AI service concierge.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> Digital invoices and secure payments.</li>
              </ul>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border/80">
              <h3 className="text-xl font-bold mb-4 text-emerald-500 flex items-center gap-2">
                <Shield className="w-5 h-5" /> For Workers
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Keep what you earn with transparent cooperative structures.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Dignity of work and protection from exploitation.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Access to training, upskilling, and welfare programs.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Flexible hours with fair job distribution.</li>
              </ul>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border/80">
              <h3 className="text-xl font-bold mb-4 text-orange-500 flex items-center gap-2">
                <Building className="w-5 h-5" /> For Cooperatives
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" /> Complete digital transformation of your operations.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" /> Data-driven insights to manage your workforce.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" /> Secure platform to vet, train, and deploy members.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" /> Increased visibility and demand generation in your city.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-blue-700 to-blue-900 border-t border-border/80 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Join the Cooperative Movement</h2>
          <p className="text-white/80 mb-8 text-sm sm:text-base max-w-xl mx-auto">
            Whether you need a service, want to offer your skills, or represent a cooperative society — Co-opConnect is built for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-colors text-sm shadow-md"
            >
              Book a Service
            </Link>
            <Link
              href="/worker/register"
              className="inline-flex items-center justify-center px-6 py-3.5 border border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Register as a Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/80 text-muted-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">CC</span>
            </div>
            <span className="font-bold text-foreground">Co-opConnect</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/about" className="hover:text-foreground transition-colors text-foreground font-medium">About Us</Link>
          </div>
          <p>© {new Date().getFullYear()} Co-opConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
'''

with open('src/app/about/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
