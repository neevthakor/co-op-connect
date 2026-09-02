import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      primaryTrade,
      experience = 1,
      cooperativeId,
      skillIds = [],
      address,
      city = 'Ahmedabad',
      state = 'Gujarat',
      isEmergencyAvailable = false,
      role = 'WORKER',
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Full legal name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!primaryTrade || typeof primaryTrade !== 'string') {
      return NextResponse.json({ error: 'Primary trade selection is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Pick first active cooperative if not provided
    let coopId = cooperativeId;
    if (!coopId) {
      const defaultCoop = await prisma.cooperative.findFirst({ where: { isActive: true } });
      coopId = defaultCoop?.id || null;
    }

    const userRole = role === 'HELPER' ? 'HELPER' : 'WORKER';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone && typeof phone === 'string' ? phone.trim() : null,
        passwordHash,
        role: userRole,
        language: 'en',
        worker: {
          create: {
            cooperativeId: coopId,
            primaryTrade: primaryTrade.trim(),
            experience: parseInt(experience.toString(), 10) || 1,
            address: address && typeof address === 'string' ? address.trim() : 'Ahmedabad, Gujarat',
            city,
            state,
            verificationStatus: 'PENDING', // Real worker starts as PENDING until verified by cooperative admin
            availabilityStatus: 'OFFLINE',
            isEmergencyAvailable: !!isEmergencyAvailable,
            totalJobs: 0,
            averageRating: 0,
            completionRate: 100,
            punctualityScore: 100,
            latitude: 23.0225 + (Math.random() - 0.5) * 0.05,
            longitude: 72.5714 + (Math.random() - 0.5) * 0.05,
          },
        },
      },
      include: {
        worker: true,
      },
    });

    const workerId = user.worker?.id;

    // Add skills if provided
    if (workerId && Array.isArray(skillIds) && skillIds.length > 0) {
      for (const sId of skillIds) {
        await prisma.workerSkill.create({
          data: {
            workerId,
            skillId: sId,
            proficiencyLevel: 'INTERMEDIATE',
            verified: false,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Worker registered successfully. Your profile is pending verification by cooperative admin.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        worker: { id: user.worker?.id, verificationStatus: user.worker?.verificationStatus },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Worker Registration Error:', error);
    return NextResponse.json(
      { error: error.message || 'Worker registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
