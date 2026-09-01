"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Heart, Bell, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer/home", label: "Home", icon: Home },
  { href: "/customer/services", label: "Services", icon: Search },
  { href: "/customer/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/customer/trusted", label: "Trusted", icon: Heart },
  { href: "/customer/profile", label: "Profile", icon: User },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top header - mobile */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/customer/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-semibold text-gray-900">Co-opConnect</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/customer/messages"
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>
            <Link
              href="/customer/notifications"
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40">
          <div className="p-6">
            <Link href="/customer/home" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">CC</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Co-opConnect</h1>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </Link>
          </div>
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/customer/messages"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/customer/messages")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <MessageSquare className="w-5 h-5" />
              Messages
            </Link>
            <Link
              href="/customer/notifications"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/customer/notifications")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </Link>
          </nav>
        </aside>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Bottom navigation - mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
