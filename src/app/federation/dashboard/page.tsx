import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWelfareFundSummary } from "@/services/welfare";
import FederationDashboardClient from "./FederationDashboardClient";

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

  // 1. Welfare Summary (Centerpiece)
  const welfareSummary = await getWelfareFundSummary(federationId);

  // 2. Worker Roster
  const workers = await prisma.worker.findMany({
    where: { cooperative: { federationId } },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      cooperative: { select: { name: true } }
    },
    orderBy: { joinedAt: 'desc' }
  });

  // 3. Booking / Demand Overview
  // Fetch bookings for workers in this federation to aggregate demand
  const bookings = await prisma.booking.findMany({
    where: { worker: { cooperative: { federationId } } },
    include: { category: true }
  });

  const demandData = bookings.reduce((acc, booking) => {
    const cat = booking.category.name;
    if (!acc[cat]) acc[cat] = { category: cat, count: 0, revenue: 0 };
    acc[cat].count += 1;
    acc[cat].revenue += booking.finalPrice || booking.estimatedPrice || 0;
    return acc;
  }, {} as Record<string, { category: string, count: number, revenue: number }>);

  // 4. Dispute Oversight
  const complaints = await prisma.complaint.findMany({
    where: { worker: { cooperative: { federationId } } },
    include: {
      customer: { include: { user: true } },
      worker: { include: { user: true } },
      booking: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  // 5. Governance Proposals (using CooperativeProposal for now)
  const cooperativeIds = federation.cooperatives.map(c => c.id);
  const proposals = await prisma.cooperativeProposal.findMany({
    where: { cooperativeId: { in: cooperativeIds } },
    include: { createdBy: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <FederationDashboardClient 
      federation={federation}
      welfareSummary={welfareSummary}
      workers={workers}
      demand={Object.values(demandData)}
      complaints={complaints}
      proposals={proposals}
      firstCoopId={cooperativeIds[0] || ""}
    />
  );
}
