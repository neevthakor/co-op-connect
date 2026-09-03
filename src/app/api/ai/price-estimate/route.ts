import { NextResponse } from 'next/server';
import { estimatePrice } from '@/services/pricing';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, description, urgency, distance } = body;
    const estimate = await estimatePrice({ categoryId, description, urgency, distance });
    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Price estimation error:', error);
    return NextResponse.json({ error: 'Failed to estimate price' }, { status: 500 });
  }
}
