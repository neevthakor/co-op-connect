import Link from "next/link";
import { Shield, Users, Scale, Brain, MapPin, Heart, Star, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">Co-opConnect</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Cooperative-Owned Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Trusted Workers.{" "}
              <span className="text-primary">Fair Opportunities.</span>{" "}
              Stronger Cooperatives.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Co-opConnect is a cooperative-owned digital marketplace that connects you with 
              verified, trusted workers for household and community services. Every worker is 
              cooperative-verified. Every job is fairly allocated. Every earning is transparent.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-base"
              >
                Find a Worker
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-base"
              >
                Join as a Worker
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
      </section>

      {/* Trust indicators */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">50+</p>
              <p className="text-sm text-gray-600 mt-1">Verified Workers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-600 mt-1">Cooperatives</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">200+</p>
              <p className="text-sm text-gray-600 mt-1">Jobs Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">4.6</p>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Co-opConnect?</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Not just another service marketplace. We are built on cooperative principles 
              of trust, fairness, and worker welfare.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                description: "Describe your problem in plain English, Hindi, or Gujarati. Our AI understands, classifies, and finds the right worker for you.",
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
              <div key={item.title} className="p-6 rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Describe Your Need", desc: "Tell us what you need — type it, speak it, or choose from categories. Our AI understands your problem." },
              { step: "2", title: "Get Matched", desc: "We find qualified, available, nearby workers from cooperative societies. You see why each worker was recommended." },
              { step: "3", title: "Get It Done", desc: "Verified worker arrives, completes the job with before/after proof, and you pay transparently. Fair and simple." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Services We Offer</h2>
          <p className="text-gray-600 text-center mb-12">Household and community services by verified cooperative workers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Electrician", "Plumber", "Carpenter", "Painter",
              "Cleaner", "AC Repair", "Appliance Repair", "Gardener",
              "Caregiver", "Driver", "Pest Control", "Waterproofing"
            ].map((service) => (
              <div key={service} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Join thousands of customers and workers building a fairer service economy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Book a Service
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Join as Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <span className="font-semibold text-white">Co-opConnect</span>
            </div>
            <p className="text-sm">
              SIH 2026 — Problem Statement 26089 — Cooperative Gig Services Platform
            </p>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Smart India Hackathon 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
