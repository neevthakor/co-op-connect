import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing token' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // 1. Hash the provided raw token to compare with DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'This password reset link is invalid.' }, { status: 400 });
    }

    // 3. Check if used
    if (resetToken.usedAt) {
      return NextResponse.json({ error: 'This password reset link has already been used.' }, { status: 400 });
    }

    // 4. Check if expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This password reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // 5. Hash new password EXACTLY like /api/auth/register
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. Update user and invalidate token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate any other active tokens for this user
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          expiresAt: new Date(),
          usedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
