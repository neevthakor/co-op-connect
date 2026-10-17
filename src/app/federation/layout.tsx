import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortalShell, type PortalNavItem } from "@/components/layout/portal-shell";

export const dynamic = "force-dynamic";

export default async function FederationLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "";

  if (!session?.user || !["FEDERATION_ADMIN", "ADMIN"].includes(userRole)) {
    redirect("/login");
  }

  const navItem = (href: string, label: string, icon: PortalNavItem["icon"]): PortalNavItem => ({ href, label, icon });

  const navItems: PortalNavItem[] = [
    navItem("/federation/dashboard", "Dashboard", "LayoutDashboard"),
    navItem("/federation/cooperatives", "Cooperatives", "Briefcase"),
    navItem("/federation/workers", "Workers", "Users"),
    navItem("/federation/verification", "Verification", "ShieldCheck"),
    navItem("/federation/org-requests", "Organization Requests", "ClipboardList"),
    navItem("/federation/organizations", "Organizations", "Briefcase"),
    navItem("/federation/welfare", "Welfare Fund", "Heart"),
    navItem("/federation/governance", "Governance", "FileText"),
    navItem("/federation/disputes", "Disputes", "ShieldAlert"),
    navItem("/federation/analytics", "Analytics", "Activity"),
  ];

  return (
    <PortalShell
      homeHref="/federation/dashboard"
      roleLabel="Federation Admin"
      accent="blue"
      navItems={navItems}
      mobileNavItems={navItems.slice(0, 4)}
      signOutEnabled={true}
    >
      {children}
    </PortalShell>
  );
}
