import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function isAuthorized(workerId: string, user: any) {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'COOPERATIVE_ADMIN') {
    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (worker && worker.cooperativeId === user.cooperativeId) return true;
  }
  if (user.role === 'WORKER' && user.workerId === workerId) return true;
  if (user.role === 'CUSTOMER') {
    // Customer can only view if worker has an ACCEPTED (or later) booking with them
    const activeBooking = await prisma.booking.findFirst({
      where: {
        customerId: user.customerId,
        workerId: workerId,
        status: { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED'] },
      }
    });
    if (activeBooking) return true;
  }
  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const workerId = resolvedParams.id;

    if (!(await isAuthorized(workerId, session.user))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { user: true }
    });

    if (!worker || !worker.user?.avatar) {
      return NextResponse.json({ error: 'No photo found' }, { status: 404 });
    }

    // Avatar path example: worker-profile-photos/clk123.../profile.jpg
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('private-uploads')
      .createSignedUrl(worker.user.avatar, 3600);

    if (signError) throw signError;

    return NextResponse.json({ url: signedData.signedUrl });
  } catch (error) {
    console.error('Photo GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const workerId = resolvedParams.id;

    if (session.user.role !== 'WORKER' || session.user.workerId !== workerId) {
      return NextResponse.json({ error: 'Forbidden. Only the worker can upload their own photo.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Profile photo is required.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Profile photo exceeds 5MB limit' }, { status: 400 });
    }
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      return NextResponse.json({ error: 'Invalid profile photo type.' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { user: true }
    });
    if (!worker || !worker.user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const fileName = `worker-profile-photos/${worker.user.id}/profile.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('private-uploads')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    await prisma.user.update({
      where: { id: worker.user.id },
      data: { avatar: fileName },
    });

    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('private-uploads')
      .createSignedUrl(fileName, 3600);
      
    if (signError) throw signError;

    return NextResponse.json({ success: true, url: signedData.signedUrl });
  } catch (error) {
    console.error('Photo POST Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
