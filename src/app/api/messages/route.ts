import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/services/notification';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const otherUserId = searchParams.get('otherUserId');

    if (bookingId) {
      const messages = await prisma.message.findMany({
        where: { bookingId },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          recipient: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(messages);
    }

    if (otherUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: session.user.id },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          recipient: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(messages);
    }

    // Return all user conversations
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { recipientId: session.user.id }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        recipient: { select: { id: true, name: true, avatar: true } },
        booking: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Messages GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, content, bookingId, mediaUrl } = body;

    if (!recipientId || !content) {
      return NextResponse.json({ error: 'recipientId and content are required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        content,
        bookingId: bookingId || null,
        mediaUrl: mediaUrl || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        recipient: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify recipient
    await sendNotification(
      recipientId,
      'MESSAGE',
      `New message from ${session.user.name || 'User'}`,
      content.slice(0, 100),
      { messageId: message.id, senderId: session.user.id, bookingId }
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error('Messages POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}

