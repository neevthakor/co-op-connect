import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const societyId = (session.user as any).societyId;
    if (!societyId) return NextResponse.json({ error: "Not a society admin" }, { status: 403 });

    const requests = await prisma.societyServiceRequest.findMany({
      where: { societyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const societyId = (session.user as any).societyId;
    if (!societyId) return NextResponse.json({ error: "Not a society admin" }, { status: 403 });

    const body = await req.json();
    const { title, description, priority, area } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }

    const request = await prisma.societyServiceRequest.create({
      data: {
        societyId,
        title,
        description,
        priority: priority || "NORMAL",
        area: area || undefined,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
