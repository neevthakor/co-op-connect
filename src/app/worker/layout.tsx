"use client";

import { Bell, Briefcase, Calendar, Home, User, Users, Wallet } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

const navItems = [
  { href: "/worker/home", label: "Home", icon: Home },
  { href: "/worker/jobs", label: "Jobs", icon: Briefcase },
  { href: "/worker/calendar", label: "Calendar", icon: Calendar },
  { href: "/worker/earnings", label: "Earnings", icon: Wallet },
  { href: "/worker/helpers", label: "Helpers & teams", icon: Users },
  { href: "/worker/notifications", label: "Notifications", icon: Bell },
  { href: "/worker/profile", label: "Profile & KYC", icon: User },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      homeHref="/worker/home"
      roleLabel="Worker dashboard"
      accent="emerald"
      navItems={navItems}
      mobileNavItems={[navItems[0], navItems[1], navItems[3], navItems[6]]}
      notificationHref="/worker/notifications"
    >
      {children}
    </PortalShell>
  );
}
