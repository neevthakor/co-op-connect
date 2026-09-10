"use client";

import { ClipboardList, LayoutDashboard, Users } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

const navItems = [
  { href: "/cooperative/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cooperative/requests", label: "Requests", icon: ClipboardList },
  { href: "/cooperative/workers", label: "Workers", icon: Users },
];

export default function CooperativeLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      homeHref="/cooperative/dashboard"
      roleLabel="Cooperative operations"
      accent="amber"
      navItems={navItems}
      mobileNavItems={navItems}
      signOutEnabled
    >
      {children}
    </PortalShell>
  );
}
