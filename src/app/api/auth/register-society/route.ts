import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Society Admin registration is disabled. Admins are provisioned via database seed.' },
    { status: 403 }
  );
}
