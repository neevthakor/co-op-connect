import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/utils";

type Permission =
  | 'booking:create' | 'booking:read' | 'booking:update' | 'booking:cancel'
  | 'worker:read' | 'worker:manage' | 'worker:verify'
  | 'customer:read' | 'customer:manage'
  | 'earnings:read' | 'earnings:manage'
  | 'helper:request' | 'helper:manage'
  | 'team:create' | 'team:manage'
  | 'payment:create' | 'payment:read'
  | 'invoice:read' | 'invoice:create'
  | 'complaint:create' | 'complaint:manage'
  | 'rating:create' | 'rating:read'
  | 'verification:manage'
  | 'demand:read' | 'forecast:read'
  | 'capacity:read' | 'capacity:manage'
  | 'welfare:read' | 'welfare:manage'
  | 'finance:read' | 'finance:manage'
  | 'dispute:manage'
  | 'fraud:read' | 'fraud:manage'
  | 'voting:read' | 'voting:vote'
  | 'settings:manage'
  | 'admin:all'
  | 'society:manage'
  | 'institution:manage';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  CUSTOMER: [
    'booking:create', 'booking:read', 'booking:cancel',
    'worker:read', 'customer:read',
    'payment:create', 'payment:read',
    'invoice:read',
    'complaint:create', 'rating:create', 'rating:read',
  ],
  WORKER: [
    'booking:read', 'booking:update',
    'worker:read', 'earnings:read',
    'helper:request',
    'team:create',
    'invoice:read',
    'rating:read',
    'voting:vote',
  ],
  HELPER: [
    'booking:read', 'booking:update',
    'worker:read', 'earnings:read',
    'rating:read',
    'voting:vote',
  ],
  ADMIN: [
    'booking:create', 'booking:read', 'booking:update', 'booking:cancel',
    'worker:read', 'worker:manage', 'worker:verify',
    'customer:read', 'customer:manage',
    'earnings:read', 'earnings:manage',
    'helper:request', 'helper:manage',
    'team:create', 'team:manage',
    'payment:create', 'payment:read',
    'invoice:read', 'invoice:create',
    'complaint:create', 'complaint:manage',
    'rating:create', 'rating:read',
    'verification:manage',
    'demand:read', 'forecast:read',
    'capacity:read', 'capacity:manage',
    'welfare:read', 'welfare:manage',
    'finance:read', 'finance:manage',
    'dispute:manage',
    'fraud:read', 'fraud:manage',
    'voting:read', 'voting:vote',
    'settings:manage',
    'admin:all',
    'society:manage',
    'institution:manage'
  ],
  COOPERATIVE_ADMIN: [
    'booking:read', 'booking:update',
    'worker:read', 'worker:manage', 'worker:verify',
    'customer:read',
    'earnings:read', 'earnings:manage',
    'helper:manage', 'team:manage',
    'payment:read', 'invoice:read', 'invoice:create',
    'complaint:manage', 'rating:read',
    'verification:manage',
    'demand:read', 'forecast:read',
    'capacity:read', 'capacity:manage',
    'welfare:read', 'welfare:manage',
    'finance:read', 'finance:manage',
    'dispute:manage',
    'fraud:read', 'fraud:manage',
    'voting:read', 'voting:vote',
    'settings:manage',
  ],
  FEDERATION_ADMIN: [
    'admin:all',
    'booking:read', 'worker:read', 'worker:manage',
    'customer:read',
    'demand:read', 'forecast:read',
    'capacity:read', 'capacity:manage',
    'welfare:read', 'finance:read',
    'fraud:read',
    'voting:read',
  ],
  SOCIETY_ADMIN: [
    'booking:create', 'booking:read',
    'worker:read',
    'payment:read', 'invoice:read',
    'complaint:create',
    'society:manage',
  ],
  INSTITUTIONAL_CUSTOMER: [
    'booking:create', 'booking:read',
    'worker:read',
    'payment:read', 'invoice:read',
    'complaint:create',
    'institution:manage',
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export async function requireAuth(...requiredRoles: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHORIZED');
  }

  const userRole = (session.user as any).role as string;
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole as UserRole)) {
    throw new Error('FORBIDDEN');
  }

  return session.user as any;
}

export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHORIZED');
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, permission)) {
    throw new Error('FORBIDDEN');
  }

  return session.user as any;
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case 'CUSTOMER': return '/customer/home';
    case 'WORKER':
    case 'HELPER': return '/worker/home';
    case 'ADMIN': return '/admin';
    case 'COOPERATIVE_ADMIN': return '/admin/overview';
    case 'FEDERATION_ADMIN': return '/admin/overview';
    case 'SOCIETY_ADMIN': return '/society/dashboard';
    case 'INSTITUTIONAL_CUSTOMER': return '/institution/dashboard';
    default: return '/login';
  }
}
