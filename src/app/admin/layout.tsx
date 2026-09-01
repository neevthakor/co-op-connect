"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, UserCheck, Users, CalendarDays, MapPin, Scale,
  Users2, Layers, TrendingUp, LineChart, Gauge, GraduationCap,
  DollarSign, HeartPulse, AlertTriangle, Shield, BarChart3,
  Vote, Settings, Bell, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 bg-slate-900 text-white z-40 transition-all duration-200 flex flex-col",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 border-b border-slate-700", collapsed ? "px-3 justify-center" : "px-4")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h1 className="font-bold text-sm">Co-opConnect</h1>
              <p className="text-[10px] text-slate-400">Admin Console</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-2">
              {!collapsed && (
                <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 mx-2 px-2 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                      collapsed && "justify-center"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign Out"
          className={cn(
            "flex items-center gap-3 mx-2 my-2 px-2 py-2 rounded-md text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-slate-700 hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Top bar */}
      <header
        className={cn(
          "fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6 transition-all duration-200",
          collapsed ? "left-16" : "left-60"
        )}
      >
        <div>
          <h2 className="font-semibold text-gray-900 capitalize">
            {pathname.split("/").pop()?.replace(/-/g, " ") || "Overview"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-200",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
