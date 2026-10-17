import { requireRolePage, getScope, cooperativeWhere } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import CooperativesClient from "./CooperativesClient";

export const dynamic = "force-dynamic";

export default async function FederationCooperativesPage() {
  const sessionUser = await requireRolePage("FEDERATION_ADMIN", "ADMIN");
  const scope = await getScope(sessionUser);

  const cooperatives = await prisma.cooperative.findMany({
    where: cooperativeWhere(scope),
    include: {
      _count: {
        select: {
          workers: true,
          admins: true,
        }
      },
      workers: {
        select: { 
          id: true,
          verificationStatus: true,
          ratings: { select: { overall: true } },
          complaints: {
            where: { status: "OPEN" },
            select: { id: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const formattedCooperatives = cooperatives.map((c) => {
    let totalRating = 0;
    let ratingCount = 0;
    let openComplaintsCount = 0;
    let verifiedWorkerCount = 0;

    for (const w of c.workers) {
      if (w.verificationStatus === "VERIFIED") verifiedWorkerCount++;
      openComplaintsCount += w.complaints.length;
      for (const r of w.ratings) {
        totalRating += r.overall;
        ratingCount++;
      }
    }

    return {
      ...c,
      verifiedWorkerCount,
      openComplaintsCount,
      averageRating: ratingCount > 0 ? (totalRating / ratingCount) : 0,
    };
  });

  return <CooperativesClient cooperatives={formattedCooperatives} />;
}
