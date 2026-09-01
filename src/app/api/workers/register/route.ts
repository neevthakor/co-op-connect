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

    if (!name || !email || !password || !primaryTrade) {
      return NextResponse.json(
        { error: 'Name, email, password, and primary trade are required' },
        { status: 400 }
      );
    }

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Pick first active cooperative if not provided
    let coopId = cooperativeId;
    if (!coopId) {
      const defaultCoop = await prisma.cooperative.findFirst({ where: { isActive: true } });
      coopId = defaultCoop?.id || null;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: role === 'HELPER' ? 'HELPER' : 'WORKER',
        language: 'en',
      },
    });

    const worker = await prisma.worker.create({
      data: {
        userId: user.id,
        cooperativeId: coopId,
        primaryTrade,
        experience: parseInt(experience.toString()) || 1,
        address: address || 'Ahmedabad, Gujarat',
        city,
        state,
        verificationStatus: 'PENDING',
        availabilityStatus: 'OFFLINE',
        isEmergencyAvailable: !!isEmergencyAvailable,
        latitude: 23.0225 + (Math.random() - 0.5) * 0.05,
        longitude: 72.5714 + (Math.random() - 0.5) * 0.05,
      },
    });

    // Add skills if provided
    if (Array.isArray(skillIds) && skillIds.length > 0) {
      for (const sId of skillIds) {
        await prisma.workerSkill.create({
          data: {
            workerId: worker.id,
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
        worker: { id: worker.id, verificationStatus: worker.verificationStatus },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Worker Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}

