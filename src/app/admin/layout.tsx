import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity, ClipboardList, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "";

  if (!session?.user || !["ADMIN", "COOPERATIVE_ADMIN", "FEDERATION_ADMIN"].includes(userRole)) {
    redirect("/login");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ...(userRole === "COOPERATIVE_ADMIN"
      ? [
          { href: "/admin/workers", label: "Workers", icon: Users },
          { href: "/admin/verification", label: "Worker verification", icon: ShieldCheck },
          { href: "/admin/complaints", label: "Customer issues", icon: Activity },
          { href: "/admin/analytics", label: "Workforce analytics", icon: Activity },
          { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
        ]
      : []),
    ...(userRole === "FEDERATION_ADMIN"
      ? [{ href: "/admin/organization-requests", label: "Organization requests", icon: ClipboardList }]
      : []),
    ...(userRole === "ADMIN"
      ? [
          { href: "/admin/workers", label: "Worker verification", icon: ShieldCheck },
          { href: "/admin/bookings", label: "Bookings & jobs", icon: ClipboardList },
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
