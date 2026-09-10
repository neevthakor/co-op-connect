import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assignWorkerToOrganizationRequest } from '@/services/organization';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || userRole !== 'FEDERATION_ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const formData = await req.formData();
    const requestId = formData.get('requestId') as string;
    const type = formData.get('type') as "SOCIETY" | "INSTITUTION";
    const workerId = formData.get('workerId') as string;

    if (!requestId || !type || !workerId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await assignWorkerToOrganizationRequest({
      requestId,
      type,
      workerId,
      assignedByUserId: session.user.id!
    });

    return NextResponse.redirect(new URL('/admin/organization-requests', req.url), 303);
  } catch (error: any) {
    console.error('Failed to assign worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
