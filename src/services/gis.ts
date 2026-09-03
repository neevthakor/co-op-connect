import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/utils";

export async function findNearbyWorkers(
  latitude: number,
  longitude: number,
  radiusKm: number = 15,
  categoryId?: string
) {
  const workers = await prisma.worker.findMany({
    where: {
      verificationStatus: "VERIFIED",
      latitude: { not: null },
      longitude: { not: null },
      ...(categoryId
        ? {
            skills: {
              some: {
                skill: {
                  categoryId,
                },
              },
            },
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          phone: true,
        },
      },
      cooperative: true,
      skills: {
        include: {
          skill: true,
        },
      },
      certifications: {
        include: {
          certification: true,
        },
      },
    },
  });

  return workers
    .map((worker) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        worker.latitude!,
        worker.longitude!
      );
      return {
        ...worker,
        distance,
      };
    })
    .filter((w) => w.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

export function calculateETA(distanceKm: number): number {
  // Average urban speed ~25 km/h + 5 min prep
  const travelMinutes = Math.round((distanceKm / 25) * 60) + 5;
  return Math.max(5, travelMinutes);
}

export async function getDemandHeatmapData(categoryId?: string) {
  const demand = await prisma.demandHistory.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      latitude: { not: null },
      longitude: { not: null },
    },
    take: 100,
    orderBy: { date: "desc" },
  });

  return demand.map((d) => ({
    area: d.area,
    latitude: d.latitude!,
    longitude: d.longitude!,
    count: d.count,
  }));
}

export async function getSupplyHeatmapData(categoryId?: string) {
  const workers = await prisma.worker.findMany({
    where: {
      verificationStatus: "VERIFIED",
      latitude: { not: null },
      longitude: { not: null },
      ...(categoryId
        ? {
            skills: {
              some: {
                skill: {
                  categoryId,
                },
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      address: true,
      primaryTrade: true,
    },
  });

  return workers.map((w) => ({
    id: w.id,
    latitude: w.latitude!,
    longitude: w.longitude!,
    title: w.primaryTrade || "Worker",
  }));
}

export async function getUnderservedAreas() {
  const gaps = await prisma.skillGapRecord.findMany({
    orderBy: { gap: "desc" },
    take: 10,
    include: {
      category: true,
    },
  });

  return gaps.map((g) => ({
    area: g.area,
    category: g.category.name,
    expectedDemand: g.expectedDemand,
    availableWorkers: g.availableWorkers,
    shortage: g.gap,
    recommendation: g.recommendation,
  }));
}
