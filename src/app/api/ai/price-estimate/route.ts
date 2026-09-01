import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ min: 10, max: 20 }); }
