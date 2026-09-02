"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, UserCheck, Users, CalendarDays, MapPin, Scale,
  Users2, Layers, TrendingUp, LineChart, Gauge, GraduationCap,
  DollarSign, HeartPulse, AlertTriangle, Shield, BarChart3,
  Vote, Settings, Bell, LogOut, ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    title: "Operations",
    items: [
      { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/verification", label: "Verification", icon: UserCheck },
      { href: "/admin/workers", label: "Workers", icon: Users },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/live-map", label: "Live Map", icon: MapPin },
    ],
  },
  {
    title: "Workforce",
    items: [
      { href: "/admin/fairmatch", label: "FairMatch", icon: Scale },
      { href: "/admin/helpers", label: "Helpers", icon: Users2 },
      { href: "/admin/teams", label: "Teams", icon: Layers },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { href: "/admin/demand", label: "Demand", icon: TrendingUp },
      { href: "/admin/forecast", label: "Forecast", icon: LineChart },
      { href: "/admin/capacity", label: "Capacity", icon: Gauge },
      { href: "/admin/skill-gaps", label: "Skill Gaps", icon: GraduationCap },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/admin/finance", label: "Finance", icon: DollarSign },
      { href: "/admin/welfare", label: "Welfare", icon: HeartPulse },
      { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
      { href: "/admin/fraud", label: "Fraud", icon: Shield },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/admin/impact", label: "Impact", icon: BarChart3 },
      { href: "/admin/voting", label: "Voting", icon: Vote },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMobileOpen(false); }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 lg:hidden cursor-pointer"
        />
      )}

      {/* Sidebar (Drawer on mobile, Collapsible on desktop) */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 bg-card border-r border-border/80 text-foreground z-50 transition-all duration-200 flex flex-col shadow-xl lg:shadow-none",
          // Mobile responsive positioning
          "left-0",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          // Desktop collapsed/expanded
          collapsed ? "lg:w-16" : "lg:w-60"
        )}
      >
        {/* Logo Header */}
        <div className={cn("flex items-center h-16 border-b border-border/80 px-4 justify-between", collapsed && "lg:px-3 lg:justify-center")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            {(!collapsed || mobileOpen) && (
              <div>
                <h1 className="font-bold text-sm text-foreground leading-tight">Co-opConnect</h1>
                <p className="text-[10px] text-primary font-medium">Admin Console</p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3">
          {navSections.map((section) => (
            <div key={section.title}>
              {(!collapsed || mobileOpen) && (
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5 mt-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin/overview" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed && !mobileOpen ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        collapsed && !mobileOpen && "lg:justify-center"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-2 border-t border-border/80 space-y-1">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className={cn(
              "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium",
              collapsed && !mobileOpen && "lg:justify-center"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>

          {/* Desktop Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex items-center justify-center w-full h-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header
        className={cn(
          "fixed top-0 right-0 h-16 bg-card/90 backdrop-blur-md border-b border-border/80 z-40 flex items-center justify-between px-4 md:px-6 transition-all duration-200",
          "left-0",
          collapsed ? "lg:left-16" : "lg:left-60"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger toggle for mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-base md:text-lg text-foreground capitalize tracking-tight">
            {pathname.split("/").pop()?.replace(/-/g, " ") || "Overview"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            aria-label="Notifications" 
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card" />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-200 w-full overflow-x-hidden",
          "ml-0",
          collapsed ? "lg:ml-16" : "lg:ml-60"
        )}
      >
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
