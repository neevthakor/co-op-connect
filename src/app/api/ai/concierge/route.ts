import { NextRequest, NextResponse } from 'next/server';
import { parseServiceRequest } from '@/services/ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text query is required' }, { status: 400 });
    }

    const parsed = await parseServiceRequest(text, language);

    // Look up category in database
    let category = null;
    if (parsed.categoryId) {
      category = await prisma.serviceCategory.findUnique({
        where: { id: parsed.categoryId },
        include: {
          skills: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      category: category || {
        id: parsed.categoryId,
        name: parsed.categoryName,
        basePrice: 350,
      },
      analysis: {
        intent: parsed.intent,
        confidence: parsed.confidence,
        category: category?.name || parsed.categoryName,
        categoryId: category?.id || parsed.categoryId,
        urgency: parsed.urgency,
        toolsNeeded: parsed.toolsNeeded,
        estimatedDuration: parsed.estimatedDuration,
        clarificationQuestions: parsed.clarificationQuestions,
        problem: parsed.problem,
        detectedKeywords: parsed.parsedData.detectedKeywords,
        language: parsed.parsedData.language,
        aiProvider: parsed.parsedData.aiProvider,
      },
      aiProvider: parsed.parsedData.aiProvider,
    });
  } catch (error) {
    console.error('AI Concierge Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'AI parsing failed' }, { status: 500 });
  }
}

