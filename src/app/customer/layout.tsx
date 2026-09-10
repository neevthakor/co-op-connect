"use client";

import { Bell, CalendarDays, Heart, Home, Search, User } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

const navItems = [
  { href: "/customer/home", label: "Home", icon: Home },
  { href: "/customer/services", label: "Services", icon: Search },
  { href: "/customer/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/customer/trusted", label: "Trusted workers", icon: Heart },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/profile", label: "Profile & settings", icon: User },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      homeHref="/customer/home"
      roleLabel="Customer portal"
      accent="blue"
      navItems={navItems}
      mobileNavItems={navItems.slice(0, 3).concat(navItems[5])}
      notificationHref="/customer/notifications"
    >
      {children}
    </PortalShell>
  );
}
