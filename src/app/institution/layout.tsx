"use client";

import { ClipboardList, FileText, LayoutDashboard, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

const navItems = [
  { href: "/institution/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/institution/locations", label: "Locations", icon: ClipboardList },
  { href: "/institution/contracts", label: "Contracts", icon: FileText },
  { href: "/institution/services", label: "Services", icon: ClipboardList },
  { href: "/institution/maintenance", label: "Maintenance", icon: Wrench },
];

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      homeHref="/institution/dashboard"
      roleLabel="Institution workspace"
      accent="teal"
      navItems={navItems}
      mobileNavItems={[navItems[0], navItems[2], navItems[3], navItems[4]]}
      signOutEnabled
    >
      {children}
    </PortalShell>
  );
}
