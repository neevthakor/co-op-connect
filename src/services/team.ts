import { prisma } from "@/lib/prisma";

export async function createTeam(bookingId: string, leadWorkerId: string) {
  return prisma.jobTeam.create({
    data: {
      bookingId,
      leadWorkerId,
      status: "ACTIVE",
      members: {
        create: {
          workerId: leadWorkerId,
          role: "LEAD",
          revenueShare: 70, // 70% share to lead
        },
      },
    },
    include: {
      members: {
        include: {
          worker: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
}

export async function addTeamMember(
  teamId: string,
  workerId: string,
  role: "HELPER" | "APPRENTICE" = "HELPER",
  revenueShare: number = 30
) {
  return prisma.jobTeamMember.create({
    data: {
      teamId,
      workerId,
      role,
      revenueShare,
    },
    include: {
      worker: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function calculateRevenueSplit(teamId: string, totalLabour: number) {
  const team = await prisma.jobTeam.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          worker: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!team) throw new Error("Team not found");

  return team.members.map((member) => ({
    workerId: member.workerId,
    name: member.worker.user.name,
    role: member.role,
    percentage: member.revenueShare,
    amount: Math.round((totalLabour * member.revenueShare) / 100),
  }));
}

export async function disbandTeam(teamId: string) {
  return prisma.jobTeam.update({
    where: { id: teamId },
    data: { status: "COMPLETED" },
  });
}
