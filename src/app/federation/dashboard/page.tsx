import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWelfareFundSummary } from "@/services/welfare";
import FederationDashboardClient from "./FederationDashboardClient";
import { RealtimeBookingListener } from '@/components/shared/realtime-listeners';

export default async function FederationDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'FEDERATION_ADMIN') {
    redirect("/federation/login");
  }

  const federationId = session.user.federationId;
  if (!federationId) {
    return <div>Error: No Federation associated with this admin account.</div>;
  }

  const federation = await prisma.federation.findUnique({
    where: { id: federationId },
    include: { cooperatives: true }
  });

  if (!federation) {
    return <div>Error: Federation not found.</div>;
  }

  const start = Date.now();

  // 1. Welfare Summary (Centerpiece)
  const welfareSummary = await getWelfareFundSummary(federationId);

  // 2. Worker Roster (limit to 50 for dashboard)
  const workers = await prisma.worker.findMany({
    where: { cooperative: { federationId } },
    select: { 
      id: true, joinedAt: true, verificationStatus: true, primaryTrade: true,
      user: { select: { name: true, email: true, phone: true } },
      cooperative: { select: { name: true } }
    },
    orderBy: { joinedAt: 'desc' },
    take: 50
  });

  // 3. Booking / Demand Overview
  // Use aggregation to group by category and sum prices
  const demandAgg = await prisma.booking.groupBy({
    by: ['categoryId'],
    where: { worker: { cooperative: { federationId } } },
    _count: { id: true },
    _sum: { finalPrice: true, estimatedPrice: true }
  });

  const categories = await prisma.serviceCategory.findMany({
    where: { id: { in: demandAgg.map(d => d.categoryId) } },
    select: { id: true, name: true }
  });

  const demandData = demandAgg.map(agg => {
    const catName = categories.find(c => c.id === agg.categoryId)?.name || 'Unknown';
    return {
      category: catName,
      count: agg._count.id,
      revenue: agg._sum.finalPrice || agg._sum.estimatedPrice || 0
    };
  });

  // 4. Dispute Oversight
  const complaints = await prisma.complaint.findMany({
    where: { worker: { cooperative: { federationId } } },
    select: {
      id: true, category: true, status: true, resolution: true, createdAt: true, description: true,
      customer: { select: { user: { select: { name: true, phone: true } } } },
      worker: { select: { user: { select: { name: true, phone: true } } } },
      booking: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB] federation demand: ${Date.now() - start}ms`);
  }

  // 5. Governance Proposals (using CooperativeProposal for now)
  const cooperativeIds = federation.cooperatives.map(c => c.id);
  const proposals = await prisma.cooperativeProposal.findMany({
    where: { cooperativeId: { in: cooperativeIds } },
    include: { createdBy: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <>
      <RealtimeBookingListener referenceId={federationId} role="federation" />
      <FederationDashboardClient 
        federation={federation}
        welfareSummary={welfareSummary}
        workers={workers}
        demand={Object.values(demandData)}
        complaints={complaints}
        proposals={proposals}
        firstCoopId={cooperativeIds[0] || ""}
      />
    </>
  );
}
