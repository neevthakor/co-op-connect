import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { assignWorkerToOrganizationRequest } from '@/services/organization';

import { requireRole, handleApiError, getScope } from '@/lib/scope';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);

    const formData = await req.formData();
    const requestId = formData.get('requestId') as string;
    const type = formData.get('type') as "SOCIETY" | "INSTITUTION";
    const workerId = formData.get('workerId') as string;

    if (!requestId || !type || !workerId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (scope.role === 'FEDERATION_ADMIN') {
      const request = type === 'SOCIETY' 
        ? await prisma.societyServiceRequest.findUnique({ where: { id: requestId } })
        : await prisma.institutionServiceRequest.findUnique({ where: { id: requestId } });
      
      if (!request) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      if (request.cooperativeId && !scope.cooperativeIds?.includes(request.cooperativeId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await assignWorkerToOrganizationRequest({
      requestId,
      type,
      workerId,
      assignedByUserId: sessionUser.id!
    });

    return NextResponse.redirect(new URL('/admin/organization-requests', req.url), 303);
  } catch (error: any) {
    return handleApiError(error);
  }
}
