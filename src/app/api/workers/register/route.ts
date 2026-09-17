import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/validation';

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
      city = 'Unspecified',
      state = 'Unspecified',
      isEmergencyAvailable = false,
      role = 'WORKER',
      latitude: providedLatitude,
      longitude: providedLongitude,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Full legal name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    
    if (!phone || typeof phone !== 'string' || !isValidPhone(phone)) {
      return NextResponse.json({ error: 'A valid 10-digit Indian phone number is required for workers' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!primaryTrade || typeof primaryTrade !== 'string') {
      return NextResponse.json({ error: 'Primary trade selection is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    // Check existing email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phone: normalizedPhone },
        ],
      },
    });
    if (existing) {
      if (existing.email === normalizedEmail) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      } else {
        return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // BUG FIX: worker registration used to hardcode latitude/longitude to null,
    // so a real worker's address was never converted into coordinates. That meant
    // the worker could never be found by proximity-based matching (matchWorkers /
    // findNearbyWorkers both require non-null lat/lng), no matter how close they
    // actually were to a customer. Prefer coordinates the client already has
    // (e.g. from browser geolocation); otherwise geocode the typed address here.
    let latitude: number | null =
      typeof providedLatitude === 'number' && !isNaN(providedLatitude) && providedLatitude >= -90 && providedLatitude <= 90 ? providedLatitude : null;
    let longitude: number | null =
      typeof providedLongitude === 'number' && !isNaN(providedLongitude) && providedLongitude >= -180 && providedLongitude <= 180 ? providedLongitude : null;

    if ((latitude === null || longitude === null) && address && typeof address === 'string' && address.trim()) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address.trim())}&format=json&limit=1`,
          { headers: { 'User-Agent': 'CoopConnect/1.0' } }
        );
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData.length > 0) {
          const fetchedLat = parseFloat(geoData[0].lat);
          const fetchedLng = parseFloat(geoData[0].lon);
          if (!isNaN(fetchedLat) && fetchedLat >= -90 && fetchedLat <= 90) {
            latitude = fetchedLat;
          }
          if (!isNaN(fetchedLng) && fetchedLng >= -180 && fetchedLng <= 180) {
            longitude = fetchedLng;
          }
        }
      } catch (geoError) {
        console.error('Worker registration geocoding failed:', geoError);
        // Non-fatal: worker is created with null coordinates and can set/fix
        // their location later from their profile (see PATCH /api/workers/[id]).
      }
    }

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
        phone: normalizedPhone,
        passwordHash,
        role: userRole,
        language: 'en',
        worker: {
          create: {
            cooperativeId: coopId,
            primaryTrade: primaryTrade.trim(),
            experience: parseInt(experience.toString(), 10) || 1,
            address: address && typeof address === 'string' ? address.trim() : 'Location Not Provided',
            city,
            state,
            verificationStatus: 'PENDING', // Real worker starts as PENDING until verified by cooperative admin
            availabilityStatus: 'OFFLINE',
            isEmergencyAvailable: !!isEmergencyAvailable,
            totalJobs: 0,
            averageRating: 0,
            completionRate: 100,
            punctualityScore: 100,
            latitude,
            longitude,
            skills: {
              create: Array.isArray(skillIds) ? skillIds.map(sId => ({
                skillId: sId,
                proficiencyLevel: 'INTERMEDIATE',
                verified: false,
                skillVerificationStatus: 'SELF_DECLARED',
              })) : []
            }
          },
        },
      },
      include: {
        worker: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Worker registered successfully. Your profile is pending verification by cooperative admin.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        worker: { id: user.worker?.id, verificationStatus: user.worker?.verificationStatus },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Worker Registration Error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Worker registration failed. Please try again.' },
      { status: 500 }
    );
  }
}