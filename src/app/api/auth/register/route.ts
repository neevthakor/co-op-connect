import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, address, city = 'Ahmedabad', state = 'Gujarat' } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Secure password hashing
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User and linked Customer record in a transaction
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone && typeof phone === 'string' ? phone.trim() : null,
        passwordHash,
        role: 'CUSTOMER',
        language: 'en',
        customer: {
          create: {
            address: address && typeof address === 'string' ? address.trim() : 'Ahmedabad',
            city,
            state,
            latitude: 23.0225 + (Math.random() - 0.5) * 0.05,
            longitude: 72.5714 + (Math.random() - 0.5) * 0.05,
          },
        },
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          customerId: user.customer?.id,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Customer Registration Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
