import { requireRolePage, getScope } from "@/lib/scope";
import { getWelfareFundSummary } from "@/services/welfare";
import { prisma } from "@/lib/prisma";
import WelfareClient from "./welfare-client";

export const dynamic = "force-dynamic";

export default async function FederationWelfarePage() {
  const sessionUser = await requireRolePage("FEDERATION_ADMIN", "ADMIN");
  const scope = await getScope(sessionUser);

  let federationId = scope.federationId;
  
  if (scope.role === "ADMIN") {
    // For demo purposes, pick the first federation for the admin
    const fed = await prisma.federation.findFirst();
    federationId = fed?.id;
  }

  if (!federationId) {
    return <div className="p-6 text-muted-foreground">No federation found.</div>;
  }

  const welfareSummary = await getWelfareFundSummary(federationId);

  return <WelfareClient federationId={federationId} welfareSummary={welfareSummary} />;
}
