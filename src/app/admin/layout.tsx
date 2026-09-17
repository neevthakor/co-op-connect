import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortalShell, type PortalNavItem } from "@/components/layout/portal-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "";

  if (!session?.user || !["ADMIN", "COOPERATIVE_ADMIN", "FEDERATION_ADMIN"].includes(userRole)) {
    redirect("/login");
  }

  const adminNavItem = (href: string, label: string, icon: PortalNavItem["icon"]): PortalNavItem => ({ href, label, icon });

  const navItems: PortalNavItem[] = [
    adminNavItem("/admin", "Dashboard", "LayoutDashboard"),
    ...(userRole === "COOPERATIVE_ADMIN"
      ? [
          adminNavItem("/admin/workers", "Workers", "Users"),
          adminNavItem("/admin/verification", "Worker verification", "ShieldCheck"),
          adminNavItem("/admin/complaints", "Customer issues", "Activity"),
          adminNavItem("/admin/analytics", "Workforce analytics", "Activity"),
          adminNavItem("/admin/bookings", "Bookings", "ClipboardList"),
        ]
      : []),
    ...(userRole === "FEDERATION_ADMIN"
      ? [
          adminNavItem("/admin/workers", "Workers", "Users"),
          adminNavItem("/admin/verification", "Worker verification", "ShieldCheck"),
          adminNavItem("/admin/organization-requests", "Organization requests", "ClipboardList")
        ]
      : []),
    ...(userRole === "ADMIN"
      ? [
          adminNavItem("/admin/workers", "Worker verification", "ShieldCheck"),
          adminNavItem("/admin/bookings", "Bookings & jobs", "ClipboardList"),
        ]
      : []),
  ];

  return (
    <PortalShell
      homeHref="/admin"
      roleLabel={userRole === "FEDERATION_ADMIN" ? "Federation admin" : "Platform admin"}
      accent="blue"
      navItems={navItems}
      mobileNavItems={navItems.slice(0, 4)}
      signOutEnabled
    >
      {children}
    </PortalShell>
  );
}
