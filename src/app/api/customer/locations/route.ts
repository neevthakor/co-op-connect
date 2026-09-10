import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = session.user.customerId;
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const locations = await prisma.customerLocation.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(locations);
  } catch (error: any) {
    console.error('Failed to fetch locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = session.user.customerId;
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const body = await req.json();
    const { address, city, state, pincode, latitude, longitude, isDefault } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // De-duplicate by address string similarity for this customer
    const existingLocations = await prisma.customerLocation.findMany({
      where: { customerId }
    });

    const normalizedAddress = address.toLowerCase().trim();
    const duplicate = existingLocations.find(l => l.address.toLowerCase().trim() === normalizedAddress);

    if (duplicate) {
      // Just return the existing one if it's the exact same address string
      if (isDefault) {
         await prisma.customerLocation.updateMany({
           where: { customerId },
           data: { isDefault: false }
         });
         const updated = await prisma.customerLocation.update({
           where: { id: duplicate.id },
           data: { isDefault: true, createdAt: new Date() } // bump createdAt so it shows up first
         });
         return NextResponse.json(updated);
      }
      return NextResponse.json(duplicate);
    }

    if (isDefault) {
      await prisma.customerLocation.updateMany({
        where: { customerId },
        data: { isDefault: false }
      });
    }

    const newLocation = await prisma.customerLocation.create({
      data: {
        customerId,
        address,
        city: city || 'Ahmedabad',
        state: state || 'Gujarat',
        pincode,
        latitude: latitude || null,
        longitude: longitude || null,
        isDefault: isDefault || existingLocations.length === 0 // make default if it's the first
      }
    });

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
