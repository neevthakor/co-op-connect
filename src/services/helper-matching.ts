import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/utils";

export interface HelperMatchParams {
  skillId?: string;
  latitude: number;
  longitude: number;
  bookingId?: string;
}

export async function matchHelpers(params: HelperMatchParams) {
  const { skillId, latitude, longitude } = params;

  const helpers = await prisma.worker.findMany({
    where: {
      verificationStatus: "VERIFIED",
      ...(skillId
        ? {
            skills: {
              some: {
                skillId,
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
    },
  });

  return helpers.map((helper) => {
    let distanceKm = 5;
    if (helper.latitude && helper.longitude) {
      distanceKm = haversineDistance(latitude, longitude, helper.latitude, helper.longitude);
    }

    const matchScore = Math.min(98, Math.max(60, 95 - Math.round(distanceKm * 2)));

    return {
      helper: {
        ...helper,
        distance: distanceKm,
      },
      match_score: matchScore,
      explanation: `Qualified assistant with verified apprenticeship and ${helper.experience} years experience in ${helper.primaryTrade || 'general trade'}.`,
    };
  }).sort((a, b) => b.match_score - a.match_score);
}

export async function createTeam(bookingId: string, leadWorkerId: string) {
  return await prisma.jobTeam.create({
    data: {
      booking: { connect: { id: bookingId } },
      leadWorker: { connect: { id: leadWorkerId } },
      members: {
        create: {
          worker: { connect: { id: leadWorkerId } },
          role: 'LEAD',
          revenueShare: 70,
        },
      },
    },
    include: {
      members: {
        include: {
          worker: { include: { user: true } },
        },
      },
    },
  });
}

export async function addTeamMember(teamId: string, workerId: string, role: string = 'HELPER', revenueShare: number = 30) {
  return await prisma.jobTeamMember.create({
    data: {
      team: { connect: { id: teamId } },
      worker: { connect: { id: workerId } },
      role,
      revenueShare,
    },
    include: {
      worker: { include: { user: true } },
    },
  });
}

