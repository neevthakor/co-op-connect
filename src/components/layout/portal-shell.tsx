"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  Bell,
  Briefcase,
  Calendar,
  CalendarDays,
  ClipboardList,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  User,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const portalIconMap = {
  Activity,
  Bell,
  Briefcase,
  Calendar,
  CalendarDays,
  ClipboardList,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  Search,
  ShieldCheck,
  User,
  Users,
  Wallet,
  Wrench,
} satisfies Record<string, LucideIcon>;

type PortalIconName = keyof typeof portalIconMap;

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon | PortalIconName;
};

type PortalShellProps = {
  children: React.ReactNode;
  homeHref: string;
  roleLabel: string;
  accent: "blue" | "emerald" | "amber" | "teal";
  navItems: PortalNavItem[];
  mobileNavItems?: PortalNavItem[];
  notificationHref?: string;
  signOutEnabled?: boolean;
};

const accents = {
  blue: {
    mark: "bg-blue-600 shadow-blue-600/20",
    label: "text-blue-700 dark:text-blue-300",
    active: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-600",
    icon: "text-blue-700 dark:text-blue-300",
    selection: "selection:bg-blue-500/20",
  },
  emerald: {
    mark: "bg-emerald-600 shadow-emerald-600/20",
    label: "text-emerald-700 dark:text-emerald-300",
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-600",
    icon: "text-emerald-700 dark:text-emerald-300",
    selection: "selection:bg-emerald-500/20",
  },
  amber: {
    mark: "bg-amber-600 shadow-amber-600/20",
    label: "text-amber-700 dark:text-amber-300",
    active: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-600",
    icon: "text-amber-700 dark:text-amber-300",
    selection: "selection:bg-amber-500/20",
  },
  teal: {
    mark: "bg-teal-600 shadow-teal-600/20",
    label: "text-teal-700 dark:text-teal-300",
    active: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-600",
    icon: "text-teal-700 dark:text-teal-300",
    selection: "selection:bg-teal-500/20",
  },
};

function isItemActive(pathname: string, item: PortalNavItem, homeHref: string) {
  return pathname === item.href || (item.href !== homeHref && pathname.startsWith(`${item.href}/`));
}

function getPortalIcon(icon: PortalNavItem["icon"]) {
  return typeof icon === "string" ? portalIconMap[icon] : icon;
}

function Brand({ homeHref, roleLabel, accent }: Pick<PortalShellProps, "homeHref" | "roleLabel" | "accent">) {
  const colors = accents[accent];

  return (
    <Link href={homeHref} className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-md", colors.mark)}>CC</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold tracking-tight text-foreground">Co-opConnect</span>
        <span className={cn("block truncate text-xs font-semibold", colors.label)}>{roleLabel}</span>
      </span>
    </Link>
  );
}

export function PortalShell({
  children,
  homeHref,
  roleLabel,
  accent,
  navItems,
  mobileNavItems = navItems.slice(0, 4),
  notificationHref,
  signOutEnabled = false,
}: PortalShellProps) {
  const pathname = usePathname();
  const colors = accents[accent];

  return (
    <div className={cn("min-h-screen bg-background text-foreground", colors.selection)}>
      <header className="safe-top sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur lg:hidden">
        <div className="flex min-h-14 items-center justify-between gap-3 px-4">
          <Brand homeHref={homeHref} roleLabel={roleLabel} accent={accent} />
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle compact />
            {notificationHref && (
              <Link
                href={notificationHref}
                aria-label="Notifications"
                className={cn(
                  "relative inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  pathname.startsWith(notificationHref) && colors.active
                )}
              >
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-card" />
              </Link>
            )}
            {signOutEnabled && (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Sign out"
                className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="size-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/80 bg-card lg:flex">
        <div className="border-b border-border/70 p-5">
          <Brand homeHref={homeHref} roleLabel={roleLabel} accent={accent} />
        </div>
        <nav aria-label={`${roleLabel} navigation`} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = isItemActive(pathname, item, homeHref);
            const Icon = getPortalIcon(item.icon);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl border-l-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && colors.active
                )}
              >
                <Icon className={cn("size-4 shrink-0", active ? colors.icon : "text-muted-foreground")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/70 p-4">
          <ThemeToggle className="mb-2 w-full justify-start" />
          {signOutEnabled ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          ) : (
            <p className="px-3 text-xs leading-relaxed text-muted-foreground">A cooperative-owned service network built around trust and fair work.</p>
          )}
        </div>
      </aside>

      <main className="min-h-screen overflow-x-clip pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:ml-64 lg:pb-10">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>

      <nav aria-label={`${roleLabel} mobile navigation`} className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 px-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const active = isItemActive(pathname, item, homeHref);
            const Icon = getPortalIcon(item.icon);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? colors.label : "hover:text-foreground"
                )}
              >
                <Icon className={cn("size-5", active && "stroke-[2.4]")} />
                <span className="max-w-full truncate text-[11px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
