import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ROUTE_PERMISSIONS: { prefix: string; roles: string[] }[] = [
  { prefix: "/customer", roles: ["CUSTOMER"] },
  { prefix: "/worker", roles: ["WORKER", "HELPER"] },
  { prefix: "/admin", roles: ["ADMIN", "COOPERATIVE_ADMIN", "FEDERATION_ADMIN"] },
  { prefix: "/society", roles: ["SOCIETY_ADMIN"] },
  { prefix: "/institution", roles: ["INSTITUTIONAL_CUSTOMER"] },
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;

  // Public routes
  if (
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/register" ||
    nextUrl.pathname === "/worker/register" ||
    nextUrl.pathname === "/customer/register" ||
    nextUrl.pathname === "/society/register" ||
    nextUrl.pathname === "/institution/register" ||
    nextUrl.pathname === "/forgot-password" ||
    nextUrl.pathname === "/reset-password" ||
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname.startsWith("/_next/") ||
    nextUrl.pathname.startsWith("/favicon") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const matchedRoute = ROUTE_PERMISSIONS.find((r) =>
    nextUrl.pathname.startsWith(r.prefix)
  );

  if (matchedRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    if (!matchedRoute.roles.includes(userRole)) {
      // Redirect to their appropriate dashboard
      const roleRedirects: Record<string, string> = {
        CUSTOMER: "/customer/home",
        WORKER: "/worker/home",
        ADMIN: "/admin",
        COOPERATIVE_ADMIN: "/admin",
        FEDERATION_ADMIN: "/admin",
        SOCIETY_ADMIN: "/society/dashboard",
        INSTITUTIONAL_CUSTOMER: "/institution/dashboard",
      };
      const redirect = roleRedirects[userRole] || "/login";
      return NextResponse.redirect(new URL(redirect, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|avatars|uploads|portfolio).*)"],
};
