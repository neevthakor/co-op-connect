import { NextRequest, NextResponse } from 'next/server';
import { matchHelpers } from '@/services/helper-matching';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get('skillId') || undefined;
    const latParam = searchParams.get('latitude');
    const lngParam = searchParams.get('longitude');
    const bookingId = searchParams.get('bookingId') || undefined;

    if (!latParam || !lngParam) {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'latitude and longitude must be valid numbers' }, { status: 400 });
    }

    const helpers = await matchHelpers({
      skillId,
      latitude,
      longitude,
      bookingId,
    });

    return NextResponse.json(helpers);
  } catch (error) {
    console.error('Helper Matching Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Helper matching failed' }, { status: 500 });
  }
}

