import { NextRequest, NextResponse } from 'next/server';
import { matchWorkers } from '@/services/matching';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });
    }
    const latParam = searchParams.get('latitude');
    const lngParam = searchParams.get('longitude');
    const urgency = (searchParams.get('urgency') as 'NORMAL' | 'URGENT' | 'EMERGENCY') || 'NORMAL';
    const cooperativeId = searchParams.get('cooperativeId') || undefined;
    const searchedAddress = searchParams.get('address') || undefined;

    if (!latParam || !lngParam) {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'latitude and longitude must be valid numbers' }, { status: 400 });
    }

    const matches = await matchWorkers({
      categoryId,
      latitude,
      longitude,
      urgency,
      cooperativeId,
      searchedAddress,
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Matching Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Worker matching failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, latitude, longitude, urgency = 'NORMAL', cooperativeId, address } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });
    }
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'latitude and longitude must be valid numbers' }, { status: 400 });
    }

    const matches = await matchWorkers({
      categoryId,
      latitude: lat,
      longitude: lng,
      urgency,
      cooperativeId,
      searchedAddress: typeof address === 'string' ? address : undefined,
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Matching Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Worker matching failed' }, { status: 500 });
  }
}

