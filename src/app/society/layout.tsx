"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, ClipboardList, Wrench, FileText, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/society/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/society/requests", label: "Requests", icon: ClipboardList },
  { href: "/society/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/society/invoices", label: "Invoices", icon: FileText },
];

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-500/20">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-60 bg-card border-r border-border/80 z-40 hidden md:flex flex-col">
        <div className="p-6 border-b border-border/40">
          <Link href="/society/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-600/20">
              <span className="text-white font-bold">CC</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm">Co-opConnect</h1>
              <p className="text-[11px] text-amber-500 font-medium">Housing Society</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-500/15 text-amber-400 font-semibold border-l-2 border-amber-500"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/40">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-md border-b border-border/80 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">CC</div>
          <span className="font-bold text-sm text-foreground">Housing Society</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            aria-label="Notifications" 
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main className="flex-1 md:ml-60 pt-14 md:pt-0 pb-24 md:pb-8 w-full overflow-x-hidden">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav 
        aria-label="Society Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/80 z-40 pb-safe"
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/society/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 transition-colors",
                  isActive ? "text-amber-400 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.3]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
