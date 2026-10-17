import { requireRolePage, getScope } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import OrgRequestsClient from "./OrgRequestsClient";

export const dynamic = "force-dynamic";

export default async function FederationOrgRequestsPage() {
  const sessionUser = await requireRolePage("FEDERATION_ADMIN", "ADMIN");
  const scope = await getScope(sessionUser);

  const whereSociety: any = { status: "OPEN" };
  const whereInstitution: any = { status: "OPEN" };

  if (scope.role === "FEDERATION_ADMIN") {
    whereSociety.cooperativeId = null;
    whereInstitution.cooperativeId = null;
  } else if (scope.role === "ADMIN") {
    whereSociety.cooperativeId = null;
    whereInstitution.cooperativeId = null;
  }

  const [societyRequests, institutionRequests, cooperatives] = await Promise.all([
    prisma.societyServiceRequest.findMany({
      where: whereSociety,
      include: { society: true, category: true, location: true, cooperative: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.institutionServiceRequest.findMany({
      where: whereInstitution,
      include: { institution: true, category: true, location: true, cooperative: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.cooperative.findMany({
      where: scope.role === "ADMIN" ? {} : { id: { in: scope.cooperativeIds } },
      select: { id: true, name: true, isActive: true },
      orderBy: { name: "asc" }
    })
  ]);

  const activeCooperatives = cooperatives.filter(c => c.isActive);

  const formattedRequests = [
    ...societyRequests.map(r => ({
      ...r,
      type: "SOCIETY" as const,
      orgName: r.society.name,
      orgAddress: r.location?.address || r.society.address,
    })),
    ...institutionRequests.map(r => ({
      ...r,
      type: "INSTITUTION" as const,
      orgName: r.institution.name,
      orgAddress: r.location?.address || r.institution.address,
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return <OrgRequestsClient requests={formattedRequests} cooperatives={activeCooperatives} />;
}
