import { prisma } from "@/lib/prisma";
import { matchWorkers, WorkerMatchResult } from "./matching";
import { createBooking } from "./booking";


export async function getOrganizationLocations(organizationId: string, type: "SOCIETY" | "INSTITUTION") {
  return prisma.organizationLocation.findMany({
    where: type === "SOCIETY" ? { societyId: organizationId } : { institutionId: organizationId },
    orderBy: { name: "asc" }
  });
}

export async function createOrganizationLocation(data: {
  organizationId: string;
  type: "SOCIETY" | "INSTITUTION";
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  buildingDetails?: string;
  accessInstructions?: string;
}) {
  const { organizationId, type, ...rest } = data;
  return prisma.organizationLocation.create({
    data: {
      ...rest,
      societyId: type === "SOCIETY" ? organizationId : undefined,
      institutionId: type === "INSTITUTION" ? organizationId : undefined,
    }
  });
}

export async function findWorkersForOrganizationRequest(
  requestId: string,
  type: "SOCIETY" | "INSTITUTION",
  urgency: "NORMAL" | "URGENT" | "EMERGENCY" = "NORMAL"
): Promise<WorkerMatchResult[]> {
  
  let latitude: number | null = null;
  let longitude: number | null = null;
  let categoryId: string | null = null;

  if (type === "SOCIETY") {
    const req = await prisma.societyServiceRequest.findUnique({
      where: { id: requestId },
      include: { location: true }
    });
    if (!req) throw new Error("Request not found");
    
    categoryId = req.categoryId;
    latitude = req.location?.latitude ?? null;
    longitude = req.location?.longitude ?? null;

  } else {
    const req = await prisma.institutionServiceRequest.findUnique({
      where: { id: requestId },
      include: { location: true }
    });
    if (!req) throw new Error("Request not found");

    categoryId = req.categoryId;
    latitude = req.location?.latitude ?? null;
    longitude = req.location?.longitude ?? null;
  }

  if (!categoryId || latitude === null || longitude === null) {
    throw new Error("Request missing required category or location coordinates for matching");
  }

  return matchWorkers({
    categoryId,
    latitude,
    longitude,
    urgency
  });
}

export async function assignWorkerToOrganizationRequest(data: {
  requestId: string;
  type: "SOCIETY" | "INSTITUTION";
  workerId: string;
  assignedByUserId: string; // The admin user making the assignment
  scheduledDate?: Date;
  scheduledTime?: string;
}) {
  const { requestId, type, workerId, scheduledDate, scheduledTime } = data;

  let customerId: string | null = null;
  let categoryId: string | null = null;
  let address: string | undefined;
  let latitude: number | undefined;
  let longitude: number | undefined;
  let description: string | undefined;

  const customer = await prisma.customer.findUnique({
    where: { userId: data.assignedByUserId }
  });
  
  if (customer) {
    customerId = customer.id;
  } else {
    const newCustomer = await prisma.customer.create({
      data: {
        userId: data.assignedByUserId,
      }
    });
    customerId = newCustomer.id;
  }

  if (type === "SOCIETY") {
    const req = await prisma.societyServiceRequest.findUnique({
      where: { id: requestId },
      include: { location: true }
    });
    if (!req) throw new Error("Request not found");
    categoryId = req.categoryId;
    description = req.description;
    address = req.location?.address || req.location?.name;
    latitude = req.location?.latitude || undefined;
    longitude = req.location?.longitude || undefined;
  } else {
    const req = await prisma.institutionServiceRequest.findUnique({
      where: { id: requestId },
      include: { location: true }
    });
    if (!req) throw new Error("Request not found");
    categoryId = req.categoryId;
    description = req.description;
    address = req.location?.address || req.location?.name;
    latitude = req.location?.latitude || undefined;
    longitude = req.location?.longitude || undefined;
  }

  if (!categoryId) throw new Error("Request missing category");
  if (!customerId) throw new Error("Failed to resolve customer context for assignment");

  const booking = await createBooking({
    customerId,
    workerId,
    categoryId,
    description,
    scheduledDate,
    scheduledTime,
    address,
    latitude,
    longitude,
  });

  if (type === "SOCIETY") {
    await prisma.societyServiceRequest.update({
      where: { id: requestId },
      data: { status: "SCHEDULED" }
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { societyRequestId: requestId }
    });
  } else {
    await prisma.institutionServiceRequest.update({
      where: { id: requestId },
      data: { status: "SCHEDULED" }
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { institutionRequestId: requestId }
    });
  }

  return booking;
}
