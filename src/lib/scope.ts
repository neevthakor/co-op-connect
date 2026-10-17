import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/utils";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  const err = error as Error | ApiError;
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  if (err.message === 'Unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (err.message === 'Forbidden' || err.message?.startsWith('Forbidden:')) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
}

export async function requireRole(...roles: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (!roles.includes(session.user.role as UserRole)) {
    throw new ApiError(403, "Forbidden");
  }
  return session.user;
}

export async function requireRolePage(...roles: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!roles.includes(session.user.role as UserRole)) {
    redirect("/login");
  }
  return session.user;
}

export type Scope = {
  role: string;
  cooperativeId?: string;
  federationId?: string;
  cooperativeIds?: string[];
};

import { Session } from "next-auth";

export async function getScope(user: Session["user"]): Promise<Scope> {
  if (user.role === "COOPERATIVE_ADMIN") {
    return {
      role: user.role,
      cooperativeId: user.cooperativeId || undefined,
      cooperativeIds: user.cooperativeId ? [user.cooperativeId] : [],
    };
  }
  if (user.role === "FEDERATION_ADMIN") {
    const federationId = user.federationId || undefined;
    if (!federationId) {
      return { role: user.role as string, federationId, cooperativeIds: [] };
    }
    const coops = await prisma.cooperative.findMany({
      where: { federationId },
      select: { id: true },
    });
    return {
      role: user.role,
      federationId,
      cooperativeIds: coops.map((c) => c.id),
    };
  }
  return { role: user.role as string };
}

export function workerWhere(scope: Scope): any {
  if (scope.role === "ADMIN") return {};
  if (scope.role === "COOPERATIVE_ADMIN") return { cooperativeId: scope.cooperativeId };
  if (scope.role === "FEDERATION_ADMIN") return { cooperativeId: { in: scope.cooperativeIds } };
  return { cooperativeId: "NONE" };
}

export function cooperativeWhere(scope: Scope): any {
  if (scope.role === "ADMIN") return {};
  if (scope.role === "COOPERATIVE_ADMIN") return { id: scope.cooperativeId };
  if (scope.role === "FEDERATION_ADMIN") return { id: { in: scope.cooperativeIds } };
  return { id: "NONE" };
}

export function bookingWhere(scope: Scope): any {
  if (scope.role === "ADMIN") return {};
  if (scope.role === "COOPERATIVE_ADMIN") return { worker: { cooperativeId: scope.cooperativeId } };
  if (scope.role === "FEDERATION_ADMIN") return { worker: { cooperativeId: { in: scope.cooperativeIds } } };
  return { worker: { cooperativeId: "NONE" } };
}

export function validateClientCooperativeId(scope: Scope, clientCooperativeId?: string | null): string | undefined {
  if (!clientCooperativeId) return undefined;
  
  if (scope.role === "ADMIN") return clientCooperativeId;
  
  if (scope.role === "COOPERATIVE_ADMIN") {
    if (clientCooperativeId !== scope.cooperativeId) {
      throw new ApiError(403, "Forbidden: Cannot access other cooperative data");
    }
    return clientCooperativeId;
  }
  
  if (scope.role === "FEDERATION_ADMIN") {
    if (!scope.cooperativeIds?.includes(clientCooperativeId)) {
      throw new ApiError(403, "Forbidden: Cannot access data for cooperative outside your federation");
    }
    return clientCooperativeId;
  }
  
  return undefined;
}
