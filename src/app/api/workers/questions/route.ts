import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trade = searchParams.get('trade');
  
  if (!trade) {
    return NextResponse.json({ error: 'Trade is required' }, { status: 400 });
  }

  try {
    const questions = await prisma.skillVerificationQuestion.findMany({
      where: { trade, isActive: true },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Questions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
