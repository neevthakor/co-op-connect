import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, address, city = 'Ahmedabad', units, contactPerson } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Society name is required' }, { status: 400 });
    }

    if (!contactPerson || typeof contactPerson !== 'string' || contactPerson.trim().length === 0) {
      return NextResponse.json({ error: 'Contact person name is required' }, { status: 400 });
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

    // Create User, Society, and SocietyAdmin in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const society = await tx.housingSociety.create({
        data: {
          name: name.trim(),
          address: address ? address.trim() : 'Location Not Provided',
          city,
          units: units ? parseInt(units, 10) : undefined,
          contactPerson: contactPerson.trim(),
          contactPhone: normalizedPhone,
        }
      });

      const newUser = await tx.user.create({
        data: {
          name: contactPerson.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          passwordHash,
          role: 'SOCIETY_ADMIN',
          language: 'en',
          societyAdmin: {
            create: {
              societyId: society.id
            }
          }
        },
        include: {
          societyAdmin: true,
        }
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Housing Society registered successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Society Registration Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register society. Please try again.' },
      { status: 500 }
    );
  }
}
