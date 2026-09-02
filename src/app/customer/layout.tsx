"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, MessageSquare, User, Bell, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile bottom nav destinations (exactly 5 items per mobile-first rules)
const mobileNavItems = [
  { href: "/customer/home", label: "Home", icon: Home },
  { href: "/customer/services", label: "Services", icon: Search },
  { href: "/customer/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  { href: "/customer/profile", label: "Profile", icon: User },
];

// Desktop sidebar items (includes secondary areas like Trusted & Notifications)
const desktopNavItems = [
  { href: "/customer/home", label: "Home", icon: Home },
  { href: "/customer/services", label: "Services", icon: Search },
  { href: "/customer/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  { href: "/customer/trusted", label: "Trusted Workers", icon: Heart },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/profile", label: "Profile & Settings", icon: User },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top header - Mobile view */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/80 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/customer/home" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">Co-opConnect</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/customer/trusted"
              aria-label="Trusted Workers"
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathname.startsWith("/customer/trusted")
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Heart className="w-5 h-5" />
            </Link>
            <Link
              href="/customer/notifications"
              aria-label="Notifications"
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                pathname.startsWith("/customer/notifications")
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card" />
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <aside className="fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border/80 z-40 flex flex-col">
          <div className="p-6 border-b border-border/40">
            <Link href="/customer/home" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group- transition-colors">
                <span className="text-white font-bold text-base">CC</span>
              </div>
              <div>
                <h1 className="font-bold text-base text-foreground leading-tight">Co-opConnect</h1>
                <p className="text-xs text-primary font-medium">Customer Portal</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/customer/home" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/15 text-primary font-semibold border-l-2 border-primary shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Cooperative Guarantee</span>
              <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono font-bold">100% Fair</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Main content with safe bottom padding for fixed mobile nav */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-10 w-full">
        {children}
      </main>

      {/* Bottom navigation - Mobile 5 core destinations */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/80 z-40 lg:hidden pb-safe"
      >
        <div className="flex items-center justify-around h-16 px-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/customer/home" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[60px] py-1.5 rounded-md transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "stroke-[2.2] scale-105" : "stroke-[1.7]")} />
                <span className={cn("text-[11px] font-medium tracking-tight", isActive ? "font-bold text-primary" : "text-muted-foreground")}>
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
