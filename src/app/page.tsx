import Link from "next/link";
import { Shield, Users, Scale, Brain, MapPin, Heart, Star, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
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
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-xs font-semibold mb-6">
              <Shield className="w-3.5 h-3.5" />
              Cooperative-Owned Domestic Services Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight tracking-tight">
              Trusted Workers.{" "}
              <span className="text-primary">Fair Opportunities.</span>{" "}
              Stronger Cooperatives.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Co-opConnect is a cooperative-owned digital marketplace that connects you with 
              verified, trusted workers for household and community services. Every worker is 
              cooperative-verified. Every job is fairly allocated. Every earning is transparent.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm"
              >
                Find a Worker
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/worker/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 text-sm"
              >
                Join as a Worker
              </Link>
            </div>
          </div>
        </div>
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-radial from-primary/10 via-transparent to-transparent -z-10 pointer-events-none" />
      </section>

      {/* Trust indicators */}
      <section className="border-y border-border/80 bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-black text-foreground">50+</p>
              <p className="text-xs text-muted-foreground mt-1">Verified Workers</p>
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">5</p>
              <p className="text-xs text-muted-foreground mt-1">Cooperatives</p>
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">200+</p>
              <p className="text-xs text-muted-foreground mt-1">Jobs Completed</p>
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">4.8</p>
              <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Why Co-opConnect?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
              Not just another service marketplace. We are built on cooperative principles 
              of trust, fairness, and worker welfare.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Worker Trust Passport",
                description: "Every worker is identity-verified, skill-certified, and cooperative-backed. View their complete professional profile before booking.",
              },
              {
                icon: Scale,
                title: "Fair Worker Allocation",
                description: "Our AI matching engine doesn't just find the nearest worker — it ensures fair distribution of work and transparent earnings across all cooperative members.",
              },
              {
                icon: Brain,
                title: "AI Service Concierge",
                description: "Describe your problem in plain English, Hindi, or Gujarati. Our Gemini-powered AI understands, classifies, and finds the right worker for you.",
              },
              {
                icon: MapPin,
                title: "GIS Intelligence",
                description: "Real-time demand-supply mapping, worker tracking, and intelligent capacity planning across your city.",
              },
              {
                icon: Users,
                title: "Cooperative Worker Network",
                description: "Workers can request helpers, form teams, and share capacity across cooperatives. Every team member earns transparently.",
              },
              {
                icon: Heart,
                title: "Worker Welfare First",
                description: "We monitor working hours, travel burden, income stability, and ensure every worker has access to insurance and training.",
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card/40 border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-foreground text-center mb-16 tracking-tight">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Describe Your Need", desc: "Tell us what you need — type it, speak it, or choose from categories. Our AI understands your problem." },
              { step: "2", title: "Get Matched", desc: "We find qualified, available, nearby workers from cooperative societies. You see why each worker was recommended." },
              { step: "3", title: "Get It Done", desc: "Verified worker arrives, completes the job with before/after proof, and you pay transparently. Fair and simple." },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-2xl bg-card border border-border/80">
                <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-md shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-foreground text-center mb-3 tracking-tight">Services We Offer</h2>
          <p className="text-muted-foreground text-center mb-12 text-sm">Household and community services by verified cooperative workers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              "Electrician", "Plumber", "Carpenter", "Painter",
              "Cleaner", "AC Repair", "Appliance Repair", "Gardener",
              "Caregiver", "Driver", "Pest Control", "Waterproofing"
            ].map((service) => (
              <div key={service} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-foreground">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-blue-700 to-blue-900 border-t border-border/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Ready to get started?</h2>
          <p className="text-white/80 mb-8 text-sm max-w-xl mx-auto">
            Join thousands of customers and workers building a fairer service economy with cooperative ownership.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-colors text-sm shadow-md"
            >
              Book a Service
            </Link>
            <Link
              href="/worker/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Join as Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/80 text-muted-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <span className="font-bold text-foreground">Co-opConnect</span>
            </div>
            <p className="text-xs">
              SIH 2026 — Problem Statement 26089 — Cooperative Gig Services Platform
            </p>
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Smart India Hackathon 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
