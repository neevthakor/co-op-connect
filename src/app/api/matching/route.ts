import { NextRequest, NextResponse } from 'next/server';
import { matchWorkers } from '@/services/matching';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || 'cat-ac';
    const latitude = parseFloat(searchParams.get('latitude') || '23.0225');
    const longitude = parseFloat(searchParams.get('longitude') || '72.5714');
    const urgency = (searchParams.get('urgency') as any) || 'NORMAL';
    const cooperativeId = searchParams.get('cooperativeId') || undefined;

    const matches = await matchWorkers({
      categoryId,
      latitude,
      longitude,
      urgency,
      cooperativeId,
    });

    return NextResponse.json(matches);
  } catch (error: any) {
    console.error('Matching Error:', error);
    return NextResponse.json({ error: error.message || 'Worker matching failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, latitude = 23.0225, longitude = 72.5714, urgency = 'NORMAL', cooperativeId } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });
    }

    const matches = await matchWorkers({
      categoryId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      urgency,
      cooperativeId,
    });

    return NextResponse.json(matches);
  } catch (error: any) {
    console.error('Matching Error:', error);
    return NextResponse.json({ error: error.message || 'Worker matching failed' }, { status: 500 });
  }
}

