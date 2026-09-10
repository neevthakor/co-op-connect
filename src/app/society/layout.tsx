"use client";

import { ClipboardList, FileText, LayoutDashboard, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

const navItems = [
  { href: "/society/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/society/locations", label: "Locations", icon: ClipboardList },
  { href: "/society/requests", label: "Requests", icon: FileText },
  { href: "/society/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/society/invoices", label: "Invoices", icon: FileText },
];

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      homeHref="/society/dashboard"
      roleLabel="Housing society"
      accent="amber"
      navItems={navItems}
      mobileNavItems={[navItems[0], navItems[2], navItems[3], navItems[4]]}
      signOutEnabled
    >
      {children}
    </PortalShell>
  );
}
