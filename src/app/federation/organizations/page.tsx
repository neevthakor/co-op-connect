import { requireRolePage, getScope } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import OrganizationsClient from "./OrganizationsClient";

export const dynamic = "force-dynamic";

export default async function FederationOrganizationsPage() {
  const sessionUser = await requireRolePage("FEDERATION_ADMIN", "ADMIN");
  const scope = await getScope(sessionUser);

  // For Admin, it sees all. For Federation, sees those with requests assigned to its cooperatives.
  const whereSociety = scope.role === "ADMIN" ? {} : {
    serviceRequests: {
      some: { cooperativeId: { in: scope.cooperativeIds } }
    }
  };

  const whereInstitution = scope.role === "ADMIN" ? {} : {
    serviceRequests: {
      some: { cooperativeId: { in: scope.cooperativeIds } }
    }
  };

  const societies = await prisma.housingSociety.findMany({
    where: whereSociety,
    include: {
      serviceRequests: {
        where: scope.role === "ADMIN" ? {} : { cooperativeId: { in: scope.cooperativeIds } },
        select: { id: true, cooperative: { select: { name: true } } }
      }
    }
  });

  const institutions = await prisma.institution.findMany({
    where: whereInstitution,
    include: {
      serviceRequests: {
        where: scope.role === "ADMIN" ? {} : { cooperativeId: { in: scope.cooperativeIds } },
        select: { id: true, cooperative: { select: { name: true } } }
      }
    }
  });

  const formattedSocieties = societies.map(s => ({
    id: s.id,
    type: "Housing Society",
    name: s.name,
    city: s.city,
    requestCount: s.serviceRequests.length,
    assignedCooperatives: Array.from(new Set(s.serviceRequests.map(r => r.cooperative?.name).filter(Boolean))),
  }));

  const formattedInstitutions = institutions.map(s => ({
    id: s.id,
    type: "Institution",
    name: s.name,
    city: s.city,
    requestCount: s.serviceRequests.length,
    assignedCooperatives: Array.from(new Set(s.serviceRequests.map(r => r.cooperative?.name).filter(Boolean))),
  }));

  const organizations = [...formattedSocieties, ...formattedInstitutions].sort((a, b) => b.requestCount - a.requestCount);

  return <OrganizationsClient organizations={organizations} />;
}
