import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/validation';
import { isValidState, isValidCity, ALL_INDIA_STATES_AND_UTS, INDIA_CITIES } from '@/lib/locations/india';

export async function POST(req: NextRequest) {

  try {
    let body: any;
    let file: File | null = null;

    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const jsonData = formData.get('data');
      if (typeof jsonData === 'string') {
        body = JSON.parse(jsonData);
      } else {
        return NextResponse.json({ error: 'Missing JSON data in form' }, { status: 400 });
      }
      file = formData.get('photo') as File | null;
    } else {
      body = await req.json();
    }

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Profile photo exceeds 5MB limit' }, { status: 400 });
      }
      if (!file.type.startsWith('image/') || file.type.includes('svg')) {
        return NextResponse.json({ error: 'Invalid profile photo type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Profile photo is required.' }, { status: 400 });
    }

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
      learningMethod,
      trainingInstitute,
      learningDetails,
      verificationAnswers,
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

    // Normalize state/city via the central dataset
    let finalState = state;
    if (state !== 'Unspecified') {
      const normalizedState = ALL_INDIA_STATES_AND_UTS.find(s => s.toLowerCase() === String(state).toLowerCase());
      if (!normalizedState) {
        return NextResponse.json({ error: 'Invalid state or union territory selected' }, { status: 400 });
      }
      finalState = normalizedState;
    }

    let finalCity = city;
    if (city !== 'Unspecified') {
      const normalizedCity = INDIA_CITIES[finalState]?.find(c => c.toLowerCase() === String(city).toLowerCase());
      if (!normalizedCity) {
        return NextResponse.json({ error: 'Invalid city selected for the given state' }, { status: 400 });
      }
      finalCity = normalizedCity;
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
      }
    }

    let coopId = cooperativeId;
    if (!coopId) {
      const defaultCoop = await prisma.cooperative.findFirst({ where: { isActive: true } });
      coopId = defaultCoop?.id || null;
    }

    const userRole = role === 'HELPER' ? 'HELPER' : 'WORKER';

    let dbQuestions: { id: string, question: string }[] = [];
    if (verificationAnswers && typeof verificationAnswers === 'object') {
      dbQuestions = await prisma.skillVerificationQuestion.findMany({
        where: { id: { in: Object.keys(verificationAnswers) } }
      });
    }

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
            city: finalCity,
            state: finalState,
            learningMethod,
            trainingInstitute,
            learningDetails,
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
              })) : []
            },
            verificationResponses: dbQuestions.length > 0 ? {
              create: dbQuestions.map(q => ({
                questionId: q.id,
                questionSnapshot: q.question,
                answer: String(verificationAnswers[q.id]),
              }))
            } : undefined
          },
        },
      },
      include: {
        worker: true,
      },
    });

    try {
      if (file) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `worker-profile-photos/${user.id}/profile.${fileExt}`;

        const { supabaseAdmin } = await import('@/lib/supabase-admin');
        const { error } = await supabaseAdmin.storage
          .from('private-uploads')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true,
          });

        if (error) throw error;

        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: fileName },
        });
      }
    } catch (uploadError) {
      console.error('Photo upload failed during registration:', uploadError instanceof Error ? uploadError.message : 'Unknown error');
      // Photo failed but user was created. Not fatal to registration according to standard sequences,
      // but if the photo was strict-required, we could rollback here. Given the prompt
      // says "If an upload succeeds but worker creation fails, clean up... Or use another safe sequence"
      // we'll just log and continue, the user can re-upload later. Or we could rollback the user.
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json({ error: 'Failed to upload photo. Please try again.' }, { status: 500 });
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
  } catch (error) {
    console.error('Worker Registration Error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Worker registration failed. Please try again.' },
      { status: 500 }
    );
  }
}