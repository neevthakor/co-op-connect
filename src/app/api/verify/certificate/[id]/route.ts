import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const certificate = await (prisma as any).platformCertificate.findUnique({
      where: { id },
      include: {
        worker: { include: { user: true } },
        cooperative: true,
      }
    });

    if (!certificate || certificate.status !== "ACTIVE") {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
