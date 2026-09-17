import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type = 'OTHER', email, phone, password, address, city = 'Ahmedabad', contactPerson } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Institution name is required' }, { status: 400 });
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

    // Create User, Institution, and InstitutionalCustomer in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: name.trim(),
          type,
          address: address ? address.trim() : 'Location Not Provided',
          city,
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
          role: 'INSTITUTIONAL_CUSTOMER',
          language: 'en',
          institutionalCustomer: {
            create: {
              institutionId: institution.id
            }
          }
        },
        include: {
          institutionalCustomer: true,
        }
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Institution registered successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Institution Registration Error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Failed to register institution. Please try again.' },
      { status: 500 }
    );
  }
}
