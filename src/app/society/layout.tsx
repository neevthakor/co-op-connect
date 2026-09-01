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
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-gray-200 z-40 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link href="/society/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">CC</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Co-opConnect</h1>
              <p className="text-[11px] text-amber-600 font-medium">Housing Society</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-40 flex items-center justify-between px-4">
        <span className="font-semibold text-gray-900">Housing Society</span>
        <Bell className="w-5 h-5 text-gray-600" />
      </div>

      <main className="flex-1 md:ml-60 pt-14 md:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 min-w-[64px] py-1",
                  isActive ? "text-amber-600" : "text-gray-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
