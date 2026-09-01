import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const institutionId = (session.user as any).institutionId;
  if (!institutionId) return NextResponse.json({ error: "Not an institution admin" }, { status: 403 });

  const requests = await prisma.institutionServiceRequest.findMany({
    where: { institutionId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const institutionId = (session.user as any).institutionId;
  if (!institutionId) return NextResponse.json({ error: "Not an institution admin" }, { status: 403 });

  const body = await req.json();
  const { title, description, priority } = body;

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description required" }, { status: 400 });
  }

  const request = await prisma.institutionServiceRequest.create({
    data: {
      institutionId,
      title,
      description,
      priority: priority || "NORMAL",
    },
  });

  return NextResponse.json(request, { status: 201 });
}
