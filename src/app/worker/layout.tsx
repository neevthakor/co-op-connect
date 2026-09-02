"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Calendar, Wallet, Users, MessageSquare, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile bottom nav destinations (exactly 5 items per mobile-first rules)
const mobileNavItems = [
  { href: "/worker/home", label: "Home", icon: Home },
  { href: "/worker/jobs", label: "Jobs", icon: Briefcase },
  { href: "/worker/earnings", label: "Earnings", icon: Wallet },
  { href: "/worker/messages", label: "Messages", icon: MessageSquare },
  { href: "/worker/profile", label: "Profile", icon: User },
];

// Desktop sidebar items (includes secondary areas like Calendar, Helpers, Notifications)
const desktopNavItems = [
  { href: "/worker/home", label: "Home", icon: Home },
  { href: "/worker/jobs", label: "Jobs", icon: Briefcase },
  { href: "/worker/calendar", label: "Calendar", icon: Calendar },
  { href: "/worker/earnings", label: "Earnings", icon: Wallet },
  { href: "/worker/helpers", label: "Helpers & Teams", icon: Users },
  { href: "/worker/messages", label: "Messages", icon: MessageSquare },
  { href: "/worker/notifications", label: "Notifications", icon: Bell },
  { href: "/worker/profile", label: "Profile & KYC", icon: User },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20">
      {/* Top header - Mobile view */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/80 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/worker/home" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">Co-opConnect</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">Worker</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/worker/calendar"
              aria-label="Calendar"
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathname.startsWith("/worker/calendar")
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Calendar className="w-5 h-5" />
            </Link>
            <Link
              href="/worker/helpers"
              aria-label="Helpers"
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathname.startsWith("/worker/helpers")
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Users className="w-5 h-5" />
            </Link>
            <Link
              href="/worker/notifications"
              aria-label="Notifications"
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                pathname.startsWith("/worker/notifications")
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-card" />
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <aside className="fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border/80 z-40 flex flex-col">
          <div className="p-6 border-b border-border/40">
            <Link href="/worker/home" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group- transition-colors">
                <span className="text-white font-bold text-base">CC</span>
              </div>
              <div>
                <h1 className="font-bold text-base text-foreground leading-tight">Co-opConnect</h1>
                <p className="text-xs text-emerald-400 font-medium">Worker Dashboard</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/worker/home" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 font-semibold border-l-2 border-emerald-500 shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-400" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Cooperative Share</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">100% Payout</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Main content with safe bottom padding for mobile */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-10 w-full">
        {children}
      </main>

      {/* Bottom navigation - Mobile 5 core destinations */}
      <nav 
        aria-label="Worker Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/80 z-40 lg:hidden pb-safe"
      >
        <div className="flex items-center justify-around h-16 px-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/worker/home" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[60px] py-1.5 rounded-md transition-colors",
                  isActive ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "stroke-[2.2] scale-105" : "stroke-[1.7]")} />
                <span className={cn("text-[11px] font-medium tracking-tight", isActive ? "font-bold text-emerald-400" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
