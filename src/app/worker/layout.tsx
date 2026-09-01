"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Calendar, Wallet, Users, MessageSquare, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/worker/home", label: "Home", icon: Home },
  { href: "/worker/jobs", label: "Jobs", icon: Briefcase },
  { href: "/worker/calendar", label: "Calendar", icon: Calendar },
  { href: "/worker/earnings", label: "Earnings", icon: Wallet },
  { href: "/worker/profile", label: "Profile", icon: User },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top header - mobile */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/worker/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-semibold text-gray-900">Co-opConnect</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/worker/helpers" className="p-2 rounded-full hover:bg-gray-100">
              <Users className="w-5 h-5 text-gray-600" />
            </Link>
            <Link href="/worker/messages" className="p-2 rounded-full hover:bg-gray-100">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>
            <Link href="/worker/notifications" className="p-2 rounded-full hover:bg-gray-100 relative">
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
            <Link href="/worker/home" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">CC</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Co-opConnect</h1>
                <p className="text-xs text-green-600 font-medium">Worker</p>
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
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/worker/helpers"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/worker/helpers")
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Users className="w-5 h-5" />
              Helpers
            </Link>
            <Link
              href="/worker/messages"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/worker/messages")
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <MessageSquare className="w-5 h-5" />
              Messages
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
                  isActive ? "text-green-600" : "text-gray-400"
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
