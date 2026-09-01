import { NextRequest, NextResponse } from 'next/server';
import { matchHelpers } from '@/services/helper-matching';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get('skillId') || undefined;
    const latitude = parseFloat(searchParams.get('latitude') || '23.0225');
    const longitude = parseFloat(searchParams.get('longitude') || '72.5714');
    const bookingId = searchParams.get('bookingId') || undefined;

    const helpers = await matchHelpers({
      skillId,
      latitude,
      longitude,
      bookingId,
    });

    return NextResponse.json(helpers);
  } catch (error: any) {
    console.error('Helper Matching Error:', error);
    return NextResponse.json({ error: error.message || 'Helper matching failed' }, { status: 500 });
  }
}

