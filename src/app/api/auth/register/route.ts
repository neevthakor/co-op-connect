import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, address, city = 'Unspecified', state = 'Unspecified' } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return NextResponse.json({ error: 'A phone number is required' }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: 'A valid 10-digit Indian mobile number is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    // Check if email or phone is already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      } else {
        return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 });
      }
    }

    // Secure password hashing
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User and linked Customer record in a transaction
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: 'CUSTOMER',
        language: 'en',
        customer: {
          create: {
            address: address && typeof address === 'string' ? address.trim() : 'Location Not Provided',
            city,
            state,
            latitude: null,
            longitude: null,
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
  } catch (error) {
    console.error('Customer Registration Error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
