import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// This is a Mock Adapter for DigiLocker OAuth & Document Verification
// Real implementation requires API Setu credentials, OAuth flow, and XML/JSON parsing.

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'WORKER') {
      return NextResponse.json({ error: 'Only workers can use this endpoint' }, { status: 403 });
    }

    const workerId = session.user.workerId;
    if (!workerId) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { aadhaarNumber, consent } = body;

    if (!consent) {
      return NextResponse.json({ error: 'User consent is required' }, { status: 400 });
    }

    // MOCK VERIFICATION DELAY
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update worker status as Verified via DigiLocker
    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        identityVerified: true,
        identityDocType: 'AADHAAR',
        identityDocMasked: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-XXXX',
        verificationMethod: 'DIGILOCKER',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: 'SYSTEM_DIGILOCKER',
        verificationNotes: 'Automatically verified via DigiLocker OAuth Mock adapter',
      },
    });

    return NextResponse.json({ 
      success: true, 
      worker: {
        verificationStatus: updatedWorker.verificationStatus,
        verificationMethod: updatedWorker.verificationMethod,
      } 
    });
  } catch (error) {
    console.error('DigiLocker Mock Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to verify identity' }, { status: 500 });
  }
}
