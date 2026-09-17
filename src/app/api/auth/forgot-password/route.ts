import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Look up user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // DO NOT reveal if user exists to prevent account enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists for this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // 2. Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 3. Expiration: 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // 4. Invalidate previous active tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() }, // still active
      },
      data: {
        usedAt: new Date(), // effectively invalidate them by marking as "used" or expired. 
        // We'll just set expiresAt to now
        expiresAt: new Date(),
      },
    });

    // 5. Save hash to DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // 6. Generate the link
    // Support standard Vercel environment variables or explicit NEXT_PUBLIC_APP_URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    
    // Vercel URLs don't include protocol, so add https:// if missing and not localhost
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    // 7. Send Email
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'An error occurred while sending the reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'If an account exists for this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot Password API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
