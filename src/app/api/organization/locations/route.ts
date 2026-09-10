import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrganizationLocation } from "@/services/organization";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const isSociety = role === "SOCIETY_ADMIN";
    const isInstitution = role === "INSTITUTIONAL_CUSTOMER";

    if (!isSociety && !isInstitution) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const organizationId = isSociety 
      ? session.user.societyId
      : session.user.institutionId;

    if (!organizationId) {
      return NextResponse.json({ error: "No organization linked" }, { status: 400 });
    }

    const body = await req.json();
    const { name, address, buildingDetails, accessInstructions } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Location name is required" }, { status: 400 });
    }

    const location = await createOrganizationLocation({
      organizationId,
      type: isSociety ? "SOCIETY" : "INSTITUTION",
      name: name.trim(),
      address: address?.trim() || undefined,
      buildingDetails: buildingDetails?.trim() || undefined,
      accessInstructions: accessInstructions?.trim() || undefined,
    });

    return NextResponse.json({ success: true, location }, { status: 201 });
  } catch (error: any) {
    console.error("Organization Location Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create location. Please try again." },
      { status: 500 }
    );
  }
}
